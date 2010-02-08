/**
 * Presentation Fixes
 * @author spambot, ljushaff
 */ 
 
FoxtrickSimplePresentation = {
       
    MODULE_NAME : "SimplePresentation",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('all'), 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.5.0.2",
	LATEST_CHANGE:"Added module for presentation options",	
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	
    OPTIONS :  new Array(           "League_Table",
									"Guestbook",
									"liveHighlightRed",
									"Highlight_Staff_On_All_Pages",
                                    "HideUnseenMatchesPanel",
                                    "HideAchievementsIcons",
									"NoLogo"
                  
								),
	OPTIONS_CSS: new Array (
                                Foxtrick.ResourcePath+"resources/css/fixes/League_Table.css",
                                Foxtrick.ResourcePath+"resources/css/fixes/Guestbook.css",
                                Foxtrick.ResourcePath+"resources/css/fixes/liveHighlightRed.css",
                                Foxtrick.ResourcePath+"resources/css/fixes/staffmarker.css",
                                Foxtrick.ResourcePath+"resources/css/fixes/hideUnseenMatchesPanel.css",
                                Foxtrick.ResourcePath+"resources/css/fixes/achievement_hideicons.css",
								Foxtrick.ResourcePath+"resources/css/fixes/NoLogo.css"
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