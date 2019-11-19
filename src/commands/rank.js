import { BungieApi } from "../bungieapi/BungieApi"
import ColorCode from '../Color';
import fs from 'fs';
const path = require('path');
import { rejects } from "assert";
import { resolve } from "path";
let Jimp = require("jimp");
var text2png = require('text2png');
const tmp_asset_dir = "./assets/tmp";

function GetProgressionName(hash)
{
    return BungieApi.Destiny2.getManifestProgressionDisplayUnitsName(hash);
}

async function GetCharacterProgressions(options)
{
    let resp = "";
    try
    {
        resp = await BungieApi.Destiny2.getProfile(
            options.membershipId, options.mType, options.components);
    } 
    catch (e)
    {
        console.log(`${e}`);
        return [false, "Character Privacy/Authorize Error"];
    } 

    return [true, resp];
}

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
                fields: [],
            }
        };

        let user_key = message.author;
        
        if (message.mentions.members.size === 1)
        {
            user_key = message.mentions.members.first().user;
        }

        return console.log(`not quite implemented yet, early return to avoid badness`);

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
        let character_keys = discord_destiny_profile.characters.split(",");
        let character_id = character_keys[0];

        let options = {
            membershipId: destiny_membership_id,
            mType: membership_type,
            components: ["CHARACTERPROGRESSIONS"],
        }

        let [valid, char_progression_response] = await GetCharacterProgressions(options);
        if (!valid)
        {
            info_message.embed.description = `${char_progression_response}`;
            info_message.embed.color = ColorCode.RED;
            message.channel.send(info_message);
            return;
        }

        let progressions_keys = char_progression_response.Response.characterProgressions.data[character_id].progressions;
        
        for (var key in progressions_keys)
        {
            let progression_name = GetProgressionName(key);
            let current_rank = 0;

            if (progression_name.displayUnitsName === "Glory Rank Points")
            {
                current_rank = char_progression_response.Response.characterProgressions.data[character_id].progressions[key].currentProgress;
                info_message.embed.fields.push({ name: `${progression_name.displayUnitsName}`, value: `${current_rank}` });
            }
            else if (progression_name.displayUnitsName === "Valor Rank Points")
            {
                current_rank = char_progression_response.Response.characterProgressions.data[character_id].progressions[key].currentProgress;
                info_message.embed.fields.push({ name: `${progression_name.displayUnitsName}`, value: `${current_rank}` });
            }
            else if (progression_name.displayUnitsName === "Infamy Rank Points")
            {
                current_rank = char_progression_response.Response.characterProgressions.data[character_id].progressions[key].currentProgress;
                info_message.embed.fields.push({ name: `${progression_name.displayUnitsName}`, value: `${current_rank}` });
            }
        }

        message.channel.send(info_message);
        return;
    },
};