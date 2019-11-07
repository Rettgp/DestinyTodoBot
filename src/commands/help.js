import TodoList from '../TodoList'
import { ReactionEmoji } from 'discord.js';
import ColorCode from '../Color';

module.exports = {
    name: 'help',
    description: 'Rasputin Help.',
    async execute(message, args, keyv)
    {
        const info_message = {
            embed: {
                description: "Rasputin Command Help",
                color: ColorCode.DEFAULT,
                fields: [
                    {
                        name: '!todo <item> <Optional:(Date to Run Activity)>',
                        value: 'Add an item to do and when to do it in "()"'
                    },
                    {
                        name: '!todos',
                        value: 'Query all todo items'
                    },
                    {
                        name: '!complete <item>',
                        value: 'Mark a todo as completed'
                    },
                    {
                        name: '!authorize',
                        value: 'Allow Rasputin to access your character information'
                    },
                    {
                        name: '!loadout <@username>',
                        value: 'Query a users current loadout'
                    }
                ],
            }
        };

        info_message.embed.color = ColorCode.PURPLE;
        message.channel.send(info_message);
        return;
    },
};