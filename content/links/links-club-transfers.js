'use strict';
/**
 * linksClubTransfers.js
 * Foxtrick add links to arena pages
 * @author convincedd, LA-MJ
 */

Foxtrick.modules['LinksClubTransfers'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['transfer'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'clubtransferslink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function() {
		var info = {};
		var types = ['clubtransferslink'];
		return { types: types, info: info };
	}
};
