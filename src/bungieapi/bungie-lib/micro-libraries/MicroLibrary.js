/** @module MicroLibrary */
"use strict"

const Fs = require( 'fs' );
const EventEmitter = require( 'events' );
const QueryString = require( 'querystring' );
const Https = require( 'https' );
const Path = require( 'path' );
/** The root directory for the project that this library will be used in */
const projectRoot = Path.dirname( require.main.filename || process.mainModule.filename );
/** Contains the parsed contents of the package.json file */
const Info = {};//JSON.parse( Fs.readFileSync( projectRoot + '/../package.json' ) );


class Request {
	/**
	 * Makes HTTP requests
	 * @constructor
	 * @params( ApiCreds ) = Your API credentials;
	 */
	constructor( ApiCreds ){
		this.ApiCreds = ApiCreds;
	}
	/**
	 * Makes an HTTP GET request to the specified uri
	 * @param { string } uri - The URI to perform the GET request on
	 * @param { oAuth } [oAuth=false] - The oAuth credentials
	 * @returns { Promise }
	 */
	get( uri, oAuth = false ){
		return new Promise( ( resolve, reject ) => {

			let	headers = {
				"X-API-KEY": this.ApiCreds.key,
				"User-Agent": this.ApiCreds.userAgent
			}

			// Send the appropriate authorization header
			headers["Authorization"] = ( typeof oAuth == 'object' ) ?
				"Bearer " + oAuth.access_token : // Use the oAuth token to
				"Basic " + new Buffer.from( this.ApiCreds.clientId + ":" + this.ApiCreds.clientSecret ).toString( 'base64' );
			Https.get( uri, { headers }, Response => {
				let data = '';

				// How long of a result should we expect?
				let len = parseInt( Response.headers['content-length'], 10 ) ;
				let size = this._convertBytes( len );
				let progress = 0;

				// A chunk of data has been received.
				Response.on('data', (chunk) => {
					data     += chunk;
					progress += chunk.length;
				});

				// The whole response has been received.
				Response.on('end', () => {
					// If the request was successful resolve the promise, otherwise reject it.
					if( Response.headers[ 'content-type' ].substring( 0, 16 ) === 'application/json' ){
						data = JSON.parse( data );

						if( typeof data.ErrorCode !== 'undefined' && data.ErrorCode !== 1 )
							reject( JSON.stringify( data ) );
						else
							resolve( data );
					} else {
						reject( data );
					}
				} );
			} );
		} );
	}

	/**
	 * Performs an HTTPS post request
	 * @param { string } uri - The full path you want to post to
	 * @param { object } PostData - An object containing the keys/value pairs you want to post to the server
	 * @param { oAuth } [oAuth=false] - The oAuth object retrieved from module:OAuth~OAuth.requestAccessToken
	 * @returns { Promise }
	 */
	async post( uri, PostData, oAuth = false ){

		return new Promise( ( resolve, reject ) => {

			// Parse the host and endpoint from the uri
			let host = uri.substring( uri.indexOf('//') + 2 , uri.indexOf('.net/') + 4 );
			let path = uri.substring( uri.indexOf('.net') + 4, uri.length );
			var data = '';
			let headers = {
				"X-API-KEY"  : this.ApiCreds.key,
				"User-Agent" : this.ApiCreds.userAgent
			}

			if( typeof PostData === 'object' ){
				PostData = JSON.stringify( PostData );
				headers["Content-Type"] = "application/json"
			} else {
				headers["Content-Type"] = "application/x-www-form-urlencoded"
			}

			headers["Content-Length"] = PostData.length;

			// Send the appropriate authorization header
			headers["Authorization"] = ( typeof oAuth == 'object' ) ?
				"Bearer " + oAuth.access_token : // Use the oAuth token to
				"Basic " + new Buffer.from( this.ApiCreds.clientId + ":" + this.ApiCreds.clientSecret ).toString( 'base64' );
			let request = Https.request( {
			// Request options
				host : host,
				path : path,
				port : 443,
				method: "POST",
				headers: headers
			// Capture the response
			}, Response => {
				Response.on( 'data', chunk => {
					data += chunk;
				} );

				Response.on( 'end', () => {

					// If the request was successful resolve the promise, otherwise reject it.
					if( Response.headers[ 'content-type' ].substring( 0, 16 ) === 'application/json' ){
						data = JSON.parse( data );

						if( typeof data.ErrorCode !== 'undefined' && data.ErrorCode !== 1 )
							reject( JSON.stringify( data ) );
						else
							resolve( data );

					} else {
						reject( data );
					}
				} );
			} );

			// Post the data
			request.write( PostData );
			// End the request
			request.end();
		} );

	}

