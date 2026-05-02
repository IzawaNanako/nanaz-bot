import type { Guild as DiscordGuild } from 'discord.js';
import { Events } from 'discord.js';
import { Guild } from '@models/guild.js';
import { GuildMember } from '@models/guildMember.js';
import { BannedMember } from '@models/bannedMember.js';

export const name = Events.GuildDelete;
export async function execute(guild: DiscordGuild) {
    console.log(`Left guild ${guild.name} (${guild.id})`);

    // Deletes all data stored in the database for the guild.
    await Guild.destroy({
        where: {
            id: guild.id,
        }
    });
    await GuildMember.destroy({
        where: {
            guildId: guild.id,
        }
    });
    await BannedMember.destroy({
        where: {
            guildId: guild.id,
        }
    });
}
