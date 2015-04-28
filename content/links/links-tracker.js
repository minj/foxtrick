'use strict';
/**
 * links-tracker.js
 * Foxtrick add links to national pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksTracker'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,

	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'trackerplayerlink', cb);
	}
};
