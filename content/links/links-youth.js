'use strict';
/**
 * linksyouthoverview.js
 * Foxtrick add links to youth overview pages
 * @author convinced
 */

Foxtrick.modules['LinksYouthOverview'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthOverview'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links']
			.getOptionsHtml(doc, 'LinksYouthOverview', 'youthlink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var boxleft = doc.getElementsByClassName('subMenu')[0];
		if (boxleft == null)
			return;
		var teamid = Foxtrick.util.id.findTeamId(boxleft);
		if (teamid == '')
			return;
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var youthSummary = doc.getElementById('ctl00_ctl00_CPContent_CPMain_tblInfo');
		var countryid = Foxtrick.util.id.findLeagueId(youthSummary);
		var main = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var youthteamid = Foxtrick.util.id.findYouthTeamId(main);
		var server = Foxtrick.Prefs.getBool('hty-stage') ? 'stage' : 'www';


		//addExternalLinksToYouthOverview
		var ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
		var header = Foxtrick.L10n.getString('links.boxheader');
		var ownBoxBodyId = 'foxtrick_links_content';
		ownBoxBody.setAttribute('id', ownBoxBodyId);

		var added = 0;
		var links = Foxtrick.modules['Links'].getLinks('youthlink', {
			'ownteamid': ownteamid,
			'teamid': teamid,
			'youthteamid': youthteamid,
			'owncountryid': owncountryid,
			'countryid': countryid,
			'server': server
		}, doc, this);
		if (links.length > 0) {
			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
				added++
			}
		}
		if (Foxtrick.Prefs.isModuleEnabled('LinksTracker')) {
			var links2 = Foxtrick.modules['Links'].getLinks('trackeryouthlink', {
				'countryid': countryid,
			}, doc, Foxtrick.modules['LinksTracker']);
			if (links2.length > 0) {
				for (var i = 0; i < links2.length; ++i) {
					links2[i].link.className = 'flag inner';
					var img = links2[i].link.getElementsByTagName('img')[0];
					var style = 'vertical-align:top; margin-top:1px; background: transparent ' +
						'url(/Img/Flags/flags.gif) no-repeat scroll ' + (-20) * countryid +
						'px 0pt; background-clip: -moz-initial; background-origin: ' +
						'-moz-initial; background-inline-policy: -moz-initial;';
					img.setAttribute('style', style);
					img.src = '/Img/Icons/transparent.gif';
					ownBoxBody.appendChild(links2[i].link);
					++added;
				}
			}
		}
		if (added) {
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
			Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, {});
		}
	}
};


Foxtrick.modules['LinksYouthPlayerDetail'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthPlayerDetails'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links'].getOptionsHtml(doc, 'LinksYouthPlayerDetail',
		                                                'youthplayerdetaillink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var boxleft = doc.getElementsByClassName('subMenu')[0];
		if (boxleft == null)
			return;
		var teamid = Foxtrick.util.id.findTeamId(boxleft);
		if (teamid === '')
			return;

		var main = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(main);
		var server = Foxtrick.Prefs.getBool('hty-stage') ? 'stage' : 'www';

		var thisdiv = main.getElementsByTagName('div')[0];
		var countryid = Foxtrick.util.id.findLeagueId(main);
		var playerid = Foxtrick.util.id.findPlayerId(thisdiv);
		var playername = thisdiv.getElementsByTagName('a')[1].textContent;

		// age
		var age = Foxtrick.Pages.Player.getAge(doc);
		var years = age.years;
		var days = age.days;

		//addExternalLinksToYouthdetail
		var added = 0;
		var header = Foxtrick.L10n.getString('links.boxheader');
		var ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
		var ownBoxBodyId = 'foxtrick_links_content';
		ownBoxBody.id = ownBoxBodyId;

		var links = Foxtrick.modules['Links'].getLinks('youthplayerdetaillink', {
			'ownteamid': ownteamid,
			'teamid': teamid,
			'youthteamid': youthteamid,
			'playerid': playerid,
			'playername': playername,
			'age': years,
			'age_days': days,
			'owncountryid': owncountryid,
			'nationality': countryid,
			'server': server
		}, doc, this);
		if (links.length > 0) {
			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
				added++;
			}
		}
		if (Foxtrick.Prefs.isModuleEnabled('LinksTracker')) {
			var links2 = Foxtrick.modules['Links'].getLinks('trackeryouthlink', {
				'countryid': countryid,
			}, doc, Foxtrick.modules['LinksTracker']);
			if (links2.length > 0) {
				for (var i = 0; i < links2.length; ++i) {
					links2[i].link.className = 'flag inner';
					var img = links2[i].link.getElementsByTagName('img')[0];
					var style = 'vertical-align:top; margin-top:1px; background: transparent ' +
						'url(/Img/Flags/flags.gif) no-repeat scroll ' + (-20) * countryid +
						'px 0pt; background-clip: -moz-initial; background-origin: ' +
						'-moz-initial; background-inline-policy: -moz-initial;';
					img.setAttribute('style', style);
					img.src = '/Img/Icons/transparent.gif';
					ownBoxBody.appendChild(links2[i].link);
					++added;
				}
			}
		}
		if (added) {
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
			Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, {});
		}

	}
};


