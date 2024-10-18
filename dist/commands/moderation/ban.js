import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import BannedMember from '../../models/bannedMember.js';
import sendLog from '../../utils/sendLog.js';
import supportButton from '../../utils/supportButton.js';
export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban selected member from the server.')
    .addUserOption(option => option
    .setName('user')
    .setDescription('The user to ban.')
    .setRequired(true))
    .addStringOption(option => option
    .setName('reason')
    .setDescription('The reason you are banning this user for.'))
    .addNumberOption(option => option
    .setName('delete_messages')
    .setDescription('How recent should their message be deleted in days? (Max 7, default 0, accepts decimals).')
    .setMinValue(0)
    .setMaxValue(7))
    .addBooleanOption(option => option
    .setName('notice')
    .setDescription('To inform the user that they have been banned. By default, this is set to true.'))
    .addNumberOption(option => option
    .setName('duration')
    .setDescription('How long should the ban last for in days? (Accepts decimals, leave empty for indefinite).')
    .setMinValue(0))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setContexts(0);
export async function execute(interaction) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');
    const delDays = interaction.options.getNumber('delete_messages') || 0;
    const notice = interaction.options.getBoolean('notice') || true;
    const duration = interaction.options.getNumber('duration');
    const bannedMember = await BannedMember.findOrCreate({
        where: {
            id: member.user.id,
            username: member.user.username,
            guildId: interaction.guild.id,
        }
    });
    if (member.user.id === interaction.user.id) {
        await interaction.reply({
            content: 'Bruh.',
        });
        return;
    }
    if (!member.bannable) {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('I can\'t seem to ban that user.\nTry checking my ban permission.'),
            ],
            ephemeral: true,
        });
        return;
    }
    const banMsgID = Math.floor(Math.random() * 5);
    const banMsgs = [
        'Be gone!',
        'They disgusted me.',
        'Who knows, maybe they\'ll be back someday?',
        'That\'s what you get.',
        'No tolerance.'
    ];
    const banEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('<:banhammer:1296420170188718141> Member Banned')
        .setDescription(banMsgs[banMsgID])
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
        {
            name: '\u200B',
            value: '\u200B',
        },
    ])
        .setImage('https://i.imgur.com/ioBFfq3.gif')
        .setTimestamp()
        .setFooter({
        text: 'Check Server Settings -> Bans or /baninfo for more information.',
        iconURL: interaction.client.user.avatarURL(),
    });
    let bannedNotice = `${interaction.user} banned you from **${interaction.guild.name}**.`;
    if (reason) {
        bannedNotice += ` Reason: ${reason}`;
        banEmbed
            .addFields({
            name: 'Reason: ',
            value: reason,
            inline: true,
        });
    }
    if (!member.user.bot && notice) {
        await member.send(bannedNotice);
    }
    const delSecs = Math.round(delDays * 86400);
    bannedMember.update({
        totalBans: bannedMember.totalBans + 1,
        isBanned: true,
        bannedBy: interaction.user.id,
        bannedReason: reason,
        bannedAt: new Date(),
    });
    if (duration) {
        bannedMember.update({
            bannedUntil: new Date(Date.now() + (duration * 86400000)),
        });
    }
    banEmbed
        .addFields({
        name: 'Expire Date: ',
        value: duration ? `${bannedMember.bannedUntil}` : 'Never',
        inline: true,
    });
    await interaction.reply({
        embeds: [banEmbed],
        components: [supportButton],
    });
    await interaction.guild.members.ban(member, {
        reason: reason ?? 'No reason provided.',
        deleteMessageSeconds: delSecs,
    });
    await sendLog(interaction.guild, {
        embeds: [banEmbed],
    });
}
