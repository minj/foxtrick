'use strict';
/**
 * linksyouthoverview.js
 * Foxtrick add links to youth overview pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksYouthOverview'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthOverview'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'youthlink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var teamid = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamid)
			return;

		var youthSummary = Foxtrick.getMBElement(doc, 'tblInfo');
		var countryid = Foxtrick.util.id.findLeagueId(youthSummary);
		var youthteamid = Foxtrick.Pages.All.getId(doc);

		var info = {
			teamid: teamid,
			youthteamid: youthteamid,
			countryid: countryid,
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
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'youthplayerdetaillink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var teamid = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamid)
			return;

		if (Foxtrick.Pages.YouthPlayer.wasFired(doc))
			return;

		var playerid = Foxtrick.Pages.All.getId(doc);
		var youthteamid = Foxtrick.Pages.All.getTeamIdFromBC(doc);
		var playername = Foxtrick.Pages.Player.getName(doc);

		var main = doc.getElementById('mainBody');
		var countryid = Foxtrick.util.id.findLeagueId(main);

		// age
		var age = Foxtrick.Pages.Player.getAge(doc);
		var years = age.years;
		var days = age.days;

		var info = {
			teamid: teamid,
			youthteamid: youthteamid,
			playerid: playerid,
			playername: playername,
			nationality: countryid,
			age: years,
			age_days: days,
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
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'youthtraininglink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var teamid = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamid)
			return;

		var youthteamid = Foxtrick.Pages.All.getTeamIdFromBC(doc);

		var info = {
			teamid: teamid,
			youthteamid: youthteamid,
		};
		var types = ['youthtraininglink'];
		return { types: types, info: info };
	},

};


Foxtrick.modules['LinksYouthPlayerList'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthPlayers'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'youthplayerlistlink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var teamid = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamid)
			return;

		var youthteamid = Foxtrick.Pages.All.getTeamIdFromBC(doc);

		var info = {
			teamid: teamid,
			youthteamid: youthteamid,
		};
		var types = ['youthplayerlistlink'];
		return { types: types, info: info };
	},

};


Foxtrick.modules['LinksYouthMatchList'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthMatchList'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'youthmatchlistlink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var teamid = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamid)
			return;

		var youthteamid = Foxtrick.Pages.All.getTeamIdFromBC(doc);

		var info = {
			teamid: teamid,
			youthteamid: youthteamid,
		};
		var types = ['youthmatchlistlink'];
		return { types: types, info: info };
	},

};


Foxtrick.modules['LinksYouthLeague'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthSeries'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'youthserieslink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var teamid = Foxtrick.Pages.All.getTeamId(doc);
		if (!teamid)
			return;

		// youthTeamId unavailable in series main header
		var subMenu = doc.querySelector('.subMenu');
		var youthteamid = Foxtrick.util.id.findYouthTeamId(subMenu);

		var youthseriesid = Foxtrick.Pages.All.getId(doc);

		var info = {
			youthseriesid: youthseriesid,
			teamid: teamid,
			youthteamid: youthteamid,
		};
		var types = ['youthserieslink'];
		return { types: types, info: info };
	},

};
