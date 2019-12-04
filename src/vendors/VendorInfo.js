import { BungieApi } from "../bungieapi/BungieApi"
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
    { let stored_vendors = s_vendors.get(this.char_options.characterId);
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
                resp = await BungieApi.Destiny2.getVendors(this.char_options);
            } 
            catch (e)
            {
                this.valid = false;
                this.execption_message = e.Message;
                return [false, e.Message];
            } 

            this.vendors = resp.Response.vendor;
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
                resp = await BungieApi.Destiny2.getVendor(this.char_options);
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
        for (let vendor in this.vendors)
        {
            let vendor_hash = vendor.data.vendorHash;
            let name = BungieApi.Destiny2.getManifestVendorName(vendor_hash).toUpperCase();
            if (vendor_name === name)
            {
                return vendor_hash;
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
        let sale_items = this.vendor_sales.data.saleItems;
        for (let item in sale_items)
        {
            let sale_item = {
                vendor_item_index: item.vendorItemIndex,
                item_name: BungieApi.Destiny2.getManifestItemName(item.itemHash),
                item_icon: BungieApi.Destiny2.getManifestItemIcon(item.itemHash),
                item_quantity: item.quantity,
                cost_item_name: BungieApi.Destiny2.getManifestItemName(item.costs[0].itemHash),
                cost_item_icon: BungieApi.Destiny2.getManifestItemIcon(item.costs[0].itemHash),
                cost_item_quantity: item.cost[0].quantity,
            };
            items.push(sale_item);
        }
        return items;
    }
}