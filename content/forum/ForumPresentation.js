/**
 * Forum Presentation Fixes
 * @author spambot, ljushaff
 */

FoxtrickForumPresentation = {
    MODULE_NAME : "ForumPresentation",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forum', 'forumViewThread', 'forumOverView' , 'forumDefault', 'forumWritePost', 'forumModWritePost'),
    DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.5.0.5",
	LATEST_CHANGE:"Added module for additional Forum presentation options",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

    OPTIONS :  new Array(           "HideFlagsInForumHeader",
									"HideLeagueInForumHeader",
									"Forum_Spoiler_reveal",
									"hideForumNotificationBox",
									"Forum_NewPostsInBracket",
									"Forum_Link_Grey_Icons",
									"moved_avatarinfo_fix"
								),
	OPTIONS_CSS: new Array (
                                Foxtrick.ResourcePath+"resources/css/fixes/HideFlagsInForumHeader.css",
                                Foxtrick.ResourcePath+"resources/css/fixes/HideLeagueInForumHeader.css",
                                Foxtrick.ResourcePath+"resources/css/fixes/Forum_Spoiler_reveal.css",
                                Foxtrick.ResourcePath+"resources/css/fixes/hideForumNotificationBox.css",
								Foxtrick.ResourcePath+"resources/css/fixes/Forum_NewPostsInBracket.css",
								Foxtrick.ResourcePath+"resources/css/fixes/Forum_Link_Grey_Icons.css",
								Foxtrick.ResourcePath+"resources/css/fixes/moved_avatarinfo_fix.css"
								)
};
