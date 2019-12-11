import { BungieApi } from "bungieapi/BungieApi"
var StringSimilarity = require('string-similarity');

export class Item
{
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
    
            let type = BungieApi.Destiny2.getManifestItemType(item);
            if (type !== item_type)
            {
                continue;
            }
    
            let name = BungieApi.Destiny2.getManifestItemName(item).toUpperCase();
            let rating = StringSimilarity.compareTwoStrings(item_name, name);
            if (rating > best_rating)
            {
                console.log(`rating: ${rating} .best_rating: ${best_rating}`);
                best_rating = rating;
                console.log(item_definition[item]);
                best_object = item_definition[item];
            }
        }
        if (best_object !== null)
        {
            let item_object = {
                name: best_object.displayProperties.name,
                description: best_object.displayProperties.description,
                icon: `${BungieApi.Destiny2.Endpoints.rootrootPath}${best_object.displayProperties.icon}`,
            };
            console.log(item_object);
            return item_object;
        }
    
        return null;
    }
}