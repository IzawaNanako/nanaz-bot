import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import BannedMember from '../../models/bannedMember.js';
import sendLog from '../../utils/sendLog.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban selected user that is banned from the server.')
    .setDescriptionLocalizations({
        'en-US': 'Unban selected user that is banned from the server.',
        'ja': 'サーバーから追放されているユーザーを選択し、追放を解除します。',
        'zh-CN': '解除所选用户的伺服器封禁。',
        'zh-TW': '解除所選使用者的伺服器封禁。',
    })
    .addStringOption(option => option
        .setName('username')
        .setDescription('The username of the user to unban.')
        .setDescriptionLocalizations({
            'en-US': 'The username of the user to unban.',
            'ja': 'アクセス禁止を解除するユーザのユーザ名。',
            'zh-CN': '要解禁的用户的用户名。',
            'zh-TW': '要解禁的使用者的使用者名稱。',
        })
        .setRequired(true)
    )
    .addBooleanOption(option => option
        .setName('notice')
        .setDescription('To inform the user that they have been unbanned. Defaults to true, it\'s TRUE!')
        .setDescriptionLocalizations({
            'en-US': 'To inform the user that they have been unbanned. Defaults to true, it\'s TRUE!',
            'ja': 'ユーザーに禁止解除を通知する。 デフォルトはTRUE！',
            'zh-CN': '通知用户他们已被解禁。 默认为true，TRUE！',
            'zh-TW': '通知使用者他們已被解除封禁。 預設為true，TRUE！',
        })
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
    const banManagePermissionError = i18next.t('ban:ban_manage_permission_error');
    const bannedUserNotFoundError = i18next.t('ban:banned_user_not_found_error');
    if (!interaction.guild || !interaction.guild.members.me) {
        await interaction.reply({
            content: unknownError,
            ephemeral: true,
        });
        return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        await interaction.reply({
            content: banManagePermissionError,
            ephemeral: true,
        });
        return;
    }
    const username = interaction.options.getString('username', true);
    const notice = interaction.options.getBoolean('notice') || true;
    const bannedMember = await BannedMember.findOne({
        where: {
            username: username,
            isBanned: true,
            guildId: interaction.guild.id,
        }
    });

    if (!bannedMember) {
        await interaction.reply({
            content: bannedUserNotFoundError,
            ephemeral: true,
        });
        return;
    }

    const guild = await Guild.findOne({
        where: {
            id: interaction.guild.id,
        }
    });
    i18next.changeLanguage(guild?.language);
    const unbanEmbedTitle = i18next.t('unban:unban_embed_title');
    const userLiteral = i18next.t('global:user_literal');
    const issuerFieldTitle = i18next.t('global:issuer_field_title');
    const unbanEmbedFooter = i18next.t('unban:unban_embed_footer');
    const unbannedNotice = i18next.t('unban:unban_notice', {
        issuer: interaction.user,
        server_name: interaction.guild.name,
    });

    const user = await interaction.client.users.fetch(bannedMember.id);

    const unbanEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(unbanEmbedTitle)
        .addFields([
            {
                name: userLiteral,
                value: `${user}`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
                inline: true,
            },
            {
                name: issuerFieldTitle,
                value: `${interaction.user}`,
                inline: true,
            },
        ])
        .setTimestamp()
        .setFooter({
            text: unbanEmbedFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        });

    if (!user.bot && notice) {
        await user.send(unbannedNotice);
    }

    await bannedMember.update({
        isBanned: false,
        bannedBy: null,
        bannedReason: null,
        bannedAt: null,
        bannedUntil: null,
    });

    await interaction.reply({
        embeds: [unbanEmbed],
        components: [supportButton],
    });
    await interaction.guild.members.unban(bannedMember.id);

    await sendLog(interaction.guild, {
        embeds: [unbanEmbed],
    });
}