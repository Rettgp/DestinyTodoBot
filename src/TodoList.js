import TodoEntry from "./TodoEntry";

export default class TodoList
{
    constructor()
    {
        this.todo_list = new Map();
    }

    AddTodo(todo)
    {
        let entry = new TodoEntry(todo);
        this.todo_list.set(todo, entry);
    }

    AddParticipent(todo, person)
    {
        let entry = this.todo_list.get(todo);
        entry.AddParticipent(person);
    }

    GetTodos()
    {
        return this.todo_list;
    }

    Serialize()
    {
        return JSON.stringify(Array.from(this.todo_list.entries())); 
    }

    Deserialize(json)
    {
        this.todo_list = new Map(JSON.parse(json)); ; 
    }
}