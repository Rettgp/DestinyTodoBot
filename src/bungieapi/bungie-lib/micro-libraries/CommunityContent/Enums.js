/** @module CommunityContent/Enum */
"use strict"

const map = require( __dirname + '/../MicroLibrary.js' ).mapEnumSync;

/**
 * Representing external partners to which BNet users can link accounts, but that are not Account System credentials: partnerships that BNet uses exclusively for data.
 * @readonly
 * @enum { string }
 */
const partnershipType = {
	NONE   : 0,
	/** Partnered with Twitch.tv */
	TWITCH : 1
};

/**
 * @readonly
 * @enum { string }
 */
const communityStatusSort = {
	VIEWERS        : 0,
	TRENDING       : 1,
	OVERALLVIEWERS : 2,
	FOLLOWERS      : 3
};

/**
 * @readonly
 * @enum { string } - The types of membership the Accounts system supports. This is the external facing enum used in place of the internal-only Bungie.SharedDefinitions.MembershipType.
 */
const bungieMembershipType = {
	NONE          : 0,
	TIGERXBOX     : 1,
	TIGERPSN      : 2,
	TIGERSTEAM    : 3,
	TIGERBLIZZARD : 4,
	TIGERDEMON    : 10,
	BUNGIENEXT    : 254,
	ALL           : -1
};

module.exports = {
	bungieMembershipType : map( bungieMembershipType ),
	communityStatusSort  : map( communityStatusSort ),
	partnershipType      : map( partnershipType )
};