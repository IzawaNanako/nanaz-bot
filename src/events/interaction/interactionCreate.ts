import { Events, CommandInteraction, AutocompleteInteraction } from 'discord.js';
import User from '../../models/user.js';
import i18next from 'i18next';

export const name = Events.InteractionCreate;
export async function execute(interaction: CommandInteraction | AutocompleteInteraction) {
    const executeUser = await User.findOne({
        where: {
            id: interaction.user.id,
        }
    });
    i18next.setDefaultNamespace('events');
    await i18next.changeLanguage(executeUser?.language);
    const commandErrorMessage = i18next.t('interactionCreate.commandErrorMessage');

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
                    content: commandErrorMessage,
                    ephemeral: true
                });
            }
            else {
                await interaction.reply({
                    content: commandErrorMessage,
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