/** @module User/Endpoint */
"use strict"
/** An object containing all of the User endpoints */
const endpoints = {
	rootPath                        : "https://www.bungie.net/Platform",
	getBungieNetUserById            : "/User/GetBungieNetUserById/{id}/",
	searchUsers                     : "/User/SearchUsers/",
	getAvailableThemes              : "/User/GetAvailableThemes/",
	getMembershipDataById           : "/User/GetMembershipsById/{membershipId}/{membershipType}/",
	getMembershipDataForCurrentUser : "/User/GetMembershipsForCurrentUser/",
	getPartnerships                 : "/User/{membershipId}/Partnerships/"
};

/** An object containing this wrappers endpoints */
module.exports = endpoints;