Foxtrick.modules['LinksYouthTraining'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthTraining'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links']
			.getOptionsHtml(doc, 'LinksYouthTraining', 'youthtraininglink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var boxleft = doc.getElementsByClassName('subMenu')[0];
		var ownteamid = 0;
		var owncountryid = 0;
		if (boxleft == null)
			return;
		var teamid = Foxtrick.util.id.findTeamId(boxleft);
		if (teamid == '')
			return;
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var main = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var youthteamid = Foxtrick.util.id.findYouthTeamId(main);
		var server = Foxtrick.Prefs.getBool('hty-stage') ? 'stage' : 'www';

		//addExternalLinksToYouthOverview
		var ownBoxBody = null;
		var links = Foxtrick.modules['Links'].getLinks('youthtraininglink', {
			'ownteamid': ownteamid,
			'teamid': teamid,
			'youthteamid': youthteamid,
			'owncountryid': owncountryid,
			'server': server
		}, doc, this);
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrick.L10n.getString('links.boxheader');
			var ownBoxBodyId = 'foxtrick_links_content';
			ownBoxBody.setAttribute('id', ownBoxBodyId);

			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}
		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, {});
	},

};


Foxtrick.modules['LinksYouthPlayerList'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthPlayers'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links']
			.getOptionsHtml(doc, 'LinksYouthPlayerList', 'youthplayerlistlink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var boxleft = doc.getElementsByClassName('subMenu')[0];
		var ownteamid = 0;
		var owncountryid = 0;
		if (boxleft == null)
			return;
		var teamid = Foxtrick.util.id.findTeamId(boxleft);
		if (teamid == '')
			return;
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var main = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var youthteamid = Foxtrick.util.id.findYouthTeamId(main);
		var server = Foxtrick.Prefs.getBool('hty-stage') ? 'stage' : 'www';


		//addExternalLinksToYouthOverview
		var ownBoxBody = null;
		var links = Foxtrick.modules['Links'].getLinks('youthplayerlistlink', {
			'ownteamid': ownteamid,
			'teamid': teamid,
			'youthteamid': youthteamid,
			'owncountryid': owncountryid,
			'server': server
		}, doc, this);
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrick.L10n.getString('links.boxheader');
			var ownBoxBodyId = 'foxtrick_links_content';
			ownBoxBody.setAttribute('id', ownBoxBodyId);

			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}
		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, {});
	}
};


Foxtrick.modules['LinksYouthMatchList'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthMatchList'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links']
			.getOptionsHtml(doc, 'LinksYouthMatchList', 'youthmatchlistlink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var boxleft = doc.getElementsByClassName('subMenu')[0];
		var ownteamid = 0;
		var owncountryid = 0;
		if (boxleft == null)
			return;
		var teamid = Foxtrick.util.id.findTeamId(boxleft);
		if (teamid == '')
			return;
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var main = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var youthteamid = Foxtrick.util.id.findYouthTeamId(main);
		var server = Foxtrick.Prefs.getBool('hty-stage') ? 'stage' : 'www';


		//addExternalLinksToYouthOverview
		var ownBoxBody = null;
		var links = Foxtrick.modules['Links'].getLinks('youthmatchlistlink', {
			'ownteamid': ownteamid,
			'teamid': teamid,
			'youthteamid': youthteamid,
			'owncountryid': owncountryid,
			'server': server
		}, doc, this);
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrick.L10n.getString('links.boxheader');
			var ownBoxBodyId = 'foxtrick_links_content';
			ownBoxBody.setAttribute('id', ownBoxBodyId);

			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}
		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, {});
	}
};


Foxtrick.modules['LinksYouthLeague'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['youthSeries'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links']
			.getOptionsHtml(doc, 'LinksYouthLeague', 'youthleaguelink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var boxleft = doc.getElementsByClassName('subMenu')[0];
		var ownteamid = 0;
		var owncountryid = 0;
		if (boxleft == null)
			return;
		var teamid = Foxtrick.util.id.findTeamId(boxleft);
		if (teamid == '')
			return;
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var main = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var youthteamid = Foxtrick.util.id.findYouthTeamId(main);
		var youthleagueid = Foxtrick.util.id.findYouthLeagueId(main);

		//addExternalLinksToYouthLeague
		var ownBoxBody = null;
		var links = Foxtrick.modules['Links'].getLinks('youthleaguelink', {
			'ownteamid': ownteamid,
			'teamid': teamid,
			'youthteamid': youthteamid,
			'owncountryid': owncountryid,
			'youthleagueid': youthleagueid
		}, doc, this);
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrick.L10n.getString('links.boxheader');
			var ownBoxBodyId = 'foxtrick_links_content';
			ownBoxBody.setAttribute('id', ownBoxBodyId);

			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}
		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, {});
	}
};
