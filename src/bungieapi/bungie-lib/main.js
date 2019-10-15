"use strict"

const Fs = require ( 'fs' );
const Path = require( 'path' );
const QueryString = require( 'querystring' );
const Ml = require( __dirname + "/micro-libraries/MicroLibrary.js" );
var Request = null;

class BungieLib{
	/**
	 * Wraps the endpoint micro-libraries to make API management easier. While
	 * the micro-libraries are designed to be modular and can operate fully independent
	 * of this wrapper; I strongly suggest you start by using the wrapper. It's very handy ;)
	 * @constructor
	 * @param { ApiCreds } ApiCreds - An Object containing your API credentials
	 * @param { array } loadMicroLibs - An array containing the names of the micro-libraries that you want to load
	 * @returns { Promise }
	 * @example
	 * var ApiCreds = {
	 *    key : "my_super_secret_api_key",
	 *    clientId: "my_client_id",
	 *    userAgent : "MyApp/0.2.3 AppId/MyAppId (+myProjectUrl;mycontact@email.com)"
	 * }
	 *
	 * var BNetApi = require( 'bungie-net-api' );
	 *
	 * // Only load the destiny2 and user libraries
	 * const Api = new BNetApi( ApiCreds, ['destiny2', 'user'] );
	 */
	constructor( ApiCreds, loadMicroLibs = ['all'] ){

		Request = new Ml.Request( ApiCreds );

		// Sanity check
		if( typeof ApiCreds.key !== 'string')
			throw new TypeError( { varName: 'ApiCreds.key', variable: ApiCreds.key, expected: 'string' } );
		if( isNaN( parseInt( ApiCreds.clientId ) ) )
			throw new TypeError( { varName: 'ApiCreds.clientId', variable: ApiCreds.clientId, expected: 'number-like' } );

		if( typeof ApiCreds.userAgent !== 'string')
			ApiCreds.userAgent = Ml.generateUserAgent( ApiCreds );

		this.ApiCreds  = ApiCreds;
		this.MicroLibs = {}

		// Parse the array of micro-libraries
		JSON.parse ( Fs.readFileSync( __dirname + '/micro-libraries.json' ) ).forEach( MicroLib => {
			this.MicroLibs[ MicroLib.name ] = MicroLib;
		});

		// Loads all modules by default
		if( ! Array.isArray( loadMicroLibs ) ) {
			console.warn( "Warning, loadMicroLibs was expected to be an array, got " + typeof loadMicroLibs );
			console.warn( "-=-=-=-=- Loading all modules by default -=-=-=-=-" );
			loadMicroLibs = ['all'];
		}

		// Load all micro-libraries
		if( loadMicroLibs[0] == 'all' ){
			// For each Ml with an entry in modules.json
			Object.keys( this.MicroLibs ).forEach( key => {
				let ml = this.MicroLibs[ key ];
				// Try to create an instance of the Ml and store it to this[Ml_name]
				try{
					this[ ml.wrapperKey ] = new( require( __dirname + ml.path + ml.main ) )( this.ApiCreds );
					if (ml.wrapperKey === "Destiny2")
					{
						this[ml.wrapperKey].init().then(output => console.log(output));
					}
				} catch( e ){
					throw new Ml.MicroLibLoadError( {
						message  : "The Micro-library " + this.MicroLibs[ key ].name + " failed to load",
						reason   : e,
						MicroLib : this.MicroLibs[ key ]
					} );
				}
			} )
		// Load only the preferred micro-libraries
		} else {
			loadMicroLibs.forEach( mlName => {
				// Is there an entry for this Micro-library in microLibs.json?
				if( typeof this.MicroLibs[ mlName ] !== 'object' ){
					// Nope!, throw an error
					throw new Ml.MicroLibLoadError({
						message : "The micro-library " + mlName + " failed to load",
						reason  : "The micro-library " + mlName + " does not have an entry in micro-libraries.json"
					});
				// Yep! try to load it
				} else {
					// cache the micro-library in question
					let ml = this.MicroLibs[ MlName ];

					// Try to create a new instance of the micro-library
					try{
						this[ ml.wrapperKey ] = new( require( __dirname + ml.path + ml.main ) )( this.ApiCreds );
					// Something went wrong, panic and run in a circle
					}catch( e ){
						throw new Ml.MicroLibLoadError( {
							message  : "The micro-library " + mlname + " failed to load",
							reason   : e,
							MicroLib : this.MicroLibs[ mlName ]
						} );
					}
				}
			} );
		}
		this.Endpoints = require( __dirname + "/Endpoints.js" );
		this.authUri = this.Endpoints.authorization + "?response_type=code&client_id=" + this.ApiCreds.clientId;
	}

