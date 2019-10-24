import { BungieApi } from "./bungieapi/BungieApi"

export default class EmojiHandler
{
    constructor(guild)
    {
        this.guild = guild;
    }

    async PerkEmojiString(perk_hash)
    {
        let perk = BungieApi.Destiny2.getPerkNameAndIcon(perk_hash);
        if (perk == null)
        {
            return "";
        }

        let emoji = await this.CheckAndAdd(perk.name, perk.icon);

        return `<:${emoji.name}:${emoji.id}>`;
    }

    async CheckAndAdd(name, icon)
    {
        if (!this.guild.emojis.some(element => (element.name === name)))
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
        if ( this.guild.emojis.size < 35 )
        {
            return;
        }

        while ( this.guild.emojis.size > 25 )
        {
            let emoji = this.guild.emojis.find(val => val.name.startsWith("perk_"));
            this.guild.deleteEmoji(emoji);
        }
    }
}