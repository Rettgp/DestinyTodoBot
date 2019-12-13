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
        return this.GetItemObjectData(best_object);
    }

    GetItemObjectData(best_object)
    {
        if (best_object === null)
        {
            return null;
        }

        let item_object_data = {
            name: best_object.displayProperties.name,
            description: best_object.displayProperties.description,
            thumbnail: `${BungieApi.Destiny2.Endpoints.rootrootPath}${best_object.displayProperties.icon}`,
            screenshot: `${BungieApi.Destiny2.Endpoints.rootrootPath}${best_object.screenshot}`,
            item_type_and_tier_display_name: best_object.itemTypeAndTierDisplayName,
            stats: this.GetItemStats(best_object),
            steps: this.GetItemSteps(best_object),
            socket_plugs: this.GetItemSocketsAndPlugs(best_object),
        };

        if (best_object.itemType === BungieApi.Destiny2.Enums.destinyItemType.EMBLEM)
        {
            item_object_data.thumbnail = null;
            item_object_data.screenshot = `${BungieApi.Destiny2.Endpoints.rootrootPath}${best_object.secondaryIcon}`;
        }
        return item_object_data;
    }

    GetItemStats(best_object)
    {
        if (!best_object.hasOwnProperty('investmentStats'))
        {
            return undefined;
        }

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

        return investment_stats_converted;
    }

    GetItemSteps(best_object)
    {
        if (!best_object.hasOwnProperty('setData'))
        {
            return undefined;
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
        return quest_step_list_converted;
    }

    GetItemSocketsAndPlugs(best_object)
    {
        if (!best_object.hasOwnProperty('sockets'))
        {
            return undefined;
        }
        let socket_and_plug_entry_list = [];
        for (let entry of best_object.sockets.socketEntries)
        {
            socket_and_plug_entry_list.push({
                socketTypeHash: entry.socketTypeHash,
                singleInitialItemHash: entry.singleInitialItemHash,
                reusablePlugItems: entry.reusablePlugItems,
                reusablePlugSetHash: this.getReusablePlugSet(entry.reusablePlugSetHash),
                randomizedPlugSetHash: this.getRandomizedPlugSet(entry.randomizedPlugSetHash),
            });
        }

        let socket_category_hash_list = [];
        for (let hash of best_object.sockets.socketCategories)
        {
            socket_category_hash_list.push(hash.socketCategoryHash);
        }

        let socket_and_plugs = [];
        for (let category of socket_category_hash_list)
        {
            let socket_and_plug_hash_values = [];
            for (let socket_and_plug_entry of socket_and_plug_entry_list)
            {
                if (socket_and_plug_entry.socketTypeHash === 0)
                {
                    continue;
                }
                let category_hash = BungieApi.Destiny2.getManifestSocketCategoryHash(socket_and_plug_entry.socketTypeHash);
                if (category !== category_hash)
                {
                    continue;
                }

                socket_and_plug_hash_values.push(socket_and_plug_entry.singleInitialItemHash);
                if (socket_and_plug_entry.reusablePlugSetHash !== undefined)
                {
                    for (let reusable of socket_and_plug_entry.reusablePlugSetHash)
                    {
                        socket_and_plug_hash_values.push(reusable.plugItemHash);
                    }
                }   

                if (socket_and_plug_entry.randomizedPlugSetHash !== undefined)
                {
                    for (let randomized of socket_and_plug_entry.randomizedPlugSetHash)
                    {
                        socket_and_plug_hash_values.push(randomized.plugItemHash);
                    }
                }        
            }
            socket_and_plugs.push({
                categoryHash: category,
                socketAndPlugHashValues: socket_and_plug_hash_values,
            });
        }

        let socket_and_plugs_converted = [];
        for (let hash of socket_and_plugs)
        {
            let category_name = BungieApi.Destiny2.getManifestDestinySocketCategoryDisplayProperties(hash.categoryHash).name;
            if (category_name !== 'WEAPON PERKS')
            {
                continue;
            }
            let value_list = [];
            let dupe_list = [];
            for (let value of hash.socketAndPlugHashValues)
            {
                if (value === 0)
                {
                    continue;
                }
                let display_properties = BungieApi.Destiny2.getManifestItemDisplayProperties(value);
                if (!dupe_list.includes(display_properties.name))
                {
                    if (value_list.length < 20)
                    {
                        value_list.push({name: display_properties.name, icon: `${BungieApi.Destiny2.Endpoints.rootrootPath}${display_properties.icon}`});
                        dupe_list.push(display_properties.name);
                    }
                    else{
                        socket_and_plugs_converted.push({categoryHash: category_name, socketAndPlugHashValues: value_list});
                        value_list = [];
                    }
                }
            }
            if (value_list.length > 0)
            {
                socket_and_plugs_converted.push({categoryHash: category_name, socketAndPlugHashValues: value_list});
            }
        }
        return socket_and_plugs_converted;
    }

    getRandomizedPlugSet(hash)
    {
        if (hash !== undefined)
        {
            return BungieApi.Destiny2.getManifestPlugSetItems(hash);
        }            
    }

    getReusablePlugSet(hash)
    {
        if (hash !== undefined)
        {
            return BungieApi.Destiny2.getManifestPlugSetItems(hash);
        }     
    }
}