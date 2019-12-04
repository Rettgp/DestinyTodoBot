/** @module Destiny2 */
"use strict"
const Ml = require( __dirname + "/../MicroLibrary.js" );
const StreamObject = require('stream-json/streamers/StreamObject');
const Fs = require( 'fs' );
const Util = require( 'util' );
const Path = require( 'path' );
var StringSimilarity = require('string-similarity');
var Request = null;

class Destiny2{
	/**
	 * @param { ApiCreds } ApiCreds - Your API credentials
	 */
	constructor( ApiCreds ){
		this.ApiCreds  = ApiCreds;
		Request        = new Ml.Request( ApiCreds );
		this.Endpoints = require( __dirname + '/Endpoints.js');
		this.Enums     = require( __dirname + '/Enums.js' );
		this.Manifest  = {"en": {}};
		// NOTE: Add all used definitions for manifest here
		this.DefinitionsToLoad = [
			"DestinyInventoryItemDefinition",
			"DestinyClassDefinition",
			"DestinyActivityDefinition",
			"DestinyActivityTypeDefinition",
			"DestinyProgressionDefinition",
		]
	}

	/**
	 * Initializes the specified manifest(s)
	 * @param { Array.string } [languages=['en']] - The languages of manifest that you will need
	 * @returns { Promise }
	 */
	async init( langs = [ 'en' ] ){
		let readDir = Util.promisify( Fs.readdir );
		let proms = [];
		let manifests_dir = __dirname + '/manifests';
		if (!Fs.existsSync(manifests_dir))
		{
			Fs.mkdirSync(manifests_dir);
		}
		return readDir(manifests_dir).then( files => {
			for (let definition of this.DefinitionsToLoad)
			{
				let filename = definition + ".json";
				if(files.includes(filename))
				{
					proms.push( this.loadManifest(definition) );
				}
				else
				{
					proms.push( this.downloadManifest(definition).then( x => proms.push( this.loadManifest(definition) ) ) );
				}
			}

			return Promise.all( proms ).then( x => "Destiny2 initialized" );
		} );
	}

	/**
	 * loads the specified manifest(s) from disk
	 * @param { Array.string } [language=['all']] - The language of manifest to load
	 * @returns { Promise }
	 */
	async loadManifest(definition_name){
		var startPath = __dirname + '/manifests/';
		return new Promise((resolve, reject) =>
		{
			Fs.readFile(Path.join(startPath, definition_name + ".json"), (err, data) =>
			{
				if (err) 
				{
					reject(err);
				}
				this.Manifest["en"][definition_name] = JSON.parse(data);
				resolve(this.Manifest);
			});
		});
	}

	/**
	 * downloads the specified manifest and saves it to the disk as "./manifests/{language}.json"
	 * @param { Array.string } languages - The language of manifest to download
	 * @returns { Promise }
	 * @see {@link https://github.com/vpzed/Destiny2-API-Info/wiki/API-Introduction-Part-3-Manifest|Destiny2 Manifest Intro} for more information
	 */
	async downloadManifest(definition_name){
		let manifestContent = await this.getMeta().then( Meta => Request.get( this.Endpoints.rootrootPath + Meta.Response.jsonWorldComponentContentPaths["en"][definition_name], false ) );
		let path = __dirname + '/manifests/' + definition_name + '.json';
		Fs.writeFileSync( path, JSON.stringify( manifestContent ) );
	}

	/**
	 * downloads the metadata for the current manifest version
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetDestinyManifest.html#operation_get_Destiny2-GetDestinyManifest|Destiny2.GetManifest} for more information
	 */
	async getMeta(){
		return new Promise( ( resolve, reject ) => {

			if( this._Meta === undefined ){
				resolve( Request.get( this.Endpoints.rootPath + this.Endpoints.getDestinyManifest ) ).then( Meta => {
					this._Meta = Meta;
					return Meta;
				} );
			} else {
				resolve( this._Meta );
			}
		} );
	}

	// NOTE: Adding a new definition? Make sure to add it to the this.DefinitionsToLoad
	getManifestItemIcon(itemHash)
	{
		return this.Manifest["en"]["DestinyInventoryItemDefinition"][String(itemHash)]["displayProperties"]["icon"];
	}

	getManifestItemName(itemHash)
	{
		return this.Manifest["en"]["DestinyInventoryItemDefinition"][String(itemHash)]["displayProperties"]["name"];
	}

	getManifestItemTierName(itemHash)
	{
		return this.Manifest["en"]["DestinyInventoryItemDefinition"][String(itemHash)]["inventory"]["tierTypeName"];
	}

	getManifestItemTypeDisplayName(itemHash)
	{
		return this.Manifest["en"]["DestinyInventoryItemDefinition"][String(itemHash)]["itemTypeDisplayName"];
	}

