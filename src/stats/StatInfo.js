import { BungieApi } from "bungieapi/BungieApi"
let ASSERT = require("assert");

// the maximum amount of time the character data 
// is allowed to be stale (ms) 10 minutes
const MAX_STAT_STALENESS = 10 * 60 * 1000;

let s_stats = new Map();

export class Stats
{
    constructor(char_id, membership_type, membership_id)
    {
        this.char_options = {
            characterId: char_id,
            membershipId: membership_id,
            mType: membership_type,
            modes: []
        }
        this.valid = false;
        this.execption_message = "";
    }

    async Request()
    {
        // Im using membershipId as the key because this request uses 
        // 0 as the character key to get global data.
        let stored_stats = s_stats.get(this.char_options.membershipId);
        let should_request = (stored_stats === undefined) ||
            (Date.now() - stored_stats.last_updated) >= MAX_STAT_STALENESS

        this.char_options.modes = [
            BungieApi.Destiny2.Enums.destinyActivityModeType.PVPCOMPETITIVE,
            BungieApi.Destiny2.Enums.destinyActivityModeType.PVPQUICKPLAY,
            BungieApi.Destiny2.Enums.destinyActivityModeType.GAMBIT
        ];

        if (should_request)
        {
            let resp = "";
            try
            {
                resp = await BungieApi.Destiny2.getHistoricalStats(this.char_options);
            } 
            catch (e)
            {
                this.valid = false;
                this.execption_message = e.Message;
                console.log(e);
                return [false, e.Message];
            } 

            this.stat_resp = resp.Response;
            s_stats.set(this.char_options.membershipId, {
                value: resp.Response,
                last_updated: Date.now()
            });
        }
        else
        {
            this.stat_resp = stored_stats.value;
        }

        this.valid = true;
        return [true, "Success"];
    }

    GetHistoricalAccountStats()
    {
        let stat_info = {
            comp_kd: this.stat_resp.pvpCompetitive.allTime[`killsDeathsRatio`].basic.displayValue,
            comp_efficiency: this.stat_resp.pvpCompetitive.allTime[`efficiency`].basic.displayValue, //(kill + assist) / death
            qp_kd: this.stat_resp.pvpQuickplay.allTime[`killsDeathsRatio`].basic.displayValue,
            qp_efficiency: this.stat_resp.pvpQuickplay.allTime[`efficiency`].basic.displayValue, //(kill + assist) / death
            gambit_kd: this.stat_resp.pvecomp_gambit.allTime[`killsDeathsRatio`].basic.displayValue,
            gambit_efficiency: this.stat_resp.pvecomp_gambit.allTime[`efficiency`].basic.displayValue, //(kill + assist) / death
        }

        return stat_info;
    }
}