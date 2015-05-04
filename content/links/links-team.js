'use strict';
/**
 * links-team.js
 * Foxtrick add links to team pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksTeam'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['teamPage'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'teamlink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var teamid = Foxtrick.Pages.All.getId(doc);
		if (!teamid)
			return;

		var main = doc.getElementById('mainBody');

		var teamname = Foxtrick.Pages.All.getTeamName(doc);
		var leagueid = Foxtrick.util.id.findLeagueId(main);
		var seriesname = Foxtrick.util.id.extractLeagueName(main);
		var levelnum = Foxtrick.util.id.getLevelNum(seriesname, leagueid);
		var seriesid = Foxtrick.util.id.findLeagueLeveUnitId(main);
		var userid = Foxtrick.util.id.findUserId(main);
		if (!seriesname.match(/^[A-Z]+\.\d+/i)) {
			seriesname = 'I';
		}
		var seriespos = 0, fans = 0;
		try {
			var teamInfo = main.querySelector('.teamInfo');

			var fanLink = teamInfo.querySelector('a[href^="/Club/Fans/"]');
			if (fanLink) {
				// supporter
				var fanP = fanLink.parentNode.cloneNode(true);
				fanP.removeChild(fanP.querySelector('a'));
				fans = Foxtrick.trimnum(fanP.textContent);
			}
			else {
				var pCount = 0;
				var child = teamInfo.getElementsByTagName('h2')[1];
				while ((child = child.nextElementSibling)) {
					if (child.tagName === 'P') {
						if (++pCount == 2) {
							// README: fan clubs with numbers cause problems
							// no way to distinguish them from fanCount
							var num = child.textContent.match(/\d\u00a0\d{3}/);
							fans = Foxtrick.trimnum(num || child.textContent);
							break;
						}
					}
				}
			}

			var seriesLink = teamInfo.querySelector('a[href^="/World/Series/"]');
			if (seriesLink) {
				// seriespos is not known during a game
				var seriesP = seriesLink.parentNode.cloneNode(true);
				seriesP.removeChild(seriesP.querySelector('a'));
				seriespos = seriesP.textContent.match(/\d/).toString();
			}
		}
		catch (e) {
			Foxtrick.log('seriespos/fans:', e);
		}

		var info = {
			userid: userid,
			teamid: teamid,
			teamname: teamname,
			fans: fans,
			leagueid: leagueid,
			seriesid: seriesid,
			levelnum: levelnum,
			seriespos: seriespos,
		};
		var types = ['teamlink'];

		return { types: types, info: info };
	},

};
