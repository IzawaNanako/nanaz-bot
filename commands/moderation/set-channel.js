const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const Guild = require('../../models/guild.js');
const sendLog = require('../../utils/sendLog.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-channel')
        .setDescription('Set the channel to send welcome messages, bye messages and logs.')
        .addStringOption(option => option
            .setName('type')
            .setDescription('The type of channel to set.')
            .setRequired(true)
            .addChoices(
                {
                    name: 'welcome',
                    value: 'welcome',
                },
                {
                    name: 'bye',
                    value: 'bye',
                },
                {
                    name: 'log',
                    value: 'log',
                }
            )
        )
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to send chosen message type in, leave empty to disable the chosen feature.')
            .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(0),
    async execute(interaction) {
        await interaction.deferReply();
        const type = interaction.options.getString('type');
        const typeName = type.charAt(0).toUpperCase() + type.slice(1);
        const channel = interaction.options.getChannel('channel');
        const [ guild ] = await Guild.findOrCreate({
            where: {
                id: await interaction.guild.id,
            }
        });
        const previousChannel = guild[type + 'ChannelId'];

        const actionEmbed = new EmbedBuilder()
            .setColor('#2E4053')
            .setAuthor({
                name: `Requested by ${interaction.user.displayName}`,
            })
            .setTitle(`${typeName} Channel Changed`)
            .setThumbnail(interaction.guild.iconURL({
                dynamic: true,
            }))
            .addFields([
                {
                    name: 'Previous Channel',
                    value: previousChannel ? `<#${previousChannel}>` : 'Disabled',
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: previousChannel ? 'New Channel' : 'Current Channel',
                    value: `${channel}` ?? 'Disabled',
                    inline: true,
                }
            ])
            .setFooter({
                text: `Executed by Nanaz`,
                iconURL: interaction.client.user.avatarURL(),
            })
            .setTimestamp();

        guild[type + 'ChannelId'] = channel ? channel.id : null;
        await guild.save();

        await interaction.editReply({
            embeds: [actionEmbed],
        });

        await sendLog(interaction.guild, {
            embeds: [actionEmbed],
        });
    }
}