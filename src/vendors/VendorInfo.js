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
                resp = await BungieApi.Destiny2.getVendor(this.char_options);
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