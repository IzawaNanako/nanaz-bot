import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import i18next from 'i18next';

i18next.setDefaultNamespace('general');
const rematchLabel = i18next.t('buttons.rematchLabel');
const supportServerLabel = i18next.t('buttons.supportServerLabel');
const acceptLabel = i18next.t('buttons.acceptLabel');
const declineLabel = i18next.t('buttons.declineLabel');

export const rematchButton = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('rematch')
            .setLabel(rematchLabel)
            .setStyle(ButtonStyle.Danger)
);

const supportServer = process.env.SUPPORT_SERVER;

if (!supportServer) {
    console.error('Support server not found.');
    process.exit(1);
}

export const supportButton = new ActionRowBuilder<ButtonBuilder> ()
    .addComponents(
        new ButtonBuilder()
            .setLabel(supportServerLabel)
            .setStyle(ButtonStyle.Link)
            .setEmoji('📞')
            .setURL(supportServer)
    );

export const acceptAndDeclineButton = new ActionRowBuilder<ButtonBuilder> ()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('accept')
            .setLabel(acceptLabel)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('decline')
            .setLabel(declineLabel)
            .setStyle(ButtonStyle.Danger)
    );
