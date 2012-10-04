'use strict';
/**
 * links-match.js
 * Foxtrick add links to played matches pages
 * @author convinced
 */

Foxtrick.modules['LinksMatch'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['match', 'matchOld'],
	CSS: Foxtrick.InternalPath + 'resources/css/links-match.css',
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links'].getOptionsHtml(doc, 'LinksMatch',
			['playedmatchlink', 'playedyouthmatchlink', 'nextmatchlink', 'matchlink'], callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		// get ids
		var youthmatch = Foxtrick.util.id.findIsYouthMatch(doc.location.href);
		var teamid, teamid2;

		var alldivs = doc.getElementsByTagName('div');
		var matchid = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);
		var isarchivedmatch =
			(doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlPreMatch') == null);
		//Foxtrick.dump('isarchivedmatch:'+isarchivedmatch+'\n');
		var hasNewRatings = Foxtrick.Pages.Match.hasNewRatings(doc);

		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementsByClassName('main')[0]);
		var server = FoxtrickPrefs.getBool('hty-stage') ? 'stage' : 'www';
		var ownyouthteamid = Foxtrick.util.id.getOwnYouthTeamId();

		if (isarchivedmatch) {
			if (hasNewRatings) {
				var teamH1 = doc.getElementsByTagName('h1')[0];
				teamid = Foxtrick.util.id.findTeamId(teamH1);
				teamid2 = Foxtrick.util.id.findSecondTeamId(teamH1, teamid);
			}
			else {
				var sidediv = doc.getElementById('sidebar');
				teamid = Foxtrick.util.id.findTeamId(sidediv);
				teamid2 = Foxtrick.util.id.findSecondTeamId(sidediv, teamid);
			}
		}
		else {
			var sidediv = doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlTeamInfo');
			if (!sidediv) sidediv = doc.getElementById('sidebar');
			teamid = Foxtrick.util.id.findTeamId(sidediv);
			teamid2 = Foxtrick.util.id.findSecondTeamId(sidediv, teamid);
		}
		var links, links2;
		var add_links = false;
		//addExternalLinksToPlayedMatch
		if (isarchivedmatch) {
			if (youthmatch) {
				links = Foxtrick.modules['Links']
					.getLinks('playedyouthmatchlink',
					          { 'ownyouthteamid': ownyouthteamid, 'matchid': matchid,
					          'teamid': teamid, 'teamid2': teamid2, 'server': server}, doc, this); }
			else {
				links = Foxtrick.modules['Links']
					.getLinks('playedmatchlink', { 'matchid': matchid, 'teamid': teamid,
					          'teamid2': teamid2 }, doc, this); }
			if (links.length > 0)
				add_links = true;
		}
		//addExternalLinksToCommingMatch
		if (!isarchivedmatch && !youthmatch) {
			links = Foxtrick.modules['Links']
				.getLinks('nextmatchlink', { 'matchid': matchid, 'teamid': teamid,
				          'teamid2': teamid2 }, doc, this);
			links2 = Foxtrick.modules['Links']
				.getLinks('matchlink', { 'matchid': matchid, 'teamid': teamid, 'teamid2': teamid2 },
				          doc, this);
			if (links.length + links2.length > 0)
				add_links = true;
		}
		// add links box
		var ownBoxBody = null;
		if (add_links) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrickl10n.getString('links.boxheader');
			var ownBoxBodyId = 'foxtrick_links_content';
			ownBoxBody.setAttribute('id', ownBoxBodyId);

			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
			}
			if (links2) {
				for (var k = 0; k < links2.length; k++) {
					links2[k].link.className = 'inner';
					ownBoxBody.appendChild(links2[k].link);
				}
			}
			if (!hasNewRatings)
				var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			else
				var box = Foxtrick.Pages.Match.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}

		// add custom links
		if (isarchivedmatch) {
			var prefset = this.MODULE_NAME + '.played';
			if (youthmatch)
				prefset = this.MODULE_NAME + '.youth.played';
			//disable for now
			if (!hasNewRatings)
				Foxtrick.util.links.add(doc, ownBoxBody, prefset, { 'matchid': matchid,
				                        'teamid': teamid, 'teamid2': teamid2 }, hasNewRatings);
		}
		if (!isarchivedmatch && !youthmatch) {
			Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME + '.coming',
			                        { 'matchid': matchid, 'teamid': teamid, 'teamid2': teamid2 });
		}
	}
};
