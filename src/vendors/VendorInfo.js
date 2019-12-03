import ColorCode from '../utility/Color.js';

let available_vendors = {
    SPIDER: 863940356,
    XUR: 2190858386,
};   

export default class Vendor
{
    constructor(message, vendor_name)
    {
        this.vendor_name = vendor_name;
        this.message = message;
    }

    VendorNone()
    {
        const info_message = {
            embed: {
                title: "",
                description: "",
                color: ColorCode.DEFAULT,
            }
        };
        
        info_message.embed.title = `Available Vendor Queries:`
        for (let vendor in available_vendors)
        {
            info_message.embed.description += `${vendor}\n`;
        }
        info_message.embed.color = ColorCode.DARK_RED;
        this.message.channel.send(info_message);
    }

    VendorQuery()
    {
        console.log(`query for ${this.vendor_name}`);
    }
}