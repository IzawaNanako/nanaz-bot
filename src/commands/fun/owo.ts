import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('owo')
    .setDescription('owo!');
export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('owo!');
}
