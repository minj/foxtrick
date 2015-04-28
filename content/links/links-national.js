'use strict';
/**
 * links-national.js
 * Foxtrick add links to national pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksNational'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['national'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'nationalteamlink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var main = doc.getElementById('mainBody');
		var header = main.getElementsByTagName('h1')[0];
		var LeagueOfficeTypeID = /U-20/.test(header.textContent) ? 4 : 2;
		var leagueid = Foxtrick.util.id.findLeagueId(main);
		var ntteamid = Foxtrick.Pages.All.getId(doc);

		var info = {
			leagueid: leagueid,
			ntteamid: ntteamid,
			LeagueOfficeTypeID: LeagueOfficeTypeID
		};
		var types = ['nationalteamlink'];

		if (Foxtrick.Prefs.isModuleEnabled('LinksTracker')) {
			var tracker = {
				type: 'trackernationalteamlink',
				module: 'LinksTracker',
			};
			types.push(tracker);
		}

		return { types: types, info: info };
	}
};
