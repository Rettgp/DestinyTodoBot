import { BungieApi } from "../bungieapi/BungieApi"
import { Character } from "./CharacterInfo.js"
import ColorCode from '../Color';
import fs from 'fs';
const path = require('path');
import { rejects } from "assert";
import { resolve } from "path";
let Jimp = require("jimp");
var text2png = require('text2png');
const tmp_asset_dir = "./assets/tmp";

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

async function RequestCharacter(options)
{
    let resp = "";
    try
    {
        resp = await BungieApi.Destiny2.getCharacter(options);
    } 
    catch (e)
    {
        return [false, "Character Privacy/Authorize Error"];
    } 

    return [true, resp];
}

async function AddSocketsToTemplate(template, sockets)
{
    let font_options = {
        color: "white",
        font: '12px NeueHaasDisplay',
        localFontPath: './assets/NeueHaasDisplay-Mediu.ttf',
        localFontName: 'NeueHaasDisplay'
    };
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
                    fs.writeFileSync(`${tmp_asset_dir}/${socket_info.name}_text.png`, text2png(`${socket_info.display}`, font_options));
                    socket_promises.push(Jimp.read(`${tmp_asset_dir}/${socket_info.name}_text.png`));
                }
            }
        }

        Promise.all(socket_promises).then(socket_jimps => {
            let x = 110;
            let y = 95;
            for (let i = 0; i < socket_jimps.length; i+=2)
            {
                template.composite(socket_jimps[i].resize(30, 30), x, y, {
                    mode: Jimp.BLEND_SOURCE_OVER,
                    opacitySource: 1.0,
                    opacityDest: 1.0
                });
                template.composite(socket_jimps[i+1], x + 35, y + 9, {
                    mode: Jimp.BLEND_SOURCE_OVER,
                    opacitySource: 1.0,
                    opacityDest: 1.0
                });

                y += 30;
                if ((i + 2) % 6 == 0)
                {
                    x += 190;
                    y = 95;
                }
            }

            resolve(template);
        }).catch(e => {
            reject(e);
        });
    })
}

async function CompositeWeaponTemplate(template, icon, name_text, type_text, light)
{
    template.composite(icon, 415, 0, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1.0,
        opacityDest: 1.0
    });
    template.composite(name_text, 10, 10, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1.0,
        opacityDest: 1.0
    });
    template.composite(type_text, 10, 45, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1.0,
        opacityDest: 1.0
    });
    template.composite(light, 10, 95, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1.0,
        opacityDest: 1.0
    });

    return template;
}

