/** @module Fireteam */
"use strict"

const Ml = require( __dirname + '/../MicroLibrary.js' );
var Request = null;

class Fireteam{
	/**
	 * @constructor
	 * @param { ApiCreds } ApiCreds - Your Api Credentials
	 */
	constructor( ApiCreds ){
		this.ApiCreds = ApiCreds;
		Request = new Ml.Request( ApiCreds );
	}

	/**
	 * Gets a count of all active non-public fireteams for the specified clan. Maximum value returned is 25.
	 * @param { number-like } groupId - The group id of the clan
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	getActivePrivateClanFireteamCount( groupId, oAuth ){
		return Ml.renderEndpoint( this.Endpoints.getActivePrivateClanFireteamCount, { groupId} )
			.then( endpoint => Request.get( this.Endpoitns.rootPath + endpoint, oAuth ) );
	}

	/**
	 * Gets a listing of all of this clan's fireteams that are have available slots. Caller is not checked for join criteria so caching is maximized.
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { module:Fireteam/Enum~fireteamActivityType } Options.activityType - The activity type to filter by.
	 *   @param { module:Fireteam/Enum~fireteamDateRange } Options.dateRange - The date range to grab available fireteams.
	 *   @param { number-like } Options.groupId - The group id of the clan.
	 *   @param { module:Fireteam/Enum~fireteamPlatform } Options.platform - The platform filter
	 *   @param { module:Fireteam/Enum~fireteamPublicSearchOption } Options.publicOnly - Determines public/private filtering.
	 *   @param { module:Fireteam/Enum~fireteamSlotSearch} Options.slotFilter - Filters based on available slots
	 *   @param { string } Options.langFilter - An optional language filter
	 *   @param { number-like } [Options.page=0] - Zero based page
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	getAvailableClanFireteams( Opts, oAuth ){
		return Promise.all( [
			Ml.enumLookup( Opts.activityType, this.Enums.fireteamActivityType ),
			Ml.enumLookup( Opts.dateRange, this.Enums.fireteamDateRange ),
			Ml.enumLookup( Opts.platform, this.Enums.fireteamPlatform ),
			Ml.enumLookup( Opts.publicOnly, this.Enums.firteamPublicSearchOption ),
			Ml.enumLookup( Opts.slotFilter, this.Enums.fireteamSlotSearch )
		] ).then( enums => {
			Opts.activityType = enums[ 0 ];
			Opts.dateRange    = enums[ 1 ];
			Opts.platform     = enums[ 2 ];
			Opts.publicOnly   = enums[ 3 ];
			Opts.slotFilter   = enums[ 4 ];
			Opts.page         = ( isNaN( parseInt( Opts.page ) ) ) ? 0 : Opts.page;

			return Ml.renderEndpoint( this.Endpoints.getAvailableClanFireteams,{
				activityType : Opts.activityType,
				dateRange    : Opts.dateRange,
				groupId      : Opts.groupId,
				page         : Opts.page,
				platform     : Opts.platform,
				publicOnly   : Opts.publicOnly,
				slotFilter   : Opts.slotFilter
			}, {
				langFilter   : ( typeof Opts.langFilter !== 'string' ) ? "" : Opts.langFilter
			} );
		} ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint, oAuth ) );
	}

	/**
	 * Gets a listing of all public fireteams starting now with open slots. Caller is not checked for join criteria so caching is maximized.
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { module:Fireteam/Enum~fireteamActivityType } Options.activityType - The activity type to filter by.
	 *   @param { module:Fireteam/Enum~fireteamDateRange } Options.dateRange - The date range to grab available fireteams.
	 *   @param { module:Fireteam/Enum~fireteamPlatform } Options.platform - The platform filter.
	 *   @param { module:Fireteam/Enum~fireteamSlotSearch } Options.slotFilter - Filters based on available slots
	 *   @param { string } Options.langFilter - An optional language filter
	 *   @param { number-like } [Options.page=0] - Zero based page
	 */
	searchPublicAvailableClanFireteams( Opts, oAuth ){
		return Promise.all( [
			Ml.enumLookup( Opts.activityType, this.Enums.fireteamActivityType ),
			Ml.enumLookup( Opts.dateRange, this.Enums.fireteamDateRange ),
			Ml.enumLookup( Opts.platform, this.Enums.fireteamPlatform ),
			Ml.enumLookup( Opts.slotFilter, this.Enums.fireteamSlotSearch )
		] ).then( enums => {
			Opts.activityType = enums[ 0 ];
			Opts.dateRange    = enums[ 1 ];
			Opts.platform     = enums[ 2 ];
			Opts.slotFilter   = enums[ 3 ];
			Opts.page         = ( isNaN( parseInt( Opts.page ) ) ) ? 0 : Opts.page;

			return Ml.renderEndpoint( this.Endpoints.searchPublicAvailableClanFireteams,{
				activityType : Opts.activityType,
				dateRange    : Opts.dateRange,
				groupId      : Opts.groupId,
				page         : Opts.page,
				platform     : Opts.platform,
				slotFilter   : Opts.slotFilter
			}, {
				langFilter   : ( typeof Opts.langFilter !== 'string' ) ? "" : Opts.langFilter
			} );
		} ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint, oAuth ) );
	}

	/**
	 * Gets a listing of all clan fireteams that caller is an applicant, a member, or an alternate of.
	 * @param { Object } Options - The data required to complete this API request
	 *   @param { number-like } Options.groupId - The group id of the clan. (This parameter is ignored unless the optional query parameter groupFilter is true).
	 *   @param { boolean } Options.includeClosed - If true, return fireteams that have been closed.
	 *   @param { module:Fireteam/Enum~fireteamPlatform} Options.fireteamPlatform - The platform filter.
	 *   @param { boolean } Options.groupFilter - If true, filter by clan. Otherwise, ignore the clan and show all of the user's fireteams.
	 *   @param { string } Options.langFilter - An optional language filter.
	 *   @param { number-like } [Options.page=0] - Deprecated parameter, ignored.
	 * @param { oAuth } oAuth - Your oAuth tokens
	 * @returns { Promise }
	 */
	getMyClanFireteams( Opts, oAuth ){
		return Ml.enumLookup( Opts.fireteamPlatform, this.Enums.fireteamPlatform )
		.then( platform => Ml.renderEndpoint( this.Endpoints.getMyClanFireteams, {
			// Path params
			groupId      : Opts.groupId,
			includClosed : Opts.includeClosed,
			page         : Opts.page,
			platform     : platform
		}, {
			// Query params
			groupFilter : Opts.groupFilter,
			langFilter  : Opts.langFilter
		} ) ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint, oAuth ) );
	}

	/**
	 * Gets a specific clan fireteam.
	 * @param { number-like } fireteamId - The unique id of the fireteam
	 * @param { number-like } groupId - The group id of the clan
	 * @param { oAuth } oAuth - Your oAuth tokens
	 */
	getClanFireteam( fireteamId, groupId, oAuth ){
		return Ml.renderEndpoint( this.Endpoints.getClanFireteam, { fireteamId, groupId } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}
}

module.exports = Fireteam;
