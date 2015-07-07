'use strict';
/**
 * links-national.js
 * Foxtrick add links to national pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksNational'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['national'],
	LINK_TYPE: 'nationalteamlink',
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
		var main = doc.getElementById('mainBody');
		var header = main.getElementsByTagName('h1')[0];
		var LeagueOfficeTypeID = /U-20/.test(header.textContent) ? 4 : 2;
		var leagueId = Foxtrick.util.id.findLeagueId(main);
		var ntTeamId = Foxtrick.Pages.All.getId(doc);

		var info = {
			leagueId: leagueId,
			ntTeamId: ntTeamId,
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
