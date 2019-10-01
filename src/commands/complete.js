import TodoList from '../TodoList'
import { ReactionEmoji } from 'discord.js';

module.exports = {
    name: 'complete',
    description: 'Mark a todo item complete.',
    async execute(message, args, keyv)
    {
        let server_id = message.guild.id;
        const info_message = {
            embed: {
                description: "",
            }
        };

        if (args.length >= 1)
        {
            let todo_list_json = await keyv.get(server_id);
            if (todo_list_json === undefined)
            {
                info_message.embed.description = `No Todo list has been setup.`
                message.channel.send(info_message);
                return;
            }

            let todo_list = new TodoList();
            todo_list.Deserialize(todo_list_json);

            let todo_name = args.join(" ");

            if (todo_list.TodoExists(todo_name))
            {
                todo_list.RemoveTodo(todo_name);
                await keyv.set(server_id, todo_list.Serialize());
            }
            else
            {
                info_message.embed.description = todo_name + ` does not exist. Please check your todos.`
                message.channel.send(info_message);
            }    

            if (todo_list.GetTodos().size < 1)
            {
                info_message.embed.description = `All Todo tasks have been completed.`
                message.channel.send(info_message);
            }
        }
        else
        {
            info_message.embed.description = `Must Indicate which Item to complete.`
            message.channel.send(info_message);
        }
        
        return;
    },
};