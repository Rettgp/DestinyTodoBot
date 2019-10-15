/** @module Destiny2/Endpoint */
"use strict"

/** An object containing all of the Destiny 2 endpoints */
const endpoints = {
	/** The starting path for all requests */
	rootrootPath : "https://www.bungie.net",
	/** The starting path for all requests */
	rootPath : "https://www.bungie.net/Platform",
	/** Returns the current version of the manifest as a json object. */
	getDestinyManifest : "/Destiny2/Manifest/",
	/** Returns the static definition of an entity of the given Type and hash identifier. Examine the API Documentation for the Type Names of entities that have their own definitions. Note that the return type will always *inherit from* DestinyDefinition, but the specific type returned will be the requested entity type if it can be found. Please don't use this as a chatty alternative to the Manifest database if you require large sets of data, but for simple and one-off accesses this should be handy. */
	getDestinyEntityDefinition : "/Destiny2/Manifest/{entityType}/{hashIdentifier}/",
	/** Returns a list of Destiny memberships given a full Gamertag or PSN ID. */
	searchDestinyPlayer : "/Destiny2/SearchDestinyPlayer/{membershipType}/{displayName}/",
	/** Returns a summary information about all profiles linked to the requesting membership type/membership ID that have valid Destiny information. The passed-in Membership Type/Membership ID may be a Bungie.Net membership or a Destiny membership. It only returns the minimal amount of data to begin making more substantive requests, but will hopefully serve as a useful alternative to UserServices for people who just care about Destiny data. Note that it will only return linked accounts whose linkages you are allowed to view. */
	getLinkedProfiles : "/Destiny2/{membershipType}/Profile/{membershipId}/LinkedProfiles/",
	/** Returns Destiny Profile information for the supplied membership. */
	getProfile : "/Destiny2/{membershipType}/Profile/{membershipId}/",
	/** Returns character information for the supplied character. */
	getCharacter : "/Destiny2/{membershipType}/Profile/{membershipId}/Character/{characterId}/",
	/** Returns information on the weekly clan rewards and if the clan has earned them or not. Note that this will always report rewards as not redeemed. */
	getClanWeeklyRewardState : "/Destiny2/Clan/{groupId}/WeeklyRewardState/",
	/** Retrieve the details of an instanced Destiny Item. An instanced Destiny item is one with an ItemInstanceId. Non-instanced items, such as materials, have no useful instance-specific details and thus are not queryable here. */
	getItem : "/Destiny2/{membershipType}/Profile/{membershipId}/Item/{itemInstanceId}/",
	/** Get currently available vendors from the list of vendors that can possibly have rotating inventory. Note that this does not include things like preview vendors and vendors-as-kiosks, neither of whom have rotating/dynamic inventories. Use their definitions as-is for those. */
	getVendors : "/Destiny2/{membershipType}/Profile/{membershipId}/Character/{characterId}/Vendors/",
	/** Get the details of a specific Vendor. */
	getVendor : "/Destiny2/{membershipType}/Profile/{membershipId}/Character/{characterId}/Vendors/{vendorHash}/",
	/** Given a Presentation Node that has Collectibles as direct descendants, this will return item details about those descendants in the context of the requesting character. */
	getCollectibleNodeDetails : "/Destiny2/{membershipType}/Profile/{membershipId}/Character/{characterId}/Collectibles/{collectiblePresentationNodeHash}/",
	/** Transfer an item to/from your vault. You must have a valid Destiny account. You must also pass BOTH a reference AND an instance ID if it's an instanced item. itshappening.gif */
	gransferItem : "/Destiny2/Actions/Items/TransferItem/",
	/** Extract an item from the Postmaster, with whatever implications that may entail. You must have a valid Destiny account. You must also pass BOTH a reference AND an instance ID if it's an instanced item.*/
	pullFromPostmaster : "/Destiny2/Actions/Items/PullFromPostmaster/",
	/** Equip an item. You must have a valid Destiny Account, and either be in a social space, in orbit, or offline. */
	equipItem : "/Destiny2/Actions/Items/EquipItem/",
	/** Equip a list of items by itemInstanceIds. You must have a valid Destiny Account, and either be in a social space, in orbit, or offline. Any items not found on your character will be ignored. */
	equipItems : "/Destiny2/Actions/Items/EquipItems/",
	/** Set the Lock State for an instanced item. You must have a valid Destiny Account. */
	setItemLockState : "/Destiny2/Actions/Items/SetLockState/",
	/** Insert a plug into a socketed item. I know how it sounds, but I assure you it's much more G-rated than you might be guessing. We haven't decided yet whether this will be able to insert plugs that have side effects, but if we do it will require special scope permission for an application attempting to do so. You must have a valid Destiny Account, and either be in a social space, in orbit, or offline. Request must include proof of permission for 'InsertPlugs' from the account owner. */
	insertSocketPlug : "/Destiny2/Actions/Items/InsertSocketPlug/",
	/** Gets the available post game carnage report for the activity ID. */
	getPostGameCarnageReport : "/Destiny2/Stats/PostGameCarnageReport/{activityId}/",
	/** Report a player that you met in an activity that was engaging in ToS-violating activities. Both you and the offending player must have played in the activityId passed in. Please use this judiciously and only when you have strong suspicions of violation, pretty please. */
	reportOffensivePostGameCarnageReportPlayer : "/Destiny2/Stats/PostGameCarnageReport/{activityId}/Report/",
	/** Gets historical stats definitions. */
	getHistoricalStatsDefinition : "/Destiny2/Stats/Definition/",
	/** Gets leaderboards with the signed in user's friends and the supplied membershipId as the focus. PREVIEW: This endpoint is still in beta, and may experience rough edges. The schema is in final form, but there may be bugs that prevent desirable operation. */
	getClanLeaderboards : "/Destiny2/Stats/Leaderboards/Clans/{groupId}/",
	/** Gets aggregated stats for a clan using the same categories as the clan leaderboards. PREVIEW: This endpoint is still in beta, and may experience rough edges. The schema is in final form, but there may be bugs that prevent desirable operation. */
	getClanAggregateStats : "/Destiny2/Stats/AggregateClanStats/{groupId}/",
	/** Gets leaderboards with the signed in user's friends and the supplied membershipId as the focus. PREVIEW: This endpoint has not yet been implemented. It is being returned for a preview of future functionality, and for public comment/suggestion/preparation. */
	getLeaderboards : "/Destiny2/{membershipType}/Account/{membershipId}/Stats/Leaderboards/",
	/** Gets leaderboards with the signed in user's friends and the supplied membershipId as the focus. PREVIEW: This endpoint is still in beta, and may experience rough edges. The schema is in final form, but there may be bugs that prevent desirable operation. */
	getLeaderboardsForCharacter : "/Destiny2/Stats/Leaderboards/{membershipType}/{membershipId}/{characterId}/",
	/** Gets a page list of Destiny items. */
	searchDestinyEntities : "/Destiny2/Armory/Search/{type}/{searchTerm}/",
	/** Gets historical stats for indicated character. */
	getHistoricalStats : "/Destiny2/{membershipType}/Account/{membershipId}/Character/{characterId}/Stats/",
	/** Gets aggregate historical stats organized around each character for a given account. */
	getHistoricalStatsForAccount : "/Destiny2/{membershipType}/Account/{membershipId}/Stats/",
	/** Gets activity history stats for indicated character. */
	getActivityHistory : "/Destiny2/{membershipType}/Account/{membershipId}/Character/{characterId}/Stats/Activities/",
	/** Gets details about unique weapon usage, including all exotic weapons. */
	getUniqueWeaponHistory : "/Destiny2/{membershipType}/Account/{membershipId}/Character/{characterId}/Stats/UniqueWeapons/",
	/** Gets all activities the character has participated in together with aggregate statistics for those activities. */
	getDestinyAggregateActivityStats : "/Destiny2/{membershipType}/Account/{membershipId}/Character/{characterId}/Stats/AggregateActivityStats/",
	/** Gets custom localized content for the milestone of the given hash, if it exists. */
	getPublicMilestoneContent : "/Destiny2/Milestones/{milestoneHash}/Content/",
	/** Gets public information about currently available Milestones. */
	getPublicMilestones : "/Destiny2/Milestones/",
	/** Initialize a request to perform an advanced write action. */
	awaInitializeRequest : "/Destiny2/Awa/Initialize/",
	/** Provide the result of the user interaction. Called by the Bungie Destiny App to approve or reject a request. */
	awaProvideAuthorizationResult : "/Destiny2/Awa/AwaProvideAuthorizationResult/",
	/** Returns the action token if user approves the request.*/
	awaGetActionToken : "/Destiny2/Awa/GetActionToken/{correlationId}/"
}

module.exports = endpoints;
