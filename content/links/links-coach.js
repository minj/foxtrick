'use strict';
/**
 * links-league.js
 * Foxtrick add links to coach pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksCoach'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['coach'],
	LINK_TYPE: 'coachlink',
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		return Foxtrick.util.links.getPrefs(doc, this, cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function() {
		return {};
	}
};
