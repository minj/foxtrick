'use strict';
/**
 * links-league.js
 * Foxtrick add links to coach pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksCoach'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['coach'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'coachlink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function() {
		var info = {};
		var types = ['coachlink'];
		return { types: types, info: info };
	}
};
