import { BungieApi } from "../bungieapi/BungieApi"
import ColorCode from '../Color';
import fs from 'fs';
import { rejects } from "assert";
import { resolve } from "path";
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
    let tier = BungieApi.Destiny2.getManifestItemTierName(item_hash);
    tier = tier.toLowerCase();
    let item_type = BungieApi.Destiny2.getManifestItemTypeDisplayName(item_hash);

    return [item_name, item_icon, item_power, tier, item_type, item_instance_id];
}

function GetCharacterEnergy(resp)
{
    let item_hash = resp.Response.equipment.data.items[1].itemHash;
    let item_instance_id = resp.Response.equipment.data.items[1].itemInstanceId;
    let item_name = BungieApi.Destiny2.getManifestItemName(item_hash);
    let item_icon = BungieApi.Destiny2.Endpoints.rootrootPath + BungieApi.Destiny2.getManifestItemIcon(item_hash);
    let item_power = resp.Response.itemComponents.instances.data[item_instance_id].primaryStat.value;
    let tier = BungieApi.Destiny2.getManifestItemTierName(item_hash);
    tier = tier.toLowerCase();
    let item_type = BungieApi.Destiny2.getManifestItemTypeDisplayName(item_hash);

    return [item_name, item_icon, item_power, tier, item_type, item_instance_id];
}

function GetCharacterPower(resp)
{
    let item_hash = resp.Response.equipment.data.items[2].itemHash;
    let item_instance_id = resp.Response.equipment.data.items[2].itemInstanceId;
    let item_name = BungieApi.Destiny2.getManifestItemName(item_hash);
    let item_icon = BungieApi.Destiny2.Endpoints.rootrootPath + BungieApi.Destiny2.getManifestItemIcon(item_hash);
    let item_power = resp.Response.itemComponents.instances.data[item_instance_id].primaryStat.value;
    let tier = BungieApi.Destiny2.getManifestItemTierName(item_hash);
    tier = tier.toLowerCase();
    let item_type = BungieApi.Destiny2.getManifestItemTypeDisplayName(item_hash);

    return [item_name, item_icon, item_power, tier, item_type, item_instance_id];
}

