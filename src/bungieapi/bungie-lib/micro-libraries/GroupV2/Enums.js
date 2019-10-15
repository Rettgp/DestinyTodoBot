/** @module GroupV2/Enum */
"use strict"

const map   = require( __dirname + '/../MicroLibrary' ).mapEnumSync;
const debug = require( 'debug' )( 'GroupV2/Enum' );

/**
 * @readonly
 * @enum { number } represents the forum category filters
 */
const bungieMembershipType = {
	/** NO fucking clue. They didn't document it. */
	"NONE" : 0,
	/** Obviously a giant killer feline xbox */
	"TIGERXBOX" : 1,
	/** Obviously a giant killer fline play station network */
	"TIGERPSN" : 2,
	/** Obviously a giant killer fline play station network */
	"TIGERSTEAM" : 3,
	/** Obviously a dumb name */
	"TIGERBLIZZARD": 4,
	/** No documentation */
	"TIGERDEMON" : 10,
	/** No documentation */
	"BUNGIENEXT":254,
	/**"All" is only valid for searching capabilities: you need to pass the actual matching BungieMembershipType for any query where you pass a known membershipId.*/
	"ALL" : "-1",
	"description" : "Bungie Membership Type"
};

/**
 * @readonly
 * @enum { number }represents the group date range
 */
const groupDateRange = {
	/** Any range */
	"ALL"       : 0,
	/** In the past 24 hours */
	"PASTDAY"   : 1,
	/** In the past 7 days */
	"PASTWEEK"  : 2,
	/** In the past 30 days */
	"PASTMONTH" : 3,
	/** In the past 365 days */
	"PASTYEAR"  : 4,
	"description" : "Group Date Range"
}

/**
 * @readonly
 * @enum { number } represents the group types
 */
const groupType = {
	/** A General group */
	"GENERAL" : 0,
	/** A clan */
	"CLAN"    : 1,
	"description" : "Group Type"
}

/**
 * @readonly
 * @enum { number } represents group count filter
 */
const groupMemberCountFilter = {
	/** Any group, regardless of number of members */
	"ALL"                   : 0,
	/** Only return groups with between one and ten members, inclusive */
	"ONETOTEN"              : 1,
	/** Only return groups with between eleven and one hundred members, inclusive */
	"ELEVENTOONEHUNDRED"    : 2,
	/** Only return group with more than one hundred members */
	"GREATERTHANONEHUNDRED" : 3,
	"description" : "Group Member Count Filter"
};

/**
 * @readonly
 * @enum { number } represents group sort filter
 */
const groupSortBy = {
	/** Sort by name */
	"NAME"       : 0,
	/** Sory by date */
	"DATE"       : 1,
	/** Sort by popularity */
	"POPULARITY" : 2,
	/** Sort by ID */
	"ID"         : 3
}

/**
 * @readonly
 * @enum { number } represents membership options
 */
const membershipOption = {
	/** Undocumented */
	"REVIEWED"  : 0,
	/** Undocumented */
	"OPEN"      : 1,
	/** Undocumented */
	"CLOSED"    : 2,
	"description" : "Membership Option"
}

/**
 * @readonly
 * @enum { number } represents the chat security setting
 */
const chatSecuritySetting = {
	/** Undocumented */
	"GROUP"  : 0,
	/** Undocumented */
	"ADMINS" : 1,
	"description" : "Chat Secrutiy Setting"
}

/**
 * @readonly
 * @enum { number } represents a group homepge
 */
const groupHomepage = {
	/** Undocumented */
	"WALL"          : 0,
	/** Undocumented */
	"FORUM"         : 1,
	/** Undocumented */
	"ALLIANCEFORUM" : 2,
	"description" : "Group Homepage"
}

/**
 * @readonly
 * @enum { number } represents a publiclity level
 */
const publicity = {
	/** Anyone can join */
	"PUBLIC"   : 0,
	/** Undocumented */
	"ALLIANCE" : 1,
	/** Private group */
	"PRIVATE"  : 2,
	"description" : "Publicity level"
}

/**
 * @readonly
 * @enum { number } represents guided game permission overrides
 */ 
const hostGuidedGamePermissionOverride = {
	"NONE"     : 0,
	"BEGINNER" : 1,
	"MEMBER"   : 2
}

/**
 * @readonly
 * @enum { number } represents the various group member permission levels
 */
const groupMemberLevel = {
	"NONE"          : 0,
	"BEGINNER"      : 1,
	"MEMBER"        : 2,
	"ADMIN"         : 3,
	"ACTINGFOUNDER" : 4,
	"FOUNDER"       : 5
}

/** 
 * @readonly
 * @enum { number } - The member levels used by all V2 Groups API. Individual group types use their own mappings in their native storage (general uses BnetDbGroupMemberType and D2 clans use ClanMemberLevel), but they are all translated to this in the runtime api. These runtime values should NEVER be stored anywhere, so the values can be changed as necessary.
 */
const runtimeGroupMemberType = {
	"NONE"          : 0,
	"BEGINNER"      : 1,
	"MEMBER"        : 2,
	"ADMIN"         : 3,
	"ACTINGFOUNDER" : 4,
	"FOUNDER"       : 5
};

/**
 * @readonly
 * @enum { number } - 
 */
const groupsForMemberFilter = {
	"ALL"        : 0,
	"FOUNDED"    : 1,
	"NONFOUNDED" : 2,
}

/**
 * @readonly
 * @enum { number } - 
 */
const groupPotentialMemberStatus = {
	"NONE"      : 0,
	"APPLICANT" : 1,
	"INVITEE"   : 2,
}

module.exports = {
	bungieMembershipType   : map( bungieMembershipType ),
	groupDateRange         : map( groupDateRange ),
	groupType              : map( groupType ),
	groupSortBy            : map( groupSortBy ),
	membershipOption       : map( membershipOption ),
	chatSecuritySetting    : map( chatSecuritySetting ),
	groupHomepage          : map( groupHomepage ),
	publicity              : map( publicity ),
	groupMemberLevel       : map( groupMemberLevel ),
	runtimeGroupMemberType : map( runtimeGroupMemberType ),
	groupsForMemberFilter  : map( groupsForMemberFilter ),
	groupPotentialMemberStatus : map( groupPotentialMemberStatus ),
	hostGuidedGamePermissionOverride : map( hostGuidedGamePermissionOverride ),
}