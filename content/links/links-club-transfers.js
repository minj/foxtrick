'use strict';
/**
 * linksClubTransfers.js
 * Foxtrick add links to arena pages
 * @author convincedd, LA-MJ
 */

Foxtrick.modules['LinksClubTransfers'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['transfer'],
	LINK_TYPE: 'clubtransferslink',
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
