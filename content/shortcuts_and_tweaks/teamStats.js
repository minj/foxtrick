/**
 * teamStats.js
 * Foxtrick team overview
 * @author OBarros
 */
////////////////////////////////////////////////////////////////////////////////
var FTTeamStats= {
    
    MODULE_NAME : "FTTeamStats",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : false,

    init : function() {
            Foxtrick.registerPageHandler( 'Players',
                                          FTTeamStats);
    },

    run : function( page, doc ) {
	},
	
	change : function( page, doc ) {
	
	}
};

