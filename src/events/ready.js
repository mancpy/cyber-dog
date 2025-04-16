module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Online como: ${client.user.tag}`);
	}
};
