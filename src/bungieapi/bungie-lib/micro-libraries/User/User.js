"use strict"
const Fs       = require( 'fs' );
const Https    = require( 'https' );
const MicroLib = require( __dirname + '/../MicroLibrary.js');
var Request  = null; // Gets initiated when the User object is constructed
/**
 * @module User
 */

class User{
	/**
	 * Wraps all User endpoints of the Bungie.net API
	 * @constructor
	 * @param { ApiCreds } ApiCreds - An object containing your API credentials
	 * @example	 
	 * let ApiCreds = {
	 *   key : "my_super_secret_api_key",
     *   clientId: "my_client_id",
     *   userAgent : "MyApp/0.2.3 AppId/MyAppId (+myProjectUrl;mycontact@email.com)"	 
	 * }
	 *
	 * let UserLib = require( '/path/to/User.js' );
	 * let User = new UserLib( ApiCreds );
	 */
	constructor( ApiCreds ){		
		this.ApiCreds  = ApiCreds;
		/** Object containing all of the endpoints for this wrapper */
		this.Endpoints = require( __dirname + '/Endpoints.js' );
		this.userAgent = ApiCreds.userAgent;
		/**
		 * Object containing all of the enumerations for this wrapper
		 * @see module:User/Enum
		 */
		this.Enums     = require( __dirname + '/Enums.js');
		Request = new MicroLib.Request( ApiCreds );
	}
	
	
	/**
	 * Searches for a Bungie.net user. Wraps this endpoint https://bungie-net.github.io/multi/operation_get_User-SearchUsers.html#operation_get_User-SearchUsers
	 * @param { string } search - Contains the data required for this API call
	 * @see {@link https://bungie-net.github.io/multi/operation_get_User-SearchUsers.html#operation_get_User-SearchUsers | User.getSearchUsers} for more information
	 * @example
	 * User.searchUsers( 'some_user_name' ).then( response => {
     *     console.log( Response ); // Do something with the API response
	 * } ).catch( e => {
	 *     // Error handling
	 * } );
	 */
	async searchUsers( search ){
		return Request.get( this.Endpoints.rootPath + this.Endpoints.searchUsers + '?q=' + encodeURI( search ) );
	}
	
	/**
	 * Retrieves information about a user. Wraps this endpoint https://bungie-net.github.io/multi/operation_get_User-GetBungieNetUserById.html#operation_get_User-GetBungieNetUserById
	 * @param { number-like } id - The Bungie.net ID you wish to pull data for
	 * @see {@link https://bungie-net.github.io/multi/operation_get_User-GetBungieNetUserById.html#operation_get_User-GetBungieNetUserById | User.getBungieNetUserById} for more information
	 * @example
	 * User.getBungieNetUserById( "valid_bungie.net_membership_id").then( response => {
     *     console.log( Response ); // Do something with the API response 
	 * }).catch( e => {
	 *     // Error handling
	 * });
	 */
	async getBungieNetUserById( id ){
		let uri  = await MicroLib.renderEndpoint( this.Endpoints.rootPath + this.Endpoints.getBungieNetUserById, { id : id } );
		return Request.get( uri );
	}
	
	/**
	 * Retrieves a list of all available user themes
	 * @see {@link https://bungie-net.github.io/multi/operation_get_User-GetAvailableThemes.html#operation_get_User-GetAvailableThemes | User.getAvailbleThemes} for more information
	 * @example
	 * User.getAvailableThemes().then( response => {
	 *     console.log( response ); // Do something with the API response
	 * } ).catch( e => {
	 *    // Error handling
	 * } );
	 */
	async getAvailableThemes(){
		return Request.get( this.Endpoints.rootPath + this.Endpoints.getAvailableThemes );
	}
	/**
	 * Retrieves a list of accounts associated with the supplied membership ID and membership type. This will include all linked accounts (even when hidden) if supplied credentials permit it.
	 * @param { number-like } id - The membership ID of the target user
	 * @param { module:User/Enum~bungieMembershipType } [type=bungieMembershipType.ALL] - A valid bungieMembershipType. Can be the number value or string.
	 * @returns {Promise}
	 * @see {@link https://bungie-net.github.io/multi/operation_get_User-GetMembershipDataById.html#operation_get_User-GetMembershipDataById | User.getMembershipDataById} for more information
	 * @example
	 * User.getMembershipDataById( { id : "valid_bungie.net_membership_id", type : "membership_type"} ).then( response => {
	 *     console.log( response ); // Do something with the API response
	 * } ).catch( e => {
	 *     // Error handling
	 * } );
	 */
	async getMembershipDataById( id, type = this.Enums.bungieMembershipType.ALL ){
		// Make sure we were given a correctly-enumerated value
		type = await MicroLib.enumLookup( type, this.Enums.bungieMembershipType );
		let uri  = await MicroLib.renderEndpoint( this.Endpoints.getMembershipDataById, { membershipId: id, membershipType: type } )
		return Request.get( this.Endpoints.rootPath + uri );
	}
	
	/**
	 * Retrieves a users linked Partnerships
	 * @param { number-like } id - The Bungie.net account ID  you wish to fetch partnerships for
	 * @see {@link https://bungie-net.github.io/multi/operation_get_User-GetPartnerships.html#operation_get_User-GetPartnerships | User.getPartnerships} for more information
	 * @example
	 * User.getPartnerships( "valid_bungie.net_membershp_id" ).then ( response => {
	 *     console.log( response ); // Do something with the API response
	 * }).catch( e => {
	 *    // Error handling
	 * } );
	 */
	async getPartnerships( id ){
		let uri = await MicroLib.renderEndpoint( this.Endpoints.getPartnerships, { membershipId: id } );
		return Request.get( this.Endpoints.rootPath + uri );
	}
	
	/**
	 * Retrieves the membership data for the currently logged-in user
	 * @see {@link https://bungie-net.github.io/multi/operation_get_User-GetMembershipDataForCurrentUser.html#operation_get_User-GetMembershipDataForCurrentUser | User.getMembershipDataForCurrentUser} for more information
	 * @example
	 * User.getMembershipDataById().then( Response => {
	 *    console.log( Response ); // Do something with the API response
	 * }).catch( e => {
	 *    // Error handling
	 *});
	 */
	async getMembershipDataForCurrentUser( oAuth ){
		return Request.get( this.Endpoints.rootPath + this.Endpoints.getMembershipDataForCurrentUser, oAuth );
	}
}

module.exports = User;