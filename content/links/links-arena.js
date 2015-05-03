'use strict';
/**
 * linksyouthoverview.js
 * Foxtrick add links to arena pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksArena'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['arena'],
	LINK_TYPE: 'arenalink',
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
		var arenaInfo = doc.querySelector('div.arenaInfo');
		if (!arenaInfo)
			return;

		var arenaId = Foxtrick.Pages.All.getId(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);

		var arenaTable = arenaInfo.getElementsByTagName('table')[0];
		var info = {
			terraces: Foxtrick.trimnum(arenaTable.rows[3].cells[1].textContent),
			basic: Foxtrick.trimnum(arenaTable.rows[4].cells[1].textContent),
			roof: Foxtrick.trimnum(arenaTable.rows[5].cells[1].textContent),
			vip: Foxtrick.trimnum(arenaTable.rows[6].cells[1].textContent),
			teamid: teamId,
			arenaid: arenaId,
		};
		return { info: info };
	}
};
