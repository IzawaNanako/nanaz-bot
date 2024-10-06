const { Events, PresenceUpdateStatus, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setStatus(PresenceUpdateStatus.DoNotDisturb);
        client.user.setActivity('cat videos', { type: ActivityType.Watching });
    }
};