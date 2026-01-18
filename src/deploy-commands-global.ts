import 'dotenv/config.js';
import { REST, Routes, ApplicationCommand } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

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
        interpolation: {
            escapeValue: false,
        },
    });
}
catch (error) {
    console.error(`i18next initialization error: ${error}`);
    process.exit(1);
}

const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;

if (!clientId || !token) {
    throw new Error('Client ID or token not found.');
}

const commands = [] as ApplicationCommand[];
const foldersPath = join('dist/commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath);
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
        const filePathURL = pathToFileURL(`./${filePath}`);
		const command = await import(`${filePathURL}`);
		if ('data' in command && 'execute' in command && command.data.name !== 'dev') {
			commands.push(command.data.toJSON());
		}
        else if (command.data.name === 'dev') {
            continue;
        }
        else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

async function reloadGlobalCommands(clientId: string, token: string) {
	try {
		console.log(`Started reloading ${commands.length} application commands.`);

        const rest = new REST().setToken(token);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{
                body: commands,
            },
		) as ApplicationCommand[];

		console.log(`Successfully reloaded ${data.length} application commands.`);
        process.exit(0);
	}
    catch (error) {
		console.error(error);
        process.exit(1);
	}
}

await reloadGlobalCommands(clientId, token);
