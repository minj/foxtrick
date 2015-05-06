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
		var teamId, teamId2;

		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var matchId = Foxtrick.Pages.Match.getId(doc);
		var isPlayed = !Foxtrick.Pages.Match.isPrematch(doc);

		if (isPlayed) {
			teamId = Foxtrick.Pages.Match.getHomeTeamId(doc);
			teamId2 = Foxtrick.Pages.Match.getAwayTeamId(doc);
		}
		else {
			var sideDiv = Foxtrick.Pages.Match.getPreMatchSummary(doc);
			if (!sideDiv)
				sideDiv = doc.getElementById('sidebar');
			teamId = Foxtrick.util.id.findTeamId(sideDiv);
			teamId2 = Foxtrick.util.id.findSecondTeamId(sideDiv, teamId);
		}
		var info = {
			matchId: matchId,
			teamId: teamId,
			teamId2: teamId2,
		};

		var subMenu = doc.querySelector('.subMenu');
		var menuTeam = Foxtrick.util.id.findTeamId(subMenu);
		if (menuTeam == teamId2) {
			info.thisTeamId = teamId2;
			info.opponentId = teamId;
		}
		else {
			info.thisTeamId = teamId;
			info.opponentId = teamId2;
		}

		var types = [];
		var hasNewSidebar = false;
		var customLinkSet = this.MODULE_NAME;

		if (isPlayed) {
			hasNewSidebar = true;
			if (isYouth) {
				types = ['playedyouthmatchlink'];
				customLinkSet += '.youth.played';
			}
			else {
				types = ['playedmatchlink'];
				customLinkSet += '.played';
			}
		}
		else if (!isYouth) {
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
