import TodoEntry from "./TodoEntry";
import TodoList from "./TodoList";
import { ReactionEmoji } from 'discord.js';
import { BungieApi } from "./bungieapi/BungieApi"
import ActivityHistory from "./ActivityHistory"

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

    async GetFlavorTextForUser(server_id, user_id, activity_string, activity_type)
    {
        let discord_destiny_profile_json = await this.keyv.get(server_id + "-" + user_id);
        if (discord_destiny_profile_json === undefined)
        {
            return "";
        }

        let discord_destiny_profile = JSON.parse(discord_destiny_profile_json);
        let destiny_membership_id = discord_destiny_profile.destiny_membership_id;
        let membership_type = discord_destiny_profile.membership_type;
        let characters = discord_destiny_profile.characters.split(",");
        let text = "";
        for (let character of characters)
        {
            text += await this.activity_history.History(
                destiny_membership_id, 
                membership_type, character, activity_string, activity_type) + "  ";
        }

        return text;
    }

    async GetList(discord_guild)
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
                    title: "",
                    footer: {
                        text: ""
                    }
                }
            };

            let [author, avatar_url] = value.Author();
            todo_message.embed.color = value.Color();
            todo_message.embed.author.name = key;
            todo_message.embed.author.icon_url = avatar_url;
            if (value.Date().length > 0)
            {
                todo_message.embed.footer.text = value.Date();
            }
            for (let participant of value.Participants())
            {
                let discord_guildmember = discord_guild.members.find(val => {return val.user.username === participant});
                let discord_user_id = discord_guildmember.user.id;
                let flavor_text = await this.GetFlavorTextForUser(discord_guild.id, discord_user_id, key, value.Type());
                todo_message.embed.title += `\n${participant} - ${flavor_text}`
            }
            this.message.channel.send(todo_message).then( async message => {
                await message.react("✅");
                await message.react("❌");
            });
        }
    }
}