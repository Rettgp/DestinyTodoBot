import TodoList from '../TodoList'
import { ReactionEmoji } from 'discord.js';
import TodoQuery from '../TodoQuery';
import ColorCode from '../Color';

module.exports = {
    name: 'todos',
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

        if (todo_list_json === undefined)
        {
            info_message.embed.description = `No Todo list has been setup.`
            info_message.embed.color = ColorCode.DARK_RED;
            message.channel.send(info_message);
            return;
        }
        
        let todo_list = new TodoList();
        todo_list.Deserialize(todo_list_json);

        if (todo_list.GetTodos().size < 1){
            info_message.embed.description = `All Todo tasks have been completed.`
            info_message.embed.color = ColorCode.GREEN;
            message.channel.send(info_message);
            return;
        }

        let todo_query = new TodoQuery(message, todo_list);
        todo_query.GetList();
        
        return;
    },
};