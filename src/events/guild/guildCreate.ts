import { Events, Guild as DiscordGuild } from 'discord.js';
import { Guild } from '../../models/guild.js';

export const name = Events.GuildCreate;

export async function execute(guild: DiscordGuild) {
    console.log(`Joined new guild: ${guild.name} (${guild.id})`);

    await Guild.create({
        id: guild.id,
        name: guild.name,
        language: 'en-us',
    });
}
