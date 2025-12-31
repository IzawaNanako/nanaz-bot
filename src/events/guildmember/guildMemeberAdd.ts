import { Events, EmbedBuilder, GuildMember as Member, PermissionFlagsBits, TextChannel } from 'discord.js';
import { Guild } from '../../models/guild.js';
import { User } from '../../models/user.js';
import { GuildMember } from '../../models/guildMember.js';
import { BannedMember } from '../../models/bannedMember.js';
import { WelcomeRole } from '../../models/welcomeRole.js';
import i18next from 'i18next';

export const name = Events.GuildMemberAdd;
export async function execute(member: Member) {
    if (member.user.bot) {
        return;
    }

    try {
        await User.findOrCreate({
            where: {
                id: member.id
            }
        });
    }
    catch (error) {
        console.error(`Error registering user ${member.id}:`, error);
    }

    const [guild] = await Guild.findOrCreate({
        where: {
            id: member.guild.id,
        }
    });

    i18next.setDefaultNamespace('events');
    await i18next.changeLanguage(guild.language);
    const welcomeEmbedTitle = i18next.t('guildMemberAdd.welcomeEmbedTitle', {
        userDisplayName: member.user.username,
    });
    const welcomeEmbedFooter = i18next.t('guildMemberAdd.welcomeEmbedFooter');
    const welcomeEmbedWasKicked = i18next.t('guildMemberAdd.welcomeEmbedWasKicked');
    const welcomeEmbedWasBanned = i18next.t('guildMemberAdd.welcomeEmbedWasBanned');

    const [guildMember] = await GuildMember.findOrCreate({
        where: {
            id: member.user.id,
            guildId: member.guild.id,
        }
    });
    const bannedMember = await BannedMember.findOne({
        where: {
            id: member.user.id,
            guildId: member.guild.id,
        }
    });
    const welcomeRoles = await WelcomeRole.findAll({
        where: {
            guildId: member.guild.id,
        }
    });

    let welcomeChannel;
    if (guild.welcomeChannelId) {
        welcomeChannel = await member.guild.channels.fetch(guild.welcomeChannelId) as TextChannel;
    }
    
    if (guild.welcomeChannelId && welcomeChannel && member.guild.members.me && member.guild.members.me.permissionsIn(guild.welcomeChannelId).has(PermissionFlagsBits.SendMessages) && member.guild.members.me.permissionsIn(guild.welcomeChannelId).has(PermissionFlagsBits.ViewChannel)) {
        const welcomeMessage = guild.welcomeMessage;

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2E4053')
            .setAuthor({
                name: `Yo ${member.user.username}!`,
                iconURL: member.user.displayAvatarURL(),
            })
            .setTitle(welcomeEmbedTitle)
            .setThumbnail(member.guild.iconURL())
            .setFooter({
                text: welcomeEmbedFooter,
                iconURL: member.client.user.avatarURL() ?? undefined,
            })
            .setTimestamp();

        if (guildMember?.isKicked) {
            welcomeEmbed
                .setDescription(welcomeEmbedWasKicked);

            guildMember.isKicked = false;
            await guildMember.save();
        }
        else if (bannedMember?.isBanned && bannedMember?.totalBans > 0) {
            welcomeEmbed
                .setDescription(welcomeEmbedWasBanned);
        }
        else {
            welcomeEmbed
                .setDescription(welcomeMessage)
        }
        
        await welcomeChannel.send({
            content: `${member.user}`,
            embeds: [welcomeEmbed],
        });
    }

    if (welcomeRoles.length > 0 && member.guild.members.me && member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        for (const role of welcomeRoles) {
            const welcomeRole = await member.guild.roles.fetch(role.id);
            if (welcomeRole) {
                await member.roles.add(role.id).catch(() => {});
            }
        }
    }
}
