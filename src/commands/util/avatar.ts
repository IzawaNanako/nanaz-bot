import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

i18next.setDefaultNamespace('commands');

export const data = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Display the avatar of the selected user.')
    .setDescriptionLocalizations({
        'en-US': 'Display the avatar of the selected user.',
        'ja': '選択したユーザーのアバターを表示します。',
        'zh-CN': '显示所选用户的头像。',
        'zh-TW': '顯示所選使用者的頭像。',
    })
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to display the avatar of.')
        .setDescriptionLocalizations({
            'en-US': 'The user to display the avatar of.',
            'ja': 'アバターを表示するユーザー。',
            'zh-CN': '要显示头像的用户。',
            'zh-TW': '要顯示頭像的使用者。',
        })
    )
    .addBooleanOption(option => option
        .setName('default_avatar')
        .setDescription('Display the user\'s default avatar instead of their avatar in the server.')
        .setDescriptionLocalizations({
            'en-US': 'Display the user\'s default avatar instead of their avatar in the server.',
            'ja': 'サーバー内のアバターではなく、ユーザーのデフォルトアバターを表示する。',
            'zh-CN': '显示用户的默认头像，而不是其在服务器中的头像。',
            'zh-TW': '顯示使用者的預設頭像，而不是他們在伺服器中的頭像。',
        })
    );
export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.guild) {
        const guild = await Guild.findOne({
            where: {
                id: interaction.guild.id,
            }
        });
        i18next.changeLanguage(guild?.language);
    }
    else {
        const executeUser = await User.findOne({
            where: {
                id: interaction.user.id,
            }
        });
        i18next.changeLanguage(executeUser?.language);
    }

    const user = interaction.options.getUser('user') || interaction.user;
    const defaultAvatar = interaction.options.getBoolean('default_avatar') || false;

    const displayedByFooter = i18next.t('global.displayedByFooter');
    const requestedByAuthor = i18next.t('global.requestedByAuthor', {
        userDisplayName: interaction.user.displayName,
    });
    const avatarEmbedTitle = i18next.t('avatar.avatarEmbedTitle', {
        userDisplayName: user.displayName,
    });
    const avatarURLDescription = i18next.t('avatar.avatarUrlDescription', {
        avatarUrl: user.avatarURL(),
    });
    const displayAvatarURLDescription = i18next.t('avatar.displayAvatarUrlDescription', {
        displayAvatarUrl: user.displayAvatarURL(),
    });

    const avatarEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({
            name: requestedByAuthor,
        })
        .setTitle(avatarEmbedTitle)
        .setFooter({
            text: displayedByFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    if (defaultAvatar && !user.bot) {
        avatarEmbed
            .setDescription(avatarURLDescription)
            .setImage(user.avatarURL({
                size: 2048,
            }));
    }
    else {
        avatarEmbed
            .setDescription(displayAvatarURLDescription)
            .setImage(user.displayAvatarURL({
                size: 2048,
            }));
    }

    await interaction.reply({
        embeds: [avatarEmbed],
        components: [supportButton],
    });
}