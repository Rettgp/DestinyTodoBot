import { BungieApi } from "bungieapi/BungieApi"
import { Character } from "character/CharacterInfo.js"
import { Membership } from "membership/MembershipManager.js";
import ColorCode from 'utility/Color';

async function GetHistoricalAccountStats(options)
{
    let resp = "";
    try
    {
        resp = await BungieApi.Destiny2.getHistoricalStats(options);
    } 
    catch (e)
    {
        console.log(`${e}`);
        return [false, "Character Privacy/Authorize Error"];
    } 

    return [true, resp];
}

function GetUpdatedInfoMessage(data)
{
    let info_message = {
        embed: {
            description: "",
            color: ColorCode.DEFAULT,
            fields: [],
            thumbnail: {
                url: "",
            }
        }
    };

    info_message.embed.thumbnail.url = data.icon_url;
    info_message.embed.fields.push({ name: `${data.name}: ${data.rank}`, value: `${data.score}` , inline: `false`});
    info_message.embed.fields.push({ name: `K/D`, value: `${data.kd}` , inline: `true`});
    info_message.embed.fields.push({ name: `KA/D`, value: `${data.efficiency}`, inline: `true` });

    return info_message;
}

module.exports = {
    name: 'rank',
    description: 'Displays user pvp ranks.',
    async execute(message, args, keyv)
    {
        let info_message = {
            embed: {
                description: "",
                color: ColorCode.DEFAULT,
                fields: [],
                thumbnail: {
                    url: "",
                }
            }
        };

        let membership = new Membership(message,keyv);
        let destiny_membership = await membership.GetMembershipOfMentionedUser();
        if (!membership.Valid())
        {
            return;
        }
        let character_id = destiny_membership.character_uids[0];

        message.channel.send(`**Rank Stats: ${destiny_membership.username}**`);

        let progression_hash_values = {
            glory_simple: 2679551909, // simple rank
            glory_detailed: 2000925172, // detailed rank
            valor_simple: 3882308435, // simple rank
            valor_detailed: 2626549951, // detailed rank
            infamy: 2772425241,
        };

        // Get Character Progression
        let character = new Character(character_id, destiny_membership.type, destiny_membership.id);

        let [valid, char_result] = await character.Request();
        if (!valid)
        {
            return " " + char_result;
        }

        // Get Stats
        let progression_glory = character.CharacterProgressions(progression_hash_values.glory_detailed);
        let stat_options = {
            membershipId: destiny_membership.id,
            mType: destiny_membership.type,
            characterId: 0,
            modes: [BungieApi.Destiny2.Enums.destinyActivityModeType.PVPCOMPETITIVE,
                BungieApi.Destiny2.Enums.destinyActivityModeType.PVPQUICKPLAY,
                BungieApi.Destiny2.Enums.destinyActivityModeType.GAMBIT]
        }
        let [stat_valid, stat_response] = await GetHistoricalAccountStats(stat_options);
        if (!stat_valid)
        {
            info_message.embed.description = `${stat_response}`;
            info_message.embed.color = ColorCode.RED;
            message.channel.send(info_message);
            return;
        }

        // Get Competitive Stats
        let comp_data = {
            name: progression_glory.name,
            rank: progression_glory.rank,
            score: progression_glory.score,
            icon_url: progression_glory.icon,
            kd: stat_response.Response.pvpCompetitive.allTime[`killsDeathsRatio`].basic.displayValue,
            efficiency: stat_response.Response.pvpCompetitive.allTime[`efficiency`].basic.displayValue, //(kill + assist) / death
        };
        info_message = GetUpdatedInfoMessage(comp_data);
        message.channel.send(info_message);

        // Get Quickplay Stats
        let progression_valor = character.CharacterProgressions(progression_hash_values.valor_detailed);
        let qp_data = {
            name: progression_valor.name,
            rank: progression_valor.rank,
            score: progression_valor.score,
            icon_url: progression_valor.icon,
            kd: stat_response.Response.pvpQuickplay.allTime[`killsDeathsRatio`].basic.displayValue,
            efficiency: stat_response.Response.pvpQuickplay.allTime[`efficiency`].basic.displayValue, //(kill + assist) / death
        };
        info_message = GetUpdatedInfoMessage(qp_data);
        message.channel.send(info_message);

        // Get Gambit Stats
        let progression_infamy = character.CharacterProgressions(progression_hash_values.infamy);
        let gambit_data = {
            name: progression_infamy.name,
            rank: progression_infamy.rank,
            score: progression_infamy.score,
            icon_url: progression_infamy.icon,
            kd: stat_response.Response.pvecomp_gambit.allTime[`killsDeathsRatio`].basic.displayValue,
            efficiency: stat_response.Response.pvecomp_gambit.allTime[`efficiency`].basic.displayValue, //(kill + assist) / death
        };
        info_message = GetUpdatedInfoMessage(gambit_data);
        message.channel.send(info_message);

        return;
    },
};