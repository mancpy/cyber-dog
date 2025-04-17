const { ComputeManagementClient } = require('@azure/arm-compute');
const { NetworkManagementClient } = require('@azure/arm-network');
const { AzureCliCredential } = require('@azure/identity');
const net = require('net');

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.AZURE_RESOURCE_GROUP;
const vmName = process.env.AZURE_VM_NAME;
const publicIPName = process.env.AZURE_PUBLIC_IP;
const minecraftPath = process.env.MINECRAFT_PATH;
const minecraftStartScript = process.env.MINECRAFT_START_SCRIPT;
const credentials = new AzureCliCredential();

const computeClient = new ComputeManagementClient(credentials, subscriptionId);
const networkClient = new NetworkManagementClient(credentials, subscriptionId);

let shutdownTimer = null;
let shutdownTime = null;

async function checkMinecraftServerStatus(ip, port = 25565, timeout = 15000) {
	return new Promise(resolve => {
		const socket = new net.Socket();

		socket.setTimeout(timeout);

		socket.on('connect', () => {
			socket.destroy();
			resolve(true);
		});

		socket.on('error', () => {
			socket.destroy();
			resolve(false);
		});

		socket.on('timeout', () => {
			socket.destroy();
			resolve(false);
		});

		socket.connect(port, ip);
	});
}

async function runCommandOnVM(command) {
	try {
		const runCommandResult = await computeClient.virtualMachines.beginRunCommand(
			resourceGroupName,
			vmName,
			{
				commandId: 'RunShellScript',
				script: [command]
			}
		);

		const result = await runCommandResult.pollUntilDone();

		if (result.value && result.value[0] && result.value[0].message) {
			console.log('Command output:', result.value[0].message);
			return {
				success: !result.value[0].message.toLowerCase().includes("error") &&
					!result.value[0].message.toLowerCase().includes("failure"),
				output: result.value[0].message
			};
		}

		return { success: true, output: 'Command executed successfully, no output' };
	} catch (error) {
		console.error('Error executing command on VM:', error);
		return { success: false, output: error.message };
	}
}

async function startMinecraftServer() {
	console.log('Starting Minecraft server...');

	const command = `cd ${minecraftPath} && sudo -u ${vmName} bash -c "./${minecraftStartScript}"`;
	console.log(`Executing command: ${command}`);

	const result = await runCommandOnVM(command);

	const checkCommand = `sudo -u ${vmName} screen -ls`;
	const checkResult = await runCommandOnVM(checkCommand);
	console.log('Result:', checkResult.output);

	return result;
}

async function stopMinecraftServer() {
	console.log('Stopping Minecraft server...');

	const command = `cd ${minecraftPath} && bash ./stop.sh`;
	return await runCommandOnVM(command);
}

async function checkMinecraftProcess() {
	const command = 'screen -list | grep -q "minecraft" && echo "Running" || echo "Not Running"';
	const result = await runCommandOnVM(command);

	return {
		success: result.success,
		running: result.success && result.output.includes("Running")
	};
}

async function getPublicIP() {
	try {
		const publicIPAddress = await networkClient.publicIPAddresses.get(
			resourceGroupName,
			publicIPName
		);

		return publicIPAddress.ipAddress || 'IP unavailable';
	} catch (error) {
		console.error('Error getting public IP:', error);
		return 'Error getting IP';
	}
}

