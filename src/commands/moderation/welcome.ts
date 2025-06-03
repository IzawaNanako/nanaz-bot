import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChatInputCommandInteraction, ChannelType, InteractionContextType, MessageFlags } from 'discord.js';
import { Guild } from '../../models/guild.js';
import { WelcomeRole } from '../../models/welcomeRole.js';
import { setPrivateInteractionLanguage } from '../../utils/setInteractionLanguage.js';
import { sendLog } from '../../utils/sendLog.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure how the bot welcome new members of this server.')
    .setDescriptionLocalizations({
        'en-US': 'Configure how the bot welcome new members of this server.',
        'ja': 'ボットがこのサーバーの新しいメンバーをどのように歓迎するかを設定します。',
        'zh-CN': '設置机器人如何欢迎该服务器的新成员。',
        'zh-TW': '設定機器人如何歡迎此伺服器的新成員。',
    })
    .addSubcommandGroup(group => group
        .setName('channel')
        .setDescription('Set the channel to send welcome messages in.')
        .setDescriptionLocalizations({
            'en-US': 'Set the channel to send welcome messages in.',
            'ja': 'ウェルカムメッセージを送信するチャンネルを設定します。',
            'zh-CN': '设置发送欢迎信息的频道。',
            'zh-TW': '設定傳送歡迎訊息的頻道。',
        })
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('Set the channel to send welcome messages in.')
            .setDescriptionLocalizations({
                'en-US': 'Set the channel to send welcome messages in.',
                'ja': 'ウェルカムメッセージを送信するチャンネルを設定します。',
                'zh-CN': '设置发送欢迎信息的频道。',
                'zh-TW': '設定傳送歡迎訊息的頻道。',
            })
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to send welcome messages in.')
                .setDescriptionLocalizations({
                    'en-US': 'The channel to send welcome messages in.',
                    'ja': 'ウェルカムメッセージを送るチャンネル。',
                    'zh-CN': '发送欢迎信息的通道。',
                    'zh-TW': '傳送歡迎訊息的頻道。',
                })
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('disable')
            .setDescription('Disable sending welcome messages in this server.')
            .setDescriptionLocalizations({
                'en-US': 'Disable sending welcome messages in this server.',
                'ja': 'このサーバでウェルカムメッセージの送信を無効にする。',
                'zh-CN': '停止在此服务器中发送欢迎信息。',
                'zh-TW': '停止在此伺服器傳送歡迎訊息。',
            })
        )
    )
    .addSubcommandGroup(group => group
        .setName('message')
        .setDescription('Set the message to send to new members of this server.')
        .setDescriptionLocalizations({
            'en-US': 'Set the message to send to new members of this server.',
            'ja': 'このサーバーの新しいメンバーに送信するメッセージを設定します。',
            'zh-CN': '设置向服务器新成员发送的信息。',
            'zh-TW': '設定要傳送給此伺服器新成員的訊息。',
        })
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('Set the message to send to new members of this server.')
            .setDescriptionLocalizations({
                'en-US': 'Set the message to send to new members of this server.',
                'ja': 'このサーバーの新しいメンバーに送信するメッセージを設定します。',
                'zh-CN': '设置向服务器新成员发送的信息。',
                'zh-TW': '設定要傳送給此伺服器新成員的訊息。',
            })
            .addStringOption(option => option
                .setName('message')
                .setDescription('The message to send, read "/help Welcome Message" for more info.')
                .setDescriptionLocalizations({
                    'en-US': 'The message to send, read "/help Welcome Message" for more info.',
                    'ja': '送信するメッセージ。詳しくは"/help Welcome Message"を参照のこと。',
                    'zh-CN': '要发送的信息，详情请阅读"/help Welcome Message"。',
                    'zh-TW': '要傳送的訊息，更多資訊請參閱"/help Welcome Message"。',
                })
                .setRequired(true)
            )
        )
    )
    .addSubcommandGroup(group => group
        .setName('role')
        .setDescription('Set the roles to give to new members of this server.')
        .setDescriptionLocalizations({
            'en-US': 'Set the roles to give to new members of this server.',
            'ja': 'このサーバーの新しいメンバーに与えるロ一ルを設定します。',
            'zh-CN': '设置给予服务器新成员的身份组。',
            'zh-TW': '設定要賦予此伺服器新成員的身份組。',
        })
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Add a role to give to new members of this server.')
            .setDescriptionLocalizations({
                'en-US': 'Add a role to give to new members of this server.',
                'ja': 'このサーバーの新しいメンバーに贈るロ一ルを追加する。',
                'zh-CN': '添加一个身份组，以给予本服务器的新成员。',
                'zh-TW': '新增一個身份組，以給予這個伺服器的新成員。',
            })
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to give to new members of this server.')
                .setDescriptionLocalizations({
                    'en-US': 'The role to give to new members of this server.',
                    'ja': 'このサーバーの新しいメンバーに与えるロ一ル。',
                    'zh-CN': '给予本服务器新成员的身份组。',
                    'zh-TW': '給這個伺服器新成員的身分組。',
                })
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Remove a role from being given to new members of this server.')
            .setDescriptionLocalizations({
                'en-US': 'Remove a role from being given to new members of this server.',
                'ja': 'このサーバーの新しいメンバーに与えられるロ一ルを削除する。',
                'zh-CN': '移除一个给予此服务器新成员的身分组。',
                'zh-TW': '移除一個給予此伺服器新成員的身分組。',
            })
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to remove from being given to new members of this server.')
                .setDescriptionLocalizations({
                    'en-US': 'The role to remove from being given to new members of this server.',
                    'ja': 'このサーバーの新メンバーに与えられないようにするロ一ル。',
                    'zh-CN': '要移除给予此服务器新成员的身分组。',
                    'zh-TW': '要移除給予此伺服器新成員的身分組。',
                })
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('clear')
            .setDescription('Clear all welcome roles of this server.')
            .setDescriptionLocalizations({
                'en-US': 'Clear all welcome roles of this server.',
                'ja': 'このサーバーのウェルカムロ一ルをすべて消去する。',
                'zh-CN': '清除本服务器的所有欢迎身份组。',
                'zh-TW': '清除此伺服器的所有歡迎身分組。',
            })
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild);
export async function execute(interaction: ChatInputCommandInteraction) {
    await setPrivateInteractionLanguage(interaction);

    const unknownError = i18next.t('global.unknownError');
    const sendMessagePermissionError = i18next.t('global.sendMessagePermissionError');
    const manageRolesPermissionError = i18next.t('global.manageRolesPermissionError');
    const viewChannelPermissionError = i18next.t('global.viewChannelPermissionError');
    const welcomeMessageAlreadyDisabledError = i18next.t('welcome.welcomeMessageAlreadyDisabledError');
    const welcomeChannelUnchangedError = i18next.t('welcome.welcomeChannelUnchangedError');

    if (!interaction.guild || !interaction.guild.members.me) {
        await interaction.reply({
            content: unknownError,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const [guild] = await Guild.findOrCreate({
        where: {
            id: interaction.guild.id,
        }
    });

    i18next.changeLanguage(guild.language);
    
    const requestedByAuthor = i18next.t('global.requestedByAuthor', {
        userDisplayName: interaction.user.displayName,
    });
    const executedByFooter = i18next.t('global.executedByFooter');
    const disabledLiteral = i18next.t('global.disabledLiteral');
    const noneLiteral = i18next.t('global.noneLiteral');
    const welcomeChannelChangedMessage = i18next.t('welcome.welcomeChannelChangedMessage');
    const welcomeMessageChangedMessage = i18next.t('welcome.welcomeMessageChangedMessage');
    const welcomeRolesChangedMessage = i18next.t('welcome.welcomeRolesChangedMessage');
    const previousChannelLiteral = i18next.t('welcome.previousChannelLiteral');
    const newChannelLiteral = i18next.t('welcome.newChannelLiteral');
    const currentChannelLiteral = i18next.t('welcome.currentChannelLiteral');
    const previousMessageLiteral = i18next.t('welcome.previousMessageLiteral');
    const currentMessageLiteral = i18next.t('welcome.currentMessageLiteral');
    const previousRolesLiteral = i18next.t('welcome.previousRolesLiteral');
    const currentRolesLiteral = i18next.t('welcome.currentRolesLiteral');
    const roleAlreadyInListError = i18next.t('welcome.roleAlreadyInListError');

    const subCommandGroupChosen = interaction.options.getSubcommandGroup();
    if (subCommandGroupChosen === 'channel') {
        const channel = interaction.options.getChannel('channel');

        if (channel && !interaction.guild.members.me.permissionsIn(channel.id).has(PermissionFlagsBits.SendMessages)) {
            await interaction.reply({
                content: sendMessagePermissionError,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (channel && !interaction.guild.members.me.permissionsIn(channel.id).has(PermissionFlagsBits.ViewChannel)) {
            await interaction.reply({
                content: viewChannelPermissionError,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.deferReply();
        const previousChannel = guild.welcomeChannelId;

        if (!channel && !previousChannel) {
            await interaction.editReply({
                content: welcomeMessageAlreadyDisabledError,
                components: [supportButton]
            });
        }

        if (channel && channel.id === previousChannel) {
            await interaction.editReply({
                content: welcomeChannelUnchangedError,
                components: [supportButton]
            });
        }

        const actionEmbed = new EmbedBuilder()
            .setColor('#2E4053')
            .setAuthor({
                name: requestedByAuthor,
            })
            .setTitle(welcomeChannelChangedMessage)
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
                    value: channel ? `${channel}` : noneLiteral,
                    inline: true,
                }
            ])
            .setFooter({
                text: executedByFooter,
                iconURL: interaction.client.user.avatarURL() ?? undefined,
            })
            .setTimestamp();
    
        await guild.update({
            welcomeChannelId: channel ? channel.id : null
        });
    
        await interaction.editReply({
            embeds: [actionEmbed],
            components: [supportButton]
        });
    
        await sendLog(interaction.guild, {
            embeds: [actionEmbed],
        });
    }
    else if (subCommandGroupChosen === 'message') {
        await interaction.deferReply();
        const message = interaction.options.getString('message', true);
    
        const actionEmbed = new EmbedBuilder()
            .setColor('#2E4053')
            .setAuthor({
                name: requestedByAuthor,
            })
            .setTitle(welcomeMessageChangedMessage)
            .setThumbnail(interaction.guild.iconURL())
            .addFields([
                {
                    name: previousMessageLiteral,
                    value: `${guild.welcomeMessage}`,
                },
                {
                    name: currentMessageLiteral,
                    value: `${message}`,
                }
            ])
            .setTimestamp()
            .setFooter({
                text: executedByFooter,
                iconURL: interaction.client.user.avatarURL() ?? undefined,
            });
    
        await guild.update({
            welcomeMessage: message,
        });
    
        await interaction.editReply({
            embeds: [actionEmbed],
            components: [supportButton],
        });
    
        await sendLog(interaction.guild, {
            embeds: [actionEmbed],
        });
    }
    else {
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            await interaction.reply({
                content: manageRolesPermissionError,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.deferReply();
        const action = interaction.options.getSubcommand();
        const role = interaction.options.getRole('role');
    
        let roles = await WelcomeRole.findAll({
            where: {
                guildId: guild.id,
            }
        });
    
        const previousRolesList = roles.map(oldRole => `<@&${oldRole.id}>`).join(', ');
    
        if (previousRolesList.includes(`<@&${role?.id}>`) && action === 'add') {
            await interaction.editReply({
                content: roleAlreadyInListError,
            });
            return;
        }
    
        const actionEmbed = new EmbedBuilder()
            .setColor('#2E4053')
            .setAuthor({
                name: requestedByAuthor,
            })
            .setTitle(welcomeRolesChangedMessage)
            .setThumbnail(interaction.guild.iconURL())
            .addFields([
                {
                    name: previousRolesLiteral,
                    value: previousRolesList.length > 0 ? previousRolesList : noneLiteral,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                }
            ])
            .setTimestamp()
            .setFooter({
                text: executedByFooter,
                iconURL: interaction.client.user.avatarURL() ?? undefined,
            });

        if (action === 'add') {
            if (!role) {
                await interaction.editReply({
                    content: unknownError,
                });
                return;
            }
            await WelcomeRole.create({
                id: role.id,
                guildId: guild.id,
            });
        }
        else if (action === 'remove') {
            if (!role) {
                await interaction.editReply({
                    content: unknownError,
                });
                return;
            }
            await WelcomeRole.destroy({
                where: {
                    id: role.id,
                    guildId: guild.id,
                }
            });
        }
        else {
            await WelcomeRole.destroy({
                where: {
                    guildId: guild.id,
                }
            });
        }
    
        roles = await WelcomeRole.findAll({
            where: {
                guildId: guild.id,
            }
        });
    
        const rolesList = roles.map(role => `<@&${role.id}>`).join(', ');
    
        actionEmbed
            .addFields([
                {
                    name: currentRolesLiteral,
                    value: rolesList.length > 0 ? rolesList : noneLiteral,
                    inline: true,
                }
            ]);
    
        await interaction.editReply({
            embeds: [actionEmbed],
            components: [supportButton],
        });
    
        await sendLog(interaction.guild, {
            embeds: [actionEmbed],
        });
    }
}