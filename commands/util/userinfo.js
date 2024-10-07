const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display information about the selected user.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to display information about.')
        )
        .setContexts(0),
    async execute(interaction) {
        const member = interaction.options.getMember('user') || interaction.member;
        const guildMember = await interaction.guild.members.fetch(member.user.id);
        const roles = '```' + guildMember.roles.cache.map((role) => role.name).join(`, `) + '```';
        let status = guildMember.presence?.status;
        let badges = '```' + guildMember.user.flags.toArray().join(', ') + '```';

        if (badges === '``````') {
            badges = '```None```';
        }

        if (status === 'offline') {
            status = 'Offline';
        }
        else if (status === 'dnd') {
            status = 'Do Not Disturb';
        }
        else if (status === 'idle') {
            status = 'Idle';
        }
        else if (status === 'online') {
            status = 'Online';
        }

        const infoTextNum = Math.floor(Math.random() * 5);
        const infoTexts = [
            'Remember, I\'m always watching...',
            'What\'s interesting about this person?',
            'Any secrets you found?',
            'Damn, look at those roles!',
            'Eh, this person seems boring.'
        ];

        const userInfoEmbed = new EmbedBuilder()
            .setColor('#03A9F4')
            .setAuthor({
                name: `Requested by ${interaction.user.displayName}`,
            })
            .setTitle(`${member.user.displayName}'s User Information`)
            .setDescription(infoTexts[infoTextNum])
            .setThumbnail(member.user.displayAvatarURL({
                dynamic: true,
            }))
            .addFields([
                {
                    name: 'Username',
                    value: `${member.user.username}`,
                    inline: true,
                },
                {
                    name: 'User ID',
                    value: `${member.user.id}`,
                    inline: true,
                },
                {
                    name: 'Badges',
                    value: `${badges}`,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                },
                {
                    name: 'Roles',
                    value: `${roles}`,
                    inline: true,
                },
                {
                    name: 'Joined this server at',
                    value: `${guildMember.joinedAt}`,
                    inline: true,
                },
                {
                    name: 'Created at',
                    value: `${member.user.createdAt}`,
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
            embeds: [userInfoEmbed],
        })
    }
}