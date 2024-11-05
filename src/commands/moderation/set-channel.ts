import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, CommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import sendLog from '../../utils/sendLog.js';
import supportButton from '../../utils/supportButton.js';

export const data = new SlashCommandBuilder()
    .setName('set-channel')
    .setDescription('Set the channel to send welcome messages, bye messages, and logs in.')
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
        .setDescription('The channel to set for the chosen feature, leave empty to disable the chosen feature.')
        .addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(0);
export async function execute(interaction: CommandInteraction) {
    if (!interaction.guild || !interaction.guild.members.me) {
        await interaction.reply({
            content: 'Something went wrong...',
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply();
    const type = interaction.options.get('type')?.value as string;
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    const channel = interaction.options.get('channel')?.channel;
    const [guild] = await Guild.findOrCreate({
        where: {
            id: interaction.guild.id,
        }
    });
    const channelKey = `${type}ChannelId` as 'welcomeChannelId' | 'byeChannelId' | 'logChannelId';
    const previousChannel = guild[channelKey];

    if (channel && !interaction.guild.members.me.permissionsIn(channel.id).has(PermissionFlagsBits.SendMessages)) {
        await interaction.editReply({
            content: 'The bot doesn\'t have permission to send messages in that channel.',
        });
        return;
    }

    const actionEmbed = new EmbedBuilder()
        .setColor('#2E4053')
        .setAuthor({
            name: `Requested by ${interaction.user.displayName}`,
        })
        .setTitle(`${typeName} Channel Changed`)
        .setThumbnail(interaction.guild.iconURL())
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
                value: `${channel}` || 'Disabled',
                inline: true,
            }
        ])
        .setFooter({
            text: `Executed by Nanaz`,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    guild.update({
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