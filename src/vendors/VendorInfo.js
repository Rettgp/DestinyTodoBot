import { BungieApi } from "../bungieapi/BungieApi"
let ASSERT = require("assert");

// the maximum amount of time the vendor data 
// is allowed to be stale (ms) 10 minutes
const MAX_VENDOR_STALENESS = 10 * 60 * 1000;

let s_vendor_sales = new Map();

export class Vendors
{
    constructor(char_id, membership_type, membership_id)
    {
        this.char_options = {
            characterId: char_id,
            membershipId: membership_id,
            mType: membership_type,
            vendorHash: 0,
            components: []
        }
        this.valid = false;
        this.execption_message = "";
        this.vendor_sales = [];
    }

    async Request(vendorHash)
    {
        let stored_vendor_sales = s_vendor_sales.get(this.char_options.characterId);
        let should_request = (stored_vendor_sales === undefined) ||
            (Date.now() - stored_vendor_sales.last_updated) >= MAX_VENDOR_STALENESS
        this.char_options.vendorHash = vendorHash;
        this.char_options.components = [
                BungieApi.Destiny2.Enums.destinyComponentType.VENDORSALES
        ];
        
        if (should_request)
        {
            let resp = "";
            try
            {
                resp = await BungieApi.Destiny2.getVendors(this.char_options);
                console.log(`response: ${resp}`);
            } 
            catch (e)
            {
                this.valid = false;
                this.execption_message = e.Message;
                return [false, e.Message];
            } 

            this.vendor_sales = resp.Response.sales;
            s_vendor_sales.set(this.char_options.characterId, {
                value: resp.Response.sales,
                last_updated: Date.now()
            });
        }
        else
        {
            this.vendor_sales = stored_vendor_sales.value;
        }

        return [true, "Success"];
    }

    VendorSales()
    {
        return this.vendor_sales;
    }
}