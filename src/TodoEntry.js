export default class TodoEntry
{
    constructor(author, author_avatar, type)
    {
        this.color = Math.floor(Math.random() * 16777214) + 1;
        this.participants = new Array();
        this.author = author;
        this.author_avatar = author_avatar;
        this.type = type;
    }

    AddParticipant(person)
    {
        this.participants.push(person);
    }

    RemoveParticipant(person)
    {
        this.participants = this.participants.filter(item => item !== person);
    }

    Participants()
    {
        return this.participants;
    }

    Author()
    {
        return [this.author, this.author_avatar];
    }

    Color()
    {
        return this.color;
    }

    Type()
    {
        return this.type;
    }
}