	getManifestClassName(classHash)
	{
		return this.Manifest["en"]["DestinyClassDefinition"][String(classHash)]["displayProperties"]["name"];
	}

	getManifestActivityName(activityHash)
	{
		let activity_def = this.Manifest["en"]["DestinyActivityDefinition"][String(activityHash)];
		if ( activity_def === undefined )
		{
			return "-";
		}

		return activity_def["originalDisplayProperties"]["name"];
	}

	getPerkNameAndIcon(perk_hash)
	{
		let perk_definition = this.Manifest["en"]["DestinyInventoryItemDefinition"];
		let perk = perk_definition[String(perk_hash)];
		let plug = perk.plug;
		if (perk["displayProperties"]["hasIcon"] == true &&
			perk["blacklisted"] == false &&
			plug != null && 
			(!plug.plugCategoryIdentifier.includes("enhancement") &&
			!plug.plugCategoryIdentifier.includes("shader") && 
			!plug.plugCategoryIdentifier.includes("masterwork") && 
			!plug.plugCategoryIdentifier.includes("mod") && 
			!plug.plugCategoryIdentifier.includes("tracker") &&
			!plug.plugCategoryIdentifier.includes("skin")))
		{
			let perk_name_sanitized = "perk_" + 
				perk["displayProperties"]["name"].replace(/ /g, "_").replace(/-/g, "_").toLowerCase();
			let perk_icon_location = "https://www.bungie.net" + perk["displayProperties"]["icon"];
			let perk_info = {
				name: perk_name_sanitized,
				icon: perk_icon_location,
				display: perk["displayProperties"]["name"]
			}
			return perk_info;
		}

		return null;
	}

	getManifestProgressionDisplayProperties(hash)
	{
		return this.Manifest["en"]["DestinyProgressionDefinition"][String(hash)]["displayProperties"];
	}

	getManifestProgressionSteps(hash)
	{
		return this.Manifest["en"]["DestinyProgressionDefinition"][String(hash)]["steps"];
	}

	findActivityMode(activity_string)
	{
		if (activity_string === "0" || activity_string == 0)
		{
			return "";
		}

		return Ml.enumLookupFuzzy(activity_string, this.Enums.destinyActivityModeType);
	}

	expandAcronym(acronym_string)
	{
		const acronyms = [
			["GOS", "Garden of Salvation"],
			["LW", "Last Wish"],
			["SOTP", "Scourge of the Past"],
			["COMP", "Competitive"]
		];
		const acronym_map = new Map(acronyms);

		let upper_case_string = acronym_string.toUpperCase();
		let string_array = upper_case_string.split(" ");
		for (const word of string_array) 
		{
			if (acronym_map.has(word))
			{
				return acronym_map.get(word);
			}
		}

		return acronym_string;
	}

	standardizeActivityString(activity_string)
	{
		// NOTE (Garrett): This may not be perfect. Put a note in here if there is a string that didnt work.
		// What doesnt work?
		//
		let all_manifest_activities = this.Manifest["en"]["DestinyActivityDefinition"];
		let best_rating = 0.0;
		let best_match = "";
		for (let activity_hash in all_manifest_activities)
		{
			if (all_manifest_activities.hasOwnProperty(activity_hash))
			{
				let activity_name = all_manifest_activities[activity_hash]["originalDisplayProperties"]["name"];
				if (activity_name !== undefined)
				{
					let rating = StringSimilarity.compareTwoStrings(
						activity_string.toUpperCase(), activity_name.toUpperCase());
					if (rating > best_rating)
					{
						best_rating = rating;
						best_match = all_manifest_activities[activity_hash];
					}
				}
			}
		}

		if (best_rating > 0.6)
		{
			let activity_type_hash = best_match["activityTypeHash"];
			let activity_type = this.Manifest["en"]["DestinyActivityTypeDefinition"][activity_type_hash]["displayProperties"]["name"];
			return [best_match["originalDisplayProperties"]["name"], activity_type];
		}

		return [activity_string, 0];
	}

	findClosestActivity(activity_string)
	{
		let standardized_activity_string = this.expandAcronym(activity_string);
		return this.standardizeActivityString(standardized_activity_string);
	}

