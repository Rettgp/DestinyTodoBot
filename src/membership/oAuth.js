import { BungieApi } from "bungieapi/BungieApi"

let s_oauths = new Map();

export class OAuth
{
    constructor()
    {
    }

    Set(destiny_membership_id, oAuth)
    {
        let oauth_val = {
            oAuth: oAuth,
            expired_time: (Date.now() + (oAuth.expires_in * 1000)),
            refresh_expired_time: (Date.now() + (oAuth.refresh_expires_in * 1000)),
        }
        s_oauths.set(destiny_membership_id, oauth_val);
    }

    async Get(destiny_membership_id)
    {
        let oauth_val = s_oauths.get(destiny_membership_id);
        if (oauth_val === undefined || (oauth_val.expired_time < Date.now()))
        {
            if (oauth_val === undefined || oauth_val.refresh_expired_time < Date.now())
            {
                console.log("oAuth is expired and refresh is expired");
                return null;
            }
            else
            {
                BungieApi.refreshAccessToken(oauth_val.oAuth).then(oAuth =>
                {
                    oauth_val.oAuth = oAuth;
                    s_oauths.set(destiny_membership_id, oauth_val);
                    return oauth_val.oAuth;
                });
            }
        }

        return oauth_val.oAuth;
    }
}