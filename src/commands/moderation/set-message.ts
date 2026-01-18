import { EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { Guild } from '../../models/guild.js';
import { setPrivateInteractionLanguage, setPublicInteractionLanguage } from '../../utils/setInteractionLanguage.js';
import { sendLog } from '../../utils/sendLog.js';
import { supportButton } from '../../utils/buttons.js';
import i18next from 'i18next';

export const data = new SlashCommandBuilder()
    .setName('set-message')
    .setDescription('Configure welcome and goodbye messages')
    .setDescriptionLocalizations({
        'en-US': 'Configure welcome and goodbye messages',
        'ja': 'ウェルカムメッセージとさようならメッセージを設定します。',
        'zh-CN': '设置欢迎和告别消息',
        'zh-TW': '設定歡迎和告別訊息',
    })
    .addSubcommand(group => group
        .setName('welcome')
        .setDescription('Set the message to send to new members of this server.')
        .setDescriptionLocalizations({
            'en-US': 'Set the message to send to new members of this server.',
            'ja': 'このサーバーの新しいメンバーに送信するメッセージを設定します。',
            'zh-CN': '设置向服务器新成员发送的信息。',
            'zh-TW': '設定要傳送給此伺服器新成員的訊息。',
        })
        .addStringOption(option => option
            .setName('message')
            .setDescription('The message to send, read "/help msg-variables" for more info.')
            .setDescriptionLocalizations({
                'en-US': 'The message to send, read "/help msg-variables" for more info.',
                'ja': '送信するメッセージ。詳しくは"/help msg-variables"を参照のこと。',
                'zh-CN': '要发送的信息，详情请阅读"/help msg-variables"。',
                'zh-TW': '要傳送的訊息，更多資訊請參閱"/help msg-variables"。',
            })
            .setRequired(true)
        )
    )
    .addSubcommand(group => group
        .setName('bye')
        .setDescription('Set the message to send to farewell members who leave this server.')
        .setDescriptionLocalizations({
            'en-US': 'Set the message to send to farewell members who leave this server.',
            'ja': 'このサーバーを去るメンバーに送信するさようならメッセージを設定します。',
            'zh-CN': '设置向离开此服务器的成员发送的告别信息。',
            'zh-TW': '設定要傳送給離開此伺服器的成員的告別訊息。',
        })
        .addStringOption(option => option
            .setName('message')
            .setDescription('The message to send, read "/help msg-variables" for more info.')
            .setDescriptionLocalizations({
                'en-US': 'The message to send, read "/help msg-variables" for more info.',
                'ja': '送信するメッセージ。詳しくは"/help msg-variables"を参照のこと。',
                'zh-CN': '要发送的信息，详情请阅读"/help msg-variables"。',
                'zh-TW': '要傳送的訊息，更多資訊請參閱"/help msg-variables"。',
            })
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild);
export async function execute(interaction: ChatInputCommandInteraction) {
    await setPrivateInteractionLanguage(interaction);

    const unknownError = i18next.t('global.unknownError');

    if (!interaction.guild || !interaction.guild.members.me) {
        await interaction.reply({
            content: unknownError,
            flags: MessageFlags.Ephemeral,
        });
        return;
    };

    await interaction.deferReply();

    const type = interaction.options.getSubcommand() as 'welcome' | 'bye';
    const message = interaction.options.getString('message');
    const [guild] = await Guild.findOrCreate({
        where: {
            id: interaction.guild.id,
        }
    });
    const messageKey = `${type}Message` as 'welcomeMessage' | 'byeMessage';
    const previousMessage = guild[messageKey];

    await setPublicInteractionLanguage(interaction);

    const requestedByAuthor = i18next.t('global.requestedByAuthor', {
        userDisplayName: interaction.user.displayName,
    });
    const executedByFooter = i18next.t('global.executedByFooter');
    const messageChangedMessage = type === 'welcome' ? i18next.t('setMessage.welcomeMessageChangedMessage') : i18next.t('setMessage.byeMessageChangedMessage');
    const previousMessageLiteral = i18next.t(`setMessage.previousMessageLiteral`);
    const newMessageLiteral = i18next.t(`setMessage.newMessageLiteral`);

    const actionEmbed = new EmbedBuilder()
        .setColor('#2E4053')
        .setAuthor({
            name: requestedByAuthor,
        })
        .setTitle(messageChangedMessage)
        .setThumbnail(interaction.guild.iconURL())
        .addFields([
            {
                name: previousMessageLiteral,
                value: previousMessage,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
                inline: true,
            },
            {
                name: newMessageLiteral,
                value: `${message}`,
                inline: true,
            }
        ])
        .setFooter({
            text: executedByFooter,
            iconURL: interaction.client.user.avatarURL() ?? undefined,
        })
        .setTimestamp();

    await guild.update({
        [messageKey]: message,
    });

    await interaction.editReply({
        embeds: [actionEmbed],
        components: [supportButton],
    });

    await sendLog(interaction.guild, {
        embeds: [actionEmbed],
    });
}
