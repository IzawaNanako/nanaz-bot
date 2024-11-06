import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, CommandInteraction } from 'discord.js';
import BannedMember from '../../models/bannedMember.js';
import sendLog from '../../utils/sendLog.js';
import supportButton from '../../utils/supportButton.js';

export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban selected member from the server.')
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to ban.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('The reason you are banning this user for.')
    )
    .addNumberOption(option => option
        .setName('delete_messages')
        .setDescription('How recent should their message be deleted in days? (Max 7, default 0, accepts decimals).')
        .setMinValue(0)
        .setMaxValue(7)
    )
    .addBooleanOption(option => option
        .setName('notice')
        .setDescription('To inform the user that they have been banned. By default, this is set to true.')
    )
    .addNumberOption(option => option
        .setName('duration')
        .setDescription('How long should the ban last for in days? (Accepts decimals, leave empty for indefinite).')
        .setMinValue(0)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setContexts(0);
export async function execute(interaction: CommandInteraction) {
    if (!interaction.guild || !interaction.guild.members.me) {
        await interaction.reply({
            content: 'Something went wrong...',
            ephemeral: true,
        });
        return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        await interaction.reply({
            content: 'I don\'t have permission to ban members in this server!',
            ephemeral: true,
        });
        return;
    }
    const user = interaction.options.get('user', true).user;
    if (!user) {
        await interaction.reply({
            content: 'Invalid User.',
            ephemeral: true,
        });
        return;
    }
    const member = await interaction.guild.members.fetch(user.id);
    const reason = interaction.options.get('reason')?.value as string ?? 'No reason provided.';
    const delDays = interaction.options.get('delete_messages')?.value as number || 0;
    const notice = interaction.options.get('notice')?.value as boolean || true;
    const duration = interaction.options.get('duration')?.value as number ?? undefined;
    if (!member || !user) {
        await interaction.reply({
            content: 'Invalid User.',
            ephemeral: true,
        });
        return;
    }

    if (user.id === interaction.user.id) {
        await interaction.reply({
            content: 'Bruh.',
            ephemeral: true,
        });
        return;
    }

    const [bannedMember] = await BannedMember.findOrCreate({
        where: {
            id: user.id,
            username: user.username,
            guildId: interaction.guild.id,
        }
    });

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
                value: `${user}`,
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
            iconURL: interaction.client.user.avatarURL() ?? undefined,
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

    if (!user.bot && notice) {
        await user.send(bannedNotice);
    }

    await interaction.guild.members.ban(user, {
        reason: reason,
        deleteMessageSeconds: delSecs,
    });

    await interaction.reply({
        embeds: [banEmbed],
        components: [supportButton],
    });

    await sendLog(interaction.guild, {
        embeds: [banEmbed],
    });
}