	// Converts bytes to larger units
	_convertBytes( bytes, unit ){
		let Conversions = {
			B  : bytes,             // Bytes
			KB : bytes / 1024,      // KiloBytes
			MB : bytes / 1048576,   // MegaBytes
			GB : bytes / 1073741824 // GigaBytes
		};

		let keys = Object.keys( Conversions );

		if( typeof unit === 'string' )
			return Conversions[ unit.toUpperCase() ];
		else{
			// If they didn't give a sane unit type, return the largest whole unit
			let i = 0;
			for( i; Conversions[ keys [ i ] ] >= 1.0 ; i++ ){}
			return Conversions[ keys[ i - 1 ] ] + " " + keys[ i - 1 ];
		}
	}
};

/**
 * Generates a generic User-Agent header
 * @param { Object } Options - The data required to generate a Bungie.net Compatible API string
 *   @param { string } Options.name - The name of your project
 *   @param { string } Options.version - The version
 * @returns { string } A user-agent string in the form of “AppName/Version AppId/appIdNum (+webUrl;contactEmail)”
 *@see {@link https://github.com/Bungie-net/api#are-there-any-restrictions-on-the-api|Restrictions} for more information.
 */
function generateUserAgent( ApiCreds ){

	if( typeof Info.homepage !== 'undefined ' ){
		var website = Info.homepage;
	} else if ( typeof Info.repository.url !== 'undefined' ){
		var website = Info.repository.url;
	} else {
		var website = "N/A";
	}

	let email = ( typeof Info.author ==='undefined' || typeof Info.author.email === 'undefined' ) ? 'N/A' : Info.author.email;
	return `${Info.name}/${Info.version} AppId/${ApiCreds.clientId} (+${website};${email})`;
}

class TypeError extends Error{
	/**
	 * @constructor
	 * @extends Error
	 * @param { Object } TypeError - Contains the information about the TypeError
	 *   @property { string } varName - The name of the variable that filed the type check
	 *   @property { var } variable - The variable that failed the type check
	 *   @property { string } expected - The expected data type
	 * @example
	 * throw new TypeError({
	 *    varName: "Options.search",
	 *    variable: Options.search,
	 *    expected: "number-like"
	 * });
	 *
	 * @example
	 * { TypeError: TypeError:  Options.search expected to be number-like; Got string
     *      at new TypeError ...
     *      name: 'TypeError',
     *      varName: 'Options.search',
     *      expected: 'number-like',
     *      failedValue: 'THIS_IS_NOT_A_NUM' }
	 */
	constructor( TypeError ){
		super( "TypeError:  " + TypeError.varName + " expected to be " + TypeError.expected + "; Got " + typeof TypeError.variable );

		this.name        = this.constructor.name;
		this.varName     = TypeError.varName;
		this.expected    = TypeError.expected;
		this.failedValue = TypeError.variable;

		Error.captureStackTrace( this, TypeError );
	}
}

class MicroLibLoadError extends Error{
	/**
	 * @constructor
	 * @extends Error
	 * @param { Object } MicroLibError - Contains the information about the module that failed
	 *   @property { string } message - A description of the error that occurred
	 *   @property { string } reason - The reason that the module failed to load
	 *   @property { MicroLibDefinition } Module - An object containing all of the module information
	 * @example
	 * throw new MicroLibLoadError({
	 *    message: "The micro-library testLib failed to load",
	 *    reason: "The main file for this module could not be found",
	 *    Module: {
	 *      name: "testLib",
	 *      wrapperKey: "Test",
	 *      main: "doesNotExist.js",
	 *      path: "/lib/testLib"
	 *    }
	 * });
	 */
	constructor( MicroLibError ){
		super( MicroLibError.message );

		this.name = this.constructor.name;

		Object.keys( MicroLibError ).forEach( key => {
			this[key] = MicroLibError[key];
		});

		Error.captureStackTrace( this, MicroLibLoadError );
	}
}

