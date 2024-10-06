const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check the current latency of the bot.'),
	async execute(interaction) {
        let msg = await interaction.reply({ content: 'Pinging...', fetchReply: true });
		interaction.editReply(`Pong! Response Latency: ${Math.floor(msg.createdTimestamp - interaction.createdTimestamp)} ms`);
	},
};