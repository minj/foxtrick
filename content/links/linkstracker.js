/**
 * linkstracker.js
 * Foxtrick add links to national pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksTracker = {
	
    MODULE_NAME : "LinksTracker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

    init : function() {
 		var linktypes = new Array("trackernationalteamlink","trackerplayerlink");
		Foxtrick.initOptionsLinksArray(this,linktypes);
 	 },

    run : function( page, doc ) {
	},
	
};