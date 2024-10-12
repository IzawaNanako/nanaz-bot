const Guild = require('../models/guild.js');

module.exports = async (guild, message) => {
    const guildData = await Guild.findOne({
        where: {
            id: guild.id
        }
    });

    if (guildData.logChannelId) {
        const logChannel = guild.channels.cache.get(guildData.logChannelId);
        if (logChannel) {
            await logChannel.send(message);
        }
    }
}