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
        s_custom_emojis.set(new_emoji.id, {
            value: custom_emoji.value,
            last_updated: Date.now()
        });
    }

    async CleanupEmojis()
    {
        if ( this.guild.emojis.size < 30 )
        {
            return;
        }

        let custom_emoji_timestamps = [];
        for (let [key, value] of s_custom_emojis)
        {
            custom_emoji_timestamps.push({id: key, time: value.last_updated});
        }

        custom_emoji_timestamps = custom_emoji_timestamps.sort(function(a, b){ 
            return a.time - b.time; 
        });

        let emoji_count = 0;
        let s_custom_emoji_count = s_custom_emojis.size;
        for (let e of custom_emoji_timestamps)
        {
            if (emoji_count >= (s_custom_emoji_count / 2))
            {
                return;
            }
            await this.guild.deleteEmoji(e.id);
            s_custom_emojis.delete(e.id);
            emoji_count++;
        }
    }
}
