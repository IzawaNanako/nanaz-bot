import 'dotenv/config.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

const token = process.env.TOKEN;

if (!token) {
    console.log('Token not found.');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction, 
        Partials.GuildMember,
    ], 
});
client.commands = new Collection();
const foldersPath = join('dist/commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath);
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
        const filePathURL = pathToFileURL(filePath);
		const command = await import(`${filePathURL}`);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
        else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = join('dist/events');
const eventFolders = readdirSync(eventsPath);

for (const folder of eventFolders) {
    const eventsPathFolder = join(eventsPath, folder);
    const eventFiles = readdirSync(eventsPathFolder);
    for (const file of eventFiles) {
        const filePath = join(eventsPathFolder, file);
        const filePathURL = pathToFileURL(filePath);
        const event = await import(`${filePathURL}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

client.login(token);

process.on('unhandledRejection', (error: any) => {
    if (error.code !== 10008) {
        console.error('Unhandled promise rejection: ', error);
    }
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception: ', error);
});