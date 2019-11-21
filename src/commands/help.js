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
                title: "Rasputin Help",
                description: "All commands must lead with a '!'",
                color: ColorCode.DEFAULT,
                fields: [
                    {
                        name: 'Commands',
                        value: 
                        '!authorize\n'+
                        '!loadout <@username>\n' +
                        '!rank <@username>\n' +
                        '!todo <item> <(date)>\n' +
                        '!todos\n' +
                        '!complete <item>\n',
                        inline: true
                    },
                    {
                        name: 'Description',
                        value: 
                        'Allow Rasputin to access your character information\n' +
                        'Query a users current loadout, @username is optional\n' +
                        'Query a users current ranking, @username is optional\n' +
                        'Add an item to do and when to do it in "( )"\n' +
                        'Query all todo items\n' +
                        'Mark a todo as completed\n',
                        inline: true
                    },
                    {
                        name: 'Example Command',
                        value: '!todo Garden of Salvation (Saturday Night)\n',
                        inline: false
                    }
                ],
            }
        };

        info_message.embed.color = ColorCode.ULTRA_VIOLET;
        message.channel.send(info_message);
        return;
    },
};