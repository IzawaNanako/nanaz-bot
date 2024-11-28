import 'dotenv/config.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

const token = process.env.TOKEN;

if (!token) {
    console.log('Token not found.');
    process.exit(1);
}

try {
    await i18next.use(Backend).init({
        backend: {
            loadPath: join('dist/locales/{{lng}}/{{ns}}.json'),
        },
        lng: 'en-US',
        fallbackLng: 'en-US',
        preload: ['en-US'],
        load: 'currentOnly',
        ns: ['commands', 'events', 'games', 'general', 'languages'],
        defaultNS: 'commands',
        fallbackNS: 'commands',
        interpolation: {
            escapeValue: false,
        },
    });
}
catch (error) {
    console.error(`i18next initialization error: ${error}`);
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
        GatewayIntentBits.GuildVoiceStates,
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

// Load commands.
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

// Load events.
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

await client.login(token);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.on('unhandledRejection', (error: any) => {
    if (error.code !== 10008) {
        console.error('Unhandled promise rejection: ', error);
    }
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception: ', error);
});