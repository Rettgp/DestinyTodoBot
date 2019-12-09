import ColorCode from 'utility/Color';

export class Membership
{
    constructor(message, keyv)
    {
        this.message = message;
        this.keyv = keyv;
        this.valid = false;
    }

    async GetMembershipOfAuthor()
    {
        const info_message = {
            embed: {
                description: "",
                color: ColorCode.DEFAULT,
            }
        };

        let user_key = this.message.author;
        let discord_destiny_profile_json = await this.keyv.get(this.message.guild.id + "-" + user_key.id);
        if (discord_destiny_profile_json === undefined)
        {
            info_message.embed.description = `${user_key.username} has not authorized me yet :(`
            info_message.embed.color = ColorCode.RED;
            this.message.channel.send(info_message);
            return;
        }
        this.valid = true;
        let discord_destiny_profile = JSON.parse(discord_destiny_profile_json);
        let membership = {
            username: user_key.username,
            id: discord_destiny_profile.destiny_membership_id,
            type: discord_destiny_profile.membership_type,
            character_uids: discord_destiny_profile.characters.split(","),
        }
        return membership;
    }   

    async GetMembershipOfMentionedUser()
    {
        const info_message = {
            embed: {
                description: "",
                color: ColorCode.DEFAULT,
            }
        };

        let user_key = this.message.author;
        if (this.message.mentions.members.size === 1)
        {
            user_key = this.message.mentions.members.first().user;
        }
        let discord_destiny_profile_json = await this.keyv.get(this.message.guild.id + "-" + user_key.id);
        if (discord_destiny_profile_json === undefined)
        {
            info_message.embed.description = `${user_key.username} has not authorized me yet :(`
            info_message.embed.color = ColorCode.RED;
            this.message.channel.send(info_message);
            return;
        }
        this.valid = true;
        let discord_destiny_profile = JSON.parse(discord_destiny_profile_json);
        let membership = {
            username: user_key.username,
            id: discord_destiny_profile.destiny_membership_id,
            type: discord_destiny_profile.membership_type,
            character_uids: discord_destiny_profile.characters.split(","),
        }
        return membership;
    }

    async GetMembershipOfCustom(user)
    {
        let discord_destiny_profile_json = await this.keyv.get(this.message.guild.id + "-" + user.id);
        if (discord_destiny_profile_json === undefined)
        {
            return "No characters found";
        }
        this.valid = true;
        let discord_destiny_profile = JSON.parse(discord_destiny_profile_json);
        let membership = {
            username: user.username,
            id: discord_destiny_profile.destiny_membership_id,
            type: discord_destiny_profile.membership_type,
            character_uids: discord_destiny_profile.characters.split(","),
        }
        return membership;
    }

    Valid()
    {
        return this.valid;
    }
}