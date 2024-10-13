const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Guild = require('../../models/guild.js');
const WelcomeRole = require('../../models/welcomeRole.js');
const sendLog = require('../../utils/sendLog.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-role')
        .setDescription('Set the roles to give to new members of this server.')
        .addStringOption(option => option
            .setName('action')
            .setDescription('The action to perform. Can be "add", "remove" or "clear" to clear all welcome roles.')
            .setRequired(true)
            .addChoices(
                {
                    name: 'Add',
                    value: 'add',
                },
                {
                    name: 'Remove',
                    value: 'remove',
                },
                {
                    name: 'Clear',
                    value: 'clear',
                }
            )
        )
        .addRoleOption(option => option
            .setName('role')
            .setDescription('The role to add or remove.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(0),
    async execute(interaction) {
        await interaction.deferReply();
        const action = interaction.options.getString('action');
        const role = interaction.options.getRole('role');
        const [ guild ] = await Guild.findOrCreate({
            where: {
                id: await interaction.guild.id,
            }
        });

        if (action === 'clear' && role) {
            await interaction.editReply({
                content: 'Please leave the role section empty to clear all welcome roles!',
            });
            return;
        }
        else if (action !== 'clear' && !role) {
            await interaction.editReply({
                content: 'Please specify a existing role!',
            });
            return;
        }

        let roles = await WelcomeRole.findAll({
            where: {
                guildId: guild.id,
            }
        });

        const previousRolesList = roles.map(role => `<@&${role.id}>`).join(', ');

        if (previousRolesList.includes(role) && action === 'add') {
            await interaction.editReply({
                content: 'This role is already in the list!',
            });
            return;
        }

        const actionEmbed = new EmbedBuilder()
            .setColor('#2E4053')
            .setAuthor({
                name: `Requested by ${interaction.user.displayName}`,
            })
            .setTitle('Welcome Roles Changed')
            .setThumbnail(interaction.guild.iconURL({
                dynamic: true,
            }))
            .addFields([
                {
                    name: 'Previous Roles',
                    value: previousRolesList.length > 0 ? previousRolesList : 'None',
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                }
            ])
            .setFooter({
                text: `Executed by Nanaz`,
                iconURL: interaction.client.user.avatarURL(),
            })
            .setTimestamp();
        
        if (action === 'clear') {
            await WelcomeRole.destroy({
                where: {
                    guildId: guild.id,
                }
            });
        }
        else if (action === 'add') {
            await WelcomeRole.create({
                id: role.id,
                guildId: guild.id,
            });
        }
        else if (action === 'remove') {
            await WelcomeRole.destroy({
                where: {
                    id: role.id,
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
                    name: 'Current Roles',
                    value: rolesList.length > 0 ? rolesList : 'None',
                    inline: true,
                }
            ]);

        await interaction.editReply({
            embeds: [actionEmbed],
        });

        await sendLog(interaction.guild, {
            embeds: [actionEmbed],
        });
    }
}