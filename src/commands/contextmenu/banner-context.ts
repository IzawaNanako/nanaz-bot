import { ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandType, EmbedBuilder, UserContextMenuCommandInteraction } from 'discord.js';
import User from '../../models/user.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new ContextMenuCommandBuilder()
    .setName('User Banner')
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
    const userFetched = await user.fetch();

    const userNoBannerError = i18next.t('banner:user_no_banner_error');
    const displayedByFooter = i18next.t('global:displayed_by_footer');
    const bannerEmbedTitle = i18next.t('banner:banner_embed_title', {
        user_displayName: userFetched.displayName,
    });
    const bannerURLDescription = i18next.t('banner:banner_url_description', {
        banner_url: userFetched.bannerURL(),
    });

    if (!userFetched.bannerURL()) {
        await interaction.reply({
            content: userNoBannerError,
            ephemeral: true,
        });
        return;
    }

    const bannerEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(bannerEmbedTitle)
        .setDescription(bannerURLDescription)
        .setImage(userFetched.bannerURL({
            size: 2048,
        }) ?? null)
        .setFooter({
            text: displayedByFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    await interaction.reply({
        embeds: [bannerEmbed],
        components: [supportButton],
        ephemeral: true,
    });
}