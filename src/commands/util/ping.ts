import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the current latency of the bot.')
    .setDescriptionLocalizations({
        'en-US': 'Check the current latency of the bot.',
        'ja': 'ボットの現在の待ち時間をチェックする。',
        'zh-CN': '检查机器人当前的延迟时间。',
        'zh-TW': '檢查機器人目前的延遲時間。',
    });
export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
        const guild = await Guild.findOne({
            where: {
                id: interaction.guild.id,
            }
        });
        i18next.changeLanguage(guild?.language);
    }
    else {
        const executeUser = await User.findOne({
            where: {
                id: interaction.user.id,
            }
        });
        i18next.changeLanguage(executeUser?.language);
    }
    const requestedByAuthor = i18next.t('global:requested_by_author', {
        user_displayName: interaction.user.displayName,
    });
    const pingingMessage = i18next.t('ping:pinging_message');
    const pingFinishedMessage = i18next.t('ping:ping_finished_message');
    const latencyLiteral = i18next.t('ping:latency_literal');
    const apiLatencyLiteral = i18next.t('ping:api_latency_literal');
    const pingedByFooter = i18next.t('ping:pinged_by_footer');

    const pingEmbed = new EmbedBuilder()
        .setColor('#808080')
        .setAuthor({
            name: requestedByAuthor,
        })
        .setTitle(pingingMessage)
        .setFooter({
            text: pingedByFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    const msg = await interaction.reply({
        embeds: [pingEmbed],
        fetchReply: true,
    });

    await interaction.editReply({
        embeds: [
            pingEmbed
                .setColor(Math.floor(msg.createdTimestamp - interaction.createdTimestamp) < 200 ? '#00FF00' : Math.floor(msg.createdTimestamp - interaction.createdTimestamp) < 400 ? '#FFFF00' : '#FF0000')
                .setTitle(pingFinishedMessage)
                .addFields([
                    {
                        name: latencyLiteral,
                        value: `${Math.floor(msg.createdTimestamp - interaction.createdTimestamp)}ms`,
                    },
                    {
                        name: apiLatencyLiteral,
                        value: `${interaction.client.ws.ping}ms`,
                    }
                ])
        ],
        components: [supportButton],
    });
}