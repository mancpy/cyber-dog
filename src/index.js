require('dotenv').config();
const eventHandler = require('./handlers/eventHandler')
const commandHandler = require('./handlers/commandHandler');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages
	]
});

eventHandler(client);
commandHandler(client);

client.login(process.env.DISCORD_TOKEN);
