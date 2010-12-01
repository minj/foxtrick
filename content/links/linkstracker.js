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
	//PAGES : new Array('trackerplayerlink'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "trackerplayerlink");
	}
};
