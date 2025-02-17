import ColorCode from 'utility/Color';

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
                        '!vendor <vendor name>\n' +
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
                        'Query current vendor items\n' +
                        'Add an item to do and when; "( )"\n' +
                        'Query all todo items\n' +
                        'Mark a todo as completed\n',
                        inline: true
                    },
                    {
                        name: 'Example Command',
                        value: '!todo Garden of Salvation (12/31/19 5:00 PM)\n',
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