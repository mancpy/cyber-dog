const { SlashCommandBuilder } = require('discord.js');
const { stopVMServer, cancelShutdown } = require('../../utils/azureManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops the Minecraft server'),
	async execute(interaction) {
		await interaction.deferReply();

		try {
			await interaction.editReply('Stopping Minecraft server...');

			const result = await stopVMServer();

			if (result.success) {
				// Cancel any scheduled shutdown
				cancelShutdown();

				await interaction.editReply('✅ Minecraft server stopped successfully!');
			} else {
				await interaction.editReply(`❌ Error stopping server: ${result.error}`);
			}
		} catch (error) {
			console.error('Error stopping server:', error);
			await interaction.editReply('❌ An error occurred while trying to stop the Minecraft server.');
		}
	},
};
