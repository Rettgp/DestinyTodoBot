import TodoList from '../TodoList'
import TodoQuery from '../TodoQuery'
import { ReactionEmoji } from 'discord.js';
import ColorCode from '../Color';
import { BungieApi } from "../bungieapi/BungieApi"

module.exports = {
    name: 'todo',
    description: 'Get information on current server todo list.',
    async execute(message, args, keyv)
    {
        let server_id = message.guild.id;
        const info_message = {
            embed: {
                description: "",
                color: ColorCode.DEFAULT,
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
            let todo_type = 0;
            [todo_name, todo_type] = BungieApi.Destiny2.findClosestActivity(todo_name);
            todo_list.AddTodo(todo_name, message.author.username, message.author.avatarURL, todo_type);
            todo_list.AddParticipant(todo_name, message.author.username);
            await keyv.set(server_id, todo_list.Serialize());
            info_message.embed.description = `${message.author.username} has added: ${todo_name}`
            info_message.embed.color = ColorCode.GREEN;
            message.channel.send(info_message);

            // Update the todos and show the list. This seems dirty.
            todo_list_json = await keyv.get(server_id);
            todo_list.Deserialize(todo_list_json);

            let todo_query = new TodoQuery(message, todo_list, keyv);
            todo_query.GetList(message.guild);
        }
        return;
    },
};
