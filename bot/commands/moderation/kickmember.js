const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kick seleted member from the server.'),
	async execute(interaction) {
		await interaction.reply('owo!');
	},
};