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

	running: false,
	run: function(doc) {
		this.running = true;
		Foxtrick.util.links.run(doc, this);
	},
	change: function(doc) {
		// challenging etc removes box. need to re-add it
		if (doc.getElementById('ft-links-box') === null && !this.running)
			this.run(doc);
	},

	links: function(doc) {
		var main = doc.getElementById('mainBody');
		var info = this.gatherLinks(main, doc);
		if (!info)
			return;

		var types = ['teamlink'];

		this.running = false;
		return { types: types, info: info };
	},

	gatherLinks: function(thisdiv, doc) {
		var teamid = Foxtrick.Pages.All.getId(doc);
		if (!teamid)
			return;

		var teamname = Foxtrick.Pages.All.getTeamName(doc);
		var leagueid = Foxtrick.util.id.findLeagueId(thisdiv);
		var seriesname = Foxtrick.util.id.extractLeagueName(thisdiv);
		var levelnum = Foxtrick.util.id.getLevelNum(seriesname, leagueid);
		var seriesid = Foxtrick.util.id.findLeagueLeveUnitId(thisdiv);
		var userid = Foxtrick.util.id.findUserId(thisdiv);
		if (!seriesname.match(/^[A-Z]+\.\d+/i)) {
			seriesname = 'I';
		}
		var seriespos = 0, fans = 0;
		try {
			var teamInfo = thisdiv.querySelector('.teamInfo');

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
		return {
			userid: userid,
			teamid: teamid,
			teamname: teamname,
			fans: fans,
			leagueid: leagueid,
			seriesid: seriesid,
			levelnum: levelnum,
			seriespos: seriespos,
		};
	}
};
