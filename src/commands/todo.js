import TodoList from '../TodoList'
import { ReactionEmoji } from 'discord.js';

module.exports = {
    name: 'todo',
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
        if (args.length >= 1)
        {
            let todo_list = new TodoList();
            if (todo_list_json !== undefined)
            {
                todo_list.Deserialize(todo_list_json);
            }

            let todo_name = args.join(" ");
            todo_list.AddTodo(todo_name, message.author.username, message.author.avatarURL);
            todo_list.AddParticipant(todo_name, message.author.username);
            await keyv.set(server_id, todo_list.Serialize());
            info_message.embed.description = `${message.author.username} has added: ${todo_name}`
            message.channel.send(info_message);

            // Update the todos and show the list. This seems dirty.
            todo_list_json = await keyv.get(server_id);
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
                    todo_message.embed.description += participant + ",";
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
