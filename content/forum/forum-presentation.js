"use strict";
/**
 * Forum Presentation Fixes
 * @author spambot, ljushaff
 */

Foxtrick.util.module.register({
	MODULE_NAME : "ForumPresentation",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : ['forum', 'forumViewThread', 'forumOverView' , 'forumDefault', 'forumWritePost', 'forumModWritePost'],

	OPTIONS : [
		"HideFlagsInForumHeader",
		"HideLeagueInForumHeader",
		"Forum_Spoiler_reveal",
		"Forum_NewPostsInBracket",
		"Forum_Link_Grey_Icons",
		"moved_avatarinfo_fix"
	],
	OPTIONS_CSS : [
		Foxtrick.InternalPath+"resources/css/fixes/HideFlagsInForumHeader.css",
		Foxtrick.InternalPath+"resources/css/fixes/HideLeagueInForumHeader.css",
		Foxtrick.InternalPath+"resources/css/fixes/Forum_Spoiler_reveal.css",
		Foxtrick.InternalPath+"resources/css/fixes/Forum_NewPostsInBracket.css",
		Foxtrick.InternalPath+"resources/css/fixes/Forum_Link_Grey_Icons.css",
		Foxtrick.InternalPath+"resources/css/fixes/moved_avatarinfo_fix.css"
	]
});
