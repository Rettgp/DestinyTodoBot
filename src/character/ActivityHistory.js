import { BungieApi } from "../bungieapi/BungieApi"
import { Character } from "./CharacterInfo.js"

function GetCharacterInfo(resp)
{
    let class_text = 
        BungieApi.Destiny2.getManifestClassName(resp.Response.character.data.classHash);
    return class_text;
}

async function RequestCharacter(options)
{
    let resp = "";
    try
    {
        resp = await BungieApi.Destiny2.getCharacter(options);
    } 
    catch (e)
    {
        return [false, "Character Privacy/Authorize Error"];
    } 

    return [true, resp];
}

async function RequestActivityHistory(options)
{
    let resp = "";
    try
    {
        resp = await BungieApi.Destiny2.getActivityHistory(options);
    } 
    catch (e)
    {
        return [false, "Activity Privacy/Authorize Error"];
    } 

    return [true, resp];
}


export default class ActivityHistory
{
    constructor(complete_emoji, incomplete_emoji)
    {
        this.complete = `<:${complete_emoji.name}:${complete_emoji.id}>`;
        this.incomplete = `<:${incomplete_emoji.name}:${incomplete_emoji.id}>`;
    }

    async History(destiny_membership_id, membership_type, character_id, activity_string, activity_mode)
    {
        let character = new Character(character_id, membership_type, destiny_membership_id);

        let [valid, char_result] = await character.Request();
        if (!valid)
        {
            return " " + char_result;
        }

        let [activity_valid, history_result] = await character.RequestActivityHistory();
        if (!activity_valid)
        {
            return " " + history_result;
        }

        let activities = character.ActivityHistory();

        if (activities === undefined)
        {
            return " ";
        }

        let now = new Date();
        let completed = this.incomplete;
        for (let i = 0; i < activities.length; ++i)
        {
            let activity = activities[i];
            let activity_name = BungieApi.Destiny2.getManifestActivityName(activity.activityDetails.directorActivityHash);
            if (activity_name === activity_string)
            {
                let date_last_played = Date.parse(activity.period);
                let days_into_weekly_reset = now.getDay() - 2; // days since last tuesday
                if (days_into_weekly_reset < 0) // Current time is on sunday or monday
                {
                    days_into_weekly_reset += 5; 
                }
                let last_tuesday = Date.parse(new Date(now.getFullYear(), now.getMonth(), now.getDate() - days_into_weekly_reset, 9));

                if (date_last_played > last_tuesday)
                {
                    completed = this.complete;
                }
            }
        }
        return character.Class() + completed;
    }
}