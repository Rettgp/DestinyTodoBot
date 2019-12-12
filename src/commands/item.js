import ColorCode from 'utility/Color.js';
import { Item } from 'Item/ItemInfo.js';
import { Membership } from "membership/MembershipManager.js";

module.exports = {
    name: 'item',
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
        let item_user_type = "";
        if (item_user_input.includes("(") && item_user_input.includes(")"))
        {
            item_user_type = item_user_input.match(/\((.*)\)/i)[1]
            item_user_input = item_user_input.replace(/ *\([^)]*\) */g, ""); 
        }        

        let item_info = new Item();
        let item_type = item_info.FindClosestItemType(item_user_type);
        
        let weapon = item_info.FindItemObject(item_user_input, item_type);
        if (weapon === null)
        {
            item_message.embed.description = `Unable to find ${item_user_input}`;
            item_message.embed.color = ColorCode.RED;
            message.channel.send(item_message);
            return;
        }

        item_message.embed.title = weapon.name;
        item_message.embed.description = weapon.description;
        item_message.embed.thumbnail.url = weapon.thumbnail;
        item_message.embed.image.url = weapon.screenshot;

        let stats = "";
        for (let stat of weapon.stats)
        {
            stats += `${stat.name}: ${stat.value}\n`;
        }

        if (stats !== "")
        {
            item_message.embed.fields.push({name: `Stats`, value: stats});
        }
        

        message.channel.send(item_message);
    }
}