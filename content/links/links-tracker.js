'use strict';
/**
 * links-tracker.js
 * Foxtrick add links to national pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksTracker'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	LINK_TYPE: 'trackerplayerlink',
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		return Foxtrick.util.links.getPrefs(doc, this, cb);
	},
};
