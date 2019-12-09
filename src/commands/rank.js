import { Character } from "character/CharacterInfo.js"
import { Membership } from "membership/MembershipManager.js";
import { Stats } from "stats/StatInfo.js";
import ColorCode from 'utility/Color';

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

        // Get Character Progression
        let character = new Character(character_id, destiny_membership.type, destiny_membership.id);
        let [valid, char_result] = await character.Request();
        if (!valid)
        {
            return " " + char_result;
        }

        let stats = new Stats(character_id, destiny_membership.type, destiny_membership.id);
        let [stats_valid, stats_result] = await stats.Request();
        if (!stats_valid)
        {
            return " " + stats_result;
        }
        
        message.channel.send(`**Rank Stats: ${destiny_membership.username}**`);
        // Get Stats
        let stat_info = stats.GetHistoricalAccountStats();
        let progression_hash_values = {
            glory_simple: 2679551909, // simple rank
            glory_detailed: 2000925172, // detailed rank
            valor_simple: 3882308435, // simple rank
            valor_detailed: 2626549951, // detailed rank
            infamy: 2772425241,
        };
        
        // Get Competitive Stats
        let progression_glory = character.CharacterProgressions(progression_hash_values.glory_detailed);
        let comp_data = {
            name: progression_glory.name,
            rank: progression_glory.rank,
            score: progression_glory.score,
            icon_url: progression_glory.icon,
            kd: stat_info.comp_kd,
            efficiency: stat_info.comp_efficiency, //(kill + assist) / death
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
            kd: stat_info.qp_kd,
            efficiency: stat_info.qp_efficiency, //(kill + assist) / death
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
            kd: stat_info.gambit_kd,
            efficiency: stat_info.gambit_efficiency, //(kill + assist) / death
        };
        info_message = GetUpdatedInfoMessage(gambit_data);
        message.channel.send(info_message);

        return;
    },
};