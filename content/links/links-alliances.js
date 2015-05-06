'use strict';
/**
 * linksyouthoverview.js
 * Foxtrick add links to arena pages
 * @author larsw84, LA-MJ
 */

Foxtrick.modules['LinksAlliances'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['federation'],
	LINK_TYPE: 'federationlink',
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

	links: function(doc) {
		var federationId = Foxtrick.Pages.All.getId(doc);
		var info = {
			federationId: federationId,
		};
		return { info: info };
	}
};
