import { BungieApi } from "../bungieapi/BungieApi"
import { Perk } from "./Perk.js"

class Item
{
    constructor(hash)
    {
        this.hash = hash;
        this.display_name = BungieApi.Destiny2.getManifestItemName(this.hash);
        this.icon = BungieApi.Destiny2.Endpoints.rootrootPath + BungieApi.Destiny2.getManifestItemIcon(this.hash);
    }

    Icon()
    {
        return this.icon;
    }

    DisplayName()
    {
        return this.display_name;
    }
}

export class EquippableItem extends Item
{
    constructor(hash, power, instance_id, sockets = [])
    {
        super(hash);

        this.power = power;
        this.instance_id = instance_id;
        this.item_type = BungieApi.Destiny2.getManifestItemTypeDisplayName(this.hash);
        this.tier = BungieApi.Destiny2.getManifestItemTierName(this.hash);
        this.perks = [];

        for (let socket in sockets)
        {
            this.perks.push(new Perk(socket.plugHash, socket.isEnabled, socket.isVisible));
        }
    }

    Power()
    {
        return this.power;
    }

    InstanceId()
    {
        return this.instance_id;
    }

    ItemTypeDisplayName()
    {
        return this.item_type;
    }

    TierDisplayName()
    {
        return this.tier;
    }

    Perks()
    {
        return this.perks;
    }
}