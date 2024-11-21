import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import sendLog from '../../utils/sendLog.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

i18next.setDefaultNamespace('commands');

export const data = new SlashCommandBuilder()
    .setName('set-channel')
    .setDescription('Set the logs channel or the channel to send bye messages in.')
    .setDescriptionLocalizations({
        'en-US': 'Set the logs channel or the channel to send bye messages in.',
        'ja': 'ログチャンネルまたはバイバイメッセージを送信するチャンネルを設定します。',
        'zh-CN': '设置日志频道或发送再见信息的频道。',
        'zh-TW': '設定記錄頻道或傳送再見訊息的頻道。',
    })
    .addSubcommandGroup(group => group
        .setName('log')
        .setDescription('Set the channel to send logs in.')
        .setDescriptionLocalizations({
            'en-US': 'Set the channel to send logs in.',
            'ja': 'ログを送信するチャンネルを設定します。',
            'zh-CN': '设置发送日志的频道。',
            'zh-TW': '設定傳送記錄的頻道。',
        })
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('The channel to send logs in.')
            .setDescriptionLocalizations({
                'en-US': 'The channel to send logs in.',
                'ja': 'ログを送信するチャンネル。',
                'zh-CN': '发送日志的频道。',
                'zh-TW': '傳送記錄的頻道。',
            })
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to send logs in.')
                .setDescriptionLocalizations({
                    'en-US': 'The channel to send logs in.',
                    'ja': 'ログを送信するチャンネル。',
                    'zh-CN': '发送日志的频道。',
                    'zh-TW': '傳送記錄的頻道。',
                })
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('disable')
            .setDescription('Disable sending logs in this server.')
            .setDescriptionLocalizations({
                'en-US': 'Disable sending logs in this server.',
                'ja': 'このサーバーのログ送信を無効にする。',
                'zh-CN': '停止在该服务器发送日志。',
                'zh-TW': '停止在此伺服器傳送記錄。',
            })
        )
    )
    .addSubcommandGroup(group => group
        .setName('bye')
        .setDescription('Set the channel to send bye messages in.')
        .setDescriptionLocalizations({
            'en-US': 'Set the channel to send bye messages in.',
            'ja': 'バイバイメッセージを送信するチャンネルを設定する。',
            'zh-CN': '设置发送再见信息的频道。',
            'zh-TW': '設定傳送再見訊息的頻道。',
        })
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('Set the channel to send bye messages in.')
            .setDescriptionLocalizations({
                'en-US': 'Set the channel to send bye messages in.',
                'ja': 'バイバイメッセージを送信するチャンネルを設定する。',
                'zh-CN': '设置发送再见信息的频道。',
                'zh-TW': '設定傳送再見訊息的頻道。',
            })
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to send bye messages in.')
                .setDescriptionLocalizations({
                    'en-US': 'The channel to send bye messages in.',
                    'ja': '別れのメッセージを送るチャンネル。 ',
                    'zh-CN': '发送再见信息的频道。',
                    'zh-TW': '傳送再見訊息的頻道。',
                })
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('disable')
            .setDescription('Disable sending bye messages in this server.')
            .setDescriptionLocalizations({
                'en-US': 'Disable sending bye messages in this server.',
                'ja': 'このサーバでバイバイメッセージを送信しないようにする。',
                'zh-CN': '停止在此服务器上发送再见信息。',
                'zh-TW': '停止在此伺服器傳送再見訊息。',
            })
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(0);
export async function execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getSubcommandGroup() as 'log' | 'bye';
    const executeUser = await User.findOne({
        where: {
            id: interaction.user.id,
        }
    });
    await i18next.changeLanguage(executeUser?.language);
    const unknownError = i18next.t('global.unknownError');
    const sendMessagePermissionError = i18next.t('global.sendMessagePermissionError');
    const viewChannelPermissionError = i18next.t('global.viewChannelPermissionError');
    const featureAlreadyDisabledError = type === 'log' ? i18next.t('setChannel.loggingAlreadyDisabledError') : i18next.t('setChannel.byeMessageAlreadyDisabledError');
    const featureChannelUnchangeError = type === 'log' ? i18next.t('setChannel.loggingChannelUnchangedError') : i18next.t('setChannel.byeMessageChannelUnchangedError');

    if (!interaction.guild || !interaction.guild.members.me) {
        await interaction.reply({
            content: unknownError,
            ephemeral: true,
        });
        return;
    };

    await interaction.deferReply();
    const channel = interaction.options.getChannel('channel');
    const [guild] = await Guild.findOrCreate({
        where: {
            id: interaction.guild.id,
        }
    });
    const channelKey = `${type}ChannelId` as 'byeChannelId' | 'logChannelId';
    const previousChannel = guild[channelKey];

    i18next.changeLanguage(guild.language);
    const requestedByAuthor = i18next.t('global.requestedByAuthor', {
        userDisplayName: interaction.user.displayName,
    });
    const executedByFooter = i18next.t('global.executedByFooter');
    const disabledLiteral = i18next.t('global.disabledLiteral');
    const channelChangedMessage = type === 'log' ? i18next.t('setChannel.logChannelChangedMessage') : i18next.t('setChannel.byeMessageChannelChangedMessage');
    const previousChannelLiteral = i18next.t(`setChannel.previousChannelLiteral`);
    const newChannelLiteral = i18next.t(`setChannel.newChannelLiteral`);
    const currentChannelLiteral = i18next.t(`setChannel.currentChannelLiteral`);

    if (channel && !interaction.guild.members.me.permissionsIn(channel.id).has(PermissionFlagsBits.SendMessages)) {
        await interaction.editReply({
            content: sendMessagePermissionError,
        });
        return;
    }

    if (channel && !interaction.guild.members.me.permissionsIn(channel.id).has(PermissionFlagsBits.ViewChannel)) {
        await interaction.reply({
            content: viewChannelPermissionError,
            ephemeral: true,
        });
        return;
    }

    if (!channel && !previousChannel) {
        await interaction.editReply({
            content: featureAlreadyDisabledError,
            components: [supportButton]
        });
    }

    if (channel && channel.id === previousChannel) {
        await interaction.editReply({
            content: featureChannelUnchangeError,
            components: [supportButton]
        });
    }

    const actionEmbed = new EmbedBuilder()
        .setColor('#2E4053')
        .setAuthor({
            name: requestedByAuthor,
        })
        .setTitle(channelChangedMessage)
        .setThumbnail(interaction.guild.iconURL())
        .addFields([
            {
                name: previousChannelLiteral,
                value: previousChannel ? `<#${previousChannel}>` : disabledLiteral,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
                inline: true,
            },
            {
                name: previousChannel ? newChannelLiteral : currentChannelLiteral,
                value: channel ? `${channel}` : disabledLiteral,
                inline: true,
            }
        ])
        .setFooter({
            text: executedByFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    await guild.update({
        [channelKey]: channel ? channel.id : null
    });

    await interaction.editReply({
        embeds: [actionEmbed],
        components: [supportButton]
    });

    await sendLog(interaction.guild, {
        embeds: [actionEmbed],
    });
}