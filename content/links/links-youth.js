'use strict';
/**
 * linksyouthoverview.js
 * Foxtrick add links to youth overview pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksYouthOverview'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthOverview'],
	LINK_TYPE: 'youthlink',
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
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamId)
			return;

		var youthSummary = Foxtrick.getMBElement(doc, 'tblInfo');
		var leagueId = Foxtrick.util.id.findLeagueId(youthSummary);
		var youthTeamId = Foxtrick.Pages.All.getId(doc);

		var info = {
			teamId: teamId,
			youthTeamId: youthTeamId,
			leagueId: leagueId,
		};
		var types = ['youthlink'];
		if (Foxtrick.Prefs.isModuleEnabled('LinksTracker')) {
			var tracker = {
				type: 'trackeryouthlink',
				module: 'LinksTracker',
			};
			types.push(tracker);
		}
		return { types: types, info: info };
	}
};


Foxtrick.modules['LinksYouthPlayerDetail'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthPlayerDetails'],
	LINK_TYPE: 'youthplayerdetaillink',
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
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamId)
			return;

		if (Foxtrick.Pages.YouthPlayer.wasFired(doc))
			return;

		var playerId = Foxtrick.Pages.All.getId(doc);
		var youthTeamId = Foxtrick.Pages.All.getTeamIdFromBC(doc);
		var playerName = Foxtrick.Pages.Player.getName(doc);

		var main = doc.getElementById('mainBody');
		var leagueId = Foxtrick.util.id.findLeagueId(main);

		// age
		var age = Foxtrick.Pages.Player.getAge(doc);
		var years = age.years;
		var days = age.days;

		var info = {
			teamId: teamId,
			youthTeamId: youthTeamId,
			playerId: playerId,
			playerName: playerName,
			nationality: leagueId,
			age: years,
			ageDays: days,
		};
		var types = ['youthplayerdetaillink'];
		if (Foxtrick.Prefs.isModuleEnabled('LinksTracker')) {
			var tracker = {
				type: 'trackeryouthplayerlink',
				module: 'LinksTracker',
			};
			types.push(tracker);
		}
		return { types: types, info: info };
	}
};


Foxtrick.modules['LinksYouthTraining'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthTraining'],
	LINK_TYPE: 'youthtraininglink',
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
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamId)
			return;

		var youthTeamId = Foxtrick.Pages.All.getTeamIdFromBC(doc);
		var trTypes = doc.querySelectorAll('#mainBody table.form select');
		var training1 = trTypes[0].value;
		var training2 = trTypes[1].value;

		var info = {
			teamId: teamId,
			youthTeamId: youthTeamId,
			training1: training1,
			training2: training2,
		};
		return { info: info };
	},

};


Foxtrick.modules['LinksYouthPlayerList'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthPlayers'],
	LINK_TYPE: 'youthplayerlistlink',
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
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamId)
			return;

		var youthTeamId = Foxtrick.Pages.All.getTeamIdFromBC(doc);

		var main = doc.getElementById('mainBody');
		var player = main.querySelector('a[href*="rowseI"]');
		var playerIds = Foxtrick.getParameterFromUrl(player.href, 'browseIds');

		var info = {
			teamId: teamId,
			youthTeamId: youthTeamId,
			playerIds: playerIds,
		};
		return { info: info };
	},

};


Foxtrick.modules['LinksYouthMatchList'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthMatchList'],
	LINK_TYPE: 'youthmatchlistlink',
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
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamId)
			return;

		var youthTeamId = Foxtrick.Pages.All.getTeamIdFromBC(doc);

		var info = {
			teamId: teamId,
			youthTeamId: youthTeamId,
		};
		return { info: info };
	},

};


Foxtrick.modules['LinksYouthLeague'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthSeries'],
	LINK_TYPE: 'youthserieslink',
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
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamId)
			return;

		// youthTeamId unavailable in series main header
		var subMenu = doc.querySelector('.subMenu');
		var youthTeamId = Foxtrick.util.id.findYouthTeamId(subMenu);

		var youthSeriesId = Foxtrick.Pages.All.getId(doc);

		var info = {
			youthSeriesId: youthSeriesId,
			teamId: teamId,
			youthTeamId: youthTeamId,
		};
		return { info: info };
	},

};
