import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, CommandInteraction } from 'discord.js';
import GuildMember from '../../models/guildMember.js';
import sendLog from '../../utils/sendLog.js';
import supportButton from '../../utils/supportButton.js';

export const data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick selected member from the server.')
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to kick.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('The reason you are kicking this user for.')
    )
    .addBooleanOption(option => option
        .setName('notice')
        .setDescription('To inform the user that they have been kicked. By default, this is set to true.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setContexts(0);
export async function execute(interaction: CommandInteraction) {
    if (!interaction.guild || !interaction.guild.members.me) {
        await interaction.reply({
            content: 'Something went wrong...',
            ephemeral: true,
        });
        return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
        await interaction.reply({
            content: 'I don\'t have permission to kick members in this server!',
            ephemeral: true,
        });
        return;
    }
    const user = interaction.options.get('user', true).user;
    if (!user) {
        await interaction.reply({
            content: 'Invalid User',
            ephemeral: true,
        });
        return;
    }
    const member = await interaction.guild.members.fetch(user.id);
    const reason = interaction.options.get('reason')?.value as string;
    const notice = interaction.options.get('notice')?.value as boolean || true;
    const [guildMember] = await GuildMember.findOrCreate({
        where: {
            id: user.id,
            guildId: interaction.guild.id,
        }
    });

    if (user.id === interaction.user.id) {
        await interaction.reply({
            content: 'What the heck are you doing?',
        });
        return;
    }

    if (!member.kickable) {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('I can\'t seem to kick that user.\nTry checking my kick permission.'),
            ],
            ephemeral: true,
        });
        return;
    }

    const kickMsgID = Math.floor(Math.random() * 5);
    const kickMsgs = [
        'They have seen better days...',
        'They\'ll probably not be missed.',
        'They\'ll be missed.',
        'I\'m going to miss you.',
        'I\'m sorry. I\'m sorry. I\'m sorry.'
    ];

    const kickEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('👋 Member Kicked')
        .setDescription(kickMsgs[kickMsgID])
        .addFields([
            {
                name: 'User: ',
                value: `${member.user}`,
                inline: true,
            },
            {
                name: 'Issued by: ',
                value: `${interaction.user}`,
                inline: true,
            },
        ])
        .setImage('https://i.imgur.com/3RiBEiw.gif')
        .setTimestamp()
        .setFooter({
            text: 'The user can join back at anytime.',
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        });

    let kickedNotice = `${interaction.user} kicked you from **${interaction.guild.name}**.`;

    if (reason) {
        kickedNotice += ` Reason: ${reason}`;
        kickEmbed
            .addFields({
                name: 'Reason: ',
                value: reason,
            });
    }

    if (!member.user.bot && notice) {
        await member.send(kickedNotice);
    }

    guildMember.update({
        isKicked: true,
    });

    await interaction.reply({
        embeds: [kickEmbed],
        components: [supportButton],
    });
    await member.kick();

    await sendLog(interaction.guild, {
        embeds: [kickEmbed],
    });
}