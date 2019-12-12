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
                    let item_properties = BungieApi.Destiny2.getManifestItemDisplayProperties(step.itemHash);
                    quest_step_list_converted.push({name: item_properties.name, description: item_properties.description});
                }
            }

            let sorted_plug_objects = [];
            if (best_object.itemType === BungieApi.Destiny2.Enums.destinyItemType.WEAPON)
            {
                let plug_object_list = [];
                let entries = best_object.sockets.socketEntries;
                let categories = best_object.sockets.socketCategories;
                for (let e of entries)
                {
                    if (e.singleInitialItemHash > 0)
                    {
                        let category_hash = BungieApi.Destiny2.getManifestSocketCategoryHash(e.socketTypeHash);
                        let category_name = "";
                        if (category_hash !== undefined)
                        {
                            category_name = BungieApi.Destiny2.getManifestDestinySocketCategoryDisplayProperties(category_hash).name;
                        }
                        let socket_properties = BungieApi.Destiny2.getManifestItemDisplayProperties(e.singleInitialItemHash);
                        plug_object_list.push({category: category_name, name: socket_properties.name, 
                                icon: `${BungieApi.Destiny2.Endpoints.rootrootPath}${socket_properties.icon}`});

                        let plug_set_items = {};
                        if (e.randomizedPlugSetHash !== undefined)
                        {
                            plug_set_items = BungieApi.Destiny2.getManifestReusablePlugItems(e.randomizedPlugSetHash);
                        }

                        if (plug_set_items.length > 0)
                        {
                            for (let plug of plug_set_items)
                            {
                                let p_item = BungieApi.Destiny2.getManifestItemDisplayProperties(plug.plugItemHash);
                                if (!plug_object_list.some(p_name => (p_name.name === p_item.name)))
                                {
                                    plug_object_list.push({category: category_name, name: p_item.name, 
                                        icon: `${BungieApi.Destiny2.Endpoints.rootrootPath}${p_item.icon}`});
                                }
                            }
                        }
                    }        
                }
                for (let category of categories)
                {
                    let category_name = BungieApi.Destiny2.getManifestDestinySocketCategoryDisplayProperties(category.socketCategoryHash).name;
                    let p_objects = [];
                    for (let plug of plug_object_list)
                    {
                        if (category_name === plug.category)
                        {
                            p_objects.push({plug});
                        }
                        if (p_objects.length >= 10)
                        {
                            sorted_plug_objects.push(category.socketCategoryHash, p_objects);
                            p_objects = [];
                        }
                    }
                    sorted_plug_objects.push(category.socketCategoryHash, p_objects);
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
                socket_plug_names: sorted_plug_objects,
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