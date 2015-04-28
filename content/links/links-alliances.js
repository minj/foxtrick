'use strict';
/**
 * linksyouthoverview.js
 * Foxtrick add links to arena pages
 * @author larsw84, LA-MJ
 */

Foxtrick.modules['LinksAlliances'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['federation'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'federationlink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var allianceId = Foxtrick.Pages.All.getId(doc);
		var info = {
			federationid: allianceId,
		};
		var types = ['federationlink'];
		return { types: types, info: info };
	}
};
