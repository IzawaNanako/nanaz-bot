import { ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandType, EmbedBuilder, UserContextMenuCommandInteraction } from 'discord.js';
import User from '../../models/user.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new ContextMenuCommandBuilder()
    .setName('User Avatar')
    .setNameLocalizations({
        'en-US': '',
        'ja': '',
        'zh-CN': '',
        'zh-TW': '',
    })
    .setType(ApplicationCommandType.User as ContextMenuCommandType);
export async function execute(interaction: UserContextMenuCommandInteraction) {
    const executeUser = await User.findOne({
        where: {
            id: interaction.user.id,
        }
    });
    if (executeUser) {
        i18next.changeLanguage(executeUser.language);
    }

    const user = interaction.targetUser;

    const displayedByFooter = i18next.t('global:displayed_by_footer');
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
        .setTitle(avatarEmbedTitle)
        .setFooter({
            text: displayedByFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    if (user.bot) {
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
        ephemeral: true,
    });
}