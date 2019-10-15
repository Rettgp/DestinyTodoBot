/** @module Forum/Endpoint */
"use strict"

/** An Object containing all of the Forum endpoints */
const endpoints = {
	rootPath                         : "https://www.bungie.net/Platform",
	getTopicsPaged                   : "/Forum/GetTopicsPaged/{page}/{pageSize}/{group}/{sort}/{quickDate}/{categoryFilter}/",
	getCoreTopicsPaged               : "/Forum/GetCoreTopicsPaged/{page}/{sort}/{quickDate}/{categoryFilter}/",
	getPostsThreadedPaged            : "/Forum/GetPostsThreadedPaged/{parentPostId}/{page}/{pageSize}/{replySize}/{getParentPost}/{rootThreadMode}/{sortMode}/",
	getPostsThreadedPagedFromChild   : "/Forum/GetPostsThreadedPagedFromChild/{childPostId}/{page}/{pageSize}/{replySize}/{rootThreadMode}/{sortMode}/",
	getPostAndParent                 : "/Forum/GetPostAndParent/{childPostId}/",
	getPostAndParentAwaitingApproval : "/Forum/GetPostAndParentAwaitingApproval/{childPostId}/",
	getTopicForContent               : "/Forum/GetTopicForContent/{contentId}/",
	getForumTagSuggestions           : "/Forum/GetForumTagSuggestions/",
	getPoll                          : "/Forum/Poll/{topicId}/",
	joinFireteamThread               : "/Forum/Recruit/Join/{topicId}/",
	leaveFireteamThread              : "/Forum/Recruit/Leave/{topicId}/",
	kickBanFireteamApplicant         : "/Forum/Recruit/KickBan/{topicId}/{targetMembershipId}/",
	approveFireteamThread            : "/Forum/Recruit/Approve/{topicId}/",
	getRecruitmentThreadSummaries    : "/Forum/Recruit/Summaries/"
};

module.exports = endpoints;