
import Discord from 'discord.js';
import TodoList from './TodoList'

export default class ReactionHandler
{
    constructor(keyv)
    {
        this.keyv = keyv;
    }

    async Handle(reaction, user)
    {
        let server_id = reaction.message.guild.id;
        let todo_list_json = await this.keyv.get(server_id);
        if (todo_list_json === undefined)
        {
            return;
        }
        let todo_list = new TodoList();
        todo_list.Deserialize(todo_list_json);
        let todo_key = reaction.message.embeds[0].author.name;
        let todo_entry = todo_list.GetTodos().get(todo_key);

        if (!todo_list.TodoExists(todo_key))
        {
            console.log("This key doesn\'t exist!");
            return;
        }

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

        let new_embed = reaction.message.embeds[0];
        new_embed.title = "";
        for (let participant of todo_entry.Participants())
        {
            // TODO (Garrett): Trailing comma
            new_embed.title += `\n${participant}`;
        }
        reaction.message.edit(new Discord.RichEmbed(new_embed));

        if (todo_entry.Participants().length <= 0)
        {
            todo_list.GetTodos().delete(todo_key);
            reaction.message.delete();
        }
        await this.keyv.set(server_id, todo_list.Serialize());
    }

    Accept(todo_list, todo_key, user)
    {
        let todo_entry = todo_list.GetTodos().get(todo_key);
        if ( todo_entry !== undefined && 
            !todo_entry.Participants().includes(user.username) )
        {
            todo_entry.AddParticipant( user.username );
            todo_list.SetTodoEntry(todo_key, todo_entry);
        }
    }

    Remove(todo_list, todo_key, user)
    {
        let todo_entry = todo_list.GetTodos().get(todo_key);
        if ( todo_entry !== undefined && 
            todo_entry.Participants().includes(user.username) )
        {
            todo_entry.RemoveParticipant( user.username );
            todo_list.SetTodoEntry(todo_key, todo_entry);
        }
    }
}