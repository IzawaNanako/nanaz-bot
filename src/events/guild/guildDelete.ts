import { Guild as DiscordGuild } from 'discord.js';
import Guild from '../../models/guild.js';
import GuildMember from '../../models/guildMember.js';
import BannedMember from '../../models/bannedMember.js';

export const name = 'guildDelete';
export async function execute(guild: DiscordGuild) {
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