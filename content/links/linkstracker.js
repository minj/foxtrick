/**
 * linkstracker.js
 * Foxtrick add links to national pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksTracker = {

    MODULE_NAME : "LinksTracker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	NEW_AFTER_VERSION: "0.4.8.3",
	LATEST_CHANGE: "Fixed saving of preference saving. All tracker settings are back to default on unfortunatelly",
	DEFAULT_ENABLED : true,
	//PAGES : new Array('trackerplayerlink'),
	OPTIONS : {},

    init : function() {
		Foxtrick.initOptionsLinks(this,"trackerplayerlink");
 	 },

    run : function( page, doc ) {
	},


};