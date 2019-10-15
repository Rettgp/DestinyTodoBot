/** @module User/Enum */
"use strict" 
 
const map   = require( __dirname + '/../MicroLibrary.js' ).mapEnumSync;
const debug = require( 'debug' )( 'User/Enum' );
/**
 * @readonly
 * @enum { number } - The types of membership the Accounts system supports. This is the external facing enum used in place of the internal-only Bungie.SharedDefinitions.MembershipType.
 */
const bungieMembershipType = {
	
	/** Use any Bungie membership type */
	"ALL": -1,
	/** Use no Bungie membership type */
	"NONE" : 0,
	/** XBox membership type */
	"TIGERXBOX" : 1,
	/** PlayStation membership type */
	"TIGERPSN" : 2,
	"TIGERSTEAM" : 3,
	/** Blizzard.net membership type */
	"TIGERBLIZZARD" : 4,
	/** Demon membership type */
	"TIGERDEMON" : 10,
	/** Bungienext membership type */
	"BUNGIENEXT" : 254,
	/** 
	 * A short description of this enum table
	 * @type { string }
	 */
	"description" : "Bungie membership type"
}

module.exports = {
	bungieMembershipType: map( bungieMembershipType )
}