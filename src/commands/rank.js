import { BungieApi } from "../bungieapi/BungieApi"
import ColorCode from '../Color';
import fs from 'fs';
const path = require('path');
import { rejects } from "assert";
import { resolve } from "path";
let Jimp = require("jimp");
var text2png = require('text2png');
const tmp_asset_dir = "./assets/tmp";

module.exports = {
    name: 'rank',
    description: 'Displays user pvp ranks.',
    async execute(message, args, keyv)
    {
        let server_id = message.guild.id;
        let info_message = {
            embed: {
                description: "",
                color: ColorCode.DEFAULT,
            }
        };

        let user_key = message.author;
        
        if (message.mentions.members.size === 1)
        {
            user_key = message.mentions.members.first().user;
        }

        let discord_destiny_profile_json = await keyv.get(server_id + "-" + user_key.id);
        if (discord_destiny_profile_json === undefined)
        {
            info_message.embed.description = `${user_key.username} has not authorized me yet :(`
            info_message.embed.color = ColorCode.RED;
            message.channel.send(info_message);
            return;
        }

        let discord_destiny_profile = JSON.parse(discord_destiny_profile_json);
        let destiny_membership_id = discord_destiny_profile.destiny_membership_id;
        let membership_type = discord_destiny_profile.membership_type;
        
        

        return;
    },
};