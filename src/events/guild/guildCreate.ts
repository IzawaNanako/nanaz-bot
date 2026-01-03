import { Events, Guild as DiscordGuild } from 'discord.js';
import { Guild } from '../../models/guild.js';

export const name = Events.GuildCreate;

export async function execute(guild: DiscordGuild) {
    console.log(`Joined new guild: ${guild.name} (${guild.id})`);

    await Guild.create({
        id: guild.id,
        name: guild.name,
        welcomeMessage: 'Thank you for joining <@guildname>!',
        byeMessage: 'Goodbye <@username>, we will miss you!',
        language: 'en-us',
    });
}
