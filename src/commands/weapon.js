import ColorCode from 'utility/Color.js';
import { Item } from 'Item/ItemInfo.js';
import { Membership } from "membership/MembershipManager.js";

module.exports = {
    name: 'weapon',
    description: 'Gets details about an item',
    async execute(message, args, keyv)
    {
        let item_message = {
            embed: {
                title: "",
                description: "",
                color: ColorCode.DEFAULT,
                thumbnail: { url: "" },
                footer: { icon_url: "", text: new Date(Date.now()),},
                image: { url: "" },
                fields: [],
            }
        };

        if (args.length < 1)
        {
            item_message.embed.description = `Please specify a weapon`;
            item_message.embed.color = ColorCode.RED;
            message.channel.send(item_message);
            return;
        }
        let item_user_input = args.join(" ").toUpperCase();

        let item_info = new Item();
        let weapon = item_info.FindItemObject(item_user_input, 3);

        if (weapon === null)
        {
            item_message.embed.description = `Unable to find ${item_user_input}`;
            item_message.embed.color = ColorCode.RED;
            message.channel.send(item_message);
            return;
        }

        item_message.embed.title = weapon.name;
        item_message.embed.description = weapon.description;
        item_message.embed.thumbnail.url = weapon.icon;
        message.channel.send(item_message);
    }
}