	/**
	 * List of available localization cultures
	 * @returns { Promise }
	 */
	getAvailableLocales(){
		return Request.get( this.Endpoints.rootPath + this.Endpoints.getAvailableLocales );
	}

	/**
	 * Get the common settings used by the Bungie.Net environment.
	 * @returns { Promise }
	 */
	getCommonSettings(){
		return Request.get( this.Endpoints.rootPath + this.Endpoints.getCommonSettings );
	}

	/**
	 * Gets any active global alert for display in the forum banners, help pages, etc. Usually used for DOC alerts.
	 * @param { boolean } [includeStreaming=true] - Determines whether Streaming Alerts are included in results
	 * @returns { Promise }
	 */
	getGlobalAlerts( includestreaming = true ){
		return Ml.renderEndpoint( this.Endpoints.getGlobalAlerts, {}, { includestreaming } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}

	/**
	 * Uses an oAuthCode to request a oAuthToken
	 * @param { string } authCode - The oAuthCode that was given to your client after they authorized your application
	 * @returns { Promise }
	 * @example
	 * OAuth.requestAccessToken( authCode ).then( oAuth => {
	 *     console.log( oAuth ); // Do something with the api response
	 * }).catch( e => {
	 *    // Error handling
	 * });
	 */
	requestAccessToken( authCode = "NO_CODE_PROVIDED" ){
		return Request.post(
			this.Endpoints.rootPath + this.Endpoints.token,
			QueryString.stringify( {
				grant_type : "authorization_code",
				code : "" + authCode,
				clientId : this.ApiCreds.clientId
			} )
		);
	}

	/**
	 * Refreshes an oAuth token
	 * @param { string } refreshToken - The refresh token you were given with your access token
	 * @returns { Promise }
	 * @example
	 * OAuth.refreshAccessToken( Opts ).then( auth => {
	 *     console.log( auth ); // Do something with the api response
	 * }).catch( e => {
	 *    // Error handling
	 * });
	 */
	refreshAccessToken( oAuth ){
		// They can pass the entire bungie.net oAuth object, or just the refreshToken
		let refreshToken = ( typeof oAuth === 'object' ) ? oAuth.refresh_token : oAuth;

		return Request.post(
			this.Endpoints.rootPath + this.Endpoints.refresh,
			QueryString.stringify( {
				grant_type : "refresh_token",
				refresh_token : "" + refreshToken
			} )
		 );
	}

	/**
	 * Get API usage by application for time frame specified. You can go as far back as 30 days ago, and can ask for up to a 48 hour window of time in a single request. You must be authenticated with at least the ReadUserData permission to access this endpoint.
	 * @param { Object } Options - The data required to complete this API call
	 *   @param { number-like } Options.applicationId - ID of the application to get usage statistics.
	 *   @param { date-time } Options.End - End time for query. Goes to now if not spcified
	 *   @param { date-time } Options.Start - Start time for query. Goes to 24 hours ago if not specified
	 * @param { oAuth } oAuth - Your oAuth credentials
	 * @returns { Promise }
	 */
	getApplicationApiUsage( Opts, oAuth ){
		var applicationId = ( isNaN( parseInt( Opts.applicationId ) ) ) ? this.ApiCreds.clientId : Opts.applicationId;
		var queryStrings  = {};

		if( typeof Opts.End !== 'undefined' )
			queryStrings.End = Opts.End;
		if( typeof Opts.Start !== 'undefined' )
			queryStrings.Start = Opts.Start

		return Ml.renderEndpoint( this.Endpoints.getApplicationApiUsage, { applicationId }, queryStrings )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint, oAuth ) );
	}

	/**
	 * Get list of applications created by Bungie.
	 * @returns { Promise }
	 */
	getBungieApplications(){
		return Request.get( this.Endpoints.rootPath + this.Endpoints.getBungieApplications );
	}
}

module.exports = BungieLib;
