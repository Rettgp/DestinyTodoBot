/** @module CommunityContent */
"use strict"
const Ml = require( __dirname + '/../MicroLibrary.js' );
let Request = null;

class CommunityContent {
	/**
	 * @constructor
	 * @param { ApiCreds } ApiCreds - Your Api Credentials
	 */
	constructor( ApiCreds ){
		this.ApiCreds = ApiCreds;
		Request = new Ml.Request( ApiCreds );
		this.Endpoints = require( __dirname + '/Endpoints.js' );
		this.Enums = require( __dirname + '/Enums.js' );
	}

	/**
	 * Returns community content.
	 * @param { module:Forum/Enum~forumTopicsCategoryFilter } mediaFilter - The type of media to get
	 * @param { number-like } [page=0] - Zero based page
	 * @param { module:Forum/Enum~communityContentSortMode } sort - The sort mode
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_CommunityContent-GetCommunityContent.html#operation_get_CommunityContent-GetCommunityContent | CommunityContent.getCommunityContent } for more information
	 */
	getCommunityContent( mediaFilter, sort, page = 0 ){
		return Ml.renderEndpoint( this.Endpoints.getCommunityContent, { mediaFilter, page, sort } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Returns info about community members who are live streaming.
	 * @param { Object } Opts - The data required to complete this API request
	 *   @param { number-like } [Opts.page=0] - Zero based page
	 *   @param { module:CommunityContent/Enum~partnershipType } - Options.partnershipType - The type of partnership for which the status should be returned.
	 *   @param { number-like } Options.modeHash - The hash of the Activity Mode for which streams should be retrieved. Don't pass it in or pass 0 to not filter by mode.
	 *   @param { string } Options.locale - The locale for streams you'd like to see. Don't pass this to fall back on your BNet locale. Pass 'ALL' to not filter by locale.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_CommunityContent-GetCommunityLiveStatuses.html#operation_get_CommunityContent-GetCommunityLiveStatuses | CommunityContent.getCommunityLiveStatuses } for more information
	 */
	getCommunityLiveStatuses( Opts ){
		Opts.page = ( isNaN( parseInt( Opts.page ) ) ) ? 0 : Opts.page;
		return Promise.all( [

			Ml.enumLookup( Opts.partnershipType, this.Enums.partnershipType ),
			Ml.enumLookup( Opts.sort, this.Enums.communityStatusSort )

		] ).then( enums => {

			Opts.partnershipType = enums[ 0 ];
			Opts.sort = enums[ 1 ];

			return Ml.renderEndpoint( this.Endpoints.getCommunityLiveStatuses, {
				// Path params
				page            : Opts.page,
				partnershipType : Opts.partnershipType,
				sort            : Opts.sort
			}, {
				// Query params
				modeHash     : ( isNaN( parseInt( Opts.modeHash ) ) ) ? 0 : Opts.modeHash,
				streamLocale : ( typeof Opts.locale !=='string' ) ? "ALL" : Opts.streamLocale
			});

		}).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Returns info about community members who are live streaming in your clans.
	 * @param { module:CommunityContent/Enum~partnershipType } partnershipType - The type of partnership for which the status should be returned.
	 * @param { module:CommunityContent/Enum~communityStatusSort } sort - The sort mode
	 * @param { number-like } [page=0] - Zero based page
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_CommunityContent-GetCommunityLiveStatusesForClanmates.html#operation_get_CommunityContent-GetCommunityLiveStatusesForClanmates | CommunityContent.getCommunityLiveStatusesForClanmates } for more information
	 */
	getCommunityLiveStatusesForClanmates( partnershipType, sort, page = 0 ){
		return Promise.all( [
			Ml.enumLookup( partnershipType, this.Enums.partnershipType ),
			Ml.enumLookup( sort, this.Enums.communityStatusSort )
		] ).then( enums => {
			partnershipType = enums[ 0 ];
			sort = enums[ 1 ];
			return Ml.renderEndpoint( this.Endpoints.getCommunityLiveStatusesForClanmates, { page, partnershipType, sort } )
		} ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Returns info about community members who are live streaming among your friends.
	 * @param { module:CommunityContent/Enum~partnershipType } partnershipType - The type of partnership for which the status should be returned.
	 * @param { module:CommunityContent/Enum~communityStatusSort } sort - The sort mode
	 * @param { number-like } [page=0] - Zero based page
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_CommunityContent-GetCommunityLiveStatusesForFriends.html#operation_get_CommunityContent-GetCommunityLiveStatusesForFriends | CommunityContent.getCommunityLiveStatusesForFriends } for more information
	 */
	getCommunityLiveStatusesForFriends( partnershipType, sort, page = 0 ){
		return Promise.all( [
			Ml.enumLookup( partnershipType, this.Enums.partnershipType ),
			Ml.enumLookup( sort, this.Enums.communityStatusSort )
		] ).then( enums => {
			partnershipType = enums[ 0 ];
			sort = enums[ 1 ];

			return Ml.renderEndpoint( this.Endpoints.getCommunityLiveStatusesForFriends, { page, partnershipType, sort } )
		} ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Returns info about Featured live streams.
	 * @param { module:CommunityContent/Enum~partnershipType } partnershipType - The type of partnership for which the status should be returned.
	 * @param { module:CommunityContent/Enum~communityStatusSort } sort - The sort mode
	 * @param { number-like } [page=0] - Zero based page
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_CommunityContent-GetFeaturedCommunityLiveStatuses.html#operation_get_CommunityContent-GetFeaturedCommunityLiveStatuses | CommunityContent.getFeaturedCommunityLiveStatuses } for more information
	 */
	getFeaturedCommunityLiveStatuses ( partnershipType, sort, page = 0 ){
		return Promise.all( [
			Ml.enumLookup( partnershipType, this.Enums.partnershipType ),
			Ml.enumLookup( sort, this.Enums.communityStatusSort )
		] ).then( enums => {
			partnershipType = enums[ 0 ];
			sort = enums[ 1 ];

			return Ml.renderEndpoint( this.Endpoints.getFeaturedCommunityLiveStatuses, { page, partnershipType, sort } )
		} ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Gets the Live Streaming status of a particular Account and Membership Type.
	 * @param { number-like } membershipId - The membershipId related to that type.
	 * @param { module:CommunityContent/Enum~bungieMembershipType } membershipType - The type of account for which info will be extracted.
	 * @param { module:CommunityContent/Enum~partnershipType  } partnershipType - The type of partnership for which info will be extracted.
	 * @returns { Promise }
	 * @see {@link https://bungie-net.github.io/multi/operation_get_CommunityContent-GetStreamingStatusForMember.html#operation_get_CommunityContent-GetStreamingStatusForMember|CommunityContent.getStreamingStatusForMember }
	 */
	getStreamingStatusForMember( membershipId, membershipType, partnershipType ){
		return Promise.all( [
			Ml.enumLookup( membershipType, this.Enums.bungieMembershipType ),
			Ml.enumLookup( partnershipType, this.Enums.partnershipType )
		] ).then( enums => {
			membershipType = enums[ 0 ];
			partnershipType = enums[ 1 ];
			return Ml.renderEndpoint( this.Endpoints.getStreamingStatusForMember, { membershipId, membershipType, partnershipType } );
		} ).then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

}

module.exports = CommunityContent
