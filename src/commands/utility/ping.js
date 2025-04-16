const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Respond with Pong and the Cyber Dog\'s latency'),
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Calculating ping...', fetchReply: true });
		const pingTime = sent.createdTimestamp - interaction.createdTimestamp;
		await interaction.editReply(`Pong! 🏓\nCyber Dog\'s latency: ${pingTime}ms`);
	}
}
