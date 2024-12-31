'use strict';
/**
 * links-manager.js
 * Foxtrick add links to manager pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksManager'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['managerPage'],
	LINK_TYPES: 'managerlink',
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
		var userId = Foxtrick.Pages.All.getId(doc);
		var bcs = Foxtrick.Pages.All.getBreadCrumbs(doc);
		// if bcs is length 1 - no team name in breadcrumbs - we are on the user's own manager page 
		var userName = bcs[ bcs.length == 1 ? 0 : 1 ].textContent;

		var info = {
			userId: userId,
			userName: userName,
		};

		var managerInfo = doc.querySelector('.managerInfo');
		var teams = managerInfo.querySelectorAll('a[href^="/Club/?TeamID"]');
		var series = managerInfo.querySelectorAll('a[href^="/World/Series/?"]');
		var leagues = managerInfo.querySelectorAll('a[href^="/World/Leagues/League.aspx"]');
		var ct = Math.min(teams.length, series.length, leagues.length);
		for (var i = 0; i < ct; i++) {
			var idx = i ? (i + 1) : '';
			info['teamId' + idx] = Foxtrick.getUrlParam(teams[i], 'teamId');
			info['teamName' + idx] = teams[i].textContent;
			info['seriesId' + idx] = Foxtrick.getUrlParam(series[i], 'leagueLevelUnitId');
			info['seriesName' + idx] = series[i].textContent;
			info['leagueId' + idx] = Foxtrick.getUrlParam(leagues[i], 'leagueId');
		}

		return { info: info };
	}
};
