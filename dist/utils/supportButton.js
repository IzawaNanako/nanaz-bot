import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
const supportServer = process.env.SUPPORT_SERVER;
if (!supportServer) {
    console.error('Support server not found.');
    process.exit(1);
}
const supportButton = new ActionRowBuilder()
    .addComponents(new ButtonBuilder()
    .setLabel('Support Server')
    .setStyle(ButtonStyle.Link)
    .setEmoji('📞')
    .setURL(supportServer));
export default supportButton;
