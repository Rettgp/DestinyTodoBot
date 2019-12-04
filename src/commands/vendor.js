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
        let character_id = character_keys[0];
        
        let vendor = new Vendors(character_id, membership_type, destiny_membership_id);

        let available_vendors = {
            SPIDER: 863940356,
            XUR: 2190858386,
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

        // This is testing code. I think i should be able to query to get all vendor 
        // hashes and string compare the user input to vendor name.
        let vendor_input = args[0].toUpperCase();
        let vendor_hash = 0;
        switch (vendor_input)
        {
            case "SPIDER":
                vendor_hash = available_vendors.SPIDER;
            break;
            case "XUR":
                vendor_hash = available_vendors.XUR;
            break; 
            default:
                console.log(`unknown vendor`);
                return;   
        }

        let [vendor_valid, vendor_result] = await vendor.Request(vendor_hash);
        if (!vendor_valid)
        {
            console.log(`vendor_valid: ${vendor_valid}`);
            console.log(`vendor_result: ${vendor_result}`);
            return " " + vendor_result;
        }

        let vendor_data = vendor.GetVendorInfo(vendor_hash);
        vendor_message.embed.title = vendor_data.name;
        vendor_message.embed.description = vendor_data.subtitle;
        vendor_message.embed.image = vendor_data.large_icon;
        vendor_message.embed.thumbnail = vendor_data.thumbnail;
        vendor_message.embed.footer.icon_url = vendor_data.footer_icon;

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