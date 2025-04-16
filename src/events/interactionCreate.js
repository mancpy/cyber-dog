module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No commanded named ${interaction.commandName} was found`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'An error occurred while executing this command!',
					ephemeral: true
				});
			} else {
				await interaction.reply({
					content: 'An error occured while executing this command!',
					ephemeral: true
				});
			}
		}
	},
};
