import 'dotenv/config.js';
import { REST, Routes, ApplicationCommand } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

if (!clientId || !guildId || !token) {
    console.error('Client ID or guild ID or token not found.');
    process.exit(1);
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
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		}
        else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

async function reloadGuildCommands(clientId: string, guildId: string, token: string) {
	try {
		console.log(`Started reloading ${commands.length} application commands.`);

        const rest = new REST().setToken(token);

		const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
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

await reloadGuildCommands(clientId, guildId, token);
