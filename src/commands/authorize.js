import { BungieApi } from "../bungieapi/BungieApi"
import ColorCode from '../Color';
const express = require('express')
const fs = require('fs')
const open = require('open')
const https = require('https')
const querystring = require('querystring');
const app = express();
const DEV = true;

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

module.exports = {
    name: 'authorize',
    description: 'Stores the user steam membership id.',
    async execute(message, args, keyv)
    {
        let server_id = message.guild.id;
        const info_message = {
            embed: {
                fields: [
                    {
                        name: "Authorize me to view your Destiny information!",
                        value: "",
                    }
                ],
                color: ColorCode.DEFAULT,
            }
        };

        let server = https.createServer({
            key: fs.readFileSync('server.key'),
            cert: fs.readFileSync('server.cert')
        }, app).listen(3000);

        const StoreOAuth = async(req, resp) => {
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
                await keyv.set(server_id + "-" + message.author.id, JSON.stringify(discord_destiny_profile));
                message.channel.send(`Thank you ${message.author.username}!`);
                server.close();
            });
        };
        app.get('/', StoreOAuth);

        info_message.embed.fields[0].value = `[${message.author.username}](${BungieApi.authUri})`;
        info_message.embed.color = ColorCode.GOLD;
        message.channel.send(info_message);

        return;
    },
};
