import { BungieApi } from "../bungieapi/BungieApi"

export class Perk
{
    constructor(hash, enabled, visible)
    {
        this.hash = hash;
        this.name = "";
        this.icon = "";
        let socket_info = BungieApi.Destiny2.getPerkNameAndIcon(this.hash);
        if (socket_info != null)
        {
            this.name = socket_info.name;
            this.icon = socket_info.icon;
        }

        this.is_enabled = enabled;
        this.is_visible = visible;
    }

    Icon()
    {
        return this.icon;
    }

    DisplayName()
    {
        return this.name;
    }

    Enabled()
    {
        return this.is_enabled;
    }

    Visible()
    {
        return this.is_visible;
    }
}