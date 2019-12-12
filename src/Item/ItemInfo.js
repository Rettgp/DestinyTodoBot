import { BungieApi } from "bungieapi/BungieApi"
var StringSimilarity = require('string-similarity');

export class Item
{
    FindClosestItemType(item_type)
    {
        let best_rating = 0.5;
        let best_type = null;

        for (let type of Object.keys(BungieApi.Destiny2.Enums.destinyItemType))
        {
            
            let rating = StringSimilarity.compareTwoStrings(item_type, type);
            if (rating > best_rating)
            {
                best_rating = rating;
                best_type = BungieApi.Destiny2.Enums.destinyItemType[type];
                if (best_rating === 1)
                {
                    break;
                }
            }        
        }
        if (best_type !== null)
        {
            return best_type;
        }
        return null;
    }

    FindItemObject(item_name, item_type)
    {
        let best_rating = 0.5;
        let best_object = null;
        let item_definition = BungieApi.Destiny2.getManifestItemDefinition();
        for (let item of Object.keys(item_definition))
        {
            if (item === undefined)
            {
                return null;
            }
    
            if (item_type !== null)
            {
                let type = BungieApi.Destiny2.getManifestItemType(item);
                if (type !== item_type)
                {
                    continue;
                }
            }

            let name = BungieApi.Destiny2.getManifestItemName(item).toUpperCase();
            let rating = StringSimilarity.compareTwoStrings(item_name, name);
            if (rating > best_rating)
            {
                best_rating = rating;
                best_object = item_definition[item];
                if (best_rating === 1)
                {
                    break;
                }
            }
        }
        if (best_object !== null)
        {
            let investment_stats = best_object.investmentStats;
            let investment_stats_converted = [];
            for (let stat of investment_stats)
            {
                let stat_properties = BungieApi.Destiny2.getManifestStatTypeDisplayProperties(stat.statTypeHash);
                let stat_type_name = stat_properties.name;
                let stat_type_icon = `${BungieApi.Destiny2.Endpoints.rootrootPath}${stat_properties.icon}`;
                if (stat_properties.icon === undefined)
                {
                    stat_type_icon = undefined;
                }
                
                if (stat_type_name === '')
                {
                    continue;
                }
                investment_stats_converted.push({hash: stat.statTypeHash, name: stat_type_name, icon: stat_type_icon, value: stat.value})
            }

            let quest_step_list_converted = [];
            if (best_object.itemType === BungieApi.Destiny2.Enums.destinyItemType.QUEST)
            {
                let quest_step_list = best_object.setData.itemList;
                for (let step of quest_step_list)
                {
                    let item_properties = BungieApi.Destiny2.getManifestItemDisplayProperties(step.itemHash)
                    quest_step_list_converted.push({name: item_properties.name, description: item_properties.description});
                }
            }

            let item_object = {
                name: best_object.displayProperties.name,
                description: best_object.displayProperties.description,
                thumbnail: `${BungieApi.Destiny2.Endpoints.rootrootPath}${best_object.displayProperties.icon}`,
                screenshot: `${BungieApi.Destiny2.Endpoints.rootrootPath}${best_object.screenshot}`,
                item_type_and_tier_display_name: best_object.itemTypeAndTierDisplayName,
                stats: investment_stats_converted,
                steps: quest_step_list_converted,
            };

            if (best_object.itemType === BungieApi.Destiny2.Enums.destinyItemType.EMBLEM)
            {
                item_object.thumbnail = null;
                item_object.screenshot = `${BungieApi.Destiny2.Endpoints.rootrootPath}${best_object.secondaryIcon}`;
            }
            return item_object;
        }
    
        return null;
    }
}