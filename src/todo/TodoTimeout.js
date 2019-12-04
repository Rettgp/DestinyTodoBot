import TodoList from "todo/TodoList";
import ColorCode from 'utility/Color';

let active_timers = new Map();

const TWO_HOUR_OFFSET_MS = (2 * 60 * 60 * 1000);

const TWENTY_FOUR_HOUR_OFFSET_MS = (24 * 60 * 60 * 1000);

export default class TodoTimeout
{
    constructor(message, keyv, server_id, key)
    {
        this.message = message;
        this.keyv = keyv;
        this.server_id = server_id;
        this.key = key;
    }

    async SetToDoTimeout(discord_guild)
    {
        let todo_list_json = await this.keyv.get(this.server_id);
        let todo_list = new TodoList();
        todo_list.Deserialize(todo_list_json);

        for (let [key, todo_entry] of todo_list.GetTodos())
        {
            if (active_timers.has(this.key))
            {
                //console.log(`${this.key} timeout already exists, do not add another.`);
                continue;
            }          

            if (this.key !== key)
            {
                //console.log(`${this.key} does not match ${key}.`);
                continue;
            }

            let now = Date.now();
            let reminder_timer = (todo_entry.Expiration() - now) - TWO_HOUR_OFFSET_MS; //remind 2 hours before expiration
            if (todo_entry.Date() !== "")
            {
                reminder_timer = (todo_entry.Date() - now) - TWO_HOUR_OFFSET_MS; // remind 2 hours before activity date
                if (reminder_timer < 0)
                {
                    // if the activity date is less than two hours from now, take half the difference.
                    reminder_timer = ((todo_entry.Date() - now) / 2);
                }
            }
            let expiration_timer = (todo_entry.Expiration() - now);
    
            let reminder_timeout = setTimeout(() => { this.SetTodoReminderTimeout(discord_guild)}, reminder_timer);
            let expiration_timeout = setTimeout(() =>  {this.SetToDoExpirationTimeout(discord_guild) }, expiration_timer);
    
            active_timers.set( this.key, {reminder_timeout,expiration_timeout});    
        }
    }

    async RemoveToDoTimeout()
    {
        for (let [key, value] of active_timers)
        {
            if (key === this.key)
            {
                clearTimeout(value.reminder_timeout);
                clearTimeout(value.expiration_timeout);
                active_timers.delete(this.key);
            }
        }
    }

    async SetTodoReminderTimeout(discord_guild)
    {
        const info_message = {
            embed: {
                description: "",
                color: ColorCode.DEFAULT,
                fields: [],
                }
            };

        let todo_list_json = await this.keyv.get(this.server_id);
        let todo_list = new TodoList();
        todo_list.Deserialize(todo_list_json);
        for (let [key, todo_entry] of todo_list.GetTodos())
        {
            if (this.key !== key)
            {
                //console.log(`${this.key} does not match ${key}.`);
                continue;
            }
            info_message.embed.description = `${this.key} Activity Reminder: ${new Date(todo_entry.Date())}`;
            info_message.embed.fields = [];
            let mention_participants = "";
            for (let participant of todo_entry.Participants())
            {
                let discord_guildmember = discord_guild.members.find(val => {return val.user.username === participant});
                let discord_user_id = discord_guildmember.user.id;
                mention_participants += `<@${discord_user_id}> `;
            }
            info_message.embed.fields.push({ name: `Participants:`, value: `${mention_participants}` });
            this.message.channel.send(info_message);
        }
    }

    async SetToDoExpirationTimeout(discord_guild)
    {
        const info_message = {
            embed: {
                description: "",
                color: ColorCode.DEFAULT,
                fields: [],
                }
            };

        let todo_list_json = await this.keyv.get(this.server_id);
        let todo_list = new TodoList();
        todo_list.Deserialize(todo_list_json);
        for (let [key, todo_entry] of todo_list.GetTodos())
        {
            if (this.key !== key)
            {
                //console.log(`${this.key} does not match ${key}.`);
                continue;
            }
            info_message.embed.description = `${this.key} Activity Expired: ${new Date(Date.now())}`;
            info_message.embed.fields = [];
            let mention_participants = "";
            for (let participant of todo_entry.Participants())
            {
                let discord_guildmember = discord_guild.members.find(val => {return val.user.username === participant});
                let discord_user_id = discord_guildmember.user.id;
                mention_participants += `<@${discord_user_id}> `;
            }
            info_message.embed.fields.push({ name: `Participants:`, value: `${mention_participants}` });
            this.message.channel.send(info_message);
            todo_list.RemoveTodo(this.key);
            await this.keyv.set(this.server_id, todo_list.Serialize());
        }
    }
}