class EnumError extends Error{
	/**
	 * @constructor
	 * @extends Error
	 * @param { Object } EnumError - Contains the information about the failed enumeration lookup
	 *   @property { string } Table - The table in which the key does not exist
	 *   @property { string } key - The key that failed the lookup
	 * @example
	 * throw new EnumError({
	 *    key: "this_key_does_not_exist",
	 *    Table: Forum.Enums.topicsQuickDate
	 * });
	 *
	 * @example
	 * { EnumError: this_key_does_not_exist is not a valid quick date
	 *  at ...
	 * name: 'EnumError',
	 * key: 'this_key_does_not_exist',
	 * lookupTable:
	 *  { '0': 'ALL',
	 *	 '1': 'LASTYEAR',
	 *	 '2': 'LASTMONTH',
	 *	 '3': 'LASTWEEK',
	 *	 '4': 'LASTDAY',
	 *	 description: 'quick date',
	 *	 ALL: 0,
	 *	 LASTYEAR: 1,
	 *	 LASTMONTH: 2,
	 *	 LASTWEEK: 3,
	 *	 LASTDAY: 4 } }
	 *
	 */
	constructor( EnumError ){
		super( EnumError.key + " is not a valid " + EnumError.Table.description );

		this.name = this.constructor.name;
		this.key = EnumError.key;
		this.lookupTable = EnumError.Table

		Error.captureStackTrace( this, EnumError );
	}
}

/**
 * Checks if the first parameter `key` is a key in the Enum object `Table`
 * @function
 * @param { Object } key - The key to look up
 * @param { Object } Table - The Enum Table in which to look for the key
 * @returns { Promise } - Resolves with the enumerated value, rejects with an {@link module:EnumError~EnumError|EnumError}
 */
async function enumLookup( key, Table ){
	return new Promise( ( resolve, reject ) => {
		// convert string keys to uppercase
		key = ( typeof key === "string" ) ? key.toUpperCase() : key;
		let typeOf = typeof Table[ key ];

		if(  ( typeOf !== 'number' && typeOf !== 'string' ) ){
			reject( new EnumError( {
				key   : key,
				Table : Table
			} ) );
		} else {
			// if( typeOf == 'string' ){
				resolve ( Table[key] );
			// } else {
			// 	resolve ( key );
			// }
		}
	} );
}

async function enumLookupFuzzy( key, Table ){
	return new Promise( ( resolve, reject ) => {
		// convert string keys to uppercase
		key = ( typeof key === "string" ) ? key.toUpperCase() : key;
		console.log(key);
		key = key.replace(/\s/g, '');
		for (let table_key of Object.keys(Table))
		{
			if (key.includes(table_key))
			{
				key = table_key;
			}
		}
		let typeOf = typeof Table[ key ];

		if(  ( typeOf !== 'number' && typeOf !== 'string' ) ){
			reject( new EnumError( {
				key   : key,
				Table : Table
			} ) );
		} else {
			if( typeOf == 'string' ){
				resolve ( Table[key] );
			} else {
				resolve ( key );
			}
		}
	} );
}

/**
 * URI enpoints are saved directly from Bungie with the placeholders in tact. The placeholders in the path each represent
 * an API parameter.
 * @function
 * @param { string } uri - The URI string to be rendered
 * @param { Object } PathParams - The PathParams required to renderEndpoint this URI
 * @param { Object } QueryStrings - An object containing all of the query strings to be added to the end of the URI
 * @returns { Promise }
 * @example
 * // Function is thenable
 *
 * let endpoint = "https://www.Bungie.net/some/path/{placeholder_1}/{second_placeholder}/{foo}";
 * renderEndpoint( endpoint,
 *     { // PathParams - These go directly in the URI
 *        placeholder_1 : 'HELLO',
 *        second_placeholder: 'WORLD',
 *        foo: 'bar'
 *    },
 *    { // QueryStrings - These are appeneded on to the end of URI and are used for HTTP GET requests
 *        "key": "value",
 *        "second" : 2
 *    }).then( uri => {
 *        console.log( uri );
 *    });
 *
 * @example
 * // Async/await
 * async function test(){
 *   let endpoint = "https://www.Bungie.net/some/path/{placeholder_1}/{second_placeholder}/{foo}";
 *   let uri = await renderEndpoint( endpoint,
 *       { // These replace the placeholders present in the URI path
 *          placeholder_1 : 'HELLO',
 *          second_placeholder: 'WORLD',
 *          foo: 'bar'
 *      },
 *      { // These are queryStrings
 *          "key": "value",
 *          "second" : 2
 *      });
 *     console.log( uri );
 * }
 *
 * @example { Output }
 * // Both examples above produce this output
 * "https://www.Bungie.net/som/path/HELLO/WORLD/bar?key=value&second=2"
 */