async function AddSocketsToTemplate(template, sockets)
{
    return new Promise((resolve, reject) => {
        let socket_promises = [];
        for (let socket of sockets)
        {
            if (socket.isEnabled == true && socket.isVisible == true)
            {
                let socket_info = BungieApi.Destiny2.getPerkNameAndIcon(socket.plugHash);
                if (socket_info != null)
                {
                    socket_promises.push(Jimp.read(socket_info.icon));
                }
            }
        }

        Promise.all(socket_promises).then(socket_jimps => {
            let x = 125;
            let y = 95;
            for (let i = 0; i < socket_jimps.length; ++i)
            {
                template.composite(socket_jimps[i].resize(30, 30), x, y, {
                    mode: Jimp.BLEND_SOURCE_OVER,
                    opacitySource: 1.0,
                    opacityDest: 1.0
                });

                y += 30;
                if ((i + 1) % 3 == 0)
                {
                    x += 60;
                    y = 95;
                }
            }

            resolve(template);
        }).catch(e => {
            reject(e);
        });
    })
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

        let [kinetic_item_name, kinetic_item_icon, 
            kinetic_item_power, kinetic_tier, kinetic_item_type, kinetic_instance_id] = GetCharacterKinetic(char);
        let [energy_item_name, energy_item_icon, 
            energy_item_power, energy_tier, energy_item_type, energy_instance_id] = GetCharacterEnergy(char);
        let [power_item_name, power_item_icon, 
            power_item_power, power_tier, power_item_type, power_instance_id] = GetCharacterPower(char);

        const loadout_message = {
            files: [
                {
                    attachment: "", 
                    name: "kinetic.png"
                },
                {
                    attachment: "", 
                    name: "power.png"
                },
                {
                    attachment: "", 
                    name: "energy.png"
                }
            ]
        };

        let kinetic_template = Jimp.read(`${kinetic_tier}_template.png`);
        let energy_template = Jimp.read(`${energy_tier}_template.png`);
        let power_template = Jimp.read(`${power_tier}_template.png`);
        let kinetic_icon = Jimp.read(kinetic_item_icon);
        let energy_icon = Jimp.read(energy_item_icon);
        let power_icon = Jimp.read(power_item_icon);
        let font_options = {
            color: "white",
            font: '28px NeueHaasDisplay',
            localFontPath: 'NeueHaasDisplay-Mediu.ttf',
            localFontName: 'NeueHaasDisplay'
        };
        let sub_font_options = {
            color: "white",
            font: '18px NeueHaasDisplay',
            localFontPath: 'NeueHaasDisplay-Mediu.ttf',
            localFontName: 'NeueHaasDisplay'
        };
        let light_font_options = {
            color: "white",
            font: '48px NeueHaasDisplay',
            localFontPath: 'NeueHaasDisplay-Mediu.ttf',
            localFontName: 'NeueHaasDisplay'
        };
        fs.writeFileSync("kinetic_text.png", text2png(kinetic_item_name, font_options));
        fs.writeFileSync("sub_kinetic_text.png", text2png(`${kinetic_item_type}`, sub_font_options));
        fs.writeFileSync("light_kinetic_text.png", text2png(`${kinetic_item_power}`, light_font_options));
        fs.writeFileSync("energy_text.png", text2png(energy_item_name, font_options));
        fs.writeFileSync("sub_energy_text.png", text2png(`${energy_item_type}`, sub_font_options));
        fs.writeFileSync("light_energy_text.png", text2png(`${energy_item_power}`, light_font_options));
        fs.writeFileSync("power_text.png", text2png(power_item_name, font_options));
        fs.writeFileSync("sub_power_text.png", text2png(`${power_item_type}`, sub_font_options));
        fs.writeFileSync("light_power_text.png", text2png(`${power_item_power}`, light_font_options));
        let kinetic_text = Jimp.read("kinetic_text.png");
        let energy_text = Jimp.read("energy_text.png");
        let power_text = Jimp.read("power_text.png");
        let sub_kinetic_text = Jimp.read("sub_kinetic_text.png");
        let sub_energy_text = Jimp.read("sub_energy_text.png");
        let sub_power_text = Jimp.read("sub_power_text.png");
        let light_kinetic_text = Jimp.read("light_kinetic_text.png");
        let light_energy_text = Jimp.read("light_energy_text.png");
        let light_power_text = Jimp.read("light_power_text.png");
        Promise.all([kinetic_template, energy_template, power_template, 
            kinetic_icon, energy_icon, power_icon, 
            kinetic_text, sub_kinetic_text, light_kinetic_text,
            energy_text, sub_energy_text, light_energy_text,
            power_text, sub_power_text, light_power_text]).then(async function (values)
        {
            let template_k = values[0];
            let template_e = values[1];
            let template_p = values[2];
            let icon_k = values[3].resize(85, 85);
            let icon_e = values[4].resize(85, 85);
            let icon_p = values[5].resize(85, 85);
            let text_k = values[6];
            let text_s_k = values[7];
            let text_l_k = values[8];
            let text_e = values[9];
            let text_s_e = values[10];
            let text_l_e = values[11];
            let text_p = values[12];
            let text_s_p = values[13];
            let text_l_p = values[14];
            template_k.composite(icon_k, 415, 0, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_k.composite(text_k, 10, 10, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_k.composite(text_s_k, 10, 45, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_k.composite(text_l_k, 10, 95, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_e.composite(icon_e, 415, 0, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_e.composite(text_e, 10, 10, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_e.composite(text_s_e, 10, 45, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_e.composite(text_l_e, 10, 95, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_p.composite(icon_p, 415, 0, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_p.composite(text_p, 10, 10, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_p.composite(text_s_p, 10, 45, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });
            template_p.composite(text_l_p, 10, 95, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1.0,
                opacityDest: 1.0
            });

            let kinetic_sockets = char.Response.itemComponents.sockets.data[kinetic_instance_id].sockets;
            let energy_sockets = char.Response.itemComponents.sockets.data[energy_instance_id].sockets;
            let power_sockets = char.Response.itemComponents.sockets.data[power_instance_id].sockets;

            template_k = await AddSocketsToTemplate(template_k, kinetic_sockets);
            template_e = await AddSocketsToTemplate(template_e, energy_sockets);
            template_p = await AddSocketsToTemplate(template_p, power_sockets);

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
        message.channel.stopTyping();
        return;
    },
};
