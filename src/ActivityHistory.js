import { BungieApi } from "./bungieapi/BungieApi"

function GetCharacterInfo(resp)
{
    let class_text = 
        BungieApi.Destiny2.getManifestClassName(resp.Response.character.data.classHash);
    return class_text;
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
        if (activity_mode.length == 0 || activity_mode == 0)
        {
            return  "";
        }

        let options = {
            page: 0,
            mode: await BungieApi.Destiny2.findActivityMode(activity_mode),
            count: 10, //TODO (Garrett): Is this too small?
            characterId: character_id,
            destinyMembershipId: destiny_membership_id,
            membershipType: membership_type
        }

        let history_resp = await BungieApi.Destiny2.getActivityHistory(options);
        if (history_resp.Response.activities === undefined)
        {
            return "";
        }

        let char_options = {
            characterId: character_id,
            membershipId: destiny_membership_id,
            mType: membership_type,
            components: ["CHARACTERS"]
        }
        let char_response = await BungieApi.Destiny2.getCharacter(char_options);
        let char_class = GetCharacterInfo(char_response);

        let now = new Date();
        let completed = this.incomplete;
        for (let activity of history_resp.Response.activities)
        {
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
        return char_class + " " + completed;
    }
}