"use strict";
/**
 * links-tracker.js
 * Foxtrick add links to national pages
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "LinksTracker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksTracker", "trackerplayerlink");
	}
});
