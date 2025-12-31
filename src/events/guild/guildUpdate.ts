import { Events, Guild as DiscordGuild } from 'discord.js';
import { Guild } from '../../models/guild.js';

export const name = Events.GuildUpdate;

export async function execute(guild: DiscordGuild) {
    const [guildData] = await Guild.findOrCreate({
        where: {
            id: guild.id,
        },
    });

    if (guildData.name !== guild.name) {
        await guildData.update({
            name: guild.name,
        });
    }
}
