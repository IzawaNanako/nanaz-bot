import { Events } from 'discord.js';
export const name = Events.InteractionCreate;
export async function execute(interaction) {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete() && !interaction.isContextMenuCommand()) {
        return;
    }
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        try {
            await command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            }
            else {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            }
        }
    }
    else if (interaction.isAutocomplete()) {
        if (command.autocomplete) {
            try {
                await command.autocomplete(interaction);
            }
            catch (error) {
                console.error(error);
            }
        }
        else {
            console.error(`The command "${interaction.commandName}" does not have an autocomplete method.`);
        }
    }
}
