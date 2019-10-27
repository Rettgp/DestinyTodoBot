import { BungieApi } from "./bungieapi/BungieApi"
const express = require('express');
const https = require('https')
const PORT = process.env.PORT || 3000;
const app = express();
const fs = require('fs')

function GetCharactersFromProfile(resp)
{
    return resp.Response.profile.data.characterIds;
}

function GetFirstDestinyMembership(resp)
{
    let id = resp.Response.destinyMemberships[0].membershipId;
    let type = resp.Response.destinyMemberships[0].membershipType;
    return [type, id];
}

export default class WebhookListener
{
    constructor(keyv)
    {
        this.keyv = keyv;
        if (process.env.DEV.toString().trim() === '1')
        {
            https.createServer({
                key: fs.readFileSync(__dirname + '/server.key'),
                cert: fs.readFileSync(__dirname + '/server.cert')
            }, app).listen(PORT);
        }

        this.message = undefined;
    }

    SetMessage(message)
    {
        this.message = message;
    }

    Listen()
    {
        app.post('/poke', (req, res) =>
        {
            res.send({ status: 'OK' });
        });
        app.get('/oAuth', (req, res) =>
        {
            let code = req.query.code;
            BungieApi.requestAccessToken(code).then( async(oAuth) =>
            {
                let destiny_membership_data = await BungieApi.User.getMembershipDataById(String(oAuth.membership_id), "BUNGIENEXT");
                let [membership_type_val, destiny_membership_id] = GetFirstDestinyMembership(destiny_membership_data);
                let profile = await BungieApi.Destiny2.getProfile(String(destiny_membership_id), membership_type_val);
                let characters = GetCharactersFromProfile(profile);
                let char_db_value = characters.join(",");
                let discord_destiny_profile = {
                    destiny_membership_id: destiny_membership_id,
                    characters: char_db_value,
                    membership_type: membership_type_val
                }
                await this.keyv.set(this.message.guild.id + "-" + this.message.author.id, JSON.stringify(discord_destiny_profile));
                this.message.channel.send(`Thank you ${this.message.author.username}!`);
            });
        });
        if (process.env.DEV.toString().trim() !== '1')
        {
            app.listen(PORT);
        }
    }
}