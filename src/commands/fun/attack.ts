import { SlashCommandBuilder, CommandInteraction, ChannelType } from 'discord.js';
import { createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, NoSubscriberBehavior, StreamType, VoiceConnectionStatus } from '@discordjs/voice';

export const data = new SlashCommandBuilder()
    .setName('attack')
    .setDescription('Attack!')
    .addStringOption(option => option
        .setName('server-id')
        .setDescription('The server to attack.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('channel-id')
        .setDescription('The channel to attack.')
        .setRequired(true)
    );
export const execute = async (interaction: CommandInteraction) => {
    try {
        const serverId = interaction.options.get('server-id', true).value as string;
        const channelId = interaction.options.get('channel-id', true).value as string;
        const server = await interaction.client.guilds.fetch(serverId);
        const channel = await server.channels.fetch(channelId);

        if (!interaction.client.guilds.cache.has(serverId) || !channel || channel.type !== ChannelType.GuildVoice) {
            await interaction.reply({
                content: 'I cannot attack that channel!',
                ephemeral: true,
            });
        }

        const metalPipeSound = createAudioResource('dist/assets/sounds/metal-pipe-falling.mp3', {
            inputType: StreamType.Arbitrary,
        });
        await interaction.reply({
            content: `Attacking ${channel} in ${server}!`
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
    }
    catch (error) {
        await interaction.reply({
            content: 'Something went wrong...',
            ephemeral: true,
        });
        console.error(error);
    }
}