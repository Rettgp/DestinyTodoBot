import TodoList from '../TodoList'
import { ReactionEmoji } from 'discord.js';

module.exports = {
    name: 'todos',
    description: 'Get information on current server todo list.',
    async execute(message, args, keyv)
    {
        let server_id = message.guild.id;
        const info_message = {
            embed: {
                description: "",
            }
        };

        let todo_list_json = await keyv.get(server_id);
        
        if (todo_list_json === undefined)
        {
            info_message.embed.description = `No Todo list has been setup.`
            message.channel.send(info_message);
        }
        else
        {
            let todo_list = new TodoList();
            todo_list.Deserialize(todo_list_json);
            for (let [key, value] of todo_list.GetTodos())
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
                    todo_message.embed.description = participant + ",";
                }
                message.channel.send(todo_message).then( async message => {
                    await message.react("✅");
                    await message.react("❌");
                });
            }
            
        }
        return;
    },
};