import 'dotenv/config.js';
import { REST, Routes } from 'discord.js';

const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;

async function deleteGlobalCommands() {
    try {
        if (!clientId || !token) {
            console.error('Client ID or token not found.');
            process.exit(1);
        }

        const rest = new REST().setToken(token);

        rest.put(Routes.applicationCommands(clientId), {
            body: [],
        });

        console.log('Successfully deleted all global commands.');
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}

await deleteGlobalCommands();