import { BungieApi } from "./bungieapi/BungieApi"

function GetCharacterInfo(resp)
{
    let class_text = 
        BungieApi.Destiny2.getManifestClassName(resp.Response.character.data.classHash);
    return class_text;
}

export default class ActivityHistory
{
    constructor()
    {
    }

    async History(destiny_membership_id, membership_type, character_id, activity_string)
    {
        let options = {
            page: 0,
            mode: await BungieApi.Destiny2.findActivityMode(activity_string),
            count: 1,
            characterId: character_id,
            destinyMembershipId: destiny_membership_id,
            membershipType: membership_type
        }
        let history_resp = await BungieApi.Destiny2.getActivityHistory(options);

        // TODO (Garrett): Remove this later. I kept it in for debugging reasons until this becomes more fleshed out
        console.log(history_resp);

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

        //TODO (Garrett): Maybe filter activities for this week
        //TODO (Garrett): Only show completed activities
        //TODO (Garrett): Be smarter on the activity type and what we display. (i.e you cant complete a PVP match so what do you show?)
        let activity_name = BungieApi.Destiny2.getManifestActivityName(history_resp.Response.activities[0].activityDetails.directorActivityHash);
        return char_class + " " + activity_name + "✅";
    }
}