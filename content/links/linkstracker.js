/**
 * linkstracker.js
 * Foxtrick add links to national pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksTracker = {
	
    MODULE_NAME : "LinksTracker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	NEW_AFTER_VERSION: "0.4.7.5",
	LASTEST_CHANGE: "Replaced ALL tracker icons by national flags",
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

    init : function() {
		Foxtrick.initOptionsLinks(this,"trackerplayerlink");    
 	 },

    run : function( page, doc ) {
	},
	
};