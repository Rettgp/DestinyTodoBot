/** @module Fireteam/Enum */
"use strict"

const map = require( __dirname + '/../MicroLibrary.js' ).mapEnumSync;

/**
 * @readonly
 * @enum { string }
 */
const fireteamActivityType = {
	ALL                : 0,
	RAID               : 1,
	CRUCIBLE           : 2,
	TRIALS             : 3,
	NIGHTFALL          : 4,
	ANYTHING           : 5,
	GAMBIT             : 6,
	BLINDWELL          : 7,
	ESCALATIONPROTOCOL : 8,
	FORGE              : 9,
	description        : "Fireteam activity type"
};

/**
 * @readonly
 * @enum { string }
 */
const fireteamDateRange = {
	ALL             : 0,
	NOW             : 1,
	TWENTYFOURHOURS : 2,
	FORTYEIGHTHOURS : 3,
	THISWEEK        : 4,
	descrition      : "Fireteam date range"
};

/**
 * @readonly
 * @enum { string }
 */
const fireteamPlatform = {
	UNKNOWN      : 0,
	PLAYSTATION4 : 1,
	XBOXONE      : 2,
	BLIZZARD     : 3,
	description  : "Fireteam platform"
};

/**
 * @readonly
 * @enum { string }
 */
const fireteamPublicSearchOption = {
	PUBLICANDPRIVATE : 0,
	PUBLICONLY       : 1,
	PRIVATEONLY      : 2,
	description      : "Fireteam public search option"
};

/**
 * @readonly
 * @enum { string }
 */
const fireteamSlotSearch = {
	NOSLOTRESTRICTION       : 0,
	HASOPENPLAYERSLOTS      : 1,
	HASOPENPLAYERORALTSLOTS : 2,
	description             : "Fireteam slot search"
};

module.exports = {
	fireteamActivityType : map( fireteamActivityType ),
	fireteamDateRange    : map( fireteamDateRange ),
	fireteamPlatform     : map( fireteamPlatform ),
};