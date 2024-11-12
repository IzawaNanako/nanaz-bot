import { EmbedBuilder, GuildMember as Member, PermissionFlagsBits, TextChannel } from 'discord.js';
import Guild from '../../models/guild.js';
import GuildMember from '../../models/guildMember.js';
import BannedMember from '../../models/bannedMember.js';
import WelcomeRole from '../../models/welcomeRole.js';
import i18next from 'i18next';

export const name = 'guildMemberAdd';
export async function execute(member: Member) {
    const guild = await Guild.findOne({
        where: {
            id: member.guild.id,
        }
    });
    if (!guild) {
        return;
    }

    i18next.setDefaultNamespace('events');
    i18next.changeLanguage(guild.language);
    const welcomeEmbedTitle = i18next.t('guildMemberAdd:welcome_embed_title', {
        displayName: member.user.username,
    });
    const welcomeEmbedFooter = i18next.t('guildMemberAdd:welcome_embed_footer');
    const welcomeEmbedWasKicked = i18next.t('guildMemberAdd:welcome_embed_was_kicked');
    const welcomeEmbedWasBanned = i18next.t('guildMemberAdd:welcome_embed_was_banned');

    const guildMember = await GuildMember.findOne({
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
    
    if (guild.welcomeChannelId && welcomeChannel && member.guild.members.me?.permissionsIn(guild.welcomeChannelId).has(PermissionFlagsBits.SendMessages)) {
        welcomeChannel = await member.guild.channels.fetch(guild.welcomeChannelId) as TextChannel;
        const welcomeMessage = guild.welcomeMessage;

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2E4053')
            .setAuthor({
                name: `Yo ${member.user.username}!`,
                iconURL: member.user.displayAvatarURL(),
            })
            .setTitle(welcomeEmbedTitle)
            .setThumbnail(member.guild.iconURL())
            .setDescription(`${welcomeMessage}`)
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

        if (bannedMember?.isBanned && bannedMember?.totalBans > 0) {
            welcomeEmbed
                .setDescription(welcomeEmbedWasBanned);
        }

        welcomeChannel.send({
            content: `${member.user}`,
            embeds: [welcomeEmbed],
        });
    }

    if (welcomeRoles.length > 0 && member.guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
        for (const role of welcomeRoles) {
            const welcomeRole = await member.guild.roles.fetch(role.id);
            if (welcomeRole) {
                await member.roles.add(role.id);
            }
        }
    }
}