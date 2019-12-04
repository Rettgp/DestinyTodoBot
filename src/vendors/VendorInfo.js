import { BungieApi } from "bungieapi/BungieApi"
import { OAuth } from "membership/oAuth"
let ASSERT = require("assert");

// the maximum amount of time the vendor data 
// is allowed to be stale (ms) 10 minutes
const MAX_VENDOR_STALENESS = 10 * 60 * 1000;

let s_vendor_sales = new Map();
let s_vendors = new Map();

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
        this.vendors = [];
    }

    async RequestVendors()
    { 
        let stored_vendors = s_vendors.get(this.char_options.characterId);
        let should_request = (stored_vendors === undefined) ||
            (Date.now() - stored_vendors.last_updated) >= MAX_VENDOR_STALENESS
        this.char_options.components = [
                BungieApi.Destiny2.Enums.destinyComponentType.VENDORS
        ];
        
        if (should_request)
        {
            let resp = "";
            try
            {
                let oAuth = new OAuth();
                let oauth_code = await oAuth.Get(this.char_options.membershipId);
                resp = await BungieApi.Destiny2.getVendors(this.char_options, oauth_code);
            } 
            catch (e)
            {
                this.valid = false;
                this.execption_message = e.Message;
                return [false, e.Message];
            } 

            this.vendors = resp.Response.vendors;
            s_vendors.set(this.char_options.characterId, {
                value: resp.Response.vendor,
                last_updated: Date.now()
            });
        }
        else
        {
            this.vendors = stored_vendors.value;
        }

        return [true, "Success"];
    }

    async RequestSales(vendorHash)
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
                let oAuth = new OAuth();
                let oauth_code = await oAuth.Get(this.char_options.membershipId);
                resp = await BungieApi.Destiny2.getVendor(this.char_options, oauth_code);
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

    FindVendorHash(vendor_name)
    {
        console.log(`attempting to find vendor_hash from vendor_name: ${vendor_name}`);
        //console.log(`this.vendors.data: ${JSON.stringify(this.vendors.data)}`);
        for (let vendor in this.vendors.data)
        {
            if (vendor === undefined)
            {
                return 0;
            }

            let name = BungieApi.Destiny2.getManifestVendorName(vendor).toUpperCase();
            if (vendor_name === name)
            {
                console.log(`chosen_vendor: ${vendor} .chosen_vendor_name: ${name}`);
                return vendor;
            }
        }
        return 0;
    }

    GetVendorInfo(vendor_hash)
    {
        let vendor_display_properties = BungieApi.Destiny2.getManifestVendorDisplayProperties(vendor_hash);
        let vendor = {
            name: vendor_display_properties.name,
            subtitle: vendor_display_properties.subtitle,
            large_icon: `${BungieApi.Destiny2.Endpoints.rootrootPath}${vendor_display_properties.largeIcon}`,
            thumbnail: `${BungieApi.Destiny2.Endpoints.rootrootPath}${vendor_display_properties.mapIcon}`,
            footer_icon: `${BungieApi.Destiny2.Endpoints.rootrootPath}${vendor_display_properties.smallTransparentIcon}`,
        };
        return vendor;
    }

    GetVendorSaleItems()
    {
        let items = [];
        let sale_items = this.vendor_sales.data;
        for (let vendorItemIndex in sale_items)
        {
            let item_object = sale_items[vendorItemIndex];
            let item_costs = sale_items[vendorItemIndex].costs;
            let cost_name = "";
            let cost_icon = "";
            let cost_quantity = "";

            if (item_costs.length > 0)
            {
                cost_name = BungieApi.Destiny2.getManifestItemName(item_costs[0].itemHash);
                cost_icon = BungieApi.Destiny2.getManifestItemIcon(item_costs[0].itemHash);
                cost_quantity = item_costs[0].quantity;
            }

            let sale_item = {
                vendor_item_index: item_object.vendorItemIndex,
                item_name: BungieApi.Destiny2.getManifestItemName(item_object.itemHash),
                item_icon: BungieApi.Destiny2.getManifestItemIcon(item_object.itemHash),
                item_quantity: item_object.quantity,
                cost_item_name: cost_name,
                cost_item_icon: cost_icon,
                cost_item_quantity: cost_quantity,
            };
            items.push(sale_item);
        }
        return items;
    }
}