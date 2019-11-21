import { BungieApi } from "./bungieapi/BungieApi"
import { EquippableItem } from "./Item.js"
let ASSERT = require("assert");

// the maximum amount of time the character data 
// is allowed to be stale (ms) 10 minutes
const MAX_CHARACTER_STALENESS = 10 * 60 * 1000;
// the maximum amount of time the activity data 
// is allowed to be stale (ms) 10 minutes
const MAX_ACTIVITY_STALENESS = 10 * 60 * 1000;

let s_characters = new Map();
let s_activities = new Map();

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
        this.valid = false;
        this.execption_message = "";
        this.progressions = undefined;
        this.activities = [];
    }

    async Request()
    {
        let stored_character = s_characters.get(this.char_options.characterId);
        let should_request = (stored_character === undefined) ||
            (Date.now() - stored_character.last_updated) >= MAX_CHARACTER_STALENESS

        this.char_options.components = [
            BungieApi.Destiny2.Enums.destinyComponentType.CHARACTERS,
            BungieApi.Destiny2.Enums.destinyComponentType.CHARACTERPROGRESSIONS,
            BungieApi.Destiny2.Enums.destinyComponentType.CHARACTEREQUIPMENT,
            BungieApi.Destiny2.Enums.destinyComponentType.ITEMINSTANCES,
            BungieApi.Destiny2.Enums.destinyComponentType.ITEMSOCKETS,
            BungieApi.Destiny2.Enums.destinyComponentType.ITEMPERKS
        ];

        if (should_request)
        {
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
            s_characters.set(this.char_options.characterId, {
                value: resp.Response,
                last_updated: Date.now()
            });
        }
        else
        {
            this.char_resp = stored_character.value;
        }

        this.class_name = 
            BungieApi.Destiny2.getManifestClassName(this.char_resp.character.data.classHash);
        this.power = this.char_resp.character.data.light;
        this.last_played = Date.parse(this.char_resp.character.data.dateLastPlayed);

        this.valid = true;
        return [true, "Success"];
    }

    async RequestActivityHistory()
    {
        let stored_activities = s_activities.get(this.char_options.characterId);
        let should_request = (stored_activities === undefined) ||
            (Date.now() - stored_activities.last_updated) >= MAX_ACTIVITY_STALENESS
        let options = {
            page: 0,
            mode: "NONE",
            count: 100, //TODO (Garrett): Is this too small or too big?
            characterId: this.char_options.characterId,
            destinyMembershipId: this.char_options.membershipId,
            membershipType: this.char_options.mType
        }

        if (should_request)
        {
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
            s_activities.set(this.char_options.characterId, {
                value: resp.Response.activities,
                last_updated: Date.now()
            });
        }
        else
        {
            this.activities = stored_activities.value;
        }

        return [true, "Success"];
    }

    AllCharacterProgressions()
    {
        return this.char_resp.progressions;
    }

    CharacterProgressions(progression_hash)
    {
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