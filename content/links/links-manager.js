'use strict';
/**
 * links-manager.js
 * Foxtrick add links to manager pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksManager'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['managerPage'],
	LINK_TYPE: 'managerlink',
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
		var userid = Foxtrick.Pages.All.getId(doc);
		var bcs = Foxtrick.Pages.All.getBreadCrumbs(doc);
		var username = bcs[1].textContent;

		// primary team only
		var mainBody = doc.getElementById('mainBody');
		var teamid = Foxtrick.util.id.findTeamId(mainBody);
		var teamname = Foxtrick.util.id.extractTeamName(mainBody);
		var seriesname = Foxtrick.util.id.extractLeagueName(mainBody);
		var seriesid = Foxtrick.util.id.findLeagueLeveUnitId(mainBody);

		var info = {
			teamid: teamid,
			teamname: teamname,
			userid: userid,
			username: username,
			seriesid: seriesid,
			seriesname: seriesname,
		};
		return { info: info };
	}
};
