/** @module Forum */
"use strict"
const Fs       = require( 'fs' );
const MicroLib = require( __dirname + '/../MicroLibrary.js');
const Https    = require( 'https' );
const QueryString = require( 'querystring' );
var Request = null;

class Forum{
	/**
	 * Wraps all Forum endpoints of the Bungie.net API
	 * @constructor
	 * @param { ApiCreds } ApiCreds - An Object containing your API credentials.
	 * @example
	 * let ApiCreds = {
	 *   key : "my_super_secret_api_key",
     *   clientId: "my_client_id",
     *   userAgent : "MyApp/AppVersion AppId/MyAppId (+myProjectUrl;mycontact@email.com)"
	 * }
	 *
	 * let ForumLib = require( '/path/to/Forum.js' );
	 * const Forum = new ForumLib( ApiCreds );
	 */
	constructor( ApiCreds ){
		this.ApiCreds   = ApiCreds;
		/** Object containing all of the Endpoints for this wrapper */
		this.Endpoints = require( __dirname + '/Endpoints.js');
		/**
		 * Object containing all of the enumerations for this wrapper
		 * @see module:Forum/Enum
		 */
		this.Enums     = require( __dirname + '/Enums.js');
		this.userAgent = ApiCreds.userAgent;
		Request = new MicroLib.Request( ApiCreds );
	}


