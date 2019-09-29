const Discord = require('discord.js');
const fs = require("fs");
import ReactionHandler from "./ReactionHandler"

// Create a Client instance with our bot token.
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

const reaction_handler = new ReactionHandler();

// When the bot is connected and ready, log to console.
bot.on('ready', () =>
{
    console.log('Connected and ready.');
});

const talkedRecently = new Set();

// Ran everytime the server gets a message
bot.on('message', async (message) =>
{
    if (!message.content.startsWith("!") || message.author.bot) return;

    // TODO (Garrett): I'd like to look at the 1st argument
    // and further break down the command. Right now the todo command
    // handles all sub commands which is nasty 
    const args = message.content.slice(1).split(/ +/);
	const command = args.shift().toLowerCase();

    if (!bot.commands.has(command)) return;

    if (talkedRecently.has(message.author.id))
    {
        message.reply("I'm tired! Wait a couple seconds and try again.")
    } 
    else
    {
        try
        {
            bot.commands.get(command).execute(message, args);

            // Adds the user to the set so that they can't talk for 2 seconds
            talkedRecently.add(message.author.id);
            setTimeout(() =>
            {
                // Removes the user from the set after 2 seconds
                talkedRecently.delete(message.author.id);
            }, 2000);
        } catch (error)
        {
            console.error(error);
            message.reply('there was an error trying to execute that command!');
        }
    }
});

bot.on('messageReactionAdd', (messageReaction, user) => 
{
    if (user.bot)
    {
        reaction_handler.UpdateCounts(messageReaction, user);
        return;
    }

    reaction_handler.Handle(messageReaction, user);
});

bot.on('error', err =>
{
    console.warn(err);
});


// Command Handler
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles)
{
    const command = require(`./commands/${file}`);

    bot.commands.set(command.name, command);
}

bot.login('NjI1ODMxMjcwMTY5MTgyMjI4.XYleEg.vJwUi1YZVVdtgq2bATnRwIXJQo4');