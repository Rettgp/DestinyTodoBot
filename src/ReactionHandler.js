import Keyv from 'keyv';
import TodoList from './TodoList'
const keyv = new Keyv(process.env.PROD_MONGODB);

export default class ReactionHandler
{
    constructor()
    {
    }

    async Handle(reaction, user)
    {
        let server_id = reaction.message.guild.id;
        let todo_list_json = await keyv.get(server_id);
        if (todo_list_json === undefined)
        {
            return;
        }
        let todo_list = new TodoList();
        todo_list.Deserialize(todo_list_json);
        let todo_key = reaction.message.embeds[0].author.name;
        let todo_entry = todo_list.GetTodos().get(todo_key);
        console.log("TODO KEY: " + todo_key);

        if (reaction.emoji.name === "❌")
        {
            if ( todo_entry !== undefined )
            {
                this.Remove(todo_list, todo_key, user);
            }
        }
        if (reaction.emoji.name === "✅")
        {
            if ( todo_entry !== undefined )
            {
                this.Accept(todo_list, todo_key, user);
            }
        }

        if (todo_entry.Participants().length <= 0)
        {
            todo_list.GetTodos().delete(todo_key);
        }
        console.log("WRITING: " + todo_list);
        await keyv.set(server_id, todo_list.Serialize());
    }

    Accept(todo_list, todo_key, user)
    {
        let todo_entry = todo_list.GetTodos().get(todo_key);
        if ( todo_entry !== undefined && 
            !todo_entry.Participants().includes(user.username) )
        {
            todo_entry.AddParticipant( user.username );
            todo_list.AddTodoEntry(todo_key, todo_entry);
            console.log("TODO LIST ADD: " + todo_list);
        }
    }

    Remove(todo_list, todo_key, user)
    {
        let todo_entry = todo_list.GetTodos().get(todo_key);
        if ( todo_entry !== undefined && 
            todo_entry.Participants().includes(user.username) )
        {
            todo_entry.RemoveParticipant( user.username );
            todo_list.AddTodoEntry(todo_key, todo_entry);
            console.log("TODO LIST Remove: " + todo_list);
        }
    }
}