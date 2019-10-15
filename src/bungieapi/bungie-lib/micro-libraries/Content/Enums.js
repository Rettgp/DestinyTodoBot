/** @module { Enum } Content/Enum */
"use strict" 
 
const map   = require( __dirname + '/../MicroLibrary.js' ).mapEnumSync;
const debug = require( 'debug' )( 'Content/Enum' );

/**
 * @readonly
 * @enum { number } represents the forum category filters
 */
const contentPropertyDataType = {
	/** No data type */
	"NONE" : 0,
	/** PlainText data type */
	"PLAINTEXT" : 1,
	/** Html data type */
	"HTML" : 2,
	/** Dropdown data type */
	"DROPDOWN" : 3,
	/** List data type */
	"LIST" : 4,
	/** JSON data type */
	"JSON" : 5,
	/** Content data type */
	"CONTENT" : 6,
	/** Representation data type */
	"REPRESENTATION" : 7,
	/** Set data type */
	"SET" : 8,
	/** File data type */
	"FILE" : 9,
	/** Folderset data type*/
	"FOLDERSET" : 10,
	/** Date data type */
	"DATE" : 11,
	/** Mltiline-Plain-Text data type */
	"MULTILINEPLAINTEXT" : 12,
	/** Destiny-content data type */
	"DESTINYCONTENT" : 13,
	/** Color data type */
	"COLOR" : 14
}

module.exports = {
	contentPropertyDataType : map( contentPropertyDataType )
}