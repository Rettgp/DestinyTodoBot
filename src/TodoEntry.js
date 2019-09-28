export default class TodoEntry
{
    constructor(todo)
    {
        this.participents = new Array();
        this.todo = todo;
    }

    AddParticipent(person)
    {
        this.participents.push(person);
    }
}