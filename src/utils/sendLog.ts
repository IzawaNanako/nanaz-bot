import { Guild as DiscordGuild, MessageCreateOptions, MessagePayload, PermissionFlagsBits, TextChannel } from 'discord.js';
import Guild from '../models/guild.js';

async function sendLog(guild: DiscordGuild, message: string | MessagePayload | MessageCreateOptions) {
    const guildData = await Guild.findOne({
        where: {
            id: guild.id,
        }
    });

    if (guildData && guildData.logChannelId && guild.members.me?.permissionsIn(guildData.logChannelId).has(PermissionFlagsBits.SendMessages)) {
        const logChannel = guild.channels.cache.get(guildData.logChannelId) as TextChannel;
        if (logChannel) {
            await logChannel.send(message);
        }
    }
};

export default sendLog;