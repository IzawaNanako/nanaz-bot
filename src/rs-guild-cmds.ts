import 'dotenv/config.js';
import { REST, Routes, ApplicationCommand } from 'discord.js';

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

async function deleteGuildCommands() {
    try {
        if (!clientId || !guildId || !token) {
            console.error('Client ID or guild ID or token not found.');
            process.exit(1);
        }

        const rest = new REST().setToken(token);
        const commands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
        const commandsArray = commands as ApplicationCommand[];

        const deletePromises = commandsArray.filter(command => command.name !== 'dev' && command.name !== 'attack').map(command => async () => {
                await rest.delete(Routes.applicationGuildCommand(clientId, guildId, command.id));
            }
        );
        await Promise.all(deletePromises);

        console.log('Successfully deleted all guild commands. (Exceptions made for "dev" and "attack" commands)');
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}

await deleteGuildCommands();