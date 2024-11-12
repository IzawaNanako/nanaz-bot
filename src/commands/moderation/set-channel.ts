import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import sendLog from '../../utils/sendLog.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('set-channel')
    .setDescription('Set the logs channel or the channel to send bye messages in.')
    .setDescriptionLocalizations({
        'en-US': '',
        'ja': '',
        'zh-CN': '',
        'zh-TW': '',
    })
    .addSubcommandGroup(group => group
        .setName('log')
        .setDescription('Set the channel to send logs in.')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('The channel to send logs in.')
            .setDescriptionLocalizations({
                'en-US': '',
                'ja': '',
                'zh-CN': '',
                'zh-TW': '',
            })
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to send logs in.')
                .setDescriptionLocalizations({
                    'en-US': '',
                    'ja': '',
                    'zh-CN': '',
                    'zh-TW': '',
                })
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('disable')
            .setDescription('Disable sending logs in this server.')
            .setDescriptionLocalizations({
                'en-US': '',
                'ja': '',
                'zh-CN': '',
                'zh-TW': '',
            })
        )
    )
    .addSubcommandGroup(group => group
        .setName('bye')
        .setDescription('Set the channel to send bye messages in.')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('Set the channel to send bye messages in.')
            .setDescriptionLocalizations({
                'en-US': '',
                'ja': '',
                'zh-CN': '',
                'zh-TW': '',
            })
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to send bye messages in.')
                .setDescriptionLocalizations({
                    'en-US': '',
                    'ja': '',
                    'zh-CN': '',
                    'zh-TW': '',
                })
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('disable')
            .setDescription('Disable sending bye messages in this server.')
            .setDescriptionLocalizations({
                'en-US': '',
                'ja': '',
                'zh-CN': '',
                'zh-TW': '',
            })
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(0);
export async function execute(interaction: ChatInputCommandInteraction) {
    const executeUser = await User.findOne({
        where: {
            id: interaction.user.id,
        }
    });
    i18next.changeLanguage(executeUser?.language);
    const unknownError = i18next.t('global:unknown_error');
    const sendMessagePermissionError = i18next.t('global:send_message_permission_error');
    if (!interaction.guild || !interaction.guild.members.me) {
        await interaction.reply({
            content: unknownError,
            ephemeral: true,
        });
        return;
    };

    await interaction.deferReply();
    const type = interaction.options.getSubcommandGroup() as 'log' | 'bye';
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    const channel = interaction.options.getChannel('channel', true);
    const [guild] = await Guild.findOrCreate({
        where: {
            id: interaction.guild.id,
        }
    });
    const channelKey = `${type}ChannelId` as 'byeChannelId' | 'logChannelId';
    const previousChannel = guild[channelKey];

    i18next.changeLanguage(guild.language);
    const requestedByAuthor = i18next.t('global:requested_by_author', {
        user_displayName: interaction.user.displayName,
    });
    const executedByFooter = i18next.t('global:executed_by_footer');
    const disabledLiteral = i18next.t('global:disabled_literal');
    const channelChangedMessage = i18next.t(`set-channel:channel_changed_message`, {
        type_name: typeName,
    });
    const previousChannelLiteral = i18next.t(`set-channel:previous_channel_literal`);
    const newChannelLiteral = i18next.t(`set-channel:new_channel_literal`);
    const currentChannelLiteral = i18next.t(`set-channel:current_channel_literal`);

    if (channel && !interaction.guild.members.me.permissionsIn(channel.id).has(PermissionFlagsBits.SendMessages)) {
        await interaction.editReply({
            content: sendMessagePermissionError,
        });
        return;
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
                value: `${channel}` || disabledLiteral,
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