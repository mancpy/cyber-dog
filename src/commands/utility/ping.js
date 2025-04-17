const { SlashCommandBuilder } = require('discord.js');
const constants = require('../../config/constants');

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Respond with Pong and the Cyber Dog\'s latency'),
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Calculating ping...', fetchReply: true });
		const pingTime = sent.createdTimestamp - interaction.createdTimestamp;
		await interaction.editReply(`Pong! ${constants.EMOJIS.PONG}\nCyber Dog\'s latency: ${pingTime}ms`);
	}
}
