import TodoList from '../TodoList'
import { ReactionEmoji } from 'discord.js';

module.exports = {
    name: 'help',
    description: 'DestinyTodoBot Help.',
    async execute(message, args, keyv)
    {
        const info_message = {
            embed: {
                description: "DestinyTodoBot Commands Help",
                fields: [
                    {
                        name: '!todo <item>',
                        value: 'Add an item to do'
                    },
                    {
                        name: '!todos',
                        value: 'Query all todo items'
                    }
                ],
            }
        };

        message.channel.send(info_message);
        return;
    },
};