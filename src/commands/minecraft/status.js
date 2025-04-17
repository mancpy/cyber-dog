const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVMStatus, getRemainingTime } = require('../../utils/azureManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Checks the Minecraft server status'),
	async execute(interaction) {
		await interaction.deferReply();

		try {
			const status = await getVMStatus();
			const remainingTime = getRemainingTime();

			const statusEmbed = new EmbedBuilder()
				.setColor(status.running ? (status.minecraftRunning ? '#00FF00' : '#FFA500') : '#FF0000')
				.setTitle('Minecraft Server Status')
				.addFields(
					{ name: 'VM Azure', value: status.running ? '🟢 Online' : '🔴 Offline', inline: true },
					{ name: 'Minecraft Server', value: status.minecraftRunning ? '🟢 Online' : '🔴 Offline', inline: true },
					{ name: 'IP Address', value: status.running ? status.ip : 'N/A', inline: true }
				)
				.setTimestamp();

			if (status.running && status.minecraftRunning && remainingTime) {
				statusEmbed.addFields({
					name: 'Time Remaining',
					value: `⏱️ ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`
				});
			}

			if (status.running && !status.minecraftRunning) {
				statusEmbed.setDescription('⚠️ The VM is online, but the Minecraft server is not responding!');
			}

			await interaction.editReply({ embeds: [statusEmbed] });
		} catch (error) {
			console.error('Error checking status:', error);
			await interaction.editReply('❌ An error occurred while checking the Minecraft server status.');
		}
	},
};
