/** @module GroupV2 */
"use strict"
const Ml = require( __dirname + "/../MicroLibrary.js" );
const QueryString = require( 'querystring' );
var Request = null;

class GroupV2 {
	/**
	 * Wraps all of the GroupV2 Bungie.net endpoints
	 * @constructor
	 * @param { ApiCreds } ApiCreds - Your API credentials
	 */
	constructor( ApiCreds ){
		this.ApiCreds = ApiCreds
		this.Enums = require( __dirname + "/Enums.js" );
		this.Endpoints = require( __dirname + "/Endpoints.js" );
		Request = new Ml.Request( ApiCreds );
	}

	/**
	 * Returns a list of all available group avatars for the signed-in user.
	 * @returns { Promise }
	 */
	async getAvailableAvatars(){
		return Request.get( this.Endpoints.rootPath + this.Endpoints.getAvailableAvatars );
	}

	/**
	 * Returns a list of all available group themes.
	 * @returns { Promise }
	 */
	async getAvailableThemes(){
		return Request.get( this.Endpoints.rootPath + this.Endpoints.getAvailableThemes );
	}

	/**
	 * Gets the state of the user's clan invite preferences for a particular membership type - true if they wish to be invited to clans, false otherwise.
	 * @param { BungieMembershipType } type - TheDestiny membership type of the account we wish to access settings
	 * @param { oAuth } oAuth - Your oAuth object.  {@link module:OAuth~OAuth See} for more information
	 * @returns { Promise }
	 */
	async getUserClanInviteSettings( mType, oAuth){
		return Ml.enumLookup( type, this.Enums.bungieMembershipType )
			.then( type => Ml.renderEndpoint( this.Endpoints.getUserClanInviteSetting, { mType } ) )
		.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint , oAuth ) );
	}

	/**
	 * Sets the state of the user's clan invite preferences - true if they wish to be invited to clans, false otherwise.
	 * @param { boolean } allowInvites - True to allow invites of this user to clans, false otherwise.
	 * @param { BungieMembershipType } mType - The Destiny membership ype of linked account we are manipulating
	 * @param { oAuth } oAuth - You oAUth credentials
	 * @returns { Promise }
	 *
	async setUserClanInviteSetting( allowInvites, mType, oAuth ){
		return Ml.enumLookup( mType, this.Enums.bungieMembershipType )
			.then( type => Ml.renderEndpoint( this.Endpoints.setUserClanInviteSetting, { mType, allowInvites } ) )
		.then( endpoint => Request.post( this.Endpoints.rootPath + endpoint , "" , oAuth ) );
	}*/

	/**
	 * Gets groups recommended for you based on the groups to whom those you follow belong.
	 * @param { groupDateRange } createDateRange - Requested range in which to pull recommended groups
	 * @param { groupType } groupType - The type of groups requested
	 * @param { oAuth } oAuth - Your oAuth credentials
	 * @returns { Promise }
	 */
	async getRecommendedGroups( createDateRange, groupType, oAuth ){
		let enums = [
			Ml.enumLookup( createDateRange, this.Enums.groupDateRange ),
			Ml.enumLookup( groupType, this.Enums.groupType )
		];

		return Prormise.all( enums )
			.then( enums => Ml.renderEndpoint( this.Endpoints.getRecommendedGroups, { createDateRange : enums[0], groupType : enums[1] } ) )
			.then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, "", oAuth ) );
	}

	/**
	 * Search for Groups
	 * @param { Object } Options - The options required to complete this API request
	 *   @param { string } Options.name  - The name of the group
	 *   @param { module:GroupV2/Enum~groupType } Options.groupType - The type of group to search for
	 *   @param { module:GroupV2/Enum~groupDateRange } Options.creationDate - The date range of the group
	 *   @param { module:GroupV2/Enum~groupSortBy } Options.sortBy - How to sort the results
	 *   @param { string } Options.requestContinuationToken - UNDOCUMENTED AND UNINTUITIVE. NO IDEA WTF THIS IS.
	 *   @param { number-like } [Options.itemsPerPage=25] Options.itemsPerPage - The number of items to return per page
	 *   @param { number-like } [Options.currentPage=0] Options.currentPage - The page you want to pull
	 *   @param { module:GroupV2/Enum~groupMemberCountFilter } [Options.groupMemberCountFilter=null] - Filter results by how many members the group hasAttribute
	 *   @param { string } [Options.localeFilter=null] - The locale to search withing.
	 *   @param { string } [Options.tagText=null]
	 * @returns { Promise }
	 */
	async groupSearch( Opts ){
		/**
		 * NOTE: GroupQuery, as of Destiny 2, has essentially two totally different and incompatible "modes".
         * If you are querying for a group, you can pass any of the properties below.
		 * If you are querying for a Clan, you MUST NOT pass any of the following properties (they must be null or undefined in your request, not just empty string/default values):
		 *
		 * - groupMemberCountFilter - localeFilter - tagText
		 *
		 * If you pass these, you will get a useless InvalidParameters error.
		 */

		Opts.itemsPerPage = ( isNaN( parseInt( Opts.itemsPerPage ) ) ) ? 25 : Opts.itemsPerPage;
		Opts.currentPage  = ( isNaN( parseInt( Opts.currentPage  ) ) ) ? 0  : Opts.currentPage;

		let enums = [
			Ml.enumLookup( Opts.groupType, this.Enums.groupType ),
			Ml.enumLookup( Opts.creationDate, this.Enums.groupDateRange ),
			Ml.enumLookup( Opts.sortBy, this.Enums.groupSortBy ),
		];

		let Query = {
			name         : Opts.name,
			itemsPerPage : Opts.itemsPerPage,
			currentPage  : Opts.currentPage,
			requestContinuationToken : Opts.requestContinuationToken
		};

		return Promise.all( enums ).then( async enums =>  {
			Query.groupType    = enums[0];
			Query.creationDate = enums[1];
			Query.sortBy       = enums[2];

			// If it's not a clan, set up the three oddball variables
			if( enums[0] !== 'CLAN' ){
				if( typeof Opts.tagText === 'string' ) Query.tagText = Opts.tagText;
				if( typeof Opts.localFilter === 'string') Query.localFilter = Opts.localFilter;
				Query.groupMemberCountFilter = await Ml.enumLookup( Opts.groupMemberCountFilter, this.Enums.groupMemberCountFilter ).catch( e => {} );
			// If it is a clan, set the three oddball variables to null
			} else {
				Query.tagText = null;
				Query.groupMemberCountFilter = null;
				Query.localeFilter = null;
			}
			// The Query has been built, make the request
			return Request.post( this.Endpoints.rootPath + this.Endpoints.groupSearch, Query );
		} );
	}

	/**
	 * Get information about a specific group of the given ID.
	 * @param { number-like } groupId - Requested group's id.
	 * @returns { Promise }
	 */
	getGroup( groupId ){
		return Ml.renderEndpoint( this.Endpoints.getGroup, { groupId } )
			.then( endpoint =>  Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Get information about a specific group with the given name and type.
	 * @param { string } groupName - Exact name of the group to find.
	 * @param { module:GroupV2/Enum~groupType } groupType - Type of group to find.
	 * @returns { Promise }
	 */
	getGroupByName( groupName, groupType ){
		return Ml.enumLookup( groupType, this.Enums.groupType )
			.then( groupType => Ml.renderEndpoint( this.Endpoints.getGroupByName, { groupType, groupName } ) )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Get information about a specific group with the given name and type. The POST version.
	 * @param { string } groupName - Exact name of the group to find.
	 * @param { module:GroupV2/Enum~groupType } groupType - Type of group to find.
	 * @returns { Promise }
	 */
	getGroupByNameV2( groupName, groupType ){
		return Ml.enumLookup( groupType, this.Enums.groupType )
			.then( groupType => Request.post(
				this.Endpoints.rootPath + this.Endpoints.getGroupByNameV2,
				{ groupName, groupType }
			) );
	}

	/**
	 * Gets a list of available optional conversation channels and their settings.
	 * @param { number-like } groupId - Requested group's id
	 * @returns { Promise }
	 */
	getGroupOptionalConversations( groupId ){
		return Ml.renderEndpoint( this.Endpoints.getGroupOptionalConversations, { groupId } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Edits a group.
	 * @param { Object } Options - The various options required by this API call
	 *   @param { string } Options.name -
	 *   @param { string } Options.about -
	 *   @param { string } Options.motto -
	 *   @param { string } Options.theme -
	 *   @param { string } Options.tags -
	 *   @param { boolean } Options.isDefaultPostAlliance -
	 *   @param { boolean } Options.isDefaultPostPublic -
	 *   @param { string } Options.callsign -
	 *   @param { string } Options.locale -
	 *   @param { ?number-like } [Options.avatarImageIndex=null] -
	 *   @param { ?module:GroupV2/Enum~groupType } [Options.groupType=null] - Type of group, either Bungie.net hosted group, or a game services hosted clan.
	 *   @param { ?boolean } [Options.isPublic=null] -
	 *   @param { ?module:GroupV2/Enum~membershipOption } [Options.membershipOption=null] -
	 *   @param { ?boolean } [Options.isPublicTopicAdminOnly=null] -
	 *   @param { ?boolean } [Options.allowChat=null] -
	 *   @param { ?module:GroupV2/Enum~chatSecuritySetting } [Options.chatSecuritySetting=null] -
	 *   @param { ?module:GroupV2/Enum~groupHomepage } [Options.groupHomepage=null] -
	 *   @param { ?boolean } [Options.enableInvitationMessagingForAdmins=null] -
	 *   @param { ?module:GroupV2/Enum~publicity} [Options.defaultPublicity=null] -
	 * @param { oAuth } oAuth - Your oAuth tokens
	 */
	editGroup( Opts, oAuth ){
		// These will either resolve with the correct enumeration string, or return null.( all fields are nullable )
		let enums = [
			Ml.enumLookup( Opts.membershipOption, this.Enums.membershipOption ).catch( e => null ),
			Ml.enumLookup( Opts.chatSecuritySetting, this.Enums.chatSecuritySetting ).catch( e => null ),
			Ml.enumLookup( Opts.groupHomepage, this.Enums.groupHomepage ).catch( e => null ),
			Ml.enumLookup( Opts.platformMembershipType, this.Enums.bungieMembershipType ).catch( e => null ),
			Ml.enumLookup( Opts.groupType, this.Enums.groupType ).catch( e => null )
		];

		// Null any nullable fields that weren't supplied
		Opts.avatarImageIndex = Ml.nullable( Opts.avatarImageIndex );
		Opts.isPublic = Ml.nullable( Opts.isPublic )
		Opts.isPublicTopicAdminOnly = Ml.nullable( Opts.isPublicTopicAdminOnly );
		Opts.allowChat = Ml.nullable( Opts.allowChat );
		Opts.enableInvitationMessagingForAdmins = Ml.nullable( Opts.enableInvitationMessagingForAdmins );

		return  Promise.all( enums )
			.then( enums => {
				Opts.membershipOption = enums[0];
				Opts.chatSecuritySetting = enums[1];
				Opts.groupHomepage = enums[2];
				Opts.platformMembershipType = enums[3];
				Opts.groupType = enums[4];
				return Request.post( this.Endpoints.rootPath + this.Endpoints.createGroup, Opts, oAuth )
			});
	}

	/**
	 * Edit an existing group's clan banner. You must have suitable permissions in the group to perform this operation. All fields are required.
	 * @param { Object } Options - The data required to complete this API call
	 *   @param { number-like } Options.groupId - Group ID of the group to edit
	 *   @param { number-like } Options.decalId -
	 *   @param { number-like } Options.decalColorId -
	 *   @param { number-like } Options.decalBackgroundColorId -
	 *   @param { number-like } Options.gonfalonId -
	 *   @param { number-like } Options.gonfalonColorId -
	 *   @param { number-like } Options.gonfalonDetailId -
	 *   @param { number-like } Options.gonfalonDetailColorId -
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	editClanBanner( Opts, oAuth ){
		return Ml.renderEndpoint( this.Endpoints.editClanBanner, { groupId : Opts.groupId } )
			.then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, {
				decalId                : Opts.decalId,
				decalColorId           : Opts.decalColorId,
				decalBackgroundColorId : Opts.decalBackgroundColorId,
				gonfalonId             : Opts.gonfalonId,
				gonfalonColorId        : Opts.gonfalonColorId,
				gonfalonDetailId       : Opts.gonfalonDetailId,
				gonfalonDetailColorId  : Opts.gonfalonDetailColorId
			}, oAuth ) );
	}

	/**
	 * Edit group options only available to a founder. You must have suitable permissions in the group to perform this operation.
	 * @param { Object } Options - The data required to complete whit API call
	 *   @param { number-like } Options.groupId - Group ID of the group to edit
	 *   @param { ?boolean } [Options.invitePermissionOverride=null] - Minimum Member Level allowed to invite new members to group
	 *   @param { ?boolean } [Options.updateculturePermissionOverride=null] - Minimum Member Level allowed to update group culture
	 *   @param { ?module:GroupV2/Enum~hostGuidedGamePermissionOverride } [Options.hostGuidedGamePermissionOverride=null] - Minimum Member Level allowed to host guided games
	 *   @param { ?boolean } [Options.updateBannerPermissionOverride=null] - Minimum Member Level allowed to update banner
	 *   @param { ?module:GroupV2/Enum~groupMemberLevel } [Options.joinLevel=null] - Level to join a member at when accepting an invite, application, or joining an open clan
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	editFounderOptions ( Opts, oAuth ){
		// Lookup enums and set to NULL on failure. Also render the endpoint while we are at it.
		let enums = [
			Ml.enumLookup( Opts.hostGuidedGamePermissionOverride, this.Enums.hostGuidedGamePermissionOverride ).catch( e => null ),
			Ml.enumLookup( Opts.joinLevel, this.Enums.groupMemberLevel ).catch( e => null),
			Ml.renderEndpoint( this.Endpoints.editFounderOptions, { groupId : Opts.groupId } ).catch( e => null )
		];

		return Promise.all( enums ).then( enums => {
			Opts.hostGuidedGamePermissionOverride = enums[0];
			Opts.joinLevel = enums[1];
			return Request.post( enums[2], {
				JoinLevel                        : Opts.joinLevel ,
				HostGuidedGamePermissionOverride : Opts.hostGuidedGamePermissionOverride,
				InvitePermissionOverride         : Ml.nullable( Opts.invitePermissionOverride ),
				UpdateBannerPermissionOverride   : Ml.nullable( Opts.updateBannerPermissionOverride ),
				UpdateCulturePermissionOverride  : Ml.nullable( Opts.updateCulturePermissionOverride )
			}, oAuth );
		} );
	}

	/**
	 * Add a new optional conversation/chat channel. Requires Admin permissions to the group.
	 * @param { Object } Options - The data required to complete whit API call
	 *   @param { number-like } Options.groupId - Group ID of the group to edit.
	 *   @param { string } Options.chatName -
	 *   @param { module:GroupV2/Enum~chatSecuritySetting } Options.chatSecurity -
	 */
	async addOptionalConversation( Opts, oAuth ){
		// Lookup the ENUM and use "undefined" as the default value
		Opts.chatSecurity = await Ml.enumLookup( Opts.chatSecurity, this.Enums.chatSecuritySetting ).catch( e => "undefined" );
		return ML.renderEndpoint( Opts.groupId, this.Endpoints.addOptionalConversation )
			.then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, {
				chatName     : Opts.chatName,
				chatSecurity : Opts.chatSecurity
			}, oAuth ) );
	}

	/**
	 * Add a new optional conversation/chat channel. Requires Admin permissions to the group.
	 * @param { Object } Options - The data required to complete whit API call
	 *   @param { number-like } Options.groupId - Group ID of the group to edit.
	 *   @param { number-like } Options.conversationId - Conversation Id of the channel being edited.
	 *   @param { string } Options.chatName -
	 *   @param { ?module:GroupV2/Enum~chatSecuritySetting } [Options.chatSecurity=null] -
	 *   @param { ?boolean } [Options.chatEnabled=null] -
	 * @returns { Promise }
	 */
	async editOptionalConversation( Opts, oAuth ){
		// Lookup the ENUM and use "undefined" as the default value
		Opts.chatSecurity = await Ml.enumLookup( Opts.chatSecurity, this.Enums.chatSecuritySetting ).catch( e => null );
		return Ml.renderEndpoint( this.Endpoints.editOptionalConversation, { conversationId: Opts.conversationId, groupId: Opts.groupId } )
			.then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, {
				chatEnabled  : Ml.nullable( Opts.chatEnabled ),
				chatName     : Opts.chatName,
				chatSecurity : Opts.chatSecurity
			}, oAuth ) );
	}

	/**
	 * Get the list of members in a given group.
	 * @param { Object } Options - The data required to complete this API call
	 *   @param { number-like } [Options.currentPage=1] - Page number (starting with 1). Each page has a fixed size of 50 items per page.
	 *   @param { number-like } Options.groupId - The ID og the group
	 *   @param { module:GroupV2/Enum~runtimeGroupMemberType } [Options.memberType="NONE"] -
	 *   @param { string } [Options.nameSearch=""] -
	 * @returns { Promise }
	 */
	async getMembersOfGroup( Opts ){
		// Loookup the Enum
		Opts.memberType = await Ml.enumLookup( Opts.memberType, this.Enums.runtimeGroupMemberType ).catch( e => 'NONE' );
		// Set default value of nameSearch
		Opts.nameSearch = ( typeof Opts.nameSearch === 'string' ) ? Opts.nameSearch : "";
		// Default page is 1
		Opts.currentPage = ( isNaN( parseInt( Opts.currentPage ) ) ) ? 1 : Opts.currentPage;
		return Ml.renderEndpoint(
			this.Endpoints.getMembersOfGroup,                             // Endpoint
			{ currentpage : Opts.currentPage, groupId : Opts.groupId },   // Path Parameters
			{ memberType : Opts.memberType, nameSearch: Opts.nameSearch } // QueryString parameters
		).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) ); // GET request
	}

	/**
	 * Get the list of members in a given group who are of Admin level or higher.
	 * @param { number-like } groupId - The ID of the group
	 * @param { number-like } [currentPage=1] - Page number (starting with 1). Each page has a fixed size of 50 items per page.
	 * @returns { Promise }
	 */
	getAdminsAndFounderOfGroup( groupId, currentPage = 1 ){
		return Ml.renderEndpoint( this.Endpoints.getAdminsAndFounderOfGroup, { groupId, currentPage } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Edit the membership type of a given member. You must have suitable permissions in the group to perform this operation.
	 * @param { Object } Options - The data required to complete this API call
	 *   @param { number-like } groupId - ID of the group to which the member belongs.
	 *   @param { number-like } membershipId - Membership ID to modify.
	 *   @param { module:GruopV2/Enum~bungieMembershipType } membershipType - Membership type of the provide membership ID.
	 *   @param { module:GroupV2/Enum~runtimeGroupMemberType } groupMemberType - New membership type for the specified member.
	 * @param { oAuth } oAuth - You oAuth tokens
	 */
	editGroupMembership( Opts, oAuth ){
		let enums = [
			Ml.enumLookup( this.Enums.bungieMembershipType, Opts.membershipType ),
			Ml.enumLookup( this.Enums.runtimeGroupMemberType, Opts.groupMemberType )
		];

		return Promise.all( enums ).then( enums => {
			Opts.memberType = enums[0];
			Opts.groupMemberType = enums[1];

			return Ml.renderEndpoint( this.Endpoints.editGroupMembership, {
				groupId : Opts.groupId,
				membershipId : Opts.membershipId,
				membershipType : Opts.membershipType,
				memberType : Opts.memberType
			} ).then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, {}, oAuth ) );
		});
	}

	/**
	 * Kick a member from the given group, forcing them to reapply if they wish to re-join the group. You must have suitable permissions in the group to perform this operation.
	 * @param { Object } Options - The data required to complete whit API request.
	 *   @param { number-like } Options.groupId - Group ID to kick the user from.
	 *   @param { number-like } Options.membershipId - Membership ID to kick.
	 *   @param { module:GroupV2/Enum~bungieMembershipType } Options.mType - Membership type of the provided membership ID.
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	async kickMember( Opts, oAuth ){

		Opts.membershipType = await Ml.enumLookup( Opts.membershipType );

		return Ml.renderEndpoint( this.Endpoints.kickMember, {
			groupId : Opts.groupId, membershipId : Opts.membershipId, membershipType : Opts.membershipType
		} ).then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, {}, oAuth ) );
	}

	/**
	 * Bans the requested member from the requested group for the specified period of time.
	 * @param { Object } Options - The data required to complete whit API request.
	 *   @param { number-like } Options.groupId - Group ID that has the member to ban.
	 *   @param { number-like } Options.membershipId - Membership ID of the member to ban from the group.
	 *   @param { module:GroupV2/Enum~bungieMembershipType } Options.mType - Membership type of the provided membership ID.
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	async banMember( Opts, oAuth ){

		Opts.membershipType = await Ml.enumLookup( this.Enums.bungieMembershipType, Opts.membershipType );

		return Ml.renderEndpoint( this.Endpoints.banMember, {
			groupId : Opts.groupId, membershipId : Opts.membershipId, membershipType : Opts.membershipType
		} ).then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, {}, oAuth ) );
	}

	/**
	 * Unbans the requested member, allowing them to re-apply for membership.
	 * @param { Object } Options - The data required to complete whit API request.
	 *   @param { number-like } Options.groupId - Group ID that has the member to ban.
	 *   @param { number-like } Options.membershipId - Membership ID of the member to ban from the group.
	 *   @param { module:GroupV2/Enum~bungieMembershipType } Options.mType - Membership type of the provided membership ID.
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	async unbanMember( Opts, oAuth ){

		Opts.membershipType = await Ml.enumLookup( this.Enums.bungieMembershipType, Opts.membershipType );

		return Ml.renderEndpoint( this.Endpoints.unbanMember, {
			groupId        : Opts.groupId,
			membershipId   : Opts.membershipId,
			membershipType : Opts.membershipType
		} ).then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, {}, oAuth ) );
	}

	/**
	 * Get the list of banned members in a given group. Only accessible to group Admins and above. Not applicable to all groups. Check group features.
	 * @param { number-like } groupId - Group ID whose banned members you are fetching
	 * @param { number-like } [currentPage=1] - Page number (starting with 1). Each page has a fixed size of 50 entries.
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	getBannedMembersOfGroup( currentPage = 1, groupId,  oAuth ){
		return Ml.renderEndpoint( this.Endpoints.getBannedMembersOfGroup, { currentPage, groupId } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint, oAuth ) );
	}

	/**
	 * An administrative method to allow the founder of a group or clan to give up their position to another admin permanently.
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { number-like } Options.founderIdNew - The new founder for this group. Must already be a group admin.
	 *   @param { number-like } Options.groupId - The target group id.
	 *   @param { module:GroupV2/Enum~bungieMembershipType } [Options.mType="NONE"] - Membership type of the provided founderIdNew.
	 * @param{ oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	async abdicateFoundership( Opts, oAuth ){
		Opts.mType = await Ml.enumLookup( Opts.mType, this.Enums.bungieMembershipType );

		return Ml.renderEndpoint( this.Endpoints.abdicateFoundership, {
			founderIdNew   : Opts.founderIdNew,
			groupId        : Opts.groupId,
			membershipType : Opts.mType
		} ).then( endpoint => Request.post( this.Endpoints.rootPath + endpoint , {}, oAuth ) );
	}

	/*
	 * Request permission to join the given group.
	 * @param { number-like } groupId - ID of the group you would like to join.
	 * @param { module:GroupV2/Enum~bungieMembershipType } mType -
	 * @param { string } message - The message to include in the request
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 *
	async requestGroupMembership( groupId, mType, message, oAuth ){
		mType = await Ml.enumLookup( Opts.mType, this.Enums.bungieMembershipType );

		return Ml.renderEndpoint( this.Endpoints.requestGroupMembership, { groupId, membershipType } )
			.then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, { message }, oAuth ) );
	}
	*/

	/**
	 * Get the list of users who are awaiting a decision on their application to join a given group. Modified to include application info.
	 * @param { number-like } currentPage - Page number (starting with 1). Each page has a fixed size of 50 items per page.
	 * @param { number-like } groupId - ID of the group.
	 * @returns { Promise }
	 */
	getPendingMemberships( currentPage, groupId, oAuth ){
		return Ml.renderEndpoint( this.Endpoints.getPendingMemberships, { currentpage : currentPage, groupId : groupId } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint, oAuth ) );
	}

	/**
	 * Get the list of users who have been invited into the group.
	 * @param { number-like } currentPage - Page number (starting with 1). Each page has a fixed size of 50 items per page.
	 * @param { number-like } groupId - ID of the group
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	getInvitedIndividuals( currentPage, groupId, oAuth ){
		return Ml.renderEndpoint( this.Endpoints.getInvitedIndividuals, { currentpage: currentPage, groupId : groupId } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint, oAuth ) );
	}

	/**
	 * Approve all of the pending users for the given group.
	 * @param { number-like } groupId - ID of the group
	 * @param { string } message - The message to include with yoru approval
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	approveAllPending( groupId, message, oAuth ){
		return Ml.renderEndpoint( this.Endpoints.approveAllPending, { groupId } )
			.then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, { message }, oAuth) )
	}

	/**
	 * Deny all of the pending users for the given group.
	 * @param { number-like } groupId - ID of the group
	 * @param { string } message - The message to include with yoru approval
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	denyAllPending( groupId, message, oAuth ){
		return Ml.renderEndpoint( this.Endpoints.denyAllPending, { groupId } )
			.then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, { message }, oAuth) )
	}

	/**
	 * Approve all of the pending users for the given group.
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { number-like } Options.groupId - ID of the group.
	 *   @param { Array.<UserMembership> } Options.memberships - An array of memberships to approve
	 *   @returns { Promise }
	 */
	async approvePendingForList( Opts, oAuth ){
		let enums = [];

		// Make sure that each membership has a valid {@link module:GroupV2/Enum~bungieMembershipType BungieMembershipType}
		Opts.memberships.forEach( ( m, i ) => {
			enums.push( Ml.enumLookup( m.membershipType, this.Enums.bungieMembershipType ) );
		} );

		return Promise.all( enums ).then( enums => {
			enums.forEach( ( mType, i ) => {
				Opts.memberships[ i ].membershipType = mType;
			} );

			return Ml.renderEndpoint( Opts.groupId, this.Endpoints.approvePendingForList )
			.then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, {
				memberships : Opts.memberships,
				message     : message
			}, oAuth ) );
		} );
	}

	/**
	 * Approve the given membershipId to join the group/clan as long as they have applied.
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { number-like } Options.groupId - ID of the group
	 *   @param { number-like } Options.membershipId - The membership id being approved.
	 *   @param { module:GroupV2/Enum~bungieMembershipType } mType - Membership type of the supplied membership ID.
	 *   @param { string } [Options.message=""] - The message to include with your approval
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	async approvePending( Opts, oAuth ){
		 Opts.mType   = await Ml.enumLookup( Opts.mType, this.Enums.bungieMembershipType );
		 Opts.message = ( typeof Opts.message === 'string' ) ? Opts.message : '';

		 return Ml.renderEndpoint( this.Endpoints.approvePending, {
			 groupId        : Opts.groupId,
			 membershipId   : Opts.membershipId,
			 membershipType : Opts.mType
		 } ).then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, { message : Opts.message }, oAuth ) );
	}

	/**
	 * Deny all of the pending users for the given group.
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { number-like } Options.groupId - ID of the group.
	 *   @param { Array.<UserMembership> } Options.memberships - An array of memberships to approve
	 *   @returns { Promise }
	 */
	async denyPendingForList( Opts, oAuth ){
		let enums = [];

		// Make sure that each membership has a valid {@link module:GroupV2/Enum~bungieMembershipType BungieMembershipType}
		Opts.memberships.forEach( ( m, i ) => {
			enums.push( Ml.enumLookup( m.membershipType, this.Enums.bungieMembershipType ) );
		} );

		return Promise.all( enums ).then( enums => {
			enums.forEach( ( mType, i ) => {
				Opts.memberships[ i ].membershipType = mType;
			} );

			return Ml.renderEndpoint( Opts.groupId, this.Endpoints.denyPendingForList )
			.then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, {
				memberships : Opts.memberships,
				message     : message
			}, oAuth ) );
		} );
	}

	/**
	 * Get information about the groups that a given member has joined.
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { module:GroupV2/Enum~groupsForMemberFilter } Options.filter - Type of group the supplied member founded.
	 *   @param { module:GroupV2/Enum~groupType } Options.groupType - Membership ID to for which to find founded groups.
	 *   @param { module:GroupV2/Enum~bungieMembershipType } Options.mType - Membership type of the supplied membership ID.
	 * @returns { Promise }
	 */
	getGroupsForMember( Opts ){
		let enums = [
			Ml.enumLookup( Opts.filter, this.Enums.groupsForMemberFilter ),
			Ml.enumLookup( Opts.groupType, this.Enums.groupType ),
			Ml.enumLookup( Opts.mType, this.Enums.bungieMembershipType )
		];

		return Promise.all( enums ).then( enums => {
			Opts.filter         = enums[0];
			Opts.groupType      = enums[1];
			Opts.membershipType = enums[2];

			return Ml.renderEndpoint( this.Endpoints.getGroupsForMember, {
				filter         : Opts.filter,
				groupType      : Opts.groupType,
				membershipId   : Opts.membershipId,
				membershipType : Opts.mType
			} ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
		} );
	}

	/**
	 * Get information about the groups that a given member has applied to or been invited to.
	 * @param { Object } Options - The data required to completed this API request
	 *   @param { module:GroupV2/Enum~groupPotentialMemberStatus } Options.filter - Filter apply to list of potential joined groups.
	 *   @param { module:GroupV2/Enum~groupType } Options.groupType - Type of group the supplied member applied.
	 *   @param { number-like } Options.membershipId - Membership ID to for which to find applied groups.
	 *   @param { module:GroupV2/Enum~bungieMembershipType } mType - Membership type of the supplied membership ID.
	 * @returns{ Promise }
	 */
	getPotentialGroupsForMember( Opts ){
		let enums = [
			Ml.enumLookup( Opts.mType, this.Enums.bungieMembershipType ),
			Ml.enumLookup( Opts.groupType, this.Enums.groupType ),
			Ml.enumLookup( Opts.filter, this.Enums.groupPotentialMemberStatus )
		];

		return Promise.all( enums ).then( enums => {
			Opts.mType                      = enums[0];
			Opts.groupType                  = enums[1];
			Opts.groupPotentialMemberStatus = enums[2];

			return Ml.renderEndpoint( this.Endpoints.getPotentialGroupsForMember, {
				filter         : Opts.filter,
				groupType      : Opts.groupType,
				membershipId   : Opts.membershipId,
				membershipType : Opts.mType
			} ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
		} );
	}

	/**
	 * Invite a user to join this group
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { number-like } Options.groupId - ID of the group you would like to join.
	 *   @param { number-like } Options.membershipId - Membership id of the account being invited.
	 *   @param { module:GroupV2/Enum~bungieMembershipType } Options.mType - MembershipType of the account being invited.
	 *   @param { string } Options.message - The message to send with your invite
	 * @param { oAuth } oAuth - Your oAuth tokens
	 */
	async individualGroupInvite( Opts, oAuth ){
		Opts.mType = Ml.enumLookup( Opts.mType, this.Enums.bungieMembershipType );

		return Ml.renderEndpoint( this.Endpoints.individualGroupInvite, {
			groupId        : Opts.groupId,
			membershipId   : Opts.membershipId,
			membershipType : Opts.membershipType
		} ).then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, {
			message : Opts.message
		}, oAuth ) );
	}

	/**
	 * Cancel a users Invite to join this group
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { number-like } Options.groupId - ID of the group you would like to join.
	 *   @param { number-like } Options.membershipId - Membership id of the account being invited.
	 *   @param { module:GroupV2/Enum~bungieMembershipType } Options.mType - MembershipType of the account being invited.
	 *   @param { string } Options.message - The message to send with your invite
	 * @param { oAuth } oAuth - Your oAuth tokens
	 */
	async individualGroupInviteCancel( Opts, oAuth ){
		Opts.mType = Ml.enumLookup( Opts.mType, this.Enums.bungieMembershipType );

		return Ml.renderEndpoint( this.Endpoints.individualGroupInviteCancel, {
			groupId        : Opts.groupId,
			membershipId   : Opts.membershipId,
			membershipType : Opts.membershipType
		} ).then( endpoint => Request.post( this.Endpoints.rootPath + endpoint, {}, oAuth ) );
	}
};

module.exports = GroupV2;
