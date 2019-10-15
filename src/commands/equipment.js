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

function GetCharacterEquipment(resp)
{
    let item_hash = resp.Response.equipment.data.items[0].itemHash;
    let item_instance_id = resp.Response.equipment.data.items[0].itemInstanceId;
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
    name: 'equipment',
    description: 'FIX ME.',
    async execute(message, args, keyv)
    {
        let server_id = message.guild.id;
        const info_message = {
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

        let bungie_membership_id = await keyv.get(server_id + "-" + message.mentions.members.first().id);
        let destiny_membership_data = await BungieApi.User.getMembershipDataById(String(bungie_membership_id), "BUNGIENEXT");
        let [membership_type, destiny_membership_id] = GetFirstDestinyMembership(destiny_membership_data);
        let profile = await BungieApi.Destiny2.getProfile(String(destiny_membership_id), membership_type);
        let characters = GetCharactersFromProfile(profile);
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
        
        const equipment_message = {
            embed: {
                color: ColorCode.DEFAULT,
                title: "",
                thumbnail: {
                    url: ""
                }
            }
        };
        let [char_class, char_light] = GetCharacterInfo(char);
        // TODO (Garrett): Deal with more than the first equipment
        let [item_name, item_icon, item_power] = GetCharacterEquipment(char);

        message.channel.send(char_class + " - " + char_light);
        equipment_message.embed.title = item_name + " - " + item_power;
        equipment_message.embed.thumbnail.url = item_icon;
        equipment_message.embed.color = ColorCode.BLUE;
        message.channel.send(equipment_message);

        return;
    },
};
