'use strict';
/**
 * links-league.js
 * Foxtrick add links to country pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksCountry'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['country'],
	LINK_TYPE: 'leaguelink',
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
		var flag = doc.getElementsByClassName('flag')[0];
		var leagueId = Foxtrick.util.id.findLeagueId(flag.parentNode);

		// get English name
		var englishName = Foxtrick.L10n.getCountryNameEnglish(leagueId);

		var info = {
			leagueId: leagueId,
			englishName: englishName
		};
		var types = ['leaguelink'];
		if (Foxtrick.Prefs.isModuleEnabled('LinksTracker')) {
			var tracker = {
				type: 'trackerleaguelink',
				module: 'LinksTracker',
			};
			types.push(tracker);
		}

		return { types: types, info: info };
	}
};
