/** @module Trending/Endpoint */
"use strict"

module.exports = {
	rootPath : "https://www.bungie.net/Platform",
	/** Returns trending items for Bungie.net, collapsed into the first page of items per category. For pagination within a category, call GetTrendingCategory. */
	getTrendingCategories : "/Trending/Categories/",
	/** Returns paginated lists of trending items for a category. */
	getTrendingCategory : "/Trending/Categories/{categoryId}/{pageNumber}/",
	/** Returns the detailed results for a specific trending entry. Note that trending entries are uniquely identified by a combination of *both* the TrendingEntryType *and* the identifier: the identifier alone is not guaranteed to be globally unique. */
	getTrendingEntryDetail : "/Trending/Details/{trendingEntryType}/{identifier}/"
}