async function startVMServer() {
	try {
		console.log(`Starting VM ${vmName}...`);

		const status = await getVMStatus();

		if (!status.running) {
			console.log('VM is not running. Starting VM...');
			await computeClient.virtualMachines.beginStart(resourceGroupName, vmName);

			let vmStatus = 'starting';
			let startAttempts = 0;
			while (vmStatus !== 'running') {
				await new Promise(resolve => setTimeout(resolve, 5000));
				const currentStatus = await getVMStatus();
				vmStatus = currentStatus.running ? 'running' : 'starting';

				if (vmStatus === 'starting' && ++startAttempts > 36) {
					throw new Error('Timeout starting the VM');
				}
			}

			console.log('VM started. Waiting 20 seconds for services to initialize...');
			await new Promise(resolve => setTimeout(resolve, 20000));
		} else {
			console.log('VM is already running.');
		}

		const publicIP = await getPublicIP();

		const minecraftAlreadyRunning = await checkMinecraftServerStatus(publicIP);

		if (minecraftAlreadyRunning) {
			console.log('Minecraft server is already running.');
			return {
				success: true,
				serverIp: publicIP
			};
		}

		console.log('Starting Minecraft server...');
		const minecraftResult = await startMinecraftServer();

		if (!minecraftResult.success) {
			return {
				success: false,
				error: "Error starting the Minecraft server: " + minecraftResult.output
			};
		}

		console.log('Checking Minecraft server status...');
		let isMinecraftRunning = false;
		let checkAttempts = 0;
		while (!isMinecraftRunning && checkAttempts < 24) {
			await new Promise(resolve => setTimeout(resolve, 15000));
			isMinecraftRunning = await checkMinecraftServerStatus(publicIP);
			checkAttempts++;
			console.log(`Attempt ${checkAttempts}: Minecraft running = ${isMinecraftRunning}`);
		}

		if (!isMinecraftRunning) {
			return {
				success: false,
				error: "VM started, but Minecraft server did not respond after 1 minute"
			};
		}

		return {
			success: true,
			serverIp: publicIP
		};
	} catch (error) {
		console.error('Error starting VM or Minecraft server:', error);
		return { success: false, error: error.message };
	}
}

async function stopVMServer() {
	try {
		console.log(`Checking VM ${vmName} status...`);

		const status = await getVMStatus();
		if (!status.running) {
			console.log('VM is already shut down.');
			return { success: true };
		}

		if (status.minecraftRunning) {
			console.log('Minecraft server is running. Stopping gracefully...');
			try {
				const stopResult = await stopMinecraftServer();
				if (!stopResult.success) {
					console.warn('Warning: Possible error stopping Minecraft server:', stopResult.output);
				} else {
					console.log('Minecraft server stopped successfully.');
				}

				console.log('Waiting 10 seconds to ensure the server has shut down...');
				await new Promise(resolve => setTimeout(resolve, 10000));
			} catch (serverStopError) {
				console.warn('Warning: Error stopping Minecraft server:', serverStopError);
			}
		} else {
			console.log('Minecraft is not running.');
		}

		console.log('Deallocating the VM...');
		await computeClient.virtualMachines.beginDeallocate(resourceGroupName, vmName);
		console.log('VM deallocated successfully.');

		return { success: true };
	} catch (error) {
		console.error('Error shutting down VM:', error);
		return { success: false, error: error.message };
	}
}

async function getVMStatus() {
	try {
		const vm = await computeClient.virtualMachines.instanceView(resourceGroupName, vmName);
		const running = vm.statuses.some(status =>
			status.code === 'PowerState/running' ||
			status.code === 'PowerState/starting'
		);

		let ip = 'N/A';
		let minecraftRunning = false;

		if (running) {
			ip = await getPublicIP();

			minecraftRunning = await checkMinecraftServerStatus(ip);

			if (!minecraftRunning) {
				const processStatus = await checkMinecraftProcess();
				minecraftRunning = processStatus.running;
			}
		}

		return { running, ip, minecraftRunning };
	} catch (error) {
		console.error('Error checking VM status:', error);
		return { running: false, ip: 'N/A', minecraftRunning: false, error: error.message };
	}
}

function scheduleShutdown(hours) {
	cancelShutdown();

	const shutdownDelayMs = hours * 60 * 60 * 1000;
	shutdownTime = new Date(Date.now() + shutdownDelayMs);

	shutdownTimer = setTimeout(async () => {
		console.log('Executing automatic shutdown of Minecraft server...');
		await stopVMServer();
		shutdownTime = null;
	}, shutdownDelayMs);

	console.log(`Automatic shutdown scheduled for ${shutdownTime}`);
}

function cancelShutdown() {
	if (shutdownTimer) {
		clearTimeout(shutdownTimer);
		shutdownTimer = null;
		shutdownTime = null;
		console.log('Automatic shutdown canceled');
	}
}

function getRemainingTime() {
	if (!shutdownTime) {
		return null;
	}

	const remainingMs = shutdownTime - Date.now();

	if (remainingMs <= 0) {
		return null;
	}

	const hours = Math.floor(remainingMs / (1000 * 60 * 60));
	const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

	return { hours, minutes, seconds };
}

module.exports = {
	startVMServer,
	stopVMServer,
	getVMStatus,
	scheduleShutdown,
	cancelShutdown,
	getRemainingTime
};
