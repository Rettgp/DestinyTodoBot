import { BungieApi } from "../bungieapi/BungieApi"
import ColorCode from '../Color';

function GetProgressionPvp(hash)
{
    return BungieApi.Destiny2.getManifestProgressionDisplayProperties(hash);
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

function GetGloryRank(level)
{
    return BungieApi.Destiny2.getGloryRank(level);
}

function GetValorRank(level)
{
    return BungieApi.Destiny2.getValorRank(level);
}

function GetInfamyRank(level)
{
    return BungieApi.Destiny2.getInfamyRank(level);
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
        let server_id = message.guild.id;
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
        let character_keys = discord_destiny_profile.characters.split(",");
        let character_id = character_keys[0];

        let progression_hash_values = {
            glory: 2679551909,
            valor: 3882308435,
            infamy: 2772425241,
        };

        // Get Character Progression
        let progression_options = {
            membershipId: destiny_membership_id,
            mType: membership_type,
            components: ["CHARACTERPROGRESSIONS"],
        }
        let [progression_valid, char_progression_response] = await GetCharacterProgressions(progression_options);
        if (!progression_valid)
        {
            info_message.embed.description = `${char_progression_response}`;
            info_message.embed.color = ColorCode.RED;
            message.channel.send(info_message);
            return;
        }

        // Get Competitive Stats
        let comp_stat_options = {
            membershipId: destiny_membership_id,
            mType: membership_type,
            characterId: 0,
            modes: BungieApi.Destiny2.Enums.destinyActivityModeType.PVPCOMPETITIVE,
        }
        let [comp_valid, comp_stat_response] = await GetHistoricalAccountStats(comp_stat_options);
        if (!comp_valid)
        {
            info_message.embed.description = `${comp_stat_response}`;
            info_message.embed.color = ColorCode.RED;
            message.channel.send(info_message);
            return;
        }
        let comp_progression_display_properties = GetProgressionPvp(progression_hash_values.glory);
        let comp_data = {
            name: `Glory Rank`,
            rank: 0,
            score: char_progression_response.Response.characterProgressions.data[character_id].progressions[progression_hash_values.glory].currentProgress,
            icon_url: `https://www.bungie.net${comp_progression_display_properties.icon}`,
            kd: comp_stat_response.Response.pvpCompetitive.allTime[`killsDeathsRatio`].basic.displayValue,
            efficiency: comp_stat_response.Response.pvpCompetitive.allTime[`efficiency`].basic.displayValue, //(kill + assist) / death
        };
        comp_data.rank = GetGloryRank(comp_data.score);
        info_message = GetUpdatedInfoMessage(comp_data);
        message.channel.send(info_message);

        // Get Quickplay Stats
        let quickplay_stat_options = {
            membershipId: destiny_membership_id,
            mType: membership_type,
            characterId: 0,
            modes: BungieApi.Destiny2.Enums.destinyActivityModeType.PVPQUICKPLAY,
        }
        let [quickplay_valid, quickplay_stat_response] = await GetHistoricalAccountStats(quickplay_stat_options);
        if (!quickplay_valid)
        {
            info_message.embed.description = `${quickplay_stat_response}`;
            info_message.embed.color = ColorCode.RED;
            message.channel.send(info_message);
            return;
        }
        let qp_progression_display_properties = GetProgressionPvp(progression_hash_values.valor);
        let qp_data = {
            name: `Valor Rank`,
            rank: 0,
            score: char_progression_response.Response.characterProgressions.data[character_id].progressions[progression_hash_values.valor].currentProgress,
            icon_url: `https://www.bungie.net${qp_progression_display_properties.icon}`,
            kd: quickplay_stat_response.Response.pvpQuickplay.allTime[`killsDeathsRatio`].basic.displayValue,
            efficiency: quickplay_stat_response.Response.pvpQuickplay.allTime[`efficiency`].basic.displayValue, //(kill + assist) / death
        };
        qp_data.rank = GetValorRank(qp_data.score);
        info_message = GetUpdatedInfoMessage(qp_data);
        message.channel.send(info_message);

        // Get Gambit Stats
        let gambit_stat_options = {
            membershipId: destiny_membership_id,
            mType: membership_type,
            characterId: 0,
            modes: BungieApi.Destiny2.Enums.destinyActivityModeType.GAMBIT,
        }
        let [gambit_valid, gambit_stat_response] = await GetHistoricalAccountStats(gambit_stat_options);
        if (!gambit_valid)
        {
            info_message.embed.description = `${gambit_stat_response}`;
            info_message.embed.color = ColorCode.RED;
            message.channel.send(info_message);
            return;
        }
        let gambit_progression_display_properties = GetProgressionPvp(progression_hash_values.infamy);
        let gambit_data = {
            name: `Infamy Rank`,
            rank: 0,
            score: char_progression_response.Response.characterProgressions.data[character_id].progressions[progression_hash_values.infamy].currentProgress,
            icon_url: `https://www.bungie.net${gambit_progression_display_properties.icon}`,
            kd: gambit_stat_response.Response.pvecomp_gambit.allTime[`killsDeathsRatio`].basic.displayValue,
            efficiency: gambit_stat_response.Response.pvecomp_gambit.allTime[`efficiency`].basic.displayValue, //(kill + assist) / death
        };
        gambit_data.rank = GetInfamyRank(gambit_data.score);
        info_message = GetUpdatedInfoMessage(gambit_data);
        message.channel.send(info_message);

        return;
    },
};