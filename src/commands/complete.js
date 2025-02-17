import TodoList from 'todo/TodoList'
import { ReactionEmoji } from 'discord.js';
import ColorCode from 'utility/Color';
import { BungieApi } from "bungieapi/BungieApi"
import TodoTimeout from 'todo/TodoTimeout';

module.exports = {
    name: 'complete',
    description: 'Mark a todo item complete.',
    async execute(message, args, keyv)
    {
        let server_id = message.guild.id;
        const info_message = {
            embed: {
                description: "",
                color: ColorCode.DEFAULT,
                fields: [],
            }
        };

        if (args.length >= 1)
        {
            let todo_list_json = await keyv.get(server_id);
            if (todo_list_json === undefined)
            {
                info_message.embed.description = `No Todo list has been setup.`
                info_message.embed.color = ColorCode.DARK_RED;
                message.channel.send(info_message);
                return;
            }

            let todo_list = new TodoList();
            todo_list.Deserialize(todo_list_json);

            let todo_name = args.join(" ");
            if (todo_list.TodoExists(todo_name))
            {
                todo_list.RemoveTodo(todo_name);
                let todo_timeout = new TodoTimeout(message, keyv, server_id, todo_name);
                todo_timeout.RemoveToDoTimeout();
                await keyv.set(server_id, todo_list.Serialize());
            }
            else
            {
                info_message.embed.description = `${todo_name} does not exist. Please check current Todos:`
                for (let [key, value] of todo_list.GetTodos())
                {
                    info_message.embed.fields.push({ name: `Todo:`, value: `${key}` });
                }
                
                info_message.embed.color = ColorCode.DARK_RED;
                message.channel.send(info_message);
                return;
            }    

            if (todo_list.GetTodos().size < 1)
            {
                info_message.embed.description = `All Todo tasks have been completed.`
                info_message.embed.color = ColorCode.GREEN;
                message.channel.send(info_message);
            }
            else
            {
                info_message.embed.description = `${todo_name} task has been completed.`
                info_message.embed.color = ColorCode.GREEN;
                message.channel.send(info_message);
            }
        }
        else
        {
            info_message.embed.description = `Must Indicate which Item to complete.`
            info_message.embed.color = ColorCode.GOLD;
            message.channel.send(info_message);
        }
        
        return;
    },
};