import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('owo')
    .setDescription('owo!');
export async function execute(interaction) {
    await interaction.reply('owo!');
}