import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('owo')
    .setDescription('owo!');
export async function execute(interaction: CommandInteraction) {
    await interaction.reply('owo!');
}