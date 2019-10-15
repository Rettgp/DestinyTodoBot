/** @module Forum/Enum */
"use strict" 
 
const map   = require( __dirname + '/../MicroLibrary.js' ).mapEnumSync;
const debug = require( 'debug' )( 'Forum/Enum' );

/**
 * @readonly
 * @enum { number } represents the forum category filters
 */
const topicsCategoryFilters = {
	/**  Use no filter */
	"NONE" : 0,
	/** Filter for links */
	"LINKS" : 1,
	/** Filter for questions */
	"QUESTIONS" : 2,
	/** Filter for answered questions */
	"ANSWEREDQUESTIONS" : 4,
	/** Filter for media */
	"MEDIA" : 8,
	/** Filter for text-only */
	"TEXTONLY" : 16,
	/** Filter for announcements */
	"ANNOUNCEMENT" : 32,
	/** Filter for official Bungie topics */
	"BUNGIEOFFICIAL" : 64,
	/** Filter for polls */
	"POLLS" : 128,
	/**
	 * A short description of this Enum table
	 * @type {string}
	 */
	"description" : "category filter",
}

/** 
 * @readonly
 * @enum { number } represents quick sorting by date
 */
const topicsQuickDate = {
	/** All dates */
	"ALL" : 0,
	/**  Last year */
	"LASTYEAR" : 1,
	/** Last month */
	"LASTMONTH" : 2,
	/** Last week */
	"LASTWEEK" : 3,
	/** Yesterday */
	"LASTDAY" : 4,
	/**
	 * A short description of this Enum table
	 * @type {string}
	 */
	"description" : "quick date",
}

/**
 * @readonly
 * @enum { number } represents the various forum sort options
 */
const topicsSort = {
	/** Use default sorting */
	"DEFAULT" : 0,
	/** Sort by last replied */
	"LASTREPLIED" : 1,
	/** Sort by most replies */
	"MOSTREPLIED" : 2,
	/** Sort by popularity */
	"POPULARITY" : 3,
	/** Sort by how controversial a topic is */
	"CONTROVERSIALITY" : 4,
	/** Sort by how liked a topic is */
	"LIKED" : 5,
	/** Sort by highest rated topics */
	"HIGGHESTRATED" : 6, 
	/** Sorty by the most up-voted tpics */
	"MOSTUPDVOTED" : 7,
	/**
	 * A short description of this Enum table
	 * @type {string}
	 */
	"description" : "sortable topic"
}

/**
 * @readonly
 * @enum { number } represents the various forum media types
 */
const mediaType = {
	/** No media type */
	"NONE" : 0,
	/** Media is some type of image */
	"IMAGE" : 1,
	/** Media is some type of video */
	"VIDEO" : 2,
	/** Media is a youtube video */
	"YOUTUBE" : 3,
	/**
	 * A short description of this enum table
	 * @type {string}
	 */
	"description" : "media type",
}

/**
 * @readonly
 * @enum { number } represents how popular a post is
 */
const postPopularity = {
	/** Unknown */
	"EMPTY" : 0,
	/** post is not popular */
	"DEFAULT" : 1,
	/** post is being discussed by several individuals */
	"DISCUSSED" : 2,
	/** Post Somewhat popular */
	"COOLSTORY" : 3,
	/** Post is very popular */
	"HEADTINGUP" : 4,
	/** Post is practically viral */
	"HOT" : 5,
	/**
	 * A short description of this Enum table
	 * @type {string}
	 */
	"description" : "post popularity",
}

/** 
 * @readonly
 * @enum { number } Represents the various post categories
 */
const postCategory = {
	/** An uncategorized post */
	"NONE" : 0,
	/** A Text only post */
	"TEXTONLY" : 1,
	/** A media post */
	"MEDIA" : 2,
	/** A link post */
	"LINK" : 4,
	/** A post containing a poll */
	"POLL" : 8,
	/** A post asking a question */
	"QUESTION" : 16,
	/** A question post that has been answered */
	"ANSWERED" : 32,
	/** An announcement post */
	"ANNOUNCEMENT" : 64,
	/** A comment */
	"CONTENTCOMMENT" : 128,
	/** An official Bungie post */
	"BUNGIEOFFICIAL" : 256,
	/** An official Ninja post */
	"NINJAOFFICIAL" : 512,
	/** A recruitment post */
	"RECRUITMENT" : 1024,
	/**
	 * A short description of this Enum table
	 * @type {string}
	 */
	"description" : "post category",
}

/** 
 * @readonly
 * @enum { number } Represents the various post flags
 */
const flags = {
	/** No flags */
	"NONE" : 0,
	/** Flagged as a Bungie staff post */
	"BUNGIESTAFFPOST" : 1,
	/** Flagged as a Ninja post*/
	"FORUMNINJAPOST" : 2,
	/** Flagged as a Forum Mentor post */
	"FORUMMENTORPOST" : 4,
	/** Flagged as a Bungie staff topic*/
	"TOPICBUNGIESTAFFPOSTED" : 8,
	/** Flagged as a topic that a Bungie volunteer has post on */
	"TOPICBUNGIEVOLUNTEERPOSTED" : 16,
	/** Flagged as a question that was answered by Bungie */
	"QUESTIONANSWEREDBYBUNGIE" : 32,
	/** Flagged as a question that was answered by Ninja */
	"QUESTIONANSWEREDBYNINJA" : 64,
	/** Flagged as community content */
	"COMMUNITYCONTENT" : 128,
	/**
	 * A short description of this Enum table
	 * @type {string}
	 */
	"description" : "forum flag",
}

/** 
 * @readonly
 * @enum { number } Represents the various post sort options
 */
const forumPostSort = {
	/** Default sort order */
	'DEFAULT' : 0,
	/** Show oldest first */
	'OLDESTFIRST' : 1,
	/**
 	 * A short description of this Enum table
	 * @type{ string }
	 */
	"description" : "forum post sort option",
}

module.exports = {
	topicsCategoryFilters : map( topicsCategoryFilters ),
	topicsQuickDate       : map( topicsQuickDate ),
	topicsSort            : map( topicsSort ),
	postPopularity        : map( postPopularity ),
	postCategory          : map( postCategory ),
	flags                 : map( flags ),
	forumPostSort         : map( forumPostSort )
}