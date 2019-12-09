import TodoEntry from "todo/TodoEntry";
import TodoList from "todo/TodoList";
import { ReactionEmoji } from 'discord.js';
import { BungieApi } from "bungieapi/BungieApi"
import ActivityHistory from "character/ActivityHistory"
import { Membership } from "membership/MembershipManager.js";

export default class TodoQuery
{
    constructor(message, todo_list, keyv)
    {
        this.message = message;
        this.todo_list = todo_list;
        let complete_emoji = message.guild.emojis.find(val => val.name === 'complete');
        let incomplete_emoji = message.guild.emojis.find(val => val.name === 'incomplete');
        this.activity_history = new ActivityHistory(complete_emoji, incomplete_emoji);
        this.keyv = keyv;
    }

    async GetFlavorTextForUser(user, activity_string, activity_type)
    {
        let membership = new Membership(this.message, this.keyv);
        let destiny_membership = await membership.GetMembershipOfCustom(user);
        if (!membership.Valid())
        {
            return destiny_membership;
        }

        if (activity_type.length === 0 || activity_type === 0)
        {
            return  "Activity not found";
        }

        let text = "";
        for (let character of destiny_membership.character_uids)
        {
            text += await this.activity_history.History(
                destiny_membership.id, 
                destiny_membership.type, character, activity_string, activity_type) + " ";
        }

        return text;
    }

    async GetList()
    {
        for (let [key, value] of this.todo_list.GetTodos())
        {
            const todo_message = {
                embed: {
                    color: 12652005,
                    author: {
                        name: "",
                        icon_url: ""
                    },
                    fields: [],
                    footer: {
                        text: ""
                    }
                }
            };

            let [author, avatar_url] = value.Author();
            todo_message.embed.color = value.Color();
            todo_message.embed.author.name = key;
            todo_message.embed.author.icon_url = avatar_url;
            if (value.Date() !== "")
            {
                let activity_date = new Date(value.Date());
                todo_message.embed.footer.text = `Activity Date: ${activity_date}`;
            }
            if (value.Expiration() !== "")
            {
                let expiration_date = new Date(value.Expiration());
                todo_message.embed.footer.text += `\nExpiration Date: ${expiration_date}`;
            }
            for (let participant of value.Participants())
            {
                let discord_guildmember = this.message.guild.members.find(val => {return val.user.username === participant});
                let flavor_text = await this.GetFlavorTextForUser(discord_guildmember.user, key, value.Type());
                todo_message.embed.fields.push({ name: `${participant}`, value: `${flavor_text}` });
            }
            this.message.channel.send(todo_message).then( async message => {
                await message.react("✅");
                await message.react("❌");
            });
        }
    }
}