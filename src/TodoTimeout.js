import TodoEntry from "./TodoEntry";
import TodoList from "./TodoList";
import { ReactionEmoji } from 'discord.js';
import { BungieApi } from "./bungieapi/BungieApi"
import ColorCode from './Color';

let active_timers = [];

export default class TodoTimeout
{
    constructor(message, todo_list, keyv)
    {
        this.message = message;
        this.todo_list = todo_list;
        this.keyv = keyv;
    }

    async SetToDoTimeout(discord_guild)
    {
        for (let [key, value] of this.todo_list.GetTodos())
        {
            if (key in active_timers)
            {
                console.log(`${key} timeout already exists, do not add another.`);
                continue;
            }
            console.log(`${key} timeout does not exist, add.`);
            

            const info_message = {
                embed: {
                    description: "",
                    color: ColorCode.DEFAULT,
                    author: {
                        name: "",
                        icon_url: ""
                    },
                    fields: [],
                    footer: {
                        text: ""
                    }
                }
            };

            let now = Date.now();
            let reminder_timer = (value.Date() - now) - (60 * 1000);
                console.log(`reminder_timer: ${reminder_timer}`);
            let expiration_timer = (value.Expiration() - now) - (24 * 60 * 60 * 1000);
                console.log(`expiration_timer: ${expiration_timer}`);

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
                console.log(`${key} Activity Reminder: ${new Date(value.Date())}`);
              }, reminder_timer);
              

            var expiration_timeout = setTimeout(() => {
                if (this.todo_list.TodoExists(key))
                {
                    console.log(`removing todo: ${key}`);
                    this.todo_list.RemoveTodo(key);
                }
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
                  console.log(`${key} Activity Expirated: ${new Date(Date.now())}`);
              }, expiration_timer);


            active_timers.push({ key: key, value: [reminder_timeout,expiration_timeout]});
        }
    }

    async RemoveToDoTimeout(todo_key)
    {
        let [reminder_timeout, expiration_timeout] = active_timers[todo_key];
        console.log(`clearing reminder timeout for ${todo_key}`);
        clearTimeout(reminder_timeout);
        console.log(`clearing expiration timeout for ${todo_key}`);
        clearTimeout(expiration_timeout);

        delete active_timers[todo_key];
    }
}