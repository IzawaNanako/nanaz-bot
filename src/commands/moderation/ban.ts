import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import BannedMember from '../../models/bannedMember.js';
import sendLog from '../../utils/sendLog.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban selected member from the server.')
    .setDescriptionLocalizations({
        'en-US': '',
        'ja': '',
        'zh-CN': '',
        'zh-TW': '',
    })
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to ban.')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('The reason you are banning this user for.')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
    )
    .addNumberOption(option => option
        .setName('delete_messages')
        .setDescription('How recent should their message be deleted in days? (Max 7, default 0, accepts decimals).')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
        .setMinValue(0)
        .setMaxValue(7)
    )
    .addBooleanOption(option => option
        .setName('notice')
        .setDescription('To inform the user that they have been banned. Defaults to false.')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
    )
    .addNumberOption(option => option
        .setName('duration')
        .setDescription('How long should the ban last for in days? (Accepts decimals, leave empty for indefinite).')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
        .setMinValue(0)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setContexts(0);
export async function execute(interaction: ChatInputCommandInteraction) {
    const executeUser = await User.findOne({
        where: {
            id: interaction.user.id,
        }
    });
    i18next.changeLanguage(executeUser?.language);
    const unknownError = i18next.t('global:unknown_error');
    const banPermissionError = i18next.t('ban:ban_permission_error');
    const invalidUserError = i18next.t('global:invalid_user_error');
    const banningThemselvesError = i18next.t('ban:banning_themselves_error');
    const failedToBanError = i18next.t('ban:failed_to_ban_error');
    if (!interaction.guild || !interaction.guild.members.me) {
        await interaction.reply({
            content: unknownError,
            ephemeral: true,
        });
        return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        await interaction.reply({
            content: banPermissionError,
            ephemeral: true,
        });
        return;
    }
    const user = interaction.options.getUser('user', true);
    const delDays = interaction.options.getNumber('delete_messages') || 0;
    const notice = interaction.options.getBoolean('notice') || false;
    const duration = interaction.options.getNumber('duration');
    let reason = interaction.options.getString('reason');
    if (!user) {
        await interaction.reply({
            content: invalidUserError,
            ephemeral: true,
        });
        return;
    }
    const member = await interaction.guild.members.fetch(user.id);
    if (!member) {
        await interaction.reply({
            content: invalidUserError,
            ephemeral: true,
        });
        return;
    }

    if (user.id === interaction.user.id) {
        await interaction.reply({
            content: banningThemselvesError,
            ephemeral: true,
        });
        return;
    }

    if (!member.bannable) {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(failedToBanError),
            ],
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
    
    const guild = await Guild.findOne({
        where: {
            id: interaction.guild.id,
        }
    });
    i18next.changeLanguage(guild?.language);
    const banEmbedTitle = i18next.t('ban:ban_embed_title');
    const userLiteral = i18next.t('global:user_literal');
    const issuerFieldTitle = i18next.t('global:issuer_field_title');
    const reasonLiteral = i18next.t('global:reason_literal');
    const banEmbedFooter = i18next.t('ban:ban_embed_footer');
    const banEmbedExpireDateTitle = i18next.t('ban:ban_embed_expire_date_title');
    const neverLiteral = i18next.t('ban:never_literal');
    const noReasonMessage = i18next.t('ban:no_reason_message');
    const banNotice = i18next.t('ban:ban_notice', {
        issuer: interaction.user,
        server_name: interaction.guild.name,
    });
    const banNoticeReason = i18next.t('ban:ban_notice_reason', {
        reason: reason,
    });
    const banRandomTextOne = i18next.t('ban:ban_random_text_one');
    const banRandomTextTwo = i18next.t('ban:ban_random_text_two');
    const banRandomTextThree = i18next.t('ban:ban_random_text_three');
    const banRandomTextFour = i18next.t('ban:ban_random_text_four');
    const banRandomTextFive = i18next.t('ban:ban_random_text_five');

    const banMsgID = Math.floor(Math.random() * 5);
    const banMsgs = [
        banRandomTextOne,
        banRandomTextTwo,
        banRandomTextThree,
        banRandomTextFour,
        banRandomTextFive,
    ];

    const banEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(banEmbedTitle)
        .setDescription(banMsgs[banMsgID])
        .addFields([
            {
                name: userLiteral,
                value: `${user}`,
                inline: true,
            },
            {
                name: issuerFieldTitle,
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
            text: banEmbedFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        });

    let bannedNotice = banNotice;

    if (reason) {
        bannedNotice += banNoticeReason;
        banEmbed
            .addFields({
                name: reasonLiteral,
                value: reason,
                inline: true,
            });
    }
    else {
        reason = noReasonMessage;
    }

    const delSecs = Math.round(delDays * 86400);

    await bannedMember.update({
        totalBans: bannedMember.totalBans + 1,
        isBanned: true,
        bannedBy: interaction.user.id,
        bannedReason: reason,
        bannedAt: new Date(),
    });

    if (duration) {
        await bannedMember.update({
            bannedUntil: new Date(Date.now() + (duration * 86400000)),
        });
    }

    banEmbed
        .addFields({
            name: banEmbedExpireDateTitle,
            value: duration ? `${bannedMember.bannedUntil}` : neverLiteral,
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