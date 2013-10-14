'use strict';
/**
 * links-tracker.js
 * Foxtrick add links to national pages
 * @author convinced
 */

Foxtrick.modules['LinksTracker'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links']
			.getOptionsHtml(doc, 'LinksTracker', 'trackerplayerlink', callback);
	}
};