	/**
	 * Returns the static definition of an entity of the given Type and hash identifier. Examine the API Documentation for the Type Names of entities that have their own definitions. Note that the return type will always *inherit from* DestinyDefinition, but the specific type returned will be the requested entity type if it can be found. Please don't use this as a chatty alternative to the Manifest database if you require large sets of data, but for simple and one-off accesses this should be handy.
	 * @param { string } entityType - The type of entity for whom you would like results. These correspond to the entity's definition contract name. For instance, if you are looking for items, this property should be 'DestinyInventoryItemDefinition'. PREVIEW: This endpoint is still in beta, and may experience rough edges. The schema is tentatively in final form, but there may be bugs that prevent desirable operation.
	 * @param { number-like } hashIdentifier - The hash identifier for the specific Entity you want returned.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetDestinyEntityDefinition.html#operation_get_Destiny2-GetDestinyEntityDefinition |Destiny2.GetDestinyEntityDefinition} for more information
	 */
	getDestinyEntityDefinition( entityType, hashIdentifier ){
		return Ml.rendernEndpoint( this.Endpoints.getDestinyEntityDefinition, { entityType, hashIdentifier } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Returns a list of Destiny memberships given a full Gamertag or PSN ID.
	 * @param { string } displayName - The full gamertag or PSN id of the player. Spaces and case are ignored.
	 * @param { module:Destiny2/Enum~bungieMembershipType } [membershipType="all"] - A valid non-BungieNet membership type, or All.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-SearchDestinyPlayer.html#operation_get_Destiny2-SearchDestinyPlayer|Destiny2.SearchDestinyPlayer} for more information
	 */
	searchPlayer( displayName, membershipType = 'ALL' ){
		return Ml.renderEndpoint( this.Endpoints.searchDestinyPlayer, { displayName, membershipType } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Returns a summary information about all profiles linked to the requesting membership type/membership ID that have valid Destiny information. The passed-in Membership Type/Membership ID may be a Bungie.Net membership or a Destiny membership. It only returns the minimal amount of data to begin making more substantive requests, but will hopefully serve as a useful alternative to UserServices for people who just care about Destiny data. Note that it will only return linked accounts whose linkages you are allowed to view.
	 * @param { number-like } membershipId - The ID of the membership whose linked Destiny accounts you want returned. Make sure your membership ID matches its Membership Type: don't pass us a PSN membership ID and the XBox membership type, it's not going to work!
	 * @param { module:Destiny2/Enum~bungieMembershipType } [membershipType="ALL"] - The type for the membership whose linked Destiny accounts you want returned.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetLinkedProfiles.html#operation_get_Destiny2-GetLinkedProfiles|Destiny2.GetLinkedProfiles} for more information
	 */
	getLinkedProfiles( membershipId, membershipType = "ALL" ){
		return Ml.renderEndpoint( this.Endpoints.getLinkedProfiles, { membershipType, membershipId } )
			.then( endpoint => Request.get( this.Endpoints.rootPath  + endpoint ) );
	}

    /**
	 * Returns Destiny Profile information for the supplied membership.
	 * @param { number-like } membershipId - Destiny membership ID
	 * @param { module:Destiny2/Enum~bungieMembershipType } membershipType - A valid non-BungieNet membership typ
	 * @param { Array.<module:Destiny2/Enum~destinyComponentType>} [components="profiles"] - An array of destiny components to return for
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetProfile.html#operation_get_Destiny2-GetProfile|Destiny2.getProfile} for more information
	 */
    getProfile( membershipId, membershipType, components = [ "profiles" ] ){
		let enums = [
			Ml.enumLookup( membershipType, this.Enums.bungieMembershipType )
		];

		components.forEach( comp => {
			enums.push( Ml.enumLookup( comp, this.Enums.destinyComponentType ) );
		} ) ;

	   return Promise.all( enums )
	   		.then( enums => Ml.renderEndpoint( this.Endpoints.getProfile, { membershipId, membershipType : enums[0] }, { components: enums.slice( 1, enums.length ).join( "," ) }, "," ) )
	   		.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
    }

    /**
	 * Returns character information for the supplied character.
	 * @param { Object } Options - The data required to complete this API call
	 *   @param { number-like } Options.characterId - ID of the character.
	 *   @param { number-like } Options.destinymembershipId - Destiny membership ID.
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.mType - A valid non-BungieNet membership type.
	 *   @param { Array.<module:Destiny2/Enum~destinyComponentType> } Options.components - An array of components to return (as strings or numeric values). See the DestinyComponentType enum for valid components to request. You must request at least one component to receive results.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetCharacter.html#operation_get_Destiny2-GetCharacter|Destiny2.GetCharacter} for more information
	 */
    getCharacter( Opts ){
		let proms = [ Ml.enumLookup( Opts.mType, this.Enums.bungieMembershipType ) ];
		// For each component, lookup
		Opts.components.forEach( c => {
			proms.push( Ml.enumLookup( c, this.Enums.destinyComponentType ) );
		} );

		return Promise.all( proms ).then( enums => {

			// Set the proper ENUM values
			Opts.mType = enums[0];
			for( let i = 1; i < enums.length; i++){
				Opts.components[ i - 1] = enums[ i ];
			}

			// Create CSV string
			Opts.components = Opts.components.join( "," );

			return 	Ml.renderEndpoint( this.Endpoints.getCharacter, {
				characterId           : Opts.characterId,
				membershipType : Opts.mType,
				membershipId   : Opts.membershipId
			}, { components : Opts.components } ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
		});
    }

    /**
	 * Returns information on the weekly clan rewards and if the clan has earned them or not. Note that this will always report rewards as not redeemed.
	 * @param { number-like } groupId - A valid group id of clan.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetClanWeeklyRewardState.html#operation_get_Destiny2-GetClanWeeklyRewardState|Destiny2.GetClanWeeklyRewardState} for more information
	 */
	getClanWeeklyRewardState( groupId ){
		return Ml.renderEndpoint( this.Endpoints.getClanWeeklyRewardState, { groupId } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Retrieve the details of an instanced Destiny Item. An instanced Destiny item is one with an ItemInstanceId. Non-instanced items, such as materials, have no useful instance-specific details and thus are not queryable here.
	 * @param { Object } Options - The data required to complete this API call
	 *   @param { number-like } Options.membershipId - The membership ID of the destiny profile.
	 *   @param { number-like } Options.itemInstanceId - The Instance ID of the destiny item.
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.mType - A valid non-BungieNet membership type.
	 *   @param { Array.<module:Destiny2/Enum~destinyComponentType> } Options.components - An array of components to return (as strings or numeric values). See the DestinyComponentType enum for valid components to request. You must request at least one component to receive results.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetItem.html#operation_get_Destiny2-GetItem|Destiny2.GetItem} for more information
	 */
	getItem( Opts ){
		let proms = [ Ml.enumLookup( Opts.mType, this.Enums.bungieMembershipType ) ];
		// For each component, lookup
		Opts.components.forEach( c => {
			proms.push( Ml.enumLookup( c, this.Enums.destinyComponentType ) );
		} );

		return Promise.all( proms ).then( enums => {

			// Set the proper ENUM values
			Opts.mType = enums[ 0 ];
			for( let i = 1; i < enums.length; i++){
				Opts.components[ i - 1] = enums[ i ];
			}

			// Create CSV string
			Opts.components = Opts.components.join( "," );

			return 	Ml.renderEndpoint( this.Endpoints.getItem, {
				characterId           : Opts.characterId,
				membershipType : Opts.mType,
				itemInstanceId   : Opts.itemInstanceId
			}, { components : Opts.components } ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
		});
	}

	/**
	 * Get currently available vendors from the list of vendors that can possibly have rotating inventory. Note that this does not include things like preview vendors and vendors-as-kiosks, neither of whom have rotating/dynamic inventories. Use their definitions as-is for those.
	 * @param { Object } Options - The data required to complete this API call
	 *   @param { number-like } Options.membershipId - The membership ID of the destiny profile.
	 *   @param { number-like } Options.characterId - The Destiny Character ID of the character for whom we're getting vendor info.
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.mType - A valid non-BungieNet membership type.
	 *   @param { Array.<module:Destiny2/Enum~destinyComponentType> } Options.components - An array of components to return (as strings or numeric values). See the DestinyComponentType enum for valid components to request. You must request at least one component to receive results.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetVendors.html#operation_get_Destiny2-GetVendors|Destiny2.GetVendors} for more information
	 */
	getVendors( Opts, oAuth ){
		let proms = [ Ml.enumLookup( Opts.mType, this.Enums.bungieMembershipType ) ];
		// For each component, lookup
		Opts.components.forEach( c => {
			proms.push( Ml.enumLookup( c, this.Enums.destinyComponentType ) );
		} );

		return Promise.all( proms ).then( enums => {

			// Set the proper ENUM values
			Opts.mType = enums[0];
			for( let i = 1; i < enums.length; i++){
				Opts.components[ i - 1] = enums[ i ];
			}

			// Create CSV string
			Opts.components = Opts.components.join( "," );

			return 	Ml.renderEndpoint( this.Endpoints.getVendors, {
				characterId           : Opts.characterId,
				membershipType : Opts.mType,
				membershipId   : Opts.membershipId
			}, { components : Opts.components } ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint, oAuth ) );
		});
	}

	/**
	 * Get the details of a specific Vendor.
	 * @param { Object } Options - The data required to complete this API call
	 *   @param { number-like } Options.membershipId - The membership ID of the destiny profile.
	 *   @param { number-like } Options.characterId - The Destiny Character ID of the character for whom we're getting vendor info.
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.mType - A valid non-BungieNet membership type.
	 *   @param { Array.<module:Destiny2/Enum~destinyComponentType> } Options.components - An array of components to return (as strings or numeric values). See the DestinyComponentType enum for valid components to request. You must request at least one component to receive results.
	 *   @param { number-like } Options.vendorHash - The Hash identifier of the Vendor to be returned.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetVendor.html#operation_get_Destiny2-GetVendor|Destiny2.GetVendor} for more information
	 */
	getVendor( Opts ){
		let proms = [ Ml.enumLookup( Opts.mType, this.Enums.bungieMembershipType ) ];
		// For each component, lookup
		Opts.components.forEach( c => {
			proms.push( Ml.enumLookup( c, this.Enums.destinyComponentType ) );
		} );

		return Promise.all( proms ).then( enums => {

			// Set the proper ENUM values
			Opts.mType = enums[0];
			for( let i = 1; i < enums.length; i++){
				Opts.components[ i - 1] = enums[ i ];
			}

			// Create CSV string
			Opts.components = Opts.components.join( "," );

			return 	Ml.renderEndpoint( this.Endpoints.getVendors, {
				characterId           : Opts.characterId,
				membershipType : Opts.mType,
				membershipId   : Opts.membershipId,
				vendorHash            : Opts.vendorHash
			}, { components : Opts.components } ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
		});
	}

	/**
	 * Transfer an item to/from your vault. You must have a valid Destiny account. You must also pass BOTH a reference AND an instance ID if it's an instanced item. itshappening.gif
	 * @param { Object } Options - the data required to complete this API call
	 *   @param { number-like } Options.itemReferenceHash -
	 *   @param { number-like } Options.stackSize -
	 *   @param { number-like } Options.itemId -
	 *   @param { number-like } Options.characterId -
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.membershipType -
	 *   @param { boolean } [transferToVault=false] -
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_post_Destiny2-TransferItem.html#operation_post_Destiny2-TransferItem|Destiny2.TransferItem} for more information
	 */
	transferItem( Opts, oAuth ){
		Opts.transferToVault = ( typeof Opts.transferToVault !== 'boolean') ? false : Opts.transferToVault;
		return Request.post( this.Endpoints.rootPath + this.Endpoints.transferItem,	Opts, oAuth );
	}

	/**
	 * Extract an item from the Postmaster, with whatever implications that may entail. You must have a valid Destiny account. You must also pass BOTH a reference AND an instance ID if it's an instanced item.
	 * @param { Object } Options - The data required to complete this API call
	 *   @param { number-like } Options.itemReferencehash -
	 *   @param { number-like } Options.stackSize -
	 *   @param { number-like } Options.itemId -
	 *   @param { number-like } Options.characterId -
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.membershipType -
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_post_Destiny2-PullFromPostmaster.html#operation_post_Destiny2-PullFromPostmaster|Destiny2.PullFromPostmaster} for more information
	 */
	pullFromPostmaster( Opts, oAuth ){
		 return Request.post( this.Endpoints.rootPath + this.Endpoints.pullFromPostmaster, Opts );
	}

	/**
	 * Equip an item. You must have a valid Destiny Account, and either be in a social space, in orbit, or offline.
	 * @param { Object } Options - The data required to complete this API call
	 *   @param { number-like } Options.itemId -
	 *   @param { number-like } Options.characterId -
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.membershipType -
	 * @param { oAuth } oAuth - your oAuth tokens
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_post_Destiny2-EquipItem.html#operation_post_Destiny2-EquipItem|Destiny2.EquipItem} for more information
	 */
	equipItem( Opts, oAuth ){
		return Request.post( this.Endpoints.rootPath + this.Endpoints.equipItem, Opts );
	}

	/**
	 * Equip a list of items by itemInstanceIds. You must have a valid Destiny Account, and either be in a social space, in orbit, or offline. Any items not found on your character will be ignored.
	 * @param { Object } Options - The data required to complete this API call
	 *   @param { Array.number-like } Options.itemIds -
	 *   @param { number-like } Options.characterId -
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.membershipType -
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_post_Destiny2-EquipItems.html#operation_post_Destiny2-EquipItems|Destiny2.EquipItems} for more information
	 */
	equipItems( Opts, oAuth ){
		return Request.post( this.Endpoints.rootPath + this.Endponits.equipItems, Opts );
	}

	/**
	 * Set the Lock State for an instanced item. You must have a valid Destiny Account.
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { boolean } Options.state - Whether or not the item is locked
	 *   @param { number-like } Options.itemId -
	 *   @param { number-like } Options.characterId -
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.membershipType
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_post_Destiny2-SetItemLockState.html#operation_post_Destiny2-SetItemLockState|Destiny2.SetItemLockState} for more information
	 */
	setItemLockState( Opts, oAuth ) {
		return Request.pot( this.Endpoints.rootPath + this.Endpoitns.setItmeLockState, Opts );
	}

	/**
	 * Gets the available post game carnage report for the activity ID.
	 * @param { number-like } activityId - The ID of the activity whose PGCR is requested.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetPostGameCarnageReport.html#operation_get_Destiny2-GetPostGameCarnageReport|Destiny2.GetPOstGameCarnageReport} for more information
	 */
	getPostGameCarnageReport( activityId ){
		return Ml.renderEndpoint( this.Endpoints.getPostGameCarnageReport, { activityId } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Report a player that you met in an activity that was engaging in ToS-violating activities. Both you and the offending player must have played in the activityId passed in. Please use this judiciously and only when you have strong suspicions of violation, pretty please.
	 * @param { Object } Options - The Data required to complete this API request
	 *   @param { number-like } Options.activityId - The ID of the activity where you ran into the brigand that you're reporting.
	 *   @param { Array.number-like } Options.reasonCategoryHashes - So you've decided to report someone instead of cursing them and their descendants. Well, okay then. This is the category or categorie(s) of infractions for which you are reporting the user. These are hash identifiers that map to DestinyReportReasonCategoryDefinition entries.
	 *   @param { Array.number-like } Options.reasonHashes - If applicable, provide a more specific reason(s) within the general category of problems provided by the reasonHash. This is also an identifier for a reason. All reasonHashes provided must be children of at least one the reasonCategoryHashes provided.
	 *   @param { number-like } Options.offendingCharacterId - Within the PGCR provided when calling the Reporting endpoint, this should be the character ID of the user that you thought was violating terms of use. They must exist in the PGCR provided.
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_post_Destiny2-ReportOffensivePostGameCarnageReportPlayer.html#operation_post_Destiny2-ReportOffensivePostGameCarnageReportPlayer|Destiny2.ReportOffensivePostGameCarnageReportPlayer} for more information
	 */
	async reportPlayer( Opts, oAuth ){
		/*Opts.reasonCategoryHashes.forEach( reason => {
			if( typeof this.Manifest.en.DestinyReportReasonCategoryDefinition[ reason ] === 'undefined')
		} );*/
	}

	/**
	 * Gets historical stats definitions.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetHistoricalStatsDefinition.html#operation_get_Destiny2-GetHistoricalStatsDefinition|Destiny2.GetHistoricalStatsDefinition}
	 */
	getHistoricalStatsDefinition(){
		return Request.get( this.Endpoints.rootPath + this.Endpoints.getHistoricalStatsDefinition );
	}
	/**
	 * Gets a page list of Destiny items.
	 * @param { string } searchTerm - The string to use when searching for Destiny entities.
	 * @param { string } type - The type of entity for whom you would like results. These correspond to the entity's definition contract name. For instance, if you are looking for items, this property should be 'DestinyInventoryItemDefinition'.
	 * @param { string } [page=0] - Page number to return, starting with 0.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-SearchDestinyEntities.html#operation_get_Destiny2-SearchDestinyEntities|Destiny2.SearchDestinyEntities} for more information
	 */
	searchDestinyEntities( searchTerm, type, page = 0 ){
		return Ml.renderEndpoint( this.Endpoints.searchDestinyEntities, { searchTerm, type }, { page } )
			.then( endpoint => Request.get( this.rootPath + endpoint ) );
	}

	/**
	 * Gets historical stats for indicated character.
	 * @param { Object } Options - THe datat required to complete this API call
	 *   @param { number-like } Options.characterId - The id of the character to retrieve. You can omit this character ID or set it to 0 to get aggregate stats across all characters.
	 *   @param { number-like } Options.membershipId - The Destiny membershipId of the user to retrieve.
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.membershipType - A valid non-BungieNet membership type.
	 *   @param { date-time } Options.dayEnd - Last day to return when daily stats are requested. Use the format YYYY-MM-DD.
	 *   @param { date-time } Options.dayStart - First day to return when daily stats are requested. Use the format YYYY-MM-DD
	 *   @param { Array.<module:Destiny2/Enum~destinyStatsGroupType> } Options.groups - Group of stats to include, otherwise only general stats are returned. Comma separated list is allowed. Values: General, Weapons, Medals
	 *   @param { Array.<module:Destiny2/Enum~destinyActivityModeType> } Options.modes - Game modes to return. See the documentation for DestinyActivityModeType for valid values, and pass in string representation, comma delimited.
	 *   @param { module:Destiny2/Enum~periodType } periodType - Indicates a specific period type to return. Optional. May be: Daily, AllTime, or Activity
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetHistoricalStats.html#operation_get_Destiny2-GetHistoricalStats|Destiny2.GetHistoricalStats} for more information
	 */
	getHistoricalStats( Opts ){
		Opts.modes = ( isNaN( parseInt( Opts.modes ) ) ) ? 0 : Opts.modes;
		return Ml.renderEndpoint( this.Endpoints.getHistoricalStats, {
			// Path params
			characterId         : Opts.characterId,
			membershipType		: Opts.mType,
			membershipId   		: Opts.membershipId
		}, {
			// Query params
			modes  : Opts.modes,
		} ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
		// let groups = [];
		// let modes  = [];
		// Opts.groups.forEach( group => { groups.push( Ml.enumLookup( group, this.Enums.destinyStatsGroupType ) ) } );
		// Opts.modes.forEach( mode => { modes.push( Ml.enumLookup( mode, this.Enums.destinyActivityModeType ) ) } );

		// return Promise.all( [
		// 	// Will be used directly below, use your eyes
		// 	Promise.all( groups ),
		// 	Promise.all( modes ),
		// 	Ml.enumLookup( Opts.periodType, this.Enums.periodType ),
		// 	Ml.enumLookup( Opts.membershipType, this.Enums.membershipType )

		// ] ).then( promises => {
		// 	// Mapped directly above, use your eyes
		// 	Opts.groups         = promises[0].join( "," );// Arrays are CSV strings I guess?
		// 	Opts.modes          = promises[1].join( "," );
		// 	Opts.periodType     = promises[2];
		// 	Opts.membershipType = promises[3];

		// 	return Ml.renderEndpoint( this.Endpoints.getHistoricalStats, {
		// 		characterId         : Opts.characterId,
		// 		membershipId 		: Opts.membershipId,
		// 		membershipType      : Opts.membershipType
		// 	}, {
		// 		dayend     : Opts.dayEnd,
		// 		daystart   : Opts.dayStart,
		// 		groups     : Opts.groups.join( "," ),
		// 		modes      : Opts.modes.join( "," ),
		// 		periodType : Opts.periodType
		// 	} );

		// } ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Gets aggregate historical stats organized around each character for a given account.
	 * @param { number-like } destinyMembershipid - The Destiny membershipId of the user to retrieve.
	 * @param { module:Destiny2/Enum~bungieMembershipType } mType - A valid non-BungieNet membership type.
	 * @param {Array.<module:Destiny2/Enum~destinyStatsGroupType> } groups - Groups of stats to include, otherwise only general stats are returned. Comma separated list is allowed. Values: General, Weapons, Medals.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetHistoricalStatsForAccount.html#operation_get_Destiny2-GetHistoricalStatsForAccount|Destiny2.GetHistoricalStatsForAccount} for more information
	 */
	getHistoricalStatsForAccount( membershipId, mType, groups ){
		let proms = [
			Ml.enumLookup( mType, this.Enums.bungieMembershipType )
		];

		groups.forEach( group => {
			proms.push( Ml.enumLookup( group, this.Enums.destinyStatsGroupType ) ) ;
		} );

		return Promise.all( proms ).then( enums => {

			// Use the string version of the Enum
			mType = enums[0];
			for( let i = 1; i < enums.length; i++ )
				groups[ i - 1 ] = enums[ i ];

			return Ml.renderEndpoint( this.Endpoints.getHistoricalStatsForAccount, {
				// Path params
				membershipId : membershipId,
				membershipType : mType
			}, {
				// Query Params
				groups : groups.join( "," )
			} );
		}).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Gets activity history stats for indicated character.
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { number-like } Options.characterId - The id of the character to retrieve.
	 *   @param { number-like } Options.membershipId - The Destiny membershipId of the user to retrieve.
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.membershipType - A valid non-BungieNet membership type.
	 *   @param { number-like  } Options.count - Number of rows to return
	 *   @param { module:Destiny2/Enum~destinyActivityModeType } Options.mode - A filter for the activity mode to be returned. None returns all activities. See the documentation for DestinyActivityModeType for valid values, and pass in string representation.
	 *   @param { number-like } [Options.page=0] - Page number to return, starting with 0.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetActivityHistory.html#operation_get_Destiny2-GetActivityHistory|Destiny2.GetActivityHistory} for more information
	 */
	getActivityHistory( Opts ){
		Opts.page = ( isNaN( parseInt( Opts.page ) ) ) ? 0 : Opts.page;
		return Ml.renderEndpoint( this.Endpoints.getActivityHistory, {
			// Path params
			characterId         : Opts.characterId,
			membershipId 		: Opts.destinyMembershipId,
			membershipType      : Opts.membershipType
		}, {
			// Query params
			count : Opts.count,
			mode  : Opts.mode,
			page  : Opts.page
		} ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Gets details about unique weapon usage, including all exotic weapons.
	 * @param { number-like } characterId - The id of the character to retrieve.
	 * @param { number-like } membershipId - The Destiny membershipId of the user to retrieve.
	 * @param { module:Destiny2/Enum~bungieMembershipType } membershipTye - A valid non-BungieNet membership type.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetUniqueWeaponHistory.html#operation_get_Destiny2-GetUniqueWeaponHistory|Destiny2.GetUniqueWeaponHistory} for more information
	 */
	getUniqueWeaponHistory( characterId, membershipId, memebershipType ){
		return Ml.renderEndpoint( this.Endpoints.getUniqueWeaponHistory, { characterId, destinymembershipId,membershipType } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Gets all activities the character has participated in together with aggregate statistics for those activities.
	 * @param { number-like } characterId - The id of the character to retrieve.
	 * @param { number-like } membershipId - The Destiny membershipId of the user to retrieve.
	 * @param { module:Destiny2/Enum~bungieMembershipType } membershipTye - A valid non-BungieNet membership type.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetDestinyAggregateActivityStats.html#operation_get_Destiny2-GetDestinyAggregateActivityStats|Destiny2.GetDestinyAggregateActivityStats} for more information
	 */
	getDestinyAggregateActivityStats( characterId, membershipId, membershipType ){
		return Ml.renderEndpoint( this.Endpoints.getDestinyAggregateActivityStats, { characterId, destinymembershipId,membershipType } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Gets custom localized content for the milestone of the given hash, if it exists.
	 * @param { number-like } milestoneHash
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetPublicMilestoneContent.html#operation_get_Destiny2-GetPublicMilestoneContent|Destiny2.GetPublicMilestoneContent} for more information
	 */
	getPublicMilestoneContent( milestoneHash ){
		return Ml.renderEndpoint( this.Endpoints.getDestinyAggregateActivityStats, { milestoneHash } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Gets public information about currently available Milestones.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-GetPublicMilestones.html#operation_get_Destiny2-GetPublicMilestones|Destiny2.GetPublicMilestones} for more information
	 */
	getPublicMilestones(){
		return Request.get( this.Endpoints.rootPath + this.Endpoints.getPublicMilestones() );
	}

	/**
	 * Initialize a request to perform an advanced write action.
	 * @param { Object } Options - The data required to complete this API request
	 *   @param {module:Destiny2/Enum~awaType } Options.type -
	 *   @param { module:Destiny2/Enum~bungieMembershipType } Options.membershipType - Destiny membership type of the account to modify.
	 *   @param { ?number-like } [Options.affectedItemId=null] - Item instance ID the action shall be applied to. This is optional for all but a new AwaType values. Rule of thumb is to provide the item instance ID if one is available.
	 *   @param { ?number-like } [Options.characterId=null] - Destiny character ID, if applicable, that will be affected by the action.
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @see {@link https://bungie-net.github.io/multi/operation_post_Destiny2-AwaInitializeRequest.html#operation_post_Destiny2-AwaInitializeRequest|Destiny2.awaitInitializeRequest} for more information
	 */
	awaitInitializeRequest( Opts, oAuth ){
		return Promise.all( [
			Ml.enumLookup( Opts.type, this.Enums.awaType),
			Ml.enumLookup( Opts.membershipType, this.Enums.bungieMembershipType )
		] ).then( enums => {
			Opts.type          = enums[ 0 ];
			Opts.membershipType = enums[ 1 ];
			return Request.post( this.Endpoitns.rootPath + this.Endpoints.awaitInitializeRequest, Opts, oAuth );
		});
	}

	/**
	 * @param { Object } Options - THe data required to complete this API request
	 *   @param { module:Destiny2/Enum~awaUserSelection } Options.selection - Indication of the selection the user has made (Approving or rejecting the action)
	 *   @param { string } Options.correlationId - Correlation ID of the request
	 *   @param { Array.byte } Options.nonce - Secret nonce received via the PUSH notification.
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_post_Destiny2-AwaProvideAuthorizationResult.html#operation_post_Destiny2-AwaProvideAuthorizationResult|Destiny2.AwaProvideAuthorizationResult} for more information
	 */
	awaProvideAuthorizationResult( Opts, oAuth ){
		return Ml.enumLookup( Opts.selection, this.Enums.awaUserSelection )
			.then( sel => {
				Opts.selection = sel;
				return Request.post( this.Endpoints.rootPath + this.Endpoints.awaProvideAuthorizationResult, Opts, oAuth );
			})
	}

	/**
	 * Returns the action token if user approves the request.
	 * @param { string } correlationId - The identifier for the advanced write action request.
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Destiny2-AwaGetActionToken.html#operation_get_Destiny2-AwaGetActionToken|Destiny2.AwaGetActionToken} for more information
	 */
	awaGetActionToken( correlationId, oAuth ){
		return Ml.renderEndpoint( this.Endpoints.awaGetActionToken, { correlationId } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}
}

module.exports = Destiny2;
