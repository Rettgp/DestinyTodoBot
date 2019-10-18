const ApiCredentials_DEV = {
    key: "bb73d430d29f4250aaba57710ab5e9c4",
    clientId: "30292",
    clientSecret: "TMuvk0Xbf4tc51hD.gcNgnm2-kuttTgX7SD7Kn7Aoow"
}
const ApiCredentials_PROD = {
    key: "e56bdd8897c8454b92df9ba685493c1d",
    clientId: "30269",
    clientSecret: "XBqoarzKs4J6.NvqKKgmiQ5L96qT7gte-PvCLQe6Vao"
}


const BungieLib = require('./bungie-lib/main.js');

let api_creds = process.env.DEV === '1' ? ApiCredentials_DEV : ApiCredentials_PROD;
// This will load ALL micro-libraries
export const BungieApi = new BungieLib(api_creds, ["user", "destiny2"]);