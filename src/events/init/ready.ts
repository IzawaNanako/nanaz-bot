import { Events, Client, PresenceStatusData, ActivityType, EmbedBuilder, ChannelType } from 'discord.js';
import { schedule } from 'node-cron';
import BotSettings from '../../models/botSettings.js';
import BannedMember from '../../models/bannedMember.js';
import Guild from '../../models/guild.js';
import sendLog from '../../utils/sendLog.js';
import i18next from 'i18next';
import { createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, NoSubscriberBehavior, StreamType, VoiceConnectionStatus } from '@discordjs/voice';

export const name = Events.ClientReady;
export const once = true;
export async function execute(client: Client) {
    if (!client.user) {
        console.error('Client user not found.');
        process.exit(1);
    }

    console.log(`Ready! Logged in as ${client.user.tag}`);

    // Set bot status.
    const activityMap = {
        'playing': ActivityType.Playing,
        'streaming': ActivityType.Streaming,
        'listening': ActivityType.Listening,
        'watching': ActivityType.Watching,
        'competing': ActivityType.Competing,
        'custom': ActivityType.Custom,
    }
    const [bot] = await BotSettings.findOrCreate({
        where: {
            id: 'Nanaz',
        }
    });

    if (!bot.status || !bot.activityType) {
        console.error('Bot status or activity type not found.');
        process.exit(1);
    }

    const status = bot.status as PresenceStatusData;

    if (bot.activityType === 'none') {
        client.user.setPresence({
            activities: [],
            status: status,
        })
        return;
    }
    else if (!bot.activityName) {
        console.error('Bot activity name not found.');
        process.exit(1);
    }

    const activityType = activityMap[bot.activityType as keyof typeof activityMap];
    
    if (activityType === ActivityType.Custom) {
        client.user.setPresence({
            activities: [{
                name: 'custom',
                type: activityType,
                state: bot.activityName,
            }],
            status: status,
        });
    }
    else if (activityType === ActivityType.Streaming) {
        if (!bot.activityUrl) {
            console.error('Activity URL not found. Ignoring activity.');
            return;
        }
        client.user.setPresence({
            activities: [{
                name: bot.activityName,
                type: activityType,
                url: bot.activityUrl,
            }],
            status: status,
        });
    }
    else {
        client.user.setPresence({
            activities: [{
                name: bot.activityName,
                type: activityType,
            }],
            status: status,
        });
    }

    const bannedMembers = await BannedMember.findAll({
        where: {
            isBanned: true,
        }
    });

    // Refresh banned users status, then unban them if the ban expired or reschedule the unban.
    for (const bannedMember of bannedMembers) {
        if (!bannedMember.bannedUntil) {
            continue;
        }

        const guild = await client.guilds.fetch(bannedMember.guildId);
        const memberFetched = await guild.members.fetch(bannedMember.id);
        const guildData = await Guild.findOne({
            where: {
                id: guild.id,
            }
        });
        const clientUser = await guild.members.fetch(client.user.id);

        i18next.changeLanguage(guildData?.language);
        const unbanEmbedTitle = i18next.t('ban.unbanEmbedTitle');
        const unbanEmbedFooter = i18next.t('ban.unbanEmbedFooter');
        const userLiteral = i18next.t('ban.userLiteral');
        const reasonLiteral = i18next.t('ban.reasonLiteral');
        const banExpiredMessage = i18next.t('ban.banExpiredMessage');

        /**
         * Unbans a user then sends a log if log channel exist.
         */
        async function unban() {
            const unbanEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(unbanEmbedTitle)
            .addFields([
                {
                    name: userLiteral,
                    value: `${memberFetched}`,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: reasonLiteral,
                    value: banExpiredMessage,
                    inline: true,
                },
            ])
            .setTimestamp()
            .setFooter({
                text: unbanEmbedFooter,
                iconURL: clientUser.avatarURL() ?? undefined,
            });
    
            await guild.members.unban(memberFetched);
            await sendLog(guild, {
                embeds: [unbanEmbed],
            });
        }

        // If a ban has expired, unban the banned user.
        if (bannedMember.bannedUntil.getTime() < Date.now()) {
            await unban();
            await bannedMember.update({
                isBanned: false,
                bannedUntil: null,
            });
            continue;
        }

        // If a ban has not expired, schedule the unban.
        schedule(`${bannedMember.bannedUntil}`, async () => {
            if (bannedMember.isBanned === false) {
                return;
            }

            await unban();
            await bannedMember.update({
                isBanned: false,
                bannedUntil: null,
            });
        });
    }

    // The pipe sound needs to be played once at bot startup before being able to play correctly.
    try {
        console.log('Caching attack command.');

        const serverId = process.env.DEV_GUILD_ID;
        const channelId = process.env.CACHE_CHANNEL_ID;

        if (!serverId || !channelId) {
            console.error('Server ID or channel ID not found.');
            return;
        }

        const server = await client.guilds.fetch(serverId);
        const channel = await server.channels.fetch(channelId);

        if (!client.guilds.cache.has(serverId) || !channel || channel.type !== ChannelType.GuildVoice) {
            return;
        }

        const metalPipeSound = createAudioResource('dist/assets/sounds/metal-pipe-falling.mp3', {
            inputType: StreamType.Arbitrary,
        });

        if (!channel || channel.type !== ChannelType.GuildVoice) {
            return;
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: serverId,
            adapterCreator: server.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
        });

        const audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        connection.subscribe(audioPlayer);

        audioPlayer.play(metalPipeSound);

        audioPlayer.on('stateChange', (_oldState, newState) => {
            if (newState.status === 'idle') {
                connection.destroy();
                audioPlayer.stop();
                return;
            }
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            if (connection) {
                connection.destroy();
            }
            audioPlayer.stop();
            return;
        });

        console.log('Attack command successfully cached.');
    }
    catch (error) {
        console.error(error);
    }
}