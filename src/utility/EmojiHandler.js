let s_custom_emojis = new Map();

export class EmojiHandler
{
    constructor(guild)
    {
        this.guild = guild;
    }

    async CreateCustomEmoji(name,emoji_icon)
    {
        let emoji_name = name.split(' ').join('_').toLowerCase();
        let new_emoji = await this.CheckAndAdd(`custom_${emoji_name}`, emoji_icon);
        return `<:${new_emoji.name}:${new_emoji.id}>`;
    }

    async CheckAndAdd(name, icon)
    {
        if (!this.guild.emojis.find(val => val.name === name))
        {
            let created_emoji = await this.guild.createEmoji(icon, name);
            this.UpdateEmojiMap(created_emoji);
            return created_emoji
        }
        else
        {
            let exiting_emoji = this.guild.emojis.find(val => val.name === name);
            this.UpdateEmojiMap(exiting_emoji);
            return exiting_emoji;
        }
    }

    UpdateEmojiMap(new_emoji)
    {
        console.log(`s_custom_emojis.size: ${s_custom_emojis.size}`);
        if (s_custom_emojis.size === 0)
        {
            let emoji_list = this.guild.emojis.map(e=>e);
            for (var emoji of emoji_list)
            {
                if (emoji.name.startsWith("custom_"))
                {
                    s_custom_emojis.set(emoji.id, {
                        value: emoji,
                        last_updated: Date.now()
                    });
                }
            }
        }

        if (!s_custom_emojis.has(new_emoji.id))
        {
            s_custom_emojis.set(new_emoji.id, {
                value: new_emoji,
                last_updated: Date.now()
            });
            return;
        }

        let custom_emoji = s_custom_emojis.get(new_emoji.id);
        s_custom_emojis.set(custom_emoji.id, {
            value: custom_emoji.value,
            last_updated: Date.now()
        });
    }

    async CleanupEmojis()
    {
        if ( this.guild.emojis.size < 35 )
        {
            return;
        }

        // the idea here would be get all dates from the stored emoji map.
        // Sort the dates ascending. 
        // remove the oldest 10 from the map and the emoji collection
        // await this.guild.deleteEmoji(emoji.id);
        // this.s_custom_emojis.delete(emoji.id);
    }
}
