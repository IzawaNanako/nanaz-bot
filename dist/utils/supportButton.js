import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
const supportButton = new ActionRowBuilder()
    .addComponents(new ButtonBuilder()
    .setLabel('Support Server')
    .setStyle(ButtonStyle.Link)
    .setEmoji('📞')
    .setURL(process.env.SUPPORT_SERVER));
export default supportButton;
