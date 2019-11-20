import { BungieApi } from "./bungieapi/BungieApi"

export class Profile
{
    constructor(membership_type, membership_id)
    {
        this.options = {
            membershipId: membership_id,
            mType: membership_type
        };
        this.execption_message = "";
        this.profile_resp = "";
        this.components = [];
    }

    async Request(components)
    {
        this.components = components;
        let resp = "";
        try
        {
            resp = await BungieApi.Destiny2.getProfile(
                this.options.membershipId, this.options.mType, components);
        } 
        catch (e)
        {
            this.valid = false;
            this.execption_message = e.Message;
            return [false, e.Message];
        } 

        this.profile_resp = resp.Response;
        this.valid = true;
        return [true, "Success"];
    }
}
