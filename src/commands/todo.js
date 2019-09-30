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
        }
        return;
    },
};
