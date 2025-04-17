const { SlashCommandBuilder } = require('discord.js');
const { startVMServer, scheduleShutdown } = require('../../utils/azureManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Starts the Minecraft server')
		.addIntegerOption(option =>
			option.setName('duration')
				.setDescription('Duration in hours before automatic shutdown')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(24)),
	async execute(interaction) {
		await interaction.deferReply();

		try {
			const duration = interaction.options.getInteger('duration');

			await interaction.editReply(`Starting Minecraft server... It will stay active for ${duration} hour(s).`);

			const result = await startVMServer();

			if (result.success) {
				// Schedule automatic shutdown
				scheduleShutdown(duration);

				await interaction.editReply(`✅ Minecraft server started successfully! Address: ${result.serverIp}\nThe server will shut down automatically in ${duration} hour(s).`);
			} else {
				await interaction.editReply(`❌ Error starting server: ${result.error}`);
			}
		} catch (error) {
			console.error('Error starting server:', error);
			await interaction.editReply('❌ An error occurred while trying to start the Minecraft server.');
		}
	},
};
