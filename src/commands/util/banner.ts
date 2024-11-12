import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Display the banner of the selected user.')
    .setDescriptionLocalizations({
        'en-US': '',
        'ja': '',
        'zh-CN': '',
        'zh-TW': '',
    })
    .addUserOption(option => option
        .setName('user')
        .setDescription('The user to display the banner of.')
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
    const userFetched = await user.fetch();

    const userNoBannerError = i18next.t('banner:user_no_banner_error');
    const requestedByAuthor = i18next.t('global:requested_by_author', {
        user_displayName: interaction.user.displayName,
    });
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
        .setAuthor({
            name: requestedByAuthor,
        })
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
    });
}