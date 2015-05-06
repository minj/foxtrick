'use strict';
/**
 * links-match.js
 * Foxtrick add links to played matches pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksMatch'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['match'],
	LINK_TYPES: [
		'playedmatchlink',
		'playedyouthmatchlink',
		'nextmatchlink',
		'matchlink'
	],
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
		// get ids
		var teamid, teamid2;

		var youthmatch = Foxtrick.Pages.Match.isYouth(doc);
		var matchid = Foxtrick.Pages.Match.getId(doc);
		var isarchivedmatch = !Foxtrick.Pages.Match.isPrematch(doc);

		if (isarchivedmatch) {
			teamid = Foxtrick.Pages.Match.getHomeTeamId(doc);
			teamid2 = Foxtrick.Pages.Match.getAwayTeamId(doc);
		}
		else {
			var sidediv = Foxtrick.Pages.Match.getPreMatchSummary(doc);
			if (!sidediv)
				sidediv = doc.getElementById('sidebar');
			teamid = Foxtrick.util.id.findTeamId(sidediv);
			teamid2 = Foxtrick.util.id.findSecondTeamId(sidediv, teamid);
		}
		var info = {
			matchid: matchid,
			teamid: teamid,
			teamid2: teamid2,
		};

		var subMenu = doc.querySelector('.subMenu');
		var menuTeam = Foxtrick.util.id.findTeamId(subMenu);
		if (menuTeam == teamid2) {
			info.thisteamid = teamid2;
			info.opponentid = teamid;
		}
		else {
			info.thisteamid = teamid;
			info.opponentid = teamid2;
		}

		var types = [];
		var hasNewSidebar = false;
		var customLinkSet = this.MODULE_NAME;

		if (isarchivedmatch) {
			hasNewSidebar = true;
			if (youthmatch) {
				types = ['playedyouthmatchlink'];
				customLinkSet += '.youth.played';
			}
			else {
				types = ['playedmatchlink'];
				customLinkSet += '.played';
			}
		}
		else if (!youthmatch) {
			// using two types for backwards-compatibility
			types = ['nextmatchlink', 'matchlink'];
			customLinkSet += '.coming';
		}
		else {
			// upcoming youth matches don't have this functionality for now
			return;
		}

		return {
			types: types,
			info: info,
			hasNewSidebar: hasNewSidebar,
			customLinkSet: customLinkSet
		};
	}
};
