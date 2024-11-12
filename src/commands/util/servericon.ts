import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import Guild from '../../models/guild.js';
import User from '../../models/user.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('servericon')
    .setDescription('Display the icon of the selected server.')
    .setDescriptionLocalizations({
        'en-US': '',
        'ja': '',
        'zh-CN': '',
        'zh-TW': '',
    })
    .addStringOption(option => option
        .setName('server-id')
        .setDescription('The ID of the server to display the icon of. "/help ids" for how to get IDs.')
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
    const requestedByAuthor = i18next.t('global:requested_by_author', {
        user_displayName: interaction.user.displayName,
    });
    const displayedByFooter = i18next.t('global:displayed_by_footer');
    const invalidServerIdError = i18next.t('servericon:invalid_server_id_error');
    const invalidServerIconError = i18next.t('servericon:invalid_server_icon_error');

    let serverID = interaction.options.getString('server');

    if (!serverID && interaction.guild) {
        serverID = interaction.guild.id;
    }

    if (!serverID) {
        await interaction.reply({
            content: invalidServerIdError,
            ephemeral: true,
        });
        return;
    }

    const server = await interaction.client.guilds.fetch(serverID);
    const serverIcon = server.iconURL({
        size: 2048,
    });

    const serverIconEmbedTitle = i18next.t('servericon:server_icon_embed_title', {
        server_name: server.name,
    });
    const serverIconEmbedDescription = i18next.t('servericon:server_icon_embed_description', {
        server_icon_url: serverIcon,
    });

    if (!serverIcon) {
        await interaction.reply({
            content: invalidServerIconError,
            ephemeral: true,
        });
        return;
    }

    const serverIconEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({
            name: requestedByAuthor,
        })
        .setTitle(serverIconEmbedTitle)
        .setDescription(serverIconEmbedDescription)
        .setImage(serverIcon)
        .setFooter({
            text: displayedByFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    await interaction.reply({
        embeds: [serverIconEmbed],
        components: [supportButton],
    });
}