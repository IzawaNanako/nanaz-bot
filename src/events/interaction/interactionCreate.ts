import { Events, AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction } from 'discord.js';
import User from '../../models/user.js';
import i18next from 'i18next';

export const name = Events.InteractionCreate;
export async function execute(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction | AutocompleteInteraction) {
    const executeUser = await User.findOne({
        where: {
            id: interaction.user.id,
        }
    });
    i18next.setDefaultNamespace('events');
    if (executeUser) {
        await i18next.changeLanguage(executeUser.language);
    }
    else {
        await i18next.changeLanguage(interaction.locale);
    }
    
    const commandUnknownError = i18next.t('interactionCreate.commandUnknownError');
    const commandNoPermissionError = i18next.t('interactionCreate.commandNoPermissionError');

    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete() && !interaction.isContextMenuCommand()) {
        return;
    }
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found, but it was triggered somehow.`);
        return;
    }

    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        if (interaction.memberPermissions && !interaction.memberPermissions.has(interaction.appPermissions)) {
            await interaction.reply({
                content: commandNoPermissionError,
                ephemeral: true
            });
            return;
        }
        
        try {
            await command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: commandUnknownError,
                    ephemeral: true
                });
            }
            else {
                await interaction.reply({
                    content: commandUnknownError,
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
            console.error(`The command "${interaction.commandName}" does not have an autocomplete method, but it was triggered somehow.`);
        }
    }
}