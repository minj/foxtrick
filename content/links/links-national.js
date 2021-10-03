'use strict';

/**
 * links-national.js
 * Foxtrick add links to national pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules.LinksNational = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['national'],
	LINK_TYPES: 'nationalteamlink',

	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc) {
		// @ts-ignore
		return Foxtrick.util.links.getPrefs(doc, this);
	},

	/** @param {document} doc */
	run: function(doc) {
		// @ts-ignore
		Foxtrick.util.links.run(doc, this);
	},

	/**
	 * @param  {document} doc
	 * @return {LinkPageDefinition}
	 */
	links: function(doc) {
		let main = doc.getElementById('mainBody');
		let header = main.querySelector('h1');
		let LeagueOfficeTypeID = -1;
		if (header) {
			// eslint-disable-next-line no-magic-numbers
			LeagueOfficeTypeID = /U21/.test(header.textContent) ? 4 : 2;
		}

		let leagueId = Foxtrick.util.id.findLeagueId(main);
		let ntTeamId = Foxtrick.Pages.All.getId(doc);

		let info = {
			leagueId,
			ntTeamId,
			LeagueOfficeTypeID,
		};

		/** @type {LinkPageType[]} */
		let types = ['nationalteamlink'];

		if (Foxtrick.Prefs.isModuleEnabled('LinksTracker')) {
			let tracker = {
				type: 'trackernationalteamlink',
				module: 'LinksTracker',
			};
			types.push(tracker);
		}

		return { types, info };
	},
};
