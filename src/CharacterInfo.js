import { BungieApi } from "./bungieapi/BungieApi"
import { EquippableItem } from "./Item.js"
let ASSERT = require("assert");

export class Character
{
    constructor(char_id, membership_type, membership_id)
    {
        this.char_options = {
            characterId: char_id,
            membershipId: membership_id,
            mType: membership_type,
            components: []
        }
        this.char_resp = "";
        this.valid = false;
        this.execption_message = "";
        this.progressions = undefined;
        this.activities = [];
    }

    async Request(components = ["CHARACTERS"])
    {
        this.char_options.components = components;

        let resp = "";
        try
        {
            resp = await BungieApi.Destiny2.getCharacter(this.char_options);
        } 
        catch (e)
        {
            this.valid = false;
            this.execption_message = e.Message;
            return [false, e.Message];
        } 

        this.char_resp = resp.Response;
        this.class_name = 
            BungieApi.Destiny2.getManifestClassName(this.char_resp.character.data.classHash);
        this.power = this.char_resp.character.data.light;
        this.last_played = Date.parse(this.char_resp.character.data.dateLastPlayed);

        this.valid = true;
        return [true, "Success"];
    }

    async RequestActivityHistory()
    {
        let options = {
            page: 0,
            mode: "NONE",
            count: 100, //TODO (Garrett): Is this too small or too big?
            characterId: this.char_options.characterId,
            destinyMembershipId: this.char_options.membershipId,
            membershipType: this.char_options.mType
        }
        let resp = "";
        try
        {
            resp = await BungieApi.Destiny2.getActivityHistory(options);
        } 
        catch (e)
        {
            this.valid = false;
            this.execption_message = e.Message;
            return [false, e.Message];
        } 

        this.activities = resp.Response.activities;
        return [true, "Success"];
    }

    AllCharacterProgressions()
    {
        ASSERT(this.char_options.components.includes(BungieApi.Destiny2.Enums.destinyComponentType.CHARACTERPROGRESSIONS));

        return this.char_resp.progressions;
    }

    CharacterProgressions(progression_hash)
    {
        ASSERT(this.char_options.components.includes(BungieApi.Destiny2.Enums.destinyComponentType.CHARACTERPROGRESSIONS));

        let steps = BungieApi.Destiny2.getManifestProgressionSteps(progression_hash);
        let step_index = this.char_resp.progressions.data.progressions[progression_hash].stepIndex;
        let progress = {
            name: BungieApi.Destiny2.getManifestProgressionDisplayProperties(progression_hash).name,
            score: this.char_resp.progressions.data.progressions[progression_hash].currentProgress,
            icon: `${BungieApi.Destiny2.Endpoints.rootrootPath}${steps[step_index].icon}`,
            rank: steps[step_index].stepName,
        };

        return progress;
    }

    ActivityHistory()
    {
        return this.activities;
    }

    ExceptionMessage()
    {
        return this.execption_message;
    }

    Valid()
    {
        return this.valid;
    }

    LastPlayed()
    {
        return this.last_played;
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
        ASSERT(this.Valid())
        ASSERT(this.char_options.components.includes(BungieApi.Destiny2.Enums.destinyComponentType.CHARACTEREQUIPMENT))
        ASSERT(this.char_options.components.includes(BungieApi.Destiny2.Enums.destinyComponentType.ITEMINSTANCES))
        ASSERT(this.char_options.components.includes(BungieApi.Destiny2.Enums.destinyComponentType.ITEMPERKS))
        ASSERT(this.char_options.components.includes(BungieApi.Destiny2.Enums.destinyComponentType.ITEMSOCKETS))

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
            let power = item_components[instance_id].primaryStat.value;
            let sockets = item_sockets[instance_id].sockets;
            let weapon = new EquippableItem(
                equipment_items[i].itemHash, power, instance_id, sockets );
            loadout.push(weapon);
        }


        return loadout;
    }
}