async function renderEndpoint( uri, PathParams = {}, QueryStrings = null, delimeter = "&" ){
	return new Promise( ( resolve, reject) => {
		if( typeof PathParams !== 'object' )
			reject( "You did not provide an Object containing your key/value pairs");
		if( typeof uri !== 'string')
			reject("The endpoint uri \"" + uri + "\" is not valid");

		var rendered = uri;
		let search = '';

		// Render the path params
		Object.keys( PathParams ).forEach( key => {
			// Don't render any undefined values
			if( typeof PathParams[key] == 'undefined' || PathParams[key] === "" )
				return;
			search = RegExp('{' + key + '}', 'g');
			rendered = rendered.replace( search, PathParams[key] );
		});

		// If there are still placeholders in the URI, reject the promise.
		let missingParams = rendered.match( /{\s*[\w\.]+\s*}/g );
		if( missingParams !== null ){
			// Pull values out of the braces
			missingParams = missingParams.map( x => { return x.match( /[\w\.]+/ )[ 0 ] } );
			reject( {
				message: "Parameters were missing from the request",
				missingParams: missingParams
			} );
		}

		// Add any query strings we were sent
		if( typeof QueryStrings == 'object' )
			rendered += "?" + QueryString.unescape(QueryString.stringify( QueryStrings, delimeter ));

		console.log(rendered)
		resolve( encodeURI( rendered ) );
	});
};

class ApiError extends Error{
	/**
	 * @constructor
	 * @extends Error
	 * @param { Object } bNetError - The parsed bungee.net API error message.
	 *   @property { number } ErrorCode - The error code of the Bungie.net error
	 * 	 @property { number } ThrottleSeconds - The number of seconds that your API key was throttled
	 *   @property { string } ErrorStatus - A string containing the status of the API call.
	 *   @property { string } Message - A message from the gods themselves.
	 */
	constructor( bNetError ){
		super( bNetError.Message );

		this.name = this.constructor.name;

		Object.keys( bNetError ).forEach( key => {
			this[key] = bNetError[key];
		});

		Error.captureStackTrace( this, ApiError );
	}
}

/**
 * Generates a universally unique identifier. I copied it from the Internet. Don't fuck with it.
 * @see {@link http://slavik.meltser.info/the-efficient-way-to-create-guid-uuid-in-javascript-with-explanation/|source} for more information
 * @returns { string } - A universally unique identification string
 */
function uuid(){
	console.log( "illuminati ◬ confirmed" );
	function _p8(s) {
		var p = (Math.random().toString(16)+"000000000").substr(2,8);
		return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
	}

	return _p8() + _p8(true) + _p8(true) + _p8();
}

/**
 * SYNCHRONOUSLY Reverse maps an object to make enumeration lookup easier.
 * @param ( Object ) Obj - Any simple object
 * @returns { enum }
 */
function mapEnumSync( Obj ){
	let rtrn = Obj;
	Object.keys( Obj ).forEach( key => {
		rtrn[ Obj[ key ] ] = key;
	});
	return rtrn;
}

/**
 * Return the value of the first parameter unless the first parameter is undefiend, then returns null
 * @param { arbitrary } val - The value whos default value is null
 * @returns { arbitrary } - Returns null if val is undefined, returns the value of val otherwise
 */
function nullable( val ){
	return ( typeof val === 'undefined' ) ? null : val;
}

module.exports = {
	TypeError,
	ApiError,
	MicroLibLoadError,
	renderEndpoint,
	enumLookup,
	enumLookupFuzzy,
	EnumError,
	generateUserAgent,
	libInfo : Info,
	Request,
	mapEnumSync,
	nullable,
	projectRoot
};
