import ColorCode from '../utility/Color.js';
import { Vendors } from '../vendors/VendorInfo.js';

module.exports = {
    name: 'vendor',
    description: 'Gets the current vendor items',
    async execute(message, args, keyv)
    {
        let server_id = message.guild.id;
        const vendor_message = {
            embed: {
                title: "",
                description: "",
                color: ColorCode.DEFAULT,
                thumbnail: "",
                footer: {
                    icon_url: "",
                    text: new Date(Date.now()),
                },
                image: {
                    url: "",
                },
                fields: [],
            }
        };

        if (args.length < 1)
        {
            console.log(`no vendor specified`);
            return;
        }

        if (args.length !== 1)
        {
            console.log(`arguments length incorrect`);
            return;
        }

        let user_key = message.author;
        if (message.mentions.members.size === 1)
        {
            user_key = message.mentions.members.first().user;
        }
        let discord_destiny_profile_json = await keyv.get(server_id + "-" + user_key.id);
        if (discord_destiny_profile_json === undefined)
        {
            vendor_message.embed.description = `${user_key.username} has not authorized me yet :(`
            vendor_message.embed.color = ColorCode.RED;
            message.channel.send(vendor_message);
            return;
        }
        let discord_destiny_profile = JSON.parse(discord_destiny_profile_json);
        let destiny_membership_id = discord_destiny_profile.destiny_membership_id;
        let membership_type = discord_destiny_profile.membership_type;
        let character_keys = discord_destiny_profile.characters.split(",");
        let character_id = character_keys[0]; // TODO: Might be nice to get latest character at some point

        // let available_vendors = {
        //     SPIDER: 863940356,
        //     XUR: 2190858386,
        // }; 
        let vendor = new Vendors(character_id, membership_type, destiny_membership_id);
        let [vendor_valid, vendor_result] = await vendor.RequestVendors();
        if (!vendor_valid)
        {
            console.log(`vendor_valid: ${vendor_sales_valid} .vendor_result: ${vendor_sales_result}`);
            return " " + vendor_result;
        }

        let vendor_user_input = args[0].toUpperCase();
        let vendor_hash = vendor.FindVendorHash(vendor_user_input);
        if (vendor_hash === 0)
        {
            console.log(`unable to find vendor hash`);
            return;
        }

        let vendor_data = vendor.GetVendorInfo(vendor_hash);
        vendor_message.embed.title = vendor_data.name;
        vendor_message.embed.description = vendor_data.subtitle;
        vendor_message.embed.image = vendor_data.large_icon;
        vendor_message.embed.thumbnail = vendor_data.thumbnail;
        vendor_message.embed.footer.icon_url = vendor_data.footer_icon;

        let [vendor_sales_valid, vendor_sales_result] = await vendor.RequestSales(vendor_hash);
        if (!vendor_sales_valid)
        {
            console.log(`vendor_sales_valid: ${vendor_sales_valid} .vendor_sales_result: ${vendor_sales_result}`);
            return " " + vendor_sales_result;
        }
        let vendor_sale_items = vendor.GetVendorSaleItems();
        for (let item in vendor_sale_items)
        {
            vendor_message.embed.fields.push({
                name: `${item.item_quantity} ${item.item_name}`, 
                value: `Cost: ${item.cost_item_quantity} ${item.cost_item_name}`, inline: `true`
            });
        }
        message.channel.send(vendor_message);

        return;
    },
};