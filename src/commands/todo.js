import Keyv from 'keyv';
import TodoList from '../TodoList'
const keyv = new Keyv(process.env.PROD_MONGODB);

module.exports = {
    name: 'todo',
    description: 'Get information on current server todo list.',
    async execute(message, args)
    {
        let server_id = message.guild.id;
        const result_message = {
            embed: {
                description: ""
            }
        };

        // TODO (Garrett): Fill out the message
        let todo_list_json = await keyv.get(server_id);
        if (args.length >= 1)
        {
            let todo_list = new TodoList();
            if (todo_list_json !== undefined)
            {
                todo_list.Deserialize(todo_list_json);
            }

            let todo_name = args.join(" ");
            todo_list.AddTodo(todo_name);
            todo_list.AddParticipent(todo_name, message.author.username);
            await keyv.set(server_id, todo_list.Serialize());
            result_message.embed.description = `${message.author.username} has added: ${todo_name}`
        }
        else if (todo_list_json === undefined)
        {
            result_message.embed.description = `No Todo list has been setup.`
        }
        else
        {
            result_message.embed.description = todo_list_json;
        }
        message.channel.send(result_message);
        return;
    },
};
