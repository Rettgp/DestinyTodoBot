import TodoList from '../TodoList'
import { ReactionEmoji } from 'discord.js';
import ColorCode from '../Color';

module.exports = {
    name: 'help',
    description: 'DestinyTodoBot Help.',
    async execute(message, args, keyv)
    {
        const info_message = {
            embed: {
                description: "DestinyTodoBot Commands Help",
                color: ColorCode.DEFAULT,
                fields: [
                    {
                        name: '!todo <item>',
                        value: 'Add an item to do'
                    },
                    {
                        name: '!todos',
                        value: 'Query all todo items'
                    },
                    {
                        name: '!complete <item>',
                        value: 'Mark a todo as completed'
                    }
                ],
            }
        };

        info_message.embed.color = ColorCode.PURPLE;
        message.channel.send(info_message);
        return;
    },
};