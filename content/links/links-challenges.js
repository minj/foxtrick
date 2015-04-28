'use strict';
/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksChallenges'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['challenges', 'youthChallenges'],
	LINK_TYPES: ['challengeslink', 'youthchallengeslink'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, this.LINK_TYPES, cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		var youthTeamId = Foxtrick.Pages.All.getTeamIdFromBC(doc);

		var types = ['challengeslink'];
		var info = { teamid: teamId };
		var customLinkSet = this.MODULE_NAME;

		if (Foxtrick.isPage(doc, 'youthChallenges')) {
			types = ['youthchallengeslink'];
			info.youthteamid = youthTeamId;
			customLinkSet += '.youth';
		}

		return { types: types, info: info, customLinkSet: customLinkSet };
	}
};
