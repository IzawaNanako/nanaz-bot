import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const supportServer = process.env.SUPPORT_SERVER;

if (!supportServer) {
    console.error('Support server not found.');
    process.exit(1);
}

const rematchButton = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('rematch')
            .setLabel('Rematch')
            .setStyle(ButtonStyle.Danger)
);


export default rematchButton;