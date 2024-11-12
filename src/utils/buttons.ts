import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import i18next from 'i18next';

i18next.setDefaultNamespace('general');
const rematchLabel = i18next.t('buttons:rematch_label');
const supportServerLabel = i18next.t('buttons:support_server_label');
const acceptLable = i18next.t('buttons:accept_label');
const declineLable = i18next.t('buttons:decline_label');

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

export const supportButton = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setLabel(supportServerLabel)
            .setStyle(ButtonStyle.Link)
            .setEmoji('📞')
            .setURL(supportServer)
    );

export const acceptAndDeclineButton = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('accept')
            .setLabel(acceptLable)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('decline')
            .setLabel(declineLable)
            .setStyle(ButtonStyle.Danger)
    );
