/**
 * Fixes for css isues
 * @author spambot
 */
 
FoxtrickFixcssProblems = {
       
    MODULE_NAME : "FixcssProblems",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('all'), 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Small bookmark icon added",	
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	
    OPTIONS :  new Array(           "Forum_FoxLink_Headers",
                                    "Club_Menu_Teamnames",
                                    "Page_Minimum_Height",
                                    "MatchOrder_Lineheight",
                                    "RTL_Fixes",
                                    "ForumScrollBarFix",
//                                    "Forum_ThreadlistSpace",
									"League_Table",
									"Guestbook",
									"liveHighlightRed",
									"HideFlagsInForumHeader",
									"HideLeagueInForumHeader",
                                    "Highlight_Staff_On_All_Pages",
                                    "HideUnseenMatchesPanel",
                                    "Forum_Spoiler_reveal",
									"MatchReportRatingsFontFix",
                                    "HideAchievementsIcons",
									"NoLogo"
                  
								),
	OPTIONS_CSS: new Array (
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/Forum_FoxLink_Headers.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/Club_Menu_Teamnames.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/Page_Minimum_Height.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/MatchOrder_Lineheight.css",
                                "",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/ForumScrollBarFix.css",
//                              "",
								"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/League_Table.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/Guestbook.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/liveHighlightRed.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/HideFlagsInForumHeader.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/HideLeagueInForumHeader.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/staffmarker.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/hideUnseenMatchesPanel.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/Forum_Spoiler_reveal.css",
								"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/MatchReportRatingsFontFix.css",
								"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/achievement_hideicons.css",
								"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/NoLogo.css"
                                ),
        OPTIONS_CSS_RTL: new Array (
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/Forum_FoxLink_Headers.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/Club_Menu_Teamnames.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/Page_Minimum_Height.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/MatchOrder_Lineheight.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/RTL_Fixes.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/ForumScrollBarFix.css",
//                              "",
							    "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/League_Table.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/Guestbook.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/liveHighlightRed.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/HideFlagsInForumHeader.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/HideLeagueInForumHeader.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/staffmarker.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/hideUnseenMatchesPanel.css",
                                "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/Forum_Spoiler_reveal.css",
								"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/MatchReportRatingsFontFix.css",
								"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/achievement_hideicons.css",
								"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/NoLogo.css"
                                ),
                               
    init : function() {
    },

                                                                       
    run : function(page, doc) {
       
	   if ( Foxtrick.isRTLLayout(doc) && Foxtrick.isModuleFeatureEnabled( this, "RTL_Fixes" )) {
				if (!Foxtrick.isStandardLayout( doc ) ) {
                        var css = "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/fixes/RTL_Fixes_simple.css";
						Foxtrick.addStyleSheet( doc, css );
				}							
			}					
    },
       
        change : function( page, doc ) {

        }    
};