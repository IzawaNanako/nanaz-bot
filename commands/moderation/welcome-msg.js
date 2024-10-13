const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Guild = require('../../models/guild.js');
const sendLog = require('../../utils/sendLog.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-msg')
        .setDescription('Set the message to send to new members of this server.')
        .addStringOption(option => option
            .setName('message')
            .setDescription('The message to send, read "/help Welcome Message" for more info.')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(0),
    async execute(interaction) {
        await interaction.deferReply();
        const message = interaction.options.getString('message');
        const [ guild ] = await Guild.findOrCreate({
            where: {
                id: await interaction.guild.id,
            }
        });

        guild.update({
            welcomeMessage: message,
        });

        const actionEmbed = new EmbedBuilder()
            .setColor('#2E4053')
            .setAuthor({
                name: `Requested by ${interaction.user.displayName}`,
            })
            .setTitle('Welcome Message Changed')
            .setThumbnail(interaction.guild.iconURL({
                dynamic: true,
            }))
            .addFields([
                {
                    name: 'Current Message',
                    value: `${guild.welcomeMessage}`,
                }
            ])
            .setTimestamp()
            .setFooter({
                text: `Executed by Nanaz`,
                iconURL: interaction.client.user.avatarURL(),
            });

        await interaction.editReply({
            embeds: [actionEmbed],
        });

        await sendLog(interaction.guild, {
            embeds: [actionEmbed],
        });
    }
}