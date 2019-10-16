import { BungieApi } from "../bungieapi/BungieApi"
import ColorCode from '../Color';

function GetCharactersFromProfile(resp)
{
    return resp.Response.profile.data.characterIds;
}

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

    return [item_name, item_icon, item_power];
}

function GetCharacterEnergy(resp)
{
    let item_hash = resp.Response.equipment.data.items[1].itemHash;
    let item_instance_id = resp.Response.equipment.data.items[1].itemInstanceId;
    let item_name = BungieApi.Destiny2.getManifestItemName(item_hash);
    let item_icon = BungieApi.Destiny2.Endpoints.rootrootPath + BungieApi.Destiny2.getManifestItemIcon(item_hash);
    let item_power = resp.Response.itemComponents.instances.data[item_instance_id].primaryStat.value;

    return [item_name, item_icon, item_power];
}

function GetCharacterPower(resp)
{
    let item_hash = resp.Response.equipment.data.items[2].itemHash;
    let item_instance_id = resp.Response.equipment.data.items[2].itemInstanceId;
    let item_name = BungieApi.Destiny2.getManifestItemName(item_hash);
    let item_icon = BungieApi.Destiny2.Endpoints.rootrootPath + BungieApi.Destiny2.getManifestItemIcon(item_hash);
    let item_power = resp.Response.itemComponents.instances.data[item_instance_id].primaryStat.value;

    return [item_name, item_icon, item_power];
}

function GetFirstDestinyMembership(resp)
{
    let id = resp.Response.destinyMemberships[0].membershipId;
    let type = resp.Response.destinyMemberships[0].membershipType;
    return [type, id];
}

module.exports = {
    name: 'loadout',
    description: 'FIX ME.',
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
        console.log(discord_destiny_profile_json);
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
                components: ["CHARACTERS", "CHARACTEREQUIPMENT", "ITEMINSTANCES", "ITEMSTATS"]
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

        let [kinetic_item_name, kinetic_item_icon, kinetic_item_power] = GetCharacterKinetic(char);
        let [energy_item_name, energy_item_icon, energy_item_power] = GetCharacterEnergy(char);
        let [power_item_name, power_item_icon, power_item_power] = GetCharacterPower(char);

        // TODO (Garrett): For the love of god please stop creating 3 separate messages...
        const kinetic_message = {
            embed: {
                color: ColorCode.DEFAULT,
                title: "",
                thumbnail: {
                    url: ""
                }
            }
        };
        kinetic_message.embed.title = kinetic_item_name + " - " + kinetic_item_power;
        kinetic_message.embed.thumbnail.url = kinetic_item_icon;
        kinetic_message.embed.color = ColorCode.WHITE;
        message.channel.send(kinetic_message);

        const energy_message = {
            embed: {
                color: ColorCode.DEFAULT,
                title: "",
                thumbnail: {
                    url: ""
                }
            }
        };
        energy_message.embed.title = energy_item_name + " - " + energy_item_power;
        energy_message.embed.thumbnail.url = energy_item_icon;
        energy_message.embed.color = ColorCode.GREEN;
        message.channel.send(energy_message);

        const power_message = {
            embed: {
                color: ColorCode.DEFAULT,
                title: "",
                thumbnail: {
                    url: ""
                }
            }
        };
        power_message.embed.title = power_item_name + " - " + power_item_power;
        power_message.embed.thumbnail.url = power_item_icon;
        power_message.embed.color = ColorCode.PURPLE;
        message.channel.send(power_message);

        message.channel.stopTyping();
        return;
    },
};
