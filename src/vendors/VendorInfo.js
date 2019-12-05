import { BungieApi } from "bungieapi/BungieApi"
import { OAuth } from "membership/oAuth"
var StringSimilarity = require('string-similarity');
let ASSERT = require("assert");

// the maximum amount of time the vendor data 
// is allowed to be stale (ms) 10 minutes
const MAX_VENDOR_STALENESS = 10 * 60 * 1000;

let s_vendors = new Map();

export class Vendors
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
        this.vendors = [];
    }

    async Request()
    { 
        let stored_vendors = s_vendors.get(this.char_options.characterId);
        let should_request = (stored_vendors === undefined) ||
            (Date.now() - stored_vendors.last_updated) >= MAX_VENDOR_STALENESS
        this.char_options.components = [
                BungieApi.Destiny2.Enums.destinyComponentType.VENDORS,
                BungieApi.Destiny2.Enums.destinyComponentType.VENDORSALES
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

            this.vendors = resp.Response;
            s_vendors.set(this.char_options.characterId, {
                value: resp.Response,
                last_updated: Date.now()
            });
        }
        else
        {
            this.vendors = stored_vendors.value;
        }

        return [true, "Success"];
    }

    FindVendorHash(vendor_name)
    {
        let best_rating = 0.5;
        for (let vendor of Object.keys(this.vendors.vendors.data))
        {
            if (vendor === undefined)
            {
                return 0;
            }

            let name = BungieApi.Destiny2.getManifestVendorName(vendor).toUpperCase();
            let rating = StringSimilarity.compareTwoStrings(vendor_name, name);
            if (rating >= best_rating)
            {
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
            footer_text: Date.parse(this.vendors.vendors.data[vendor_hash].nextRefreshDate),
        };
        return vendor;
    }

    GetVendorSaleItems(vendor_hash)
    {
        let items = [];
        let sale_items = this.vendors.sales.data[vendor_hash].saleItems;
        for (var item_object of Object.values(sale_items))
        {
            let item_costs = item_object.costs;
            let item_costs_converted = [];

            for (var c_item of Object.values(item_costs))
            {
                let c_object = {
                    name: BungieApi.Destiny2.getManifestItemName(c_item.itemHash),
                    icon: BungieApi.Destiny2.getManifestItemIcon(c_item.itemHash),
                    item_type: BungieApi.Destiny2.getManifestItemType(c_item.itemHash),
                    item_type_display_name: BungieApi.Destiny2.getManifestItemTypeDisplayName(c_item.itemHash),
                    quantity: c_item.quantity,
                };
                item_costs_converted.push(c_object);
            }

            let sale_item = {
                vendor_item_index: item_object.vendorItemIndex,
                item_name: BungieApi.Destiny2.getManifestItemName(item_object.itemHash),
                item_icon: BungieApi.Destiny2.getManifestItemIcon(item_object.itemHash),
                item_type: BungieApi.Destiny2.getManifestItemType(item_object.itemHash),
                item_type_display_name: BungieApi.Destiny2.getManifestItemTypeDisplayName(item_object.itemHash),
                item_quantity: item_object.quantity,
                item_costs: item_costs_converted,
            };
            items.push(sale_item);
        }
        return items;
    }
}