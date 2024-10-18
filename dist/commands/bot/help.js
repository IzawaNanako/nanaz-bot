import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import supportButton from '../../utils/supportButton.js';
export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help on certain features of this bot.')
    .addStringOption(option => option
    .setName('option')
    .setDescription('The thing you want to get help on, check "/help Menu" if you don\'t seem to find what you need.')
    .setAutocomplete(true));
export async function execute(interaction) {
    const codeBlockExampleOne = '\\`This is a code block.\\`';
    const codeBlockExampleTwo = '\\`\\`\\`This is a cool code block.\nI\'m a line.\nI\'m not a line, wait I am!?\\`\\`\\`';
    let option = interaction.options.getString('option');
    if (option) {
        option = option.toLowerCase();
    }
    const helpEmbed = new EmbedBuilder()
        .setTimestamp()
        .setFooter({
        text: 'If you couldn\'t find what you need, feel free to contact us through our official support server.',
        iconURL: interaction.client.user.avatarURL(),
    });
    if (!option || option === 'menu') {
        helpEmbed
            .setColor('#2E4053')
            .setTitle('Help Menu')
            .setDescription('Below is a list of the options available for help.')
            .addFields({
            name: 'menu',
            value: 'Show up this menu.',
            inline: true,
        }, {
            name: 'settings',
            value: 'Get help on how to configure this bot.',
            inline: true,
        }, {
            name: 'formats',
            value: 'Get help on how to format your messages.',
            inline: true,
        }, {
            name: '\u200B',
            value: '\u200B',
        }, {
            name: 'ids',
            value: 'Get help on how to use IDs. You can check users not inside your server or other server\'s info with this!',
            inline: true,
        }, {
            name: 'welcome-msg',
            value: 'Get help on the welcome message feature.',
            inline: true,
        }, {
            name: '\u200B',
            value: '\u200B',
        });
    }
    else if (option === 'settings') {
        helpEmbed
            .setColor('#2E4053')
            .setTitle('Settings Helps')
            .setDescription(`Here are some common issues regarding how to configure the bot or your server.\n\nQ: The random welcome message sent by Discord is still there after I enabled this bot's welcome feature!\nAns: Go to Server Settings -> Overview -> Find "SYSTEM MESSAGES CHANNEL" and change it as you like. If you are looking to disable the welcome message from this bot, use "/set-channel welcome" and keep the channel option empty.\n\nQ: How do I limit members to only be able to use commands in channels I desire?\nAns: Go to Server Settings -> Under "APPS", go to "Integrations" -> Find Nanaz then you can configure however you like!\n\nQ: I'm on mobile and everything is different! How do I do anything!?\nAns: We highly recommend you to set up the bot or your server on a PC environment, however the name of the settings shouldn't change on mobile at all. Click on your avatar to find user settings, and instead of right clicking, hold your finger on what you want to find the options for to get the options to pop up.`);
    }
    else if (option === 'formats') {
        helpEmbed
            .setColor('#2E4053')
            .setTitle('Formatting Helps')
            .setDescription(`Discord, and some other platforms, use **Markdown**, which is a system to create formatted texts.\n\nGo to the bottom of the message if you only want to know how to put characters in a way like "\\_Why is this not italic?\\_"\n\nHere are some syntaxs you can use!\n\n"**Bold**": \\*\\*Bold\\*\\*\n"_Italic_": \\_Italic\\_ or \\*Italic\\*\n"__Underline__": \\_\\_Underline\\_\\_\n\n# Heading 1\n## Heading 2\n### Heading 3\nEquals to\n\\# Heading 1\n\\#\\# Heading 2\n\\#\\#\\# Heading 3\nrespectively, note that the space is neccessary.\n\nYou can also put message\n-# like this!\nOriginal Message:\nYou can also put message\n-\\# like this!\nNote that along with the headers, they need their own line and the space is neccessary.\n\n[Here is a masked link that takes you to cat pictures.](https://www.google.com/search?q=cats&tbm=isch)\nOriginal Message:\n\\[Here is a masked link that takes you to cat pictures.\\](https://www.google.com/search?q=cats&tbm=isch)\n\n- This is a list\n- cats\n  - cute\n  - meow\n* dogs\n  * friend\n  * woof\n\nYou can create this by putting "- " or "\\* " in front of each line, remember that the space is neccessary. Add another 2 spaces at the very start to indent.\n\nOriginal Message:\n\n\\- This is a list\n\\- cats\n\u200B \u200B \\- cute\n\u200B \u200B \\- meow\n\\* dogs\n\u200B \u200B \\* friend\n\u200B \u200B \\* woof\n\n\`This is a code block.\`\nOriginal Message:\n${codeBlockExampleOne}\n\`\`\`\nThis is a cool code block.\nI\'m a line.\nI\'m not a line, wait I am!?\`\`\`\nOriginal Message:\n${codeBlockExampleTwo}\n\nIf you are a programmer, you can also put the language name after the three "\`" to make your code colorful like in your IDE, but you probably already knew this.\n\n> I\'m quoted\nOriginal Message:\n\\> I\'m quoted\n\n> We\' are quoted.\n> I am.\n> Me too.\nOriginal Message:\n\\>\\>\\> We\' are quoted.\nI am.\nMe too.\n\nSo, how did I put all these fancy characters without ruining everything? Well it's pretty simple, just put a "\\\" before any character that has a special effect to "Escape" it!\nExample: "\\*\\*I am escaped!\\*\\*"\nOriginal Message: "\\\\\u200B\\*\\\\\u200B\\*I am escaped!\\\\\u200B\\*\\\\\u200B\\*"`);
    }
    else if (option === 'ids') {
        helpEmbed
            .setColor('#2E4053')
            .setTitle('IDs Helps')
            .setDescription(`ID in Discord is a unique string of numbers assigned to every guild, user, channels, emojis and possibly more! Everything has their own ID, it's their only way of knowing each other!\n\nTo get something's ID, you'll need to turn on Developer Mode on Discord, head to your User Settings -> Under "APP SETTINGS", go to "Advanced" -> Turn on "Developer Mode".\n\nNow you just have to right click on a user, a server, or anything, then click on "Copy _Something_ ID" to get their ID!`)
            .setImage('https://i.imgur.com/Dn402t2.gif');
    }
    else if (option === 'welcome-msg') {
        helpEmbed
            .setColor('#2E4053')
            .setTitle('Welcome Message Helps')
            .setDescription(`The welcome message to send to new members of your server.\n\nDefault: "Thank you for joining \${member.guild.name}!"\n\nCommon Questions: (Remove the quotes if you want to include any of the syntaxs below.)\nQ: How can I get the server name?\nAns: You can just type the server name in yourself, but if you want, "\${member.guild.name} as shown above."\n\nQ: How can I get the new member\s username?\nAns: "\${member.user.username}"\n\nQ: I actually meant their name displayed, like the one with caps?\nAns: "\${member.user.displayName}"\n\nQ: How do I get a new line?\nAns: Use "\\n" at the end of the line, don\'t need any spaces.\n\nQ: How do I make something bold or italic or something something?\nAns: Check "/help formats".\n\nQ: How do I put multiple characters such as "*" in my message without it making my message weird?\nAns: Check "/help formats".`);
    }
    else {
        await interaction.reply({
            content: 'Invalid option.',
            ephemeral: true,
        });
        return;
    }
    await interaction.reply({
        embeds: [helpEmbed],
        components: [supportButton],
        ephemeral: true,
    });
}
export async function autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = [
        'menu',
        'settings',
        'formats',
        'ids',
        'welcome-msg',
    ];
    const filtered = choices.filter(choice => choice.startsWith(focusedValue.toLowerCase()));
    await interaction.respond(filtered.map(choice => ({
        name: choice,
        value: choice,
    }))
        .slice(0, 25));
}
