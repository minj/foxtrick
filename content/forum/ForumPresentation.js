/**
 * Forum Presentation Fixes
 * @author spambot, ljushaff
 */ 
 
FoxtrickForumPresentation = {
       
    MODULE_NAME : "ForumPresentation",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('all'), 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.5.0.2",
	LATEST_CHANGE:"Added module for additional Forum presentation options",	
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	
    OPTIONS :  new Array(           "HideFlagsInForumHeader",
									"HideLeagueInForumHeader",
									"Forum_Spoiler_reveal",
									"hideForumNotificationBox"
                  
								),
	OPTIONS_CSS: new Array (
                                Foxtrick.ResourcePath+"resources/css/fixes/HideFlagsInForumHeader.css",
                                Foxtrick.ResourcePath+"resources/css/fixes/HideLeagueInForumHeader.css",
                                Foxtrick.ResourcePath+"resources/css/fixes/Forum_Spoiler_reveal.css",
                                Foxtrick.ResourcePath+"resources/css/fixes/hideForumNotificationBox.css"
								),
                               
    init : function() {
    },

                                                                       
    run : function(page, doc) {
       
	for (var i = 0; i < this.OPTIONS.length; i++) {
           
            if (Foxtrick.isModuleFeatureEnabled( this, this.OPTIONS[i]  ) ) {
                var css = Foxtrick.ResourcePath+"resources/css/fixes/" + this.OPTIONS[i] + ".css";
                var css_simple = Foxtrick.ResourcePath+"resources/css/fixes/" + this.OPTIONS[i] + "_simple.css";
                if ( ( (LAYOUTSWITCH[i] == 'standard' ) || (LAYOUTSWITCH[i] == 'all') ) && (Foxtrick.isStandardLayout( doc ) == true) ) {
                    Foxtrick.dump ('  FIXES: (standard) ' + i + ' - ' + this.OPTIONS[i] + ' enabled.\n');
                    Foxtrick.addStyleSheet( doc, css );
                }
                else if ( ((LAYOUTSWITCH[i] == 'simple' ) || (LAYOUTSWITCH[i] == 'all')) && (Foxtrick.isStandardLayout( doc ) == false) ) {
                    // Foxtrick.dump ('  FIXES: (simple) ' + i + ' - ' + this.OPTIONS[i] + ' enabled.\n');
                    Foxtrick.addStyleSheet ( doc, css );
                }
                                else if ( LAYOUTSWITCH[i] == 'alternate' ) {
                    // Foxtrick.dump ('  FIXES: (simple) ' + i + ' - ' + this.OPTIONS[i] + ' enabled.\n');
                    if (Foxtrick.isStandardLayout( doc ) == false)  Foxtrick.addStyleSheet ( doc, css_simple );
                    else  Foxtrick.addStyleSheet ( doc, css );
                }                              
                else {
                    // Foxtrick.dump ('  FIXES: ' + i + ' - ' + this.OPTIONS[i] + ' disabled.\n');
                }
            }
        }    
    },
       
        change : function( page, doc ) {

        }    
};