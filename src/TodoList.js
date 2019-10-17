import TodoEntry from "./TodoEntry";

export default class TodoList
{
    constructor()
    {
        // NOTE (Garrett): This class is merely a container for serialization
        // Any other member than todo_list will not be persisted.
        this.todo_list = new Map();
    }

    // TODO (Garrett): This method is kinda EH now that I added AddTodoEntry.
    // Get rid of it?
    // Also do we need any other convienence function if you just
    // have AddTodoEntry. It does force calling code to know how to
    // form an entry. MEH
    AddTodo(todo, author, author_avatar, type, date)
    {
        let entry = new TodoEntry(author, author_avatar, type, date);
        this.todo_list.set(todo, entry);
    }

    RemoveTodo(todo_key)
    {
        this.todo_list.delete(todo_key);
    }

    TodoExists(todo_key)
    {
        return this.todo_list.has(todo_key);
    }

    AddParticipant(todo, person)
    {
        let entry = this.todo_list.get(todo);
        entry.AddParticipant(person);
    }

    SetTodoEntry(todo, todo_entry)
    {
        this.todo_list.set(todo, todo_entry);
    }

    GetTodos()
    {
        return this.todo_list;
    }

    Serialize()
    {
        return JSON.stringify(Array.from(this.todo_list.entries())); 
    }

    // TODO (Garrett): Need to handle exceptions here due to possible 
    // content malformation if the database is out of sync with client
    Deserialize(json)
    {
        let serialized_map = new Map(JSON.parse(json));
        for (let [key, value] of serialized_map)
        {
            let todo_entry = new TodoEntry(value.author, value.author_avatar, value.type, value.date);
            todo_entry.color = value.color;
            let participants = value.participants;
            for (let i = 0; i < participants.length; ++i)
            {
                todo_entry.AddParticipant(participants[i]);
            }
            this.SetTodoEntry(key, todo_entry);
        }
    }
}