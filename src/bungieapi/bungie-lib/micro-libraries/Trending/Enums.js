/** @module Trending/Enum */
"use strict"

const map = require( __dirname + '/../MicroLibrary.js' ).mapEnumSync;

/**
 * The known entity types that you can have returned from Trending.
 * @readonly
 * @enum { string }
 */
const trendingEntryType = {
	NEWS            : 0,
	DESTINYITEM     : 1,
	DESTINYACTIVITY : 2,
	DESTINYRITUAL   : 3,
	SUPPORTARTICLE  : 4,
	CREATION        : 5,
	STREAM          : 6,
	UPDATE          : 7,
	LINK            : 8,
	FORUMTAG        : 9,
	CONTAINER       : 10,
	RELEASE         : 11
};

module.exports = {
	trendingEntryType : map( trendingEntryType )
}