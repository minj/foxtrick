'use strict';
/**
 * links-players.js
 * Foxtrick add links to manager pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksPlayers'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['allPlayers'],
	LINK_TYPE: 'playerslink',
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
		if (Foxtrick.isPage(doc, 'keyPlayers'))
			// README: keyPlayers has no browseIds
			return;

		var teamId = Foxtrick.Pages.All.getId(doc);
		var teamName = Foxtrick.Pages.All.getTeamName(doc);
		var main = doc.getElementById('mainBody');
		var player = main.querySelector('a[href*="rowseI"]');
		var playerIds = player ? Foxtrick.getParameterFromUrl(player.href, 'browseIds') : null;

		var info = {
			teamId: teamId,
			teamName: teamName,
			playerIds: playerIds,
		};

		return { info: info };
	},
};
