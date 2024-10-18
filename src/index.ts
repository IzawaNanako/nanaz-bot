import 'dotenv/config.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

const token = process.env.TOKEN;

const client = new Client({
                        intents:[
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
const foldersPath = join('./commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const command = await import(`./${filePath}`);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
        else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = join('./events');
const eventFolders = readdirSync(eventsPath);

for (const folder of eventFolders) {
    const eventsPathFolder = join(eventsPath, folder);
    const eventFiles = readdirSync(eventsPathFolder).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = join(eventsPathFolder, file);
        const event = await import(`./${filePath}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

client.login(token);

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection: ', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception: ', error);
});