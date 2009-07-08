/**
 * Fixes for css isues
 * @author spambot
 */
 
FoxtrickFixcssProblems = {
       
    MODULE_NAME : "FixcssProblems",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('all'), 
    DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.8.2",
	LASTEST_CHANGE:"Created function HideUnwatchedMatchesPanel, Option highlight in red new events on HTlive, Forum_ThreadlistSpace obsolte, HideFlags/Leaguelevel in forum and flickerfix for HeaderFix with Firefox 3.5 added",	
	LASTEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	
    OPTIONS :  new Array(           "Forum_FoxLink_Headers",
                                    "Club_Menu_Teamnames",
                                    "Page_Minimum_Height",
                                    "Forum_Header_Smallsize",
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
                  "HideUnseenMatchesPanel"
                  
								),
	OPTIONS_CSS: new Array (
                                "chrome://foxtrick/content/resources/css/fixes/Forum_FoxLink_Headers.css",
                                "chrome://foxtrick/content/resources/css/fixes/Club_Menu_Teamnames.css",
                                "chrome://foxtrick/content/resources/css/fixes/Page_Minimum_Height.css",
                                "chrome://foxtrick/content/resources/css/fixes/Forum_Header_Smallsize.css",
                                "chrome://foxtrick/content/resources/css/fixes/MatchOrder_Lineheight.css",
                                "",
                                "chrome://foxtrick/content/resources/css/fixes/ForumScrollBarFix.css",
//                                "",
								"chrome://foxtrick/content/resources/css/fixes/League_Table.css",
                                "chrome://foxtrick/content/resources/css/fixes/Guestbook.css",
                                "chrome://foxtrick/content/resources/css/fixes/liveHighlightRed.css",
                                "chrome://foxtrick/content/resources/css/fixes/HideFlagsInForumHeader.css",
                                "chrome://foxtrick/content/resources/css/fixes/HideLeagueInForumHeader.css",
                                "chrome://foxtrick/content/resources/css/fixes/staffmarker.css"
                                ),
        OPTIONS_CSS_RTL: new Array (
                                "chrome://foxtrick/content/resources/css/fixes/Forum_FoxLink_Headers.css",
                                "chrome://foxtrick/content/resources/css/fixes/Club_Menu_Teamnames.css",
                                "chrome://foxtrick/content/resources/css/fixes/Page_Minimum_Height.css",
                                "chrome://foxtrick/content/resources/css/fixes/Forum_Header_Smallsize.css",
                                "chrome://foxtrick/content/resources/css/fixes/MatchOrder_Lineheight.css",
                                "chrome://foxtrick/content/resources/css/fixes/RTL_Fixes.css",
                                "chrome://foxtrick/content/resources/css/fixes/ForumScrollBarFix.css",
//                                "",
							                 	"chrome://foxtrick/content/resources/css/fixes/League_Table.css",
                                "chrome://foxtrick/content/resources/css/fixes/Guestbook.css",
                                "chrome://foxtrick/content/resources/css/fixes/liveHighlightRed.css",
                                "chrome://foxtrick/content/resources/css/fixes/HideFlagsInForumHeader.css",
                                "chrome://foxtrick/content/resources/css/fixes/HideLeagueInForumHeader.css",
                                "chrome://foxtrick/content/resources/css/fixes/staffmarker.css",
                                "chrome://foxtrick/content/resources/css/fixes/hideUnseenMatchesPanel.css"
                                ),
                               
    init : function() {
    },

                                                                       
    run : function(page, doc) {
       
	   if ( Foxtrick.isRTLLayout(doc) && Foxtrick.isModuleFeatureEnabled( this, "RTL_Fixes" )) {
				if (!Foxtrick.isStandardLayout( doc ) ) {
                        var css = "chrome://foxtrick/content/resources/css/fixes/RTL_Fixes_simple.css";
						Foxtrick.addStyleSheet( doc, css );
				}							
			}
			
			
     /* obsolete      
		if (Foxtrick.isModuleFeatureEnabled( this, "Forum_ThreadlistSpace" )) {
				if (!Foxtrick.isStandardLayout( doc ) ) {
                        var css = "chrome://foxtrick/content/resources/css/fixes/Forum_ThreadlistSpace_simple.css";
						Foxtrick.addStyleSheet( doc, css );
				}
				else {
				        var css = "chrome://foxtrick/content/resources/css/fixes/Forum_ThreadlistSpace.css";
						Foxtrick.addStyleSheet( doc, css );
				}				
			}*/
             
	return;
   

                // old version
               
        // standard | simpe | all | alternate
        var LAYOUTSWITCH = new Array (
           // "standard",
           // "alternate",
            "all",
            "all",
            "all",
            "simple",
            "all",
                        "all"
        );
        dump (' => LAYOUT: ' + Foxtrick.isStandardLayout( doc ) + '\n');
        for (var i = 0; i < this.OPTIONS.length; i++) {
           
            if (Foxtrick.isModuleFeatureEnabled( this, this.OPTIONS[i]  ) ) {
                var css = "chrome://foxtrick/content/resources/css/fixes/" + this.OPTIONS[i] + ".css";
                var css_simple = "chrome://foxtrick/content/resources/css/fixes/" + this.OPTIONS[i] + "_simple.css";
                if ( ( (LAYOUTSWITCH[i] == 'standard' ) || (LAYOUTSWITCH[i] == 'all') ) && (Foxtrick.isStandardLayout( doc ) == true) ) {
                    dump ('  FIXES: (standard) ' + i + ' - ' + this.OPTIONS[i] + ' enabled.\n');
                    Foxtrick.addStyleSheet( doc, css );
                }
                else if ( ((LAYOUTSWITCH[i] == 'simple' ) || (LAYOUTSWITCH[i] == 'all')) && (Foxtrick.isStandardLayout( doc ) == false) ) {
                    // dump ('  FIXES: (simple) ' + i + ' - ' + this.OPTIONS[i] + ' enabled.\n');
                    Foxtrick.addStyleSheet ( doc, css );
                }
                                else if ( LAYOUTSWITCH[i] == 'alternate' ) {
                    // dump ('  FIXES: (simple) ' + i + ' - ' + this.OPTIONS[i] + ' enabled.\n');
                    if (Foxtrick.isStandardLayout( doc ) == false)  Foxtrick.addStyleSheet ( doc, css_simple );
                    else  Foxtrick.addStyleSheet ( doc, css );
                }                              
                else {
                    // dump ('  FIXES: ' + i + ' - ' + this.OPTIONS[i] + ' disabled.\n');
                }
            }
        }    
    },
       
        change : function( page, doc ) {

        }    
};