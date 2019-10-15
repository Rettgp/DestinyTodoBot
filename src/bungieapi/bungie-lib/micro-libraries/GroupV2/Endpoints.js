/** @module GroupV2/Endpoint */
"use strict"

/** An object containing all of the GroupV2 endpoints */
const endpoints = {
	rootPath : "https://www.bungie.net/Platform",
	getAvailableAvatars : "/GroupV2/GetAvailableAvatars/",
	getAvailableThemes : "/GroupV2/GetAvailableThemes/",
	getUserClanInviteSetting : "/GroupV2/GetUserClanInviteSetting/{mType}/",
	getGroupByName : "/GroupV2/Name/{groupName}/{groupType}/",
	getGroup : "/GroupV2/{groupId}/",	
	setUserClanInviteSetting : "/GroupV2/SetUserClanInviteSetting/{mType}/{allowInvites}/",
	getRecommendedGroups : "/GroupV2/Recommended/{groupType}/{createDateRange}/",
	groupSearch : "/GroupV2/Search/",
	getGroupByNameV2 : "/GroupV2/NameV2/",
	getGroupOptionalConversations : "/GroupV2/{groupId}/OptionalConversations/",
	createGroup : "/GroupV2/Create/",
	editGroup : "/GroupV2/{groupId}/Edit/",
	editClanBanner : "/GroupV2/{groupId}/EditClanBanner/",
	editFounderOptions : "/GroupV2/{groupId}/EditFounderOptions/",
	addOptionalConversation : "/GroupV2/{groupId}/OptionalConversations/Add/",
	editOptionalConversation : "/GroupV2/{groupId}/OptionalConversations/Edit/{conversationId}/",
	getMembersOfGroup : "/GroupV2/{groupId}/Members/",
	getAdminsAndFounderOfGroup : "/GroupV2/{groupId}/AdminsAndFounder/",
	editGroupMembership : "/GroupV2/{groupId}/Members/{membershipType}/{membershipId}/SetMembershipType/{memberType}/",
	kickMember : "/GroupV2/{groupId}/Members/{membershipType}/{membershipId}/Kick/",
	banMember : "/GroupV2/{groupId}/Members/{membershipType}/{membershipId}/Ban/",
	unbanMember : "/GroupV2/{groupId}/Members/{membershipType}/{membershipId}/Unban/",
	getBannedMembersOfGroup : "/GroupV2/{groupId}/Banned/",
	abdicateFoundership : "/GroupV2/{groupId}/Admin/AbdicateFoundership/{membershipType}/{founderIdNew}/",
	requestGroupMembership : "/GroupV2/{groupId}/Members/Apply/{membershipType}/",
	getPendingMemberships : "/GroupV2/{groupId}/Members/Pending/",
	getInvitedIndividuals : "/GroupV2/{groupId}/Members/InvitedIndividuals/",
	rescindGroupMembership : "/GroupV2/{groupId}/Members/Rescind/{membershipType}/",
	approveAllPending : "/GroupV2/{groupId}/Members/ApproveAll/",
	denyAllPending : "/GroupV2/{groupId}/Members/DenyAll/",
	approvePendingForList : "/GroupV2/{groupId}/Members/ApproveList/",
	approvePending : "/GroupV2/{groupId}/Members/Approve/{membershipType}/{membershipId}/",
	denyPendingForList : "/GroupV2/{groupId}/Members/DenyList/",
	getGroupsForMember : "/GroupV2/User/{membershipType}/{membershipId}/{filter}/{groupType}/",
	getPotentialGroupsForMember : "/GroupV2/User/Potential/{membershipType}/{membershipId}/{filter}/{groupType}/",
	individualGroupInvite : "/GroupV2/{groupId}/Members/IndividualInvite/{membershipType}/{membershipId}/",
	individualGroupInviteCancel : "/GroupV2/{groupId}/Members/IndividualInviteCancel/{membershipType}/{membershipId}/"
};

module.exports = endpoints;