import ColorCode from '../utility/Color.js';
import { Vendors } from '../vendors/VendorInfo.js';

module.exports = {
    name: 'vendor',
    description: 'Gets the current vendor items',
    async execute(message, args, keyv)
    {
        let server_id = message.guild.id;
        const info_message = {
            embed: {
                title: "",
                fields: [],
                color: ColorCode.DEFAULT,
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
            info_message.embed.description = `${user_key.username} has not authorized me yet :(`
            info_message.embed.color = ColorCode.RED;
            message.channel.send(info_message);
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

        let [vendor_valid, vendor_result] = await vendor.Request(available_vendors.SPIDER);
        if (!vendor_valid)
        {
            console.log(`vendor_valid: ${vendor_valid}`);
            console.log(`vendor_result: ${vendor_result}`);
            return " " + vendor_result;
        }

        let vendor_sales = vendor.VendorSales();

        if (vendor_sales === undefined)
        {
            console.log(`vendor_sales === undefined`);
            return " ";
        }

        return;
    },
};