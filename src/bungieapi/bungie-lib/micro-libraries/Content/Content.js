"use strict"
const Fs       = require( 'fs' );
const Https    = require( 'https' );
const MicroLib = require( __dirname + '/../MicroLibrary.js');
var Request = null;
/**
 * @module Content
 */

class Content{
	/**
	 * Wraps the Content endpoints of the Bungie.net API
	 * @constructor
	 * @param { ApiCreds } ApiCreds - An object containing your API credentials
	 * @example
	 * let ApiCreds = {
	 *   key : "my_super_secret_api_key",
     *   clientId: "my_client_id",
     *   userAgent : '{AppName}/{AppVersion} AppId/{MyAppId} (+{projectUri};{email})'
	 * }
	 *
	 * let ContentLib = require( '/path/to/Content.js' );
	 * const Content = new ContentLib( ApiCreds );
	 */
	constructor( ApiCreds ){
		this.ApiCreds  = ApiCreds;
		/** Contains the endpoints needed for this wrapper */
		this.Endpoints = require( __dirname + '/Endpoints.js' );
		/**
		 * Contains the enumerations needed for this wrapper
		 * @see module:Content/Enum
		 */
		this.Enums     = require( __dirname + '/Enums.js' );
		this.userAgent = ApiCreds.userAgent;
		Request = new MicroLib.Request( ApiCreds );
	}

	/**
	 * Gets an object describing a particular variant of content.
	 * @param { string } type - The content type to fetch
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Content-GetContentType.html#operation_get_Content-GetContentType | Content.getContentType} for more information
	 * @example
	 * Content.getContentType( "some_content_type" ).then( Response => {
	 *     console.log( Response ); // Do something with the Response
	 * } ).catch( e => {
	 *     //Error Handling
	 * } );
	 */
	async getContentType( type ){
		return MicroLib.renderEndpoint( this.Endpoints.getContentType, { type: type } )
		  .then( uri => Request.get( this.Endpoints.rootPath + uri ) );
	}

	/**
	 * Returns a content item referenced by id
	 * @param { Object } Options - The data required for this API call
	 *   @param { string|number } Options.id - The id of the content
	 *   @param { string } Options.locale - The locale in which to search for the ID
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Content-GetContentById.html#operation_get_Content-GetContentById | Content.getContentById} for more information
	 * @example
	 * Content.getContentById( { id : 'some_id', locale: 'some_locale' } ).then( Response => {
	 *     console.log( Response ); // Do something with the API Response
	 * } ).catch( e => {
	 *    //Error Handling
	 * } );
	 */
	async getContentById( Opts ){
		return MicroLib.renderEndpoint( this.Endpoints.getContentById, { id: Opts.id, locale: Opts.locale } )
		  .then( uri => Request.get( this.Endpoints.rootPath + uri ) );
	}

	/**
	 * Returns the newest item that matches a given tag and Content Type.
	 * @param { Object } Options - The data required for this API call
	 *   @param { string } Options.locale - The locale you want to search
	 *   @param { string } Options.tag - The tag you want to search for
	 *   @param { string } Options.type - The type of content you want to search for
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Content-GetContentByTagAndType.html#operation_get_Content-GetContentByTagAndType | Content.getContentByTagAndType} for more information
	 * @example
	 * Content.getContentByTagAndType( { locale: 'some_locale', tag: 'some_tag', type: 'some_type' } ).then( Response => {
	 *     console.log( Response ); // Do something with the API Response
	 * } ).catch( e => {
	 *    // Error handling
	 * });
	 */
	async getContentByTagAndType( Opts, oAuth ){
		return MicroLib.renderEndpoint( this.Endpoints.getContentByTagAndType, { locale : Opts.locale, tag : Opts.tag, type : Opts.type } )
		  .then( uri => Request.get( this.Endpoints.rootPath + uri ) );
	}

	/**
	 * Gets content based on querystring information passed in. Provides basic search and text search capabilities.
	 * @param { Object } Options - The data required for this API call
	 *   @param { string } Options.locale - The local to search in
	 *   @param { string } Options.cType - Content type tag: Help, News, etc. Supply multiple ctypes separated by space
	 *   @param { string | number } Options.currentPage - Page number for the search results, starting with page 1.
	 *   @param { string } Options.searchText - Word or phrase for the search.
	 *   @param { string } Options.tag - Tag used on the content to be searched
	 *   @param { string= } Options.source - For analytics, hint at the part of the app that triggered the search.
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Content-SearchContentWithText.html#operation_get_Content-SearchContentWithText | Content.searchContentWithText} for more information
	 * @example
	 * let Options = {
	 *     locale      : 'some_locale',
     *     cType       : 'some_content_type',
	 *     currentPage : 1,
	 *     searchText  : 'your_search_term',
	 *     tag         : 'some_tag'
	 * };
	 *
	 * Content.searchContentWithText( Options ).then ( Response => {
     *     console.log( Response ); // Do something with the API Response
	 * } ).catch( e => {
	 *    // Error handling
	 * } );
	 */
	async searchContentWithText( Opts ){
		let PathParams = { locale: Opts.locale };
		let QueryStrings = {
			currentpage: Opts.currentPage,
			ctype: Opts.cType,
			searchtext: Opts.searchText,
			tag: Opts.tag
		}

		return MicroLib.renderEndpoint( this.Endpoints.searchContentWithText, PathParams, QueryStrings)
		  .then( uri => Request.get( this.Endpoints.rootPath + uri ) );
	}


	/**
	 * Searches for Content Items that match the given Tag and Content Type.
	 * @param { Object } Options - An object containing all of the data required for this API call
	 *   @param { string } Options.locale - The locale to search
	 *   @param { string } Options.tag - The tag to search
	 *   @param { string } Options.type - The type to search
	 *   @param { number-like } Options.currentPage - The page number for the search results starting with page 1
	 * @see {@link https://bungie-net.github.io/multi/operation_get_Content-SearchContentByTagAndType.html#operation_get_Content-SearchContentByTagAndType | Content.searchContentByTagAndType} for more information
	 * @example
	 * let Opts = {
	 *     locale : 'some_locale',
	 *     tag: 'some_tag',
	 *     type: 'some_type',
	 *     currentPage : 1
	 * }
	 *
	 * Content.searchContentByTagAndType( Opts ).then( Response => {
	 *     console.log( Response ); // Do something with the API Response
	 * } ).catch( e => {
	 *    // Error handling
	 * } );
	 */
	async searchContentByTagAndType( Opts ){
		let PathParams = {
			locale: Opts.locale,
			tag : Opts.tag,
			type: Opts.type
		};

		let QueryStrings = {
			currentpage : Opts.currentPage
		}

		return MicroLib.renderEndpoint( this.Endpoints.searchContentByTagAndType, PathParams, QueryStrings)
		  .then( uri => Request.get( this.Endpoints.rootPath + uri ) );
	}
}

module.exports = Content;
