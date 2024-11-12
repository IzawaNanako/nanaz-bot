import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChatInputCommandInteraction, ChannelType } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import WelcomeRole from '../../models/welcomeRole.js';
import sendLog from '../../utils/sendLog.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure how the bot welcome new members of this server.')
    .setDescriptionLocalizations({
        'en-US': '',
        'ja': '',
        'zh-CN': '',
        'zh-TW': '',
    })
    .addSubcommandGroup(group => group
        .setName('channel')
        .setDescription('Set the channel to send welcome messages in.')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('Set the channel to send welcome messages in.')
            .setDescriptionLocalizations({
                'en-US': '',
                'ja': '',
                'zh-CN': '',
                'zh-TW': '',
            })
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to send welcome messages in.')
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
            .setDescription('Disable sending welcome messages in this server.')
            .setDescriptionLocalizations({
                'en-US': '',
                'ja': '',
                'zh-CN': '',
                'zh-TW': '',
            })
        )
    )
    .addSubcommandGroup(group => group
        .setName('message')
        .setDescription('Set the message to send to new members of this server.')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('Set the message to send to new members of this server.')
            .setDescriptionLocalizations({
                'en-US': '',
                'ja': '',
                'zh-CN': '',
                'zh-TW': '',
            })
            .addStringOption(option => option
                .setName('message')
                .setDescription('The message to send, read "/help Welcome Message" for more info.')
                .setDescriptionLocalizations({
                    'en-US': '',
                    'ja': '',
                    'zh-CN': '',
                    'zh-TW': '',
                })
                .setRequired(true)
            )
        )
    )
    .addSubcommandGroup(group => group
        .setName('role')
        .setDescription('Set the roles to give to new members of this server.')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Add a role to give to new members of this server.')
            .setDescriptionLocalizations({
                'en-US': '',
                'ja': '',
                'zh-CN': '',
                'zh-TW': '',
            })
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to give to new members of this server.')
                .setDescriptionLocalizations({
                    'en-US': '',
                    'ja': '',
                    'zh-CN': '',
                    'zh-TW': '',
                })
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Remove a role from being given to new members of this server.')
            .setDescriptionLocalizations({
                'en-US': '',
                'ja': '',
                'zh-CN': '',
                'zh-TW': '',
            })
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to remove from being given to new members of this server.')
                .setDescriptionLocalizations({
                    'en-US': '',
                    'ja': '',
                    'zh-CN': '',
                    'zh-TW': '',
                })
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('clear')
            .setDescription('Clear all roles of this server.')
            .setDescriptionLocalizations({
                'en-US': '',
                'ja': '',
                'zh-CN': '',
                'zh-TW': '',
            })
        )
    )
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
    const manageRolesPermissionError = i18next.t('global:manage_roles_permission_error');
    if (!interaction.guild || !interaction.guild.members.me) {
        await interaction.reply({
            content: unknownError,
            ephemeral: true,
        });
        return;
    }

    const [guild] = await Guild.findOrCreate({
        where: {
            id: interaction.guild.id,
        }
    });
    i18next.changeLanguage(guild.language);
    const requestedByAuthor = i18next.t('global:requested_by_author', {
        user_displayName: interaction.user.displayName,
    });
    const executedByFooter = i18next.t('global:executed_by_footer');
    const disabledLiteral = i18next.t('global:disabled_literal');
    const noneLiteral = i18next.t('global:none_literal');
    const welcomeChannelChangedMessage = i18next.t('welcome:welcome_channel_changed_message');
    const welcomeMessageChangedMessage = i18next.t('welcome:welcome_message_changed_message');
    const welcomeRolesChangedMessage = i18next.t('welcome:welcome_roles_changed_message');
    const previousChannelLiteral = i18next.t('welcome:previous_channel_literal');
    const newChannelLiteral = i18next.t('welcome:new_channel_literal');
    const currentChannelLiteral = i18next.t('welcome:current_channel_literal');
    const previousMessageLiteral = i18next.t('welcome:previous_message_literal');
    const currentMessageLiteral = i18next.t('welcome:current_message_literal');
    const previousRolesLiteral = i18next.t('welcome:previous_roles_literal');
    const currentRolesLiteral = i18next.t('welcome:current_roles_literal');
    const roleAlreadyInListError = i18next.t('welcome:role_already_in_list_error');

    const subCommandGroupChosen = interaction.options.getSubcommandGroup();
    if (subCommandGroupChosen === 'channel') {
        const channel = interaction.options.getChannel('channel', true);

        if (channel && !interaction.guild.members.me.permissionsIn(channel.id).has(PermissionFlagsBits.SendMessages)) {
            await interaction.reply({
                content: sendMessagePermissionError,
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply();
        const previousChannel = guild.welcomeChannelId;

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
                    value: `${channel}` || noneLiteral,
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
                ephemeral: true,
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