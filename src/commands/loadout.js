import { BungieApi } from "../bungieapi/BungieApi"
import ColorCode from '../Color';
import EmojiHandler from "../EmojiHandler"
import fs from 'fs';
let Jimp = require("jimp");
var text2png = require('text2png');

function GetCharacterInfo(resp)
{
    let class_text = 
        BungieApi.Destiny2.getManifestClassName(resp.Response.character.data.classHash);
    let light = resp.Response.character.data.light;
    return [class_text, light];
}

function GetCharacterKinetic(resp)
{
    let item_hash = resp.Response.equipment.data.items[0].itemHash;
    let item_instance_id = resp.Response.equipment.data.items[0].itemInstanceId;
    let item_name = BungieApi.Destiny2.getManifestItemName(item_hash);
    let item_icon = BungieApi.Destiny2.Endpoints.rootrootPath + BungieApi.Destiny2.getManifestItemIcon(item_hash);
    let item_power = resp.Response.itemComponents.instances.data[item_instance_id].primaryStat.value;

    return [item_name, item_icon, item_power, item_instance_id];
}

function GetCharacterEnergy(resp)
{
    let item_hash = resp.Response.equipment.data.items[1].itemHash;
    let item_instance_id = resp.Response.equipment.data.items[1].itemInstanceId;
    let item_name = BungieApi.Destiny2.getManifestItemName(item_hash);
    let item_icon = BungieApi.Destiny2.Endpoints.rootrootPath + BungieApi.Destiny2.getManifestItemIcon(item_hash);
    let item_power = resp.Response.itemComponents.instances.data[item_instance_id].primaryStat.value;

    return [item_name, item_icon, item_power, item_instance_id];
}

function GetCharacterPower(resp)
{
    let item_hash = resp.Response.equipment.data.items[2].itemHash;
    let item_instance_id = resp.Response.equipment.data.items[2].itemInstanceId;
    let item_name = BungieApi.Destiny2.getManifestItemName(item_hash);
    let item_icon = BungieApi.Destiny2.Endpoints.rootrootPath + BungieApi.Destiny2.getManifestItemIcon(item_hash);
    let item_power = resp.Response.itemComponents.instances.data[item_instance_id].primaryStat.value;

    return [item_name, item_icon, item_power, item_instance_id];
}

async function AddPerks(emoji_handler, perks)
{
    let emoji_string = "";
    let emoji_number = 1;
    for (let perk of perks)
    {
        if (perk.isEnabled == true && perk.isVisible == true)
        {
            emoji_string += await emoji_handler.PerkEmojiString(perk.plugHash);
            if ((emoji_number % 5) == 0)
            {
                emoji_string += "\n"
            }
            else
            {
                emoji_string += " ";
            }
            ++emoji_number
        }
    }

    return emoji_string;
}

module.exports = {
    name: 'loadout',
    description: 'Displays mentioned users loadout.',
    async execute(message, args, keyv)
    {
        let server_id = message.guild.id;
        let info_message = {
            embed: {
                description: "",
                color: ColorCode.DEFAULT,
            }
        };

        if (message.mentions.members.size != 1)
        {
            info_message.embed.description = "Please @ someone you want to inspect";
            info_message.embed.color = ColorCode.RED;
            message.channel.send(info_message);
            return;
        }

        let discord_destiny_profile_json = await keyv.get(server_id + "-" + message.mentions.members.first().id);
        if (discord_destiny_profile_json === undefined)
        {
            info_message.embed.description = `${message.mentions.members.first().user.username} has not authorized me yet :(`
            info_message.embed.color = ColorCode.RED;
            message.channel.send(info_message);
            return;
        }

        message.channel.startTyping();
        let discord_destiny_profile = JSON.parse(discord_destiny_profile_json);
        let destiny_membership_id = discord_destiny_profile.destiny_membership_id;
        let membership_type = discord_destiny_profile.membership_type;
        let characters = discord_destiny_profile.characters.split(",");
        let char = {};
        let date_time = 0;
        for (let char_id of characters)
        {
            let options = {
                characterId: char_id,
                membershipId: destiny_membership_id,
                mType: membership_type,
                components: ["CHARACTERS", "CHARACTEREQUIPMENT", "ITEMINSTANCES", "ITEMSOCKETS", "ITEMPERKS"]
            }
            let char_response = await BungieApi.Destiny2.getCharacter(options);

            let date_last_played = Date.parse(char_response.Response.character.data.dateLastPlayed);
            if (date_last_played > date_time)
            {
                char = char_response
                date_time = date_last_played;
            }
        }
        
        let [char_class, char_light] = GetCharacterInfo(char);
        message.channel.send(char_class + " - " + char_light);

        let [kinetic_item_name, kinetic_item_icon, kinetic_item_power, kinetic_instance_id] = GetCharacterKinetic(char);
        let [energy_item_name, energy_item_icon, energy_item_power, energy_instance_id] = GetCharacterEnergy(char);
        let [power_item_name, power_item_icon, power_item_power, power_instance_id] = GetCharacterPower(char);

        let emoji_handler = new EmojiHandler(message.guild);

        const loadout_message = {
            files: [
                {
                    attachment: "", 
                    name: "kinetic.png"
                },
                {
                    attachment: "", 
                    name: "energy.png"
                },
                {
                    attachment: "", 
                    name: "power.png"
                }
            ]
        };

        let kinetic_template = Jimp.read("exotic_template.png");
        let energy_template = Jimp.read("exotic_template.png");
        let power_template = Jimp.read("exotic_template.png");
        let kinetic_icon = Jimp.read(kinetic_item_icon);
        let energy_icon = Jimp.read(energy_item_icon);
        let power_icon = Jimp.read(power_item_icon);
        let font_options = {
            color: "white",
            font: '36px Neue Haas Display Medium',
            localFontPath: 'NeueHaasDisplay-Mediu.ttf',
            localFontName: 'NeueHaasDisplay-Mediu'
        };
        fs.writeFileSync("kinetic_text.png", text2png(kinetic_item_name + "\n" + kinetic_item_power, font_options));
        fs.writeFileSync("energy_text.png", text2png(energy_item_name + "\n" + energy_item_power, font_options));
        fs.writeFileSync("power_text.png", text2png(power_item_name + "\n" + power_item_power, font_options));
        let kinetic_text = Jimp.read("kinetic_text.png");
        let energy_text = Jimp.read("energy_text.png");
        let power_text = Jimp.read("power_text.png");
        Promise.all([result_template, kinetic_template, energy_template, power_template, 
            kinetic_icon, energy_icon, power_icon, 
            kinetic_text, energy_text, power_text]).then(function (values)
        {
            let template_k = values[1];
            let template_e = values[2];
            let template_p = values[3];
            let icon_k = values[4].resize(100, 100);
            let icon_e = values[5].resize(100, 100);
            let icon_p = values[6].resize(100, 100);
            let text_k = values[7];
            let text_e = values[8];
            let text_p = values[9];
            template_k.composite(icon_k, 400, 0, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_k.composite(text_k, 10, 10, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_e.composite(icon_e, 400, 0, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_e.composite(text_e, 10, 10, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_p.composite(icon_p, 400, 0, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_p.composite(text_p, 10, 10, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            let image_write_promises = [];
            image_write_promises.push(template_k.write("kinetic_result.png"));
            image_write_promises.push(template_e.write("energy_result.png"));
            image_write_promises.push(template_p.write("power_result.png"));
            Promise.all(image_write_promises).then(images => {
                loadout_message.files[0].attachment = "kinetic_result.png";
                loadout_message.files[1].attachment = "energy_result.png";
                loadout_message.files[2].attachment = "power_result.png";
                message.channel.send(loadout_message).then(msg => {
                // fs.unlinkSync("result.png");
                });
            });
        });
                // let sockets = char.Response.itemComponents.sockets.data[kinetic_instance_id].sockets
                // for (let socket of sockets)
                // {
                //     if (socket.isEnabled == true && socket.isVisible == true)
                //     {
                //         let socket_info = BungieApi.Destiny2.getPerkNameAndIcon(perk_hash);
                //         Jimp.read(socket_info.icon).then(socket_icon => {
                //         });
                //     }
                // }

        message.channel.stopTyping();

        emoji_handler.CleanupEmojis();
        return;
    },
};
