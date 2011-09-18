/**
 * links-tracker.js
 * Foxtrick add links to national pages
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "LinksTracker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	//PAGES : new Array('trackerplayerlink'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "trackerplayerlink");
	}
});
