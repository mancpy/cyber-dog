require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
	const folderPath = path.join(commandsPath, folder);
	const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(folderPath, file);
		const command = require(filePath);

		if ('data' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command in ${filePath} is missing the required data property.`);
		}
	}
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		console.log(`Starting the registration of ${commands.length} slash commands (/).`);

		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands },
		);

		console.log(`${data.length} slash commands (/) were registered succesfully!`);
	} catch (error) {
		console.error(error);
	}
})();
