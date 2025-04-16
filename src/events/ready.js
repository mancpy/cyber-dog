module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Online as: ${client.user.tag}`);
	}
};
