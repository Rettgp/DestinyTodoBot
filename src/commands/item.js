import ColorCode from 'utility/Color.js';
import { Item } from 'Item/ItemInfo.js';
import { EmojiHandler } from "utility/EmojiHandler.js";

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
            item_message.embed.description = `Please specify an item to query`;
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

        let item_class = new Item();
        let item_type = item_class.FindClosestItemType(item_user_type);

        let item_info = item_class.FindItemObject(item_user_input, item_type);
        if (item_info === null)
        {
            item_message.embed.description = `Unable to find ${item_user_input}`;
            item_message.embed.color = ColorCode.RED;
            message.channel.send(item_message);
            return;
        }

        item_message.embed.title = `${item_info.name} - ${item_info.item_type_and_tier_display_name}`;
        item_message.embed.description = item_info.description;
        item_message.embed.thumbnail.url = item_info.thumbnail;
        item_message.embed.image.url = item_info.screenshot;

        let emoji_handler = new EmojiHandler(message.guild);
        if (item_info.socket_plugs !== undefined)
        {
            for (let sorted_plug of item_info.socket_plugs)
            {
                let socket_value = "";
                for (let socket of sorted_plug.socketAndPlugHashValues)
                {
                    let new_emoji = await emoji_handler.CreateCustomEmoji(socket.name, socket.icon);
                    if (new_emoji === undefined)
                    {
                        new_emoji = '';
                    }
                    socket_value += `${new_emoji} ${socket.name}\n`;
                }
                if (socket_value !== "")
                {
                    item_message.embed.fields.push({name: `${sorted_plug.categoryHash}`, value: socket_value, inline: 'true'});
                }
            }
        }

        if (item_info.stats !== undefined)
        {
            let stats = "";
            for (let stat of item_info.stats)
            {
                stats += `${stat.name}: ${stat.value}\n`;
            }
            if (stats !== "")
            {
                item_message.embed.fields.push({name: `STATS`, value: stats, inline: 'true'});
            }
        }

        if (item_info.steps !== undefined)
        {
            for (let step of item_info.steps)
            {
                item_message.embed.fields.push({name: `Quest Step: ${step.name}`, value: step.description});
            }
        }
        
        message.channel.send(item_message)
            .then(msg => {emoji_handler.CleanupEmojis()});
    }
}