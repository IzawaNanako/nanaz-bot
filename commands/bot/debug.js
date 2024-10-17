const { SlashCommandBuilder, PermissionFlagsBits, PresenceUpdateStatus, ActivityType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Debug commands that control the bot directly, accessible only by the developer.')
        .addStringOption(option => option
            .setName('option')
            .setDescription('The action to take.')
            .setRequired(true)
            .addChoices(
                {
                    name: 'stop',
                    value: 'stop',
                },
                {
                    name: 'username',
                    value: 'username',
                },
                {
                    name: 'status',
                    value: 'status',
                },
                {
                    name: 'activity',
                    value: 'activity',
                }
            )
        )
        .addStringOption(option => option
            .setName('value')
            .setDescription('The value to set, if one is needed.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(0),
    async execute(interaction) {
        if (interaction.user.id !== process.env.OWNER_ID) {
            await interaction.reply({
                content: 'You do not have the permission to use this command.',
                ephemeral: true,
            });
            return;
        }
        const statusMap = {
            online: 'PresenceUpdateStatus.Online',
            idle: 'PresenceUpdateStatus.Idle',
            dnd: 'PresenceUpdateStatus.DoNotDisturb',
            invisible: 'PresenceUpdateStatus.Invisible',
        };
        const option = interaction.options.getString('option');
        let value = interaction.options.getString('value');
        let valueTwo = interaction.options.getString('value_two');

        if (option === 'stop') {
            await interaction.reply({
                content: 'Shutting down...',
            });
            process.exit();
        }
        else if (option === 'username') {
            if (!value) {
                await interaction.reply({
                    content: 'Please provide a name.',
                    ephemeral: true,
                });
                return;
            }
            try {
                await interaction.reply({
                    content: `Changing my username to ${value}...`,
                });
                interaction.client.user.setUsername(value);
            }
            catch (error) {
                await interaction.reply({
                    content: 'Failed to set username.',
                    ephemeral: true,
                });
                console.log(error);
            }
        }
        else if (option === 'status') {
            if (!value) {
                await interaction.reply({
                    content: 'Please provide a valid status.',
                    ephemeral: true,
                });
                return;
            }
            if (!Object.values(PresenceUpdateStatus).includes(value)) {
                await interaction.reply({
                    content: `Changing my status to ${value}...`,
                });
                interaction.client.user.setStatus(value);
            }
            else {
                await interaction.reply({
                    content: 'Invalid status. Valid statuses are: online, idle, dnd, and invisible.',
                    ephemeral: true,
                });
            }
        }
        else if (option === 'activity') {
            if (!value) {
                await interaction.reply({
                    content: 'Please provide an activity.',
                    ephemeral: true,
                });
                return;
            }
            await interaction.reply({
                content: `Changing my activity to ${value}...`,
            });
        }
        else {
            await interaction.reply({
                content: 'Invalid option.',
                ephemeral: true,
            });
        }
    }
};