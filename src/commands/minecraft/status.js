const constants = require('../../config/constants');
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
				.setColor(status.running ? (status.minecraftRunning ? constants.COLORS.SUCCESS : constants.COLORS.WARNING) : constants.COLORS.ERROR)
				.setTitle('Minecraft Server Status')
				.addFields(
					{ name: 'VM Azure', value: status.running ? `${constants.EMOJIS.ONLINE} Online` : `${constants.EMOJIS.OFFLINE} Offline`, inline: true },
					{ name: 'Minecraft Server', value: status.minecraftRunning ? `${constants.EMOJIS.ONLINE} Online` : `${constants.EMOJIS.OFFLINE} Offline`, inline: true },
					{ name: 'IP Address', value: status.running ? status.ip : 'N/A', inline: true }
				)
				.setTimestamp();

			if (status.running && status.minecraftRunning && remainingTime) {
				statusEmbed.addFields({
					name: 'Time Remaining',
					value: `${constants.EMOJIS.LOADING} ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`
				});
			}

			if (status.running && !status.minecraftRunning) {
				statusEmbed.setDescription(`${constants.EMOJIS.WARNING} The VM is online, but the Minecraft server is not responding!`);
			}

			await interaction.editReply({ embeds: [statusEmbed] });
		} catch (error) {
			console.error('Error checking status:', error);
			await interaction.editReply(`${constants.EMOJIS.ERROR} An error occurred while checking the Minecraft server status.`);
		}
	},
};
