/** @module Fireteam/Endpoint */
"use strict"

module.exports = {
	rootPath : "https://www.bungie.net/Platform",
	/** Gets a count of all active non-public fireteams for the specified clan. Maximum value returned is 25. */
	getActivePrivateClanFireteamCount : "/Fireteam/Clan/{groupId}/ActiveCount/",
	/** Gets a listing of all of this clan's fireteams that are have available slots. Caller is not checked for join criteria so caching is maximized. */
	getAvailableClanFireteams : "/Fireteam/Clan/{groupId}/Available/{platform}/{activityType}/{dateRange}/{slotFilter}/{publicOnly}/{page}/",
	/** Gets a listing of all public fireteams starting now with open slots. Caller is not checked for join criteria so caching is maximized. */
	searchPublicAvailableClanFireteams : "/Fireteam/Search/Available/{platform}/{activityType}/{dateRange}/{slotFilter}/{page}/",
	/** Gets a listing of all clan fireteams that caller is an applicant, a member, or an alternate of. */
	getMyClanFireteams : "/Fireteam/Clan/{groupId}/My/{platform}/{includeClosed}/{page}/",
	/** Gets a specific clan fireteam. */
	getClanFireteam : "/Fireteam/Clan/{groupId}/Summary/{fireteamId}/"
}