const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('owo')
		.setDescription('owo!'),
        
	async execute(interaction) {
		await interaction.reply('owo!');
	},
};