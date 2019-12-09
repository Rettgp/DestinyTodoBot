import ColorCode from 'utility/Color.js';
import { Vendors } from 'vendors/VendorInfo.js';
import { Character } from "character/CharacterInfo.js"
import { Membership } from "membership/MembershipManager.js";

module.exports = {
    name: 'vendor',
    description: 'Gets the current vendor items',
    async execute(message, args, keyv)
    {
        const vendor_message = {
            embed: {
                title: "",
                description: "",
                color: ColorCode.DEFAULT,
                thumbnail: { url: "" },
                footer: { icon_url: "", text: new Date(Date.now()),},
                image: { url: "" },
                fields: [],
            }
        };

        if (args.length < 1)
        {
            vendor_message.embed.description = `Please specify a vendor`;
            vendor_message.embed.color = ColorCode.RED;
            message.channel.send(vendor_message);
            return;
        }

        let membership = new Membership(message,keyv);
        let user_membership = await membership.GetAuthorMembership();
        if (!membership.Valid())
        {
            return;
        }

        let character_id = 0;
        let date_time = 0;
        for (let char_id of user_membership.destiny_character_keys)
        {
            let character = new Character(char_id, user_membership.destiny_membership_type, 
                user_membership.destiny_membership_id);
            let [valid, result] = await character.Request();

            if (!character.Valid())
            {
                continue;
            }

            let date_last_played = character.LastPlayed();
            if (date_last_played > date_time)
            {
                character_id = char_id;
                date_time = date_last_played;
            }
        }

        let vendor = new Vendors(character_id, user_membership.destiny_membership_type, 
            user_membership.destiny_membership_id);
        let [vendor_valid, vendor_result] = await vendor.Request();
        if (!vendor_valid)
        {
            console.log(`vendor_valid: ${vendor_sales_valid} .vendor_result: ${vendor_sales_result}`);
            return " " + vendor_result;
        }
        let vendor_user_input = args.join(" ").toUpperCase();
        let vendor_hash = vendor.FindVendorHash(vendor_user_input);
        if (vendor_hash === 0)
        {
            vendor_message.embed.title = `Unable to Locate ${vendor_user_input}`;
            vendor_message.embed.description = `Perhaps ${vendor_user_input} is hiding, on vacation, or just on a time gated rotation`;
            message.channel.send(vendor_message);
            return;
        }
        let vendor_data = vendor.GetVendorInfo(vendor_hash);
        vendor_message.embed.title = vendor_data.name;
        vendor_message.embed.description = vendor_data.subtitle;
        vendor_message.embed.image.url = vendor_data.large_icon;
        vendor_message.embed.thumbnail.url = vendor_data.thumbnail;
        vendor_message.embed.footer.icon_url = vendor_data.footer_icon;
        vendor_message.embed.footer.text = `Reset: ${new Date(vendor_data.footer_text)}`;

        let vendor_sale_items = vendor.GetVendorSaleItems(vendor_hash);
        for (let vendor_object of Object.values(vendor_sale_items))
        {
            let quantity = vendor_object.item_quantity;
            if (quantity === 1)
            {
                quantity = '';
            }

            let name = `${vendor_object.item_name} ${quantity}`;
            let cost = "";
            for (var c_item of Object.values(vendor_object.item_costs))
            {
                cost += `Cost: ${c_item.quantity} ${c_item.name}\n`;
            }
            if (cost === "")
            {
                cost = `No Cost`;
            }

            if (name !== " ")
            {
                vendor_message.embed.fields.push({
                    name: name, 
                    value: cost, 
                    inline: `false`
                });
            }
        }
        message.channel.send(vendor_message);

        return;
    },
};