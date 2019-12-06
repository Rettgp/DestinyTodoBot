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
            return created_emoji
        }
        else
        {
            return this.guild.emojis.find(val => val.name === name);
        }
    }

    CleanupEmojis()
    {
        if ( this.guild.emojis.size < 40 )
        {
            return;
        }

        let emoji_list = this.guild.emojis.map(e=>e);
        for (var emoji of emoji_list)
        {
            if (emoji.name.startsWith("custom_"))
            {
                this.guild.deleteEmoji(emoji.id);
            }
        }
    }
}
