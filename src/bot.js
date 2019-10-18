const Discord = require('discord.js');
const fs = require("fs");
import ReactionHandler from "./ReactionHandler"
import Keyv from 'keyv';
const keyv = new Keyv(process.env.PROD_MONGODB);
const bot_prod_id = 'NjI1ODMxMjcwMTY5MTgyMjI4.XYleEg.vJwUi1YZVVdtgq2bATnRwIXJQo4';
const bot_dev_id = 'NjI4MjYzMTkxMjY4NDI1NzI4.XZIrQw.3g4G3xw5sRL5FHOrxT-2wNYd3YA';

// Create a Client instance with our bot token.
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

const reaction_handler = new ReactionHandler(keyv);

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
            if (!message.guild.emojis.exists('name', 'complete'))
            {
                message.guild.createEmoji('./Complete.png', 'complete');
                message.guild.createEmoji('./Incomplete.png', 'incomplete');
            }
            bot.commands.get(command).execute(message, args, keyv);

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
        // TODO (Garrett): Is there any way to get a correct 
        // reading on reactions? We would need to be able
        // to indirectly force another user's reaction
        // which I dont think is possible
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

bot.login(bot_dev_id);