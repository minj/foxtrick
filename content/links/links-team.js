'use strict';
/**
 * links-team.js
 * Foxtrick add links to team pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksTeam'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['teamPage'],
	LINK_TYPE: 'teamlink',
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
		var teamId = Foxtrick.Pages.All.getId(doc);
		if (!teamId)
			return;

		var main = doc.getElementById('mainBody');

		var userId = Foxtrick.util.id.findUserId(main);
		var teamName = Foxtrick.Pages.All.getTeamName(doc);
		var leagueId = Foxtrick.util.id.findLeagueId(main);
		var seriesName = Foxtrick.util.id.extractLeagueName(main);
		var seriesId = Foxtrick.util.id.findLeagueLeveUnitId(main);

		var series = Foxtrick.util.id.parseSeries(seriesName, leagueId);
		var levelNum = series[0];
		var seriesNum = series[1];
		var seriesPos = 0, fans = 0;
		try {
			var teamInfo = main.querySelector('.teamInfo');

			var fanClubSize = teamInfo.querySelector('.fanClubSize');
			fans = Foxtrick.trimnum(fanClubSize.textContent);

			var seriesLink = teamInfo.querySelector('a[href^="/World/Series/"]');
			if (seriesLink) {
				// seriesPos is not known during a game
				var seriesP = seriesLink.parentNode.cloneNode(true);
				seriesP.removeChild(seriesP.querySelector('a'));
				seriesPos = seriesP.textContent.match(/\d/).toString();
			}
		}
		catch (e) {
			Foxtrick.log('seriesPos/fans:', e);
		}

		var info = {
			userId: userId,
			teamId: teamId,
			teamName: teamName,
			fans: fans,
			leagueId: leagueId,
			seriesId: seriesId,
			levelNum: levelNum,
			seriesNum: seriesNum,
			seriesPos: seriesPos,
		};

		return { info: info };
	},

};
