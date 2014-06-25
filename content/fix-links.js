'use strict';
/*
 * fix-links.js
 * Add various parameters to standartise HT links
 * @author LA-MJ
 */

Foxtrick.modules.FixLinks = {
	CORE_MODULE: true,
	PAGES: [
		'match',
		'matches', 'matchesArchive',
		'playerStats',
		'matchesLatest',
		'players', 'youthPlayers'
	],
	NICE: -20, // place before all DOM mutating modules
	addParam: function(url, param, value, replace) {
		var newUrl = url, urlParts = url.split('#'), hasQuery = /\?/.test(urlParts[0]);
		if (replace) {
			var rePlaceRe = new RegExp('([&?])' + param + '=[^&]+&?', 'i');
			urlParts[0] = urlParts[0].replace(rePlaceRe, '$1');
			urlParts[0] = urlParts[0].replace(/\?$/, '');
			hasQuery = /\?/.test(urlParts[0]);
		}
		else if (new RegExp('[&?]' + param + '=[^&]+', 'i').test(urlParts[0]))
			return newUrl;
		newUrl = urlParts[0] + (hasQuery ? '&' : '?') + param + '=' + value +
			(urlParts[1] ? '#' + urlParts[1] : '');
		//else
		//	newUrl = url.replace(new RegExp('([&?])' + param + '=[^&]*', 'i'),
		//						 '$1' + param + '=' + value);
		return newUrl;
	},
	addAnchor: function(url, anchor) {
		var urlParts = url.split('#');
		return urlParts[0] + '#' + anchor;
	},
	addTeamId: function(url, teamId, youthTeamId) {
		url = this.addParam(url, 'teamId', teamId);
		if (youthTeamId)
			url = this.addParam(url, 'youthTeamId', youthTeamId);
		return url;
	},
	fixLineupLink: function(link, teamId, youthTeamId) {
		var url = this.addTeamId(link.href, teamId, youthTeamId);
		url = this.addAnchor(url, 'tab2');
		link.href = url;
	},
	addPlayerHighlight: function(link, playerId) {
		var url = this.addParam(link.href, 'HighlightPlayerID', playerId);
		link.href = url;
	},
	getDefaultTeamId: function(doc) {
		var teamId = Foxtrick.util.id.getTeamIdFromUrl(doc.location.href);
		if (!teamId) {
			teamId = Foxtrick.util.id.getTeamIdFromUrl(doc.querySelector('div.subMenu a').href);
			if (!teamId)
				teamId = Foxtrick.util.id.getOwnTeamId();
		}
		return teamId;
	},
	getYouthTeamId: function(doc) {
		var youthid = Foxtrick.util.id.getYouthTeamIdFromUrl(doc.location.href);
		if (!youthid) {
			var menu = doc.getElementsByClassName('subMenu')[0];
			youthid = menu ? Foxtrick.util.id.findYouthTeamId(menu) : null;
		}
		return youthid;
	},
	parseMatchPage: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc))
			return;

		var module = this;
		var makeListener = function(link) {
			return function(e) {
				var doc = link.ownerDocument;
				var l = doc.location.href.match(/(#.*)/);
				var a = link.href.match(/(#.*)/);
				if (l && !a)
					link.href = link.href + l[1];
			};
		};

		var loc = doc.location.href;
		var paramsTosave = {
			teamId: Foxtrick.util.id.getTeamIdFromUrl(loc),
			youthTeamId: Foxtrick.util.id.getYouthTeamIdFromUrl(loc),
			HighlightPlayerID: Foxtrick.getParameterFromUrl(loc, 'HighlightPlayerID'),
			BrowseIds: Foxtrick.getParameterFromUrl(loc, 'BrowseIds'),
		};
		var saveParams = function(link) {
			var url = link.href;
			for (var p in paramsTosave) {
				if (paramsTosave[p]) {
					url = module.addParam(url, p, paramsTosave[p]);
				}
			}
			link.href = url;
		};

		var browseLinks = doc.querySelectorAll('.speedBrowser a');
		for (var i = 0; i < browseLinks.length; i++) {
			var link = browseLinks[i];
			saveParams(link);
			Foxtrick.onClick(link, makeListener(link));
		}

		var links = doc.querySelectorAll('div.boxHead a');
		var id = this.getDefaultTeamId(doc);
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		for (var i = 0; i < links.length; ++i) {
			saveParams(links[i]);
		}
		links = doc.querySelectorAll('#oldMatchRatings th a');
		Foxtrick.forEach(function(link) {
			if (isYouth) {
				module.fixLineupLink(link, id, Foxtrick.Pages.Match.getHomeTeamId(doc));
			}
			else {
				module.fixLineupLink(link, Foxtrick.Pages.Match.getHomeTeamId(doc));
			}
			saveParams(link);
		}, links);
	},
	parseMatchesPage: function(doc) {
		var table = doc.querySelector('#mainBody table');
		var b = table.querySelector('a[href*="BrowseIds"]');
		var browseIds = b ? Foxtrick.getParameterFromUrl(b.href, 'BrowseIds') : null;
		var lineupImgs = table.querySelectorAll('img.matchOrder');
		var id = this.getDefaultTeamId(doc);
		var isYouth = /Youth/i.test(doc.location.href);
		var youthid = isYouth ? this.getYouthTeamId(doc) : null;
		var isReportLink = function(a) {
			return a.href && /Match\.aspx/.test(a.href) && !/#/.test(a.href);
		};

		for (var i = 0; i < lineupImgs.length; i++) {
			var link = lineupImgs[i].parentNode;
			this.fixLineupLink(link, id, youthid);
			if (browseIds)
				link.href = this.addParam(link.href, 'BrowseIds', browseIds);
			if (youthid) {
				// add youthteamid to report link
				var row = link.parentNode.parentNode;
				var reportLink = Foxtrick.nth(isReportLink, row.getElementsByTagName('a'));
				reportLink.href = this.addParam(reportLink.href, 'youthTeamId', youthid);
			}
		}
	},
	parsePlayerStats: function(doc) {
		var id = this.getDefaultTeamId(doc);
		var pid = Foxtrick.getParameterFromUrl(doc.location.href, 'PlayerID');
		var links = doc.querySelectorAll('#matches a');
		for (var i = 0; i < links.length; i++) {
			this.fixLineupLink(links[i], id);
			this.addPlayerHighlight(links[i], pid);
		}
	},
	parseH2HLatestMatches: function(doc) {
		var module = this;
		var homeId = Foxtrick.getParameterFromUrl(doc.location.href, 'HomeTeamID');
		var awayId = Foxtrick.getParameterFromUrl(doc.location.href, 'AwayTeamID');
		var names = doc.querySelectorAll('#mainBody th');
		var home = names[0].textContent.trim(), away = names[1].textContent.trim();
		var links = doc.querySelectorAll('#mainBody td.left a');
		// links go in cycles of 6
		// home team match: match-link, match-home-lineup-link, match-away-lineup-link
		// away team match: match-link, match-home-lineup-link, match-away-lineup-link

		var addTeamIdIfAway = function(match, lineup, name, id) {
			if (!new RegExp('^' + name).test(match.textContent))
				lineup.href = module.addParam(lineup.href, 'teamId', id);
		};
		for (var i = 0; i < links.length; i += 6) {
			// add ids to match-links
			links[i].href = this.addParam(links[i].href, 'teamId', homeId);
			links[i + 3].href = this.addParam(links[i + 3].href, 'teamId', awayId);
			// add ids to lineup-links if away; we don't care about third-party teams
			addTeamIdIfAway(links[i], links[i + 2], home, homeId);
			addTeamIdIfAway(links[i + 3], links[i + 5], away, awayId);
		}
	},
	parsePlayers: function(doc) {
		var module = this;
		var id = this.getDefaultTeamId(doc);
		var isYouth = Foxtrick.isPage(doc, 'youthPlayers');
		var youthid = isYouth ? this.getYouthTeamId(doc) : null;
		var players = doc.getElementsByClassName('playerInfo');
		Foxtrick.forEach(function(p) {
			var pid = Foxtrick.util.id.findPlayerId(p);
			var matchLink = p.querySelector('a[href^="/Club/Matches/Match.aspx"]');
			module.fixLineupLink(matchLink, id, youthid);
			module.addPlayerHighlight(matchLink, pid);
		}, players);
	},
	run: function(doc) {
		if (Foxtrick.isPage(doc, 'match'))
			this.parseMatchPage(doc);
			// this might be a bit annoying as it causes match page to reload
		else if (Foxtrick.isPage(doc, 'matches') || Foxtrick.isPage(doc, 'matchesArchive'))
			this.parseMatchesPage(doc);
		else if (Foxtrick.isPage(doc, 'playerStats'))
			this.parsePlayerStats(doc);
		else if (Foxtrick.isPage(doc, 'matchesLatest'))
			this.parseH2HLatestMatches(doc);
		else if (Foxtrick.isPage(doc, 'players') || Foxtrick.isPage(doc, 'youthPlayers'))
			this.parsePlayers(doc);
	},
};
