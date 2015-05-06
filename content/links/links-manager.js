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

		var info = {
			userid: userid,
			username: username,
		};

		var playerInfo = doc.querySelector('.playerInfo');
		var teams = playerInfo.querySelectorAll('a[href^="/Club/?TeamID"]');
		var series = playerInfo.querySelectorAll('a[href^="/World/Series/?"]');
		var leagues = playerInfo.querySelectorAll('a[href^="/World/Leagues/League.aspx"]');
		var ct = Math.min(teams.length, series.length, leagues.length);
		for (var i = 0; i < ct; i++) {
			var idx = i ? (i + 1) : '';
			info['teamid' + idx] = Foxtrick.getParameterFromUrl(teams[i], 'teamId');
			info['teamname' + idx] = teams[i].textContent;
			info['seriesid' + idx] = Foxtrick.getParameterFromUrl(series[i], 'leagueLevelUnitId');
			info['seriesname' + idx] = series[i].textContent;
			info['leagueid' + idx] = Foxtrick.getParameterFromUrl(leagues[i], 'leagueId');
		}

		return { info: info };
	}
};