function CleanupTmpDir()
{
    fs.readdir(tmp_asset_dir, (err, files) =>
    {
        if (err) throw err;
        for (const file of files)
        {
            fs.unlinkSync(path.join(tmp_asset_dir, file), err =>
            {
                if (err) throw err;
            });
        }
    });
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
        if (!fs.existsSync(tmp_asset_dir)){
            fs.mkdirSync(tmp_asset_dir);
        }

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
        let characters = discord_destiny_profile.characters.split(",");
        let latest_char = {};
        let date_time = 0;
        let characters = []
        for (let char_id of characters)
        {
            let components = ["CHARACTERS", "CHARACTEREQUIPMENT", "ITEMINSTANCES", "ITEMSOCKETS", "ITEMPERKS"];
            let character = new Character(char_id, membership_type, destiny_membership_id, components);
            await character.Request();

            if (!character.Valid())
            {
                info_message.embed.description = `${char_response}`;
                info_message.embed.color = ColorCode.RED;
                message.channel.send(info_message);
                return;
            }

            characters.push(character)

            let date_last_played = character.LastPlayed();
            if (date_last_played > date_time)
            {
                latest_char = character;
                date_time = date_last_played;
            }
        }
        
        message.channel.send(latest_char.Class() + " - " + latest_char.Power());

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

        let font_options = {
            color: "white",
            font: '28px NeueHaasDisplay',
            localFontPath: './assets/NeueHaasDisplay-Mediu.ttf',
            localFontName: 'NeueHaasDisplay'
        };
        let sub_font_options = {
            color: "white",
            font: '18px NeueHaasDisplay',
            localFontPath: './assets/NeueHaasDisplay-Mediu.ttf',
            localFontName: 'NeueHaasDisplay'
        };
        let light_font_options = {
            color: "white",
            font: '48px NeueHaasDisplay',
            localFontPath: './assets/NeueHaasDisplay-Mediu.ttf',
            localFontName: 'NeueHaasDisplay'
        };

        // let char_loadout = latest_char.Loadout();

        fs.writeFileSync(`${tmp_asset_dir}/kinetic_text.png`, text2png(kinetic_item_name, font_options));
        fs.writeFileSync(`${tmp_asset_dir}/sub_kinetic_text.png`, text2png(`${kinetic_item_type}`, sub_font_options));
        fs.writeFileSync(`${tmp_asset_dir}/light_kinetic_text.png`, text2png(`${kinetic_item_power}`, light_font_options));
        fs.writeFileSync(`${tmp_asset_dir}/energy_text.png`, text2png(energy_item_name, font_options));
        fs.writeFileSync(`${tmp_asset_dir}/sub_energy_text.png`, text2png(`${energy_item_type}`, sub_font_options));
        fs.writeFileSync(`${tmp_asset_dir}/light_energy_text.png`, text2png(`${energy_item_power}`, light_font_options));
        fs.writeFileSync(`${tmp_asset_dir}/power_text.png`, text2png(power_item_name, font_options));
        fs.writeFileSync(`${tmp_asset_dir}/sub_power_text.png`, text2png(`${power_item_type}`, sub_font_options));
        fs.writeFileSync(`${tmp_asset_dir}/light_power_text.png`, text2png(`${power_item_power}`, light_font_options));
        let read_promises = [
            Jimp.read(`./assets/${kinetic_tier}_template.png`),
            Jimp.read(`./assets/${energy_tier}_template.png`),
            Jimp.read(`./assets/${power_tier}_template.png`),
            Jimp.read(kinetic_item_icon),
            Jimp.read(energy_item_icon),
            Jimp.read(power_item_icon),
            Jimp.read(`${tmp_asset_dir}/kinetic_text.png`),
            Jimp.read(`${tmp_asset_dir}/sub_kinetic_text.png`),
            Jimp.read(`${tmp_asset_dir}/light_kinetic_text.png`),
            Jimp.read(`${tmp_asset_dir}/energy_text.png`),
            Jimp.read(`${tmp_asset_dir}/sub_energy_text.png`),
            Jimp.read(`${tmp_asset_dir}/light_energy_text.png`),
            Jimp.read(`${tmp_asset_dir}/power_text.png`),
            Jimp.read(`${tmp_asset_dir}/sub_power_text.png`),
            Jimp.read(`${tmp_asset_dir}/light_power_text.png`)
        ];
        Promise.all(read_promises).then(async function (values)
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
            template_k = await CompositeWeaponTemplate(template_k, icon_k, text_k, text_s_k, text_l_k);
            template_e = await CompositeWeaponTemplate(template_e, icon_e, text_e, text_s_e, text_l_e);
            template_p = await CompositeWeaponTemplate(template_p, icon_p, text_p, text_s_p, text_l_p);

            let kinetic_sockets = char.Response.itemComponents.sockets.data[kinetic_instance_id].sockets;
            let energy_sockets = char.Response.itemComponents.sockets.data[energy_instance_id].sockets;
            let power_sockets = char.Response.itemComponents.sockets.data[power_instance_id].sockets;

            template_k = await AddSocketsToTemplate(template_k, kinetic_sockets);
            template_e = await AddSocketsToTemplate(template_e, energy_sockets);
            template_p = await AddSocketsToTemplate(template_p, power_sockets);

            let image_write_promises = [];
            image_write_promises.push(template_k.write(`${tmp_asset_dir}/kinetic_result.png`));
            image_write_promises.push(template_e.write(`${tmp_asset_dir}/energy_result.png`));
            image_write_promises.push(template_p.write(`${tmp_asset_dir}/power_result.png`));
            Promise.all(image_write_promises).then(images => {
                loadout_message.files[0].attachment = `${tmp_asset_dir}/kinetic_result.png`;
                loadout_message.files[1].attachment = `${tmp_asset_dir}/energy_result.png`;
                loadout_message.files[2].attachment = `${tmp_asset_dir}/power_result.png`;
                message.channel.send(loadout_message).then(msg => {
                    CleanupTmpDir();
                });
            });
        });
        return;
    },
};
