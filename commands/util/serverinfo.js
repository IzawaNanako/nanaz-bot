const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display information about this server.')
        .setContexts(0),
    async execute(interaction) {
        let owner = await interaction.guild.members.fetch(interaction.guild.ownerId);

        const infoTextNum = Math.floor(Math.random() * 5);
        const infoTexts = [
            'Maybe you can find some secrets I couldn\'t find?',
            'Anything interesting?',
            'Oh, look at all those cool numbers!',
            'What\'s up?',
            'Wow, that\'s a lot of info!',
        ];

        const serverInfoEmbed = new EmbedBuilder()
            .setColor('#2E4053')
            .setAuthor({
                name: `Requested by ${interaction.user.displayName}`,
            })
            .setTitle('Server Information')
            .setDescription(infoTexts[infoTextNum])
            .setThumbnail(interaction.guild.iconURL({
                dynamic: true,
            }))
            .addFields([
                {
                    name: 'Server Name',
                    value: `${interaction.guild.name}`,
                    inline: true,
                },
                {
                    name: 'Server ID',
                    value: `\`${interaction.guild.id}\``,
                    inline: true,
                },
                {
                    name: 'Server Owner',
                    value: `<@${owner.user.id}>`,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                },
                {
                    name: 'Total Members',
                    value: `${interaction.guild.memberCount}`,
                    inline: true,
                },
                {
                    name: 'Boost Count',
                    value: `${interaction.guild.premiumSubscriptionCount}`,
                    inline: true,
                },
                {
                    name: 'Boost Level',
                    value: `${interaction.guild.premiumTier}`,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                },
                {
                    name: 'Role Count',
                    value: `${interaction.guild.roles.cache.size}`,
                    inline: true,
                },
                {
                    name: 'Channel Count',
                    value: `${interaction.guild.channels.cache.size}`,
                    inline: true,
                },
                {
                    name: 'Custom Emoji Count',
                    value: `${interaction.guild.emojis.cache.size}`,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                },
                {
                    name: 'Created At',
                    value: `${interaction.guild.createdAt}`,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                }
            ])
            .setFooter({
                text: `Fetched by Nanaz`,
                iconURL: interaction.client.user.avatarURL(),
            })
            .setTimestamp();
        
        await interaction.reply({
            embeds: [serverInfoEmbed],
        });
    }
}