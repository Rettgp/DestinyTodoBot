import { BungieApi } from "../bungieapi/BungieApi"
import ColorCode from '../Color';
const express = require('express')
const fs = require('fs')
const open = require('open')
const https = require('https')
const querystring = require('querystring');
const app = express();
const DEV = true;

module.exports = {
    name: 'authorize',
    description: 'Stores the user steam membership id.',
    async execute(message, args, keyv)
    {
        let server_id = message.guild.id;
        const info_message = {
            embed: {
                description: "",
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
                await keyv.set(server_id + "-" + message.author.id, oAuth.membership_id);
                info_message.embed.description = "Your ID has been stored and you can now take part in the API";
                info_message.embed.color = ColorCode.GREEN;
                message.channel.send(info_message);
                server.close();
            });
        };
        app.get('/', StoreOAuth);

        open(BungieApi.authUri);

        return;
    },
};
