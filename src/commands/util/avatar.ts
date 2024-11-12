import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Display the avatar of the selected user.')
    .setDescriptionLocalizations({
        'en-US': '',
        'ja': '',
        'zh-CN': '',
        'zh-TW': '',
    })
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to display the avatar of.')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
        })
    )
    .addBooleanOption(option => option
        .setName('default_avatar')
        .setDescription('Display the user\'s default avatar instead of their avatar in the server.')
        .setDescriptionLocalizations({
            'en-US': '',
            'ja': '',
            'zh-CN': '',
            'zh-TW': '',
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

    const displayedByFooter = i18next.t('global:displayed_by_footer');
    const requestedByAuthor = i18next.t('global:requested_by_author', {
        user_displayName: interaction.user.displayName,
    });
    const avatarEmbedTitle = i18next.t('avatar:avatar_embed_title', {
        user_displayName: user.displayName,
    });
    const avatarURLDescription = i18next.t('avatar:avatar_url_description', {
        avatar_url: user.avatarURL(),
    });
    const displayAvatarURLDescription = i18next.t('avatar:display_avatar_url_description', {
        display_avatar_url: user.displayAvatarURL(),
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