	/**
	 * Get topics from any forum.
	 * @param { Object } Options - An object containing the data what we need to complete this API call
	 *   @param { string } Options.categoryFilter - Should be one of the values defined in {@link module:Forum/Enum~topicsCategoryFilters CategoryFilter}
	 *   @param { number } Options.group - The group, if any
	 *   @param { number } Options.page - Zero paged number
	 *   @param { string } Options.quickDate - Should be one of the values defined in {@link module:Forum/Enum~topicsQuickDate QuickDate}
	 *   @param { string } Options.sort - Should be one of the names defined in {@link module:ForumEnum~topicsSort}
	 *   @param { number } [Options.pageSize=25] - currently unused
	 *   @param { string } [Options.locales='en'] - Comma separated list of locales posts must match to return in the result list
	 *   @param { string } [Options.tagString=''] - The tags to search, if any
	 * @returns { promise }
	 */
	async getTopicsPaged( Opts ){

		let enumLookups = [
			MicroLib.enumLookup( Opts.categoryFilter, this.Enums.topicsCategoryFilters ),
			MicroLib.enumLookup( Opts.quickDate, this.Enums.topicsQuickDate ),
			MicroLib.enumLookup( Opts.sort, this.Enums.topicsSort )
		]

		let pathParams = {
			page : Opts.page,
			pageSize: Opts.pageSize,
			group : Opts.group,
			sort: Opts.sort,
			quickDate: Opts.quickDate,
			categoryFilter : Opts.categoryFilter
		};

		let queryStrings = {
			locales : Opts.locales,
			tagstring: Opts.tagString
		}

		// Even though page size isn't used in the API, it is used to renderEndpoint the endpoint. so make sure that we have one.
		Opts.pageSize  = ( isNaN( parseInt( Opts.pageSize ) ) ) ? 25 : parseInt( Opts.pageSize );
		Opts.locales   = ( typeof Opts.locales == 'string') ? Opts.locales : 'en';
		Opts.tagString = ( typeof Opts.tagString == 'string' ) ? Opts.tagString : '';

		return Promise.all( enumLookups )
		  .then( () => MicroLib.renderEndpoint( this.Endpoints.getTopicsPaged, PathParams, queryStrings ) )
		  .then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Gets a listing of all topics marked as part of the core group.
	 * @param { Object } Options - The parameters required to fulfill this API request
	 *   @param { string } Options.categoryFilter - Should be one of the values defined in {@link module:Forum/Enum~topicsCategoryFilters CategoryFilter}
	 *   @param { string } Options.quickDate - A valid {@link module:Forum/Enum~topicsQuickDate QuickDate}
	 *   @param { string } Options.sort - Should be one of the values defined in {@link module:Forum/Enum~topicsSort SortOption}
	 *   @param { string } [Options.locales='en'] - A valid locale
	 *   @param { number-like } [Options.page=0] - The zero-based page
	 * @returns { promise }
	 */
	async getCoreTopicsPaged( Opts ){
		// Default values
		Opts.page = ( isNaN( parseInt( Opts.page ) ) ) ? 0 : Opts.page;
		Opts.locales = ( typeof Opts.locales === 'string' ) ? Opts.locales : 'en';

		let QueryStrings = {
			locales : Opts.locales
		}

		// Start doing everything at once
		let enumLookups = [
			MicroLib.enumLookup( Opts.categoryFilter, this.Enums.topicsCategoryFilters ), // 0
			MicroLib.enumLookup( Opts.quickDate, this.Enums.topicsQuickDate ), // 1
			MicroLib.enumLookup( Opts.sort, this.Enums.topicsSort ), // 2
		];

		// Return the promise that Request.get returned to us here
		return Promise.all( enumLookups ).then( enums => {
			let PathParams = {
				page : Opts.page,
				categoryFilter: enums[0],
				quickDate: enums[1],
				sort: enums[2]
			}

			return MicroLib.renderEndpoint( this.Endpoints.getCoreTopicsPaged, PathParams, QueryStrings );

		 }).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Returns a thread of posts at the given parent, optionally returning replies to those posts as well as the original parent.
	 * @param { Object } Options - The parameters required to complete this API call
	 *   @param { number-like } Options.page - The zero-based page number to request
	 *   @param { string } Options.sort - Should be one of the values defined in {@link module:Forum/Enum~topicsSort SortTopic}
	 *   @param { number-like } Options.parentPostId - The parent posts ID
	 *   @param { number-like } Options.replySize -
	 *   @param { number-like } Options.pageSize - The number of results to include in the response
	 *   @param { boolean } [Options.getParentHost=false] - Whether or not to request the parent host thread
	 *   @Param { boolean } [Options.rootThreadMode=false] -
	 *   @param { boolean } [Options.showBanned=false] - Whether or not to include banned threads in the response
	 * @returns { promise }
	 */
	async getPostsThreadedPaged( Opts ){
		// Default values
		Opts.page = isNaN( parseInt( Opts.page ) ) ? 0 : Opts.page;
		Opts.replySize = ( isNaN( parseInt( Opts.replySize ) ) ) ? null : Opts.replySize;
		Opts.getParentPost = ( typeof Opts.getParentHost === 'undefined' ) ? false : Opts.getParentHost;
		Opts.rootThreadMode = ( typeof Opts.rootThreadMode === 'undefined' ) ? false : Opts.rootThreadMode;
		Opts.showBanned = ( typeof Opts.showBanned === 'undefined' ) ? false : Opts.showBanned;

		let PathParams = {
			getParentPost : Opts.getParentPost,
			page : Opts.page,
			pageSize : Opts.pageSize,
			parentPostId : Opts.parentPostId,
			replySize : Opts.replySize,
			rootThreadMode : Opts.rootThreadMode,
		};

		let QueryStrings = {
			showbanned : Opts.showBanned
		};

		return MicroLib.enumLookup( Opts.sort, this.Enums.forumPostSort )
			.then( sortMode => {
				PathParams.sortMode = sortMode;
				return MicroLib.renderEndpoint( this.Endpoints.getPostsThreadedPaged, PathParams, QueryStrings );
			} )
		.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Returns a thread of posts starting at the topicId of the input childPostId, optionally returning replies to those posts as well as the original parent.
	 * @param { Object } Options - The parameters required to complete this API call
	 *   @param { number-like } Options.childPostId - The ID of the child post
	 *   @param { string } Options.sort - Should be one of the values defined in {@link module:Forum/Enum~forumPostSort SortOption}
	 *   @param { number-like } [Options.page=0] - The zero-based page index
	 *   @param { number-like } [Options.pageSize=25] - The number of results per page to return
	 *   @param { number-like } [Options.replySize=64] -
	 *   @param { boolean } [ Options.rootThreadMode=false] -
	 *   @param { boolean } [ Options.showBanned=false] - Whether or not to include banned threads in the result
	 * @returns { Promise }
	 */
	async getPostsThreadedPagedFromChild( Opts ){
		//Default Values
		Opts.page = ( isNaN( parseInt( Opts.page ) ) ) ? 0 : Opts.page;
		Opts.pageSize = ( isNaN( parseInt( Opts.pageSize ) ) ) ? 25 : Opts.pageSize;
		Opts.replySize = ( isNaN( parseInt( Opts.replySize ) ) ) ? 64 : Opts.replySize;
		Opts.rootThreadMode = ( typeof Opts.rootThreadMode === 'undefined' ) ? false : Opts.rootThreadMode;
		Opts.showBanned = ( Opts.showBanned ) ? "" : Opts.showBanned; // If they want to see banned results, then this parameter needs to be blank. SO we convert "true" to blank

		let PathParams = {
			childPostId: Opts.childPostId,
			page: Opts.page,
			pageSize: Opts.pageSize,
			replySize: Opts.replySize,
			rootThreadMode: Opts.rootThreadMode,
		};

		let QueryStrings = {
			showbanned : Opts.showBanned
		};

		MicroLib.enumLookup( Opts.sort, this.Enums.forumPostSort )
			.then( sortMode => {
				PathParams.sortMode = sortMode;
				return MicroLib.render( this.Endpoints.getPostsThreadedFromChild, PathParams, QueryStrings );
			} )
		.then( endpoint => Reqeust.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Returns the post specified and its immediate parent.
	 * @param { number-like } childPostId - The post id that you want the parent for.
	 * @param { boolean } [showBanned=false] - Whether or not to include banned posts in the response
	 * @returns { Promise }
	 */
	async getPostAndParent( childPostId, showBanned = false ){
		Opts.showBanned = ( typeof Opts.showBanned !== 'boolean' ) ? false : Opts.showBanned;
		return MicroLib.renderEndpoint( this.Endpoints.getPostAndParent, { childPostId: Opts.childPostId }, { showBanned : Opts.showBanned } )
		  .then( uri => Request.get( uri ) );
	}

	/**
	 * Returns the post specified and its immediate parent of posts that are awaiting approval.
	 * @param { number-like } childPostId - The post id that you want the parent for.
	 * @param { boolean } [showBanned=false] - Whether or not to include banned posts in the response
	 * @returns { Promise }
	 */
	async getPostAndParentAwaitingApproval( childPostId, showBanned = false ){
		return MicroLib.renderEndpoint( this.Endpoints.getPostAndParentAwaitingApproval, { childPostId: childPostId }, { showBanned : showBanned } )
		  .then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Gets the post Id for the given content item's comments, if it exists.
	 * @param { number-like } contentId - The post Id
	 * @returns { Promise }
	 */
	async getTopicForContent( contentId ){
		return MicroLib.renderEndpoint( this.Endpoints.getTopicForContent, { contentId : contentId })
		  .then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Gets tag suggestions based on partial text entry, matching them with other tags previously used in the forums
	 * @param { string } partialTag - The partial tag input to generate suggestions from
	 * @returns { Promise }
	 */
	async getForumTagSuggestions( partialTag ){
		return MicroLib.renderEndpoint( this.Endpoints.getForumTagSuggestions, {}, { partialtag : partialTag } )
		  .then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Gets the specified forum poll.
	 * @param { number-like } topicId - The partial tag input to generate suggestions from
	 * @returns { Promise }
	 */
	async getPoll( topicId ){
		return MicroLib.renderEndpoint( this.Endpoints.getPoll, { topicId : topicId } )
		  .then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/*
	 * Allows a user to slot themselves into a recruitment thread fireteam slot. Returns the new state of the fireteam.
	 * @param { number-like } topicId - The post id of the recruitment topic you wish to join.
	 * @param { oAuth } oAUth - The oAuthAccess token retrieved from The {@link module:OAuth~OAuth OAuth} library
	 * @returns { Promise }

	async joinFireteamThread( topicId, oAuth ){
		return MicroLib.renderEndpoint( this.Endpoints.joinFireteamThread, { topicId : topicId } )
		  .then( uri => Request.post( this.Endpoints.rootPath + uri, "", oAuth ) );
	}**/

	/*
	 * Allows a user to remove themselves from a recruitment thread fireteam slot. Returns the new state of the fireteam.
	 * @param { number-like } topicId - The post id of the recruitment topic you wish to leave
	 * @param { oAuth } oAuth - The oAuth access token retrieved from the {@link module:OAuth~OAuth OAuth} library
	 * @returns { Promise }

	async leaveFireteamThread( topicId, oAuth ){
		return MicroLib.renderEndpoint( this.Endpoints.leaveFireteamThread , { topicId : topicId } )
		  .then( uri => Request.post( this.Endpoints.rootPath + uri, "", oAuth ) );
	}
	*/

	/*
	 * Allows a recruitment thread owner to kick a join user from the fireteam. Returns the new state of the fireteam.
	 * @param { number-like } topicId - The post id of the recruitment topic you wish to join
	 * @param { number-like } targetMembershipId - The id of the user you wish to kick
	 * @param { oAuth } oAuth - The oAuth access token retrieved from the {@link module:OAuth~OAuth OAuth} library

	async kickBanFireteamApplicant( targetId, topicId, oAuth ){
		return MicroLib.renderEndpoint( this.Endpoints.kickBanFirteamApplicant, { targetMembershipid: targetId, topicId: topicId } )
		  .then( uri => Request.post( this.Endpoints.rootPath + uri, "", oAuth ) );
	}
	*/

	/*
	 * Allows the owner of a fireteam thread to approve all joined members and start a private message conversation with them.
	 * @param { number-like } topicId - The post id of the recruitment topic to approve.
	 * @param { oAuth } oAuth - The oAuth access token retrieved from the {@link module:OAuth~OAuth OAuth} library
	 * @returns { Promise }
	 *
	async approveFireteamThread( topicId, oAuth ){
		return MicroLib.renderEndpoint( this.Endpoints.approveFireteamThread, { topicId } )
		  .then( uri => Request.post( this.Endpoints.rootPath + uri, "", oAuth ) );
	}
	*/

	/*
	 * Allows the caller to get a list of to 25 recruitment thread summary information objects.
	 * @param { array } arr - The array of recruitment thread summary information objects.
	 * @returns { Promise }
	 *
	async getRecruitmentThreadSummaries( arr, oAuth ){
		return Request.post( this.Endpoints.rootPath + this.Endpoints.getRecruitmentThreadSummaries, arr, oAuth );
	}*/
}

module.exports = Forum;
