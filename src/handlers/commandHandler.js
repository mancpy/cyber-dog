const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = (client) => {
	client.commands = new Collection();

	const commandsPath = path.join(__dirname, '../commands');
	const commandFolders = fs.readdirSync(commandsPath);

	for (const folder of commandFolders) {
		const folderPath = path.join(commandsPath, folder);
		const commandFiles = fs.readdirSync(folderPath).filer(file => file.endsWith('.js'));

		for (const file of commandsFiles) {
			const filePath = path.join(folderPath, file);
			const command = require(filePath);

			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command in ${filePath} is missing the required data or execute property`);
			}
		}
	}

	console.log(`Loaded ${client.commands.size} commands`);
};
