import { Events, AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction, MessageFlags } from 'discord.js';
import { setInteractionLanguage } from '../../utils/setInteractionLanguage.js';
import i18next from 'i18next';

export const name = Events.InteractionCreate;
export async function execute(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction | AutocompleteInteraction) {
    i18next.setDefaultNamespace('events');

    await setInteractionLanguage(interaction);

    const commandUnknownError = i18next.t('interactionCreate.commandUnknownError');

    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete() && !interaction.isContextMenuCommand()) {
        return;
    }
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found, but it was triggered somehow.`);
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
                    content: commandUnknownError,
                    flags: MessageFlags.Ephemeral,
                });
            }
            else {
                await interaction.reply({
                    content: commandUnknownError,
                    flags: MessageFlags.Ephemeral,
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
            console.error(`The command "${interaction.commandName}" does not have an autocomplete method, but it was triggered somehow.`);
        }
    }
}