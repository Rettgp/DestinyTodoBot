import { BungieApi } from "../bungieapi/BungieApi"
import { EquippableItem } from "./Item.js"
let ASSERT = require("assert");

export default class Character
{
    constructor(char_id, membership_type, membership_id, components = ["CHARACTERS"])
    {
        this.char_options = {
            characterId: char_id,
            membershipId: membership_id,
            mType: membership_type,
            components: components
        }
        this.char_resp = "";
        this.valid = false;
    }

    async Request()
    {
        let resp = "";
        try
        {
            resp = await BungieApi.Destiny2.getCharacter(this.char_options);
        } 
        catch (e)
        {
            console.log(e);
            this.valid = false;
            return [false, "Character Privacy/Authorize Error"];
        } 

        this.char_resp = resp.Response;
        this.class_name = 
            BungieApi.Destiny2.getManifestClassName(this.char_resp.character.data.classHash);
        this.power = this.char_resp.character.data.light;
        this.last_played = Date.parse(this.char_resp.character.data.dateLastPlayed);
        this.valid = true;
        return [true, "Success"];
    }

    Valid()
    {
        return this.valid;
    }

    LastPlayed()
    {
        return Date.parse(this.last_played);
    }

    Power()
    {
        return this.power;
    }

    Class()
    {
        return this.class_name;
    }

    Loadout()
    {
        ASSERT(this.char_options.components.includes("CHARACTEREQUIPMENT"))
        ASSERT(this.char_options.components.includes("ITEMINSTANCES"))
        ASSERT(this.char_options.components.includes("ITEMSOCKETS"))
        ASSERT(this.char_options.components.includes("ITEMPERKS"))

        // TODO: Probably more robust to return an object mapping equipment slots to data
        // rather than an array
        let loadout = [];
        let equipment_items = this.char_resp.equipment.data.items;
        let item_components = this.char_resp.itemComponents.instances.data;
        let item_sockets = this.char_resp.itemComponents.sockets.data;
        
        for (let i = 0; i < equipment_items.length; ++i)
        {
            if (i >= 3)
            {
                // ONLY GET PRIMARY,ENERGY,HEAVY
                break;
            }

            let instance_id = equipment_items[i].itemInstanceId;
            let power = item_components[heavy_instance_id].primaryStat.value;
            let sockets = item_sockets[heavy_instance_id].sockets;
            let weapon = new EquippableItem(
                equipment_items[i].itemHash, power, instance_id, sockets );
            loadout.push(weapon);
        }


        return loadout;
    }
}