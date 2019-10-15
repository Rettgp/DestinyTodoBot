/** @module CommunityContent/Endpoint */
"use strict"

const Endpoints = {
	rootPath : "https://www.bungie.net/Platform",
	/** Returns community content. */
	getCommunityContent : "/CommunityContent/Get/{sort}/{mediaFilter}/{page}/",
	/** Returns info about community members who are live streaming. */
	getCommunityLiveStatuses : "/CommunityContent/Live/All/{partnershipType}/{sort}/{page}/",
	/** Returns info about community members who are live streaming in your clans. */
	getCommunityLiveStatusesForClanmates : "/CommunityContent/Live/Clan/{partnershipType}/{sort}/{page}/",
	/** Returns info about community members who are live streaming among your friends. */
	getCommunityLiveStatusesForFriends : "/CommunityContent/Live/Friends/{partnershipType}/{sort}/{page}/",
	/** Returns info about Featured live streams. */
	getFeaturedCommunityLiveStatuses : "/CommunityContent/Live/Featured/{partnershipType}/{sort}/{page}/",
	/** Gets the Live Streaming status of a particular Account and Membership Type. */
	getStreamingStatusForMember : "/CommunityContent/Live/Users/{partnershipType}/{membershipType}/{membershipId}/"
};

module.exports = Endpoints;