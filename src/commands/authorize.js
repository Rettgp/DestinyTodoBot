import { BungieApi } from "../bungieapi/BungieApi"
import ColorCode from '../Color';

module.exports = {
    name: 'authorize',
    description: 'Stores the user steam membership id.',
    async execute(message, args, keyv)
    {
        const info_message = {
            embed: {
                fields: [
                    {
                        name: "Authorize me to view your Destiny information!",
                        value: "",
                    }
                ],
                color: ColorCode.DEFAULT,
            }
        };

        info_message.embed.fields[0].value = `[${message.author.username}](${BungieApi.authUri})`;
        info_message.embed.color = ColorCode.GOLD;
        message.channel.send(info_message);

        return;
    },
};
