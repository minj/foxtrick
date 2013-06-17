'use strict';
/**
 * links-team.js
 * Foxtrick add links to team pages
 * @author convinced
 */

Foxtrick.modules['LinksTeam'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['teamPage'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links'].getOptionsHtml(doc, 'LinksTeam', 'teamlink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		this.AddLinksRight(doc);
	},

	change: function(doc) {
		// challenging etc removes box. need to re-add it
		if (doc.getElementById('ft-links-box') === null)
			this.run(doc);
	},

	AddLinksRight: function(doc) {
		var main = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var ownBoxBody = null;
		var teaminfo = this.gatherLinks(main, doc);

		var links = Foxtrick.modules['Links'].getLinks('teamlink', teaminfo, doc, this);
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrickl10n.getString('links.boxheader');
			var ownBoxBodyId = 'foxtrick_links_content';
			ownBoxBody.id = ownBoxBodyId;

			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}
		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, teaminfo);
	},

	gatherLinks: function(thisdiv, doc) {
		var countryid = Foxtrick.util.id.findLeagueId(thisdiv);
		var teamid = Foxtrick.util.id.findTeamId(thisdiv);
		var teamname = Foxtrick.util.id.extractTeamName(thisdiv);
		var leaguename = Foxtrick.util.id.extractLeagueName(thisdiv);
		var levelnum = Foxtrick.util.id.getLevelNum(leaguename, countryid);
		var leagueid = Foxtrick.util.id.findLeagueLeveUnitId(thisdiv);
		var userid = Foxtrick.util.id.findUserId(thisdiv);
		if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
			leaguename = 'I';
		}
		var leaguepos = 0, fans = 0;
		try {
			var teamInfo = doc.getElementById('mainBody').getElementsByTagName('h2')[0].parentNode;
			var ps = teamInfo.getElementsByTagName('p');
			try { leaguepos = ps[0].textContent.match(/(\d)/)[1]; }
			catch (e) {} // running game, leaguepos not known
			var children = teamInfo.childNodes;
			var child, i = 0, infocount = 0;
			while (child = children[i++]) {
				if (infocount == 2 && child.nodeName == 'P') {
					fans = children[i + 1].textContent.replace(/\u00a0/g, '').match(/(\d+)/)[1];
					break;
				}
				if (child.className && child.className == 'info')
					infocount++;
			}
		}
		catch (e) {
			Foxtrick.dump('leaguepos/fans: ' + e + '\n');
		}
		return { 'teamid': teamid, 'teamname': teamname, 'countryid': countryid,
				'levelnum': levelnum, 'leagueid': leagueid, 'userid': userid,
				'fans': fans, 'leaguepos': leaguepos };
	}
};
