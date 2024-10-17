const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const supportButton = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setLabel('Support')
            .setStyle(ButtonStyle.Link)
            .setEmoji('📞')
            .setURL(process.env.SUPPORT_SERVER)
    );

module.exports = supportButton;