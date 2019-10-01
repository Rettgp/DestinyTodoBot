import TodoEntry from "./TodoEntry";
import TodoList from "./TodoList";
import { ReactionEmoji } from 'discord.js';

export default class TodoQuery
{
    constructor(message, todo_list)
    {
        this.message = message;
        this.todo_list = todo_list;
    }

    GetList()
    {
        for (let [key, value] of this.todo_list.GetTodos())
        {
            const todo_message = {
                embed: {
                    color: 12652005,
                    description: "",
                    author: {
                        name: "",
                        icon_url: ""
                    },
                    provider: {
                        name: ""
                    }
                }
            };

            let [author, avatar_url] = value.Author();
            todo_message.embed.color = value.Color();
            todo_message.embed.author.name = key;
            todo_message.embed.author.icon_url = avatar_url;
            for (let participant of value.Participants())
            {
                // TODO (Garrett): Trailing comma
                todo_message.embed.description += participant + ",";
            }
            this.message.channel.send(todo_message).then( async message => {
                await message.react("✅");
                await message.react("❌");
            });
        }
    }
}