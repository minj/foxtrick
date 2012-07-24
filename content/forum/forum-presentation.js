"use strict";
/**
 * Forum Presentation Fixes
 * @author spambot, ljushaff
 */

Foxtrick.modules["ForumPresentation"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : ['forum', 'forumViewThread', 'forumOverview' , 'forumDefault', 'forumWritePost', 'forumModWritePost'],

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
	],

	run : function(doc) {
		if(FoxtrickPrefs.isModuleOptionEnabled("ForumPresentation", "Forum_NewPostsInBracket")){
			Foxtrick.map(function(node){
				Foxtrick.makeFeaturedElement(node, Foxtrick.modules.ForumPresentation);
				for(var i=0; i < node.childNodes.length; i++)
					if(node.childNodes[i].tagName === undefined)
						node.removeChild(node.childNodes[i]);
			}, doc.getElementsByClassName("threadInfo")); //fplThreadInfo should be added to but that's dynamic in default -> more tricky
		}	
	}
};
