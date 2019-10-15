/** @module Trending */
"use strict"
const Ml = require( __dirname + '/../MicroLibrary.js' );
var Request = null;

class Trending{
	/**
	 * @constructor
	 * @param { ApiCreds } ApiCreds - Your Api Credentials
	 */
	constructor( ApiCreds ){
		this.ApiCreds = ApiCreds;
		this.Endpoints = require( __dirname + '/Endpoints.js' );
		Request = new Ml.Request( ApiCreds );
	}
	
	/**
	 * Returns trending items for Bungie.net, collapsed into the first page of items per category. For pagination within a category, call GetTrendingCategory.
	 * @returns { Promise }
	 */
	getTrendingCategories(){
		return Request.get( this.Endpoints.rootPath + this.Endpoints.getTrendingCategories );
	}
	
	/**
	 * Returns paginated lists of trending items for a category.
	 * @param { string } categoryId - The ID of the category for whom you want additional results.
	 * @param { number-like } pageNumber - The page # of results to return.
	 */
	getTrendingCategory( categoryId, pageNumber ){
		return Ml.renderEndpoint( this.Endpoints.getTrendingCategory, { categoryId, pageNumber } )
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}
	
	/**
	 * Returns the detailed results for a specific trending entry. Note that trending entries are uniquely identified by a combination of *both* the TrendingEntryType *and* the identifier: the identifier alone is not guaranteed to be globally unique.
	 * @param { string } identifier - The identifier for the entity to be returned.
	 * @param { module:Trending/Enum~trendingEntryType } trendingEntryType - The type of entity to be returned.
	 * @returns { Promise }
	 */
	getTrendingEntryDetail( identifier, trendingEntryType ){
		return Ml.renderEndpoint( this.Endpoints.getRendingEntryDetail, { identifier, trendingEntryType })
			.then( endpoint => Request.get( this.Endpoints.rootPath + endpoint ) );
	}
}

module.exports = Trending;