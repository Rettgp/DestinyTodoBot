import TodoEntry from "./TodoEntry";
import TodoList from "./TodoList";
import { ReactionEmoji } from 'discord.js';
import { BungieApi } from "./bungieapi/BungieApi"
import ColorCode from './Color';

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
        if (todo_list_json === undefined)
        {
            console.log(`todo_list_json_undefined`);
            return;
        }

        let todo_list = new TodoList();
        todo_list.Deserialize(todo_list_json);
        
        for (let [key, value] of todo_list.GetTodos())
        {
            if (active_timers.has(key))
            {
                //console.log(`${key} timeout already exists, do not add another.`);
                continue;
            }            
    
            const info_message = {
                embed: {
                    description: "",
                    color: ColorCode.DEFAULT,
                    fields: [],
                }
            };
    
            let now = Date.now();

            let reminder_timer = (value.Expiration() - now) - TWO_HOUR_OFFSET_MS; //remind 2 hours before expiration
            if (value.Date() != "")
            {
                reminder_timer = (value.Date() - now) - TWO_HOUR_OFFSET_MS; // remind 2 hours before activity date
                if (reminder_timer < 0)
                {
                    // if the activity date is less than two hours from now, take half the difference.
                    reminder_timer = ((value.Date() - now) / 2);
                }
            }
            let expiration_timer = (value.Expiration() - now) - TWENTY_FOUR_HOUR_OFFSET_MS;
            var reminder_timeout = setTimeout(() => {
                info_message.embed.description = `${key} Activity Reminder: ${new Date(value.Date())}`;
                info_message.embed.fields = [];
                let mention_participants = "";
                for (let participant of value.Participants())
                {
                    let discord_guildmember = discord_guild.members.find(val => {return val.user.username === participant});
                    let discord_user_id = discord_guildmember.user.id;
                    mention_participants += `<@${discord_user_id}> `;
                }
                info_message.embed.fields.push({ name: `Participants:`, value: `${mention_participants}` });
                this.message.channel.send(info_message);
              }, reminder_timer);
              
    
            var expiration_timeout = setTimeout(() => {
                this.CleanUpTodo();

                info_message.embed.description = `${key} Activity Expired: ${new Date(Date.now())}`;
                info_message.embed.fields = [];
                let mention_participants = "";
                for (let participant of value.Participants())
                {
                    let discord_guildmember = discord_guild.members.find(val => {return val.user.username === participant});
                    let discord_user_id = discord_guildmember.user.id;
                    mention_participants += `<@${discord_user_id}> `;
                }
                info_message.embed.fields.push({ name: `Participants:`, value: `${mention_participants}` });
                this.message.channel.send(info_message);
              }, expiration_timer);
    
            active_timers.set( key, {reminder_timeout,expiration_timeout});
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

    async CleanUpTodo()
    {
        let todo_list_json = await this.keyv.get(this.server_id);
        if (todo_list_json === undefined)
        {
            console.log(`Could not obtain todo_list_json.`);
            return;
        }

        let todo_list = new TodoList();
        todo_list.Deserialize(todo_list_json);

        if (todo_list.TodoExists(this.key))
        {
            todo_list.RemoveTodo(this.key);
            await this.keyv.set(this.server_id, todo_list.Serialize());
        }
    }
}