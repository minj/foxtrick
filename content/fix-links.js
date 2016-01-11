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
		'matches', 'matchesArchive', 'matchesCup',
		'playerStats',
		'matchesLatest',
		'players', 'youthPlayers',
	],
	NICE: -20, // place before all DOM mutating modules
	addParam: function(originalUrl, param, value, replace) {
		var parts = originalUrl.split('#'), url = parts[0], anchor = parts[1];

		param = encodeURIComponent(param);
		value = encodeURIComponent(value);

		var reStr = Foxtrick.strToRe(param);
		var paramRe = new RegExp('([&?])' + reStr + '=[^&]*&?', 'i');
		if (!replace && paramRe.test(url)) {
			return originalUrl;
		}
		else {
			url = url.replace(paramRe, '$1');
			url = url.replace(/\?$/, ''); // strip ? if query was emptied
		}

		url += (/\?/.test(url) ? '&' : '?') + param + '=' + value + (anchor ? '#' + anchor : '');
		return url;
	},
	addAnchor: function(url, anchor) {
		var urlParts = url.split('#');
		return urlParts[0] + '#' + encodeURIComponent(anchor);
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
	getMenuTeamId: function(doc) {
		var teamLink = doc.querySelector('.subMenu a[href*="TeamID="]');
		return Foxtrick.util.id.getTeamIdFromUrl(teamLink.href);
	},
	getDefaultTeamId: function(doc) {
		var teamId = Foxtrick.util.id.getTeamIdFromUrl(doc.location.href);
		if (!teamId) {
			teamId = this.getMenuTeamId(doc) || Foxtrick.util.id.getOwnTeamId();
		}
		return teamId;
	},
	getYouthTeamId: function(doc) {
		var youthId = Foxtrick.util.id.getYouthTeamIdFromUrl(doc.location.href);
		if (!youthId) {
			var menu = doc.querySelector('.subMenu');
			youthId = menu ? Foxtrick.util.id.findYouthTeamId(menu) : null;
		}
		return youthId;
	},
	parseMatchPage: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc) || Foxtrick.Pages.Match.inProgress(doc))
			return;

		var module = this;
		var loc = doc.location.href;
		var docAnchor = loc.match(/#.*/);

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
		Foxtrick.forEach(function(link) {
			saveParams(link);
			Foxtrick.onClick(link, function() {
				var linkAnchor = this.href.match(/#.*/);
				if (!linkAnchor && docAnchor)
					link.href += docAnchor[0];
			});
		}, browseLinks);

		var id = module.getDefaultTeamId(doc);
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var links = doc.querySelectorAll('div.boxHead a');
		Foxtrick.forEach(saveParams, links);

		var matchLinks = doc.querySelectorAll('#oldMatchRatings th a');
		Foxtrick.forEach(function(link) {
			if (isYouth) {
				module.fixLineupLink(link, id, Foxtrick.Pages.Match.getHomeTeamId(doc));
			}
			else {
				module.fixLineupLink(link, Foxtrick.Pages.Match.getHomeTeamId(doc));
			}
			saveParams(link);
		}, matchLinks);
	},
	parseMatchesPage: function(doc) {
		var module = this;

		var id = module.getDefaultTeamId(doc);
		var isYouth = Foxtrick.Pages.All.isYouth(doc);
		var youthTeamId = isYouth ? module.getYouthTeamId(doc) : null;

		var table = doc.querySelector('#mainBody table');
		var browser = table.querySelector('a[href*="BrowseIds"]');
		var browseIds = browser ? Foxtrick.getParameterFromUrl(browser.href, 'BrowseIds') : null;

		var lineupImgs = table.querySelectorAll('img.matchOrder');
		Foxtrick.forEach(function(lineupImg) {
			var link = lineupImg.parentNode;
			module.fixLineupLink(link, id, youthTeamId);

			if (browseIds)
				link.href = module.addParam(link.href, 'BrowseIds', browseIds);

			if (youthTeamId) {
				// add youthTeamId to report link
				var row = link.parentNode.parentNode;
				var rowLinks = row.getElementsByTagName('a');
				var reportLink = Foxtrick.nth(function(a) {
					return a.href && /Match\.aspx/.test(a.href) && !/#/.test(a.href);
				}, rowLinks);

				reportLink.href = module.addParam(reportLink.href, 'youthTeamId', youthTeamId);
			}
		}, lineupImgs);
	},
	parsePlayerStats: function(doc) {
		var module = this;

		var OPEN_NEW = Foxtrick.L10n.getString('button.open_new');
		var addLinkToMatchIcon = function(icon, url) {
			// don't modify icon className so as not to interfere with player-stats-xp
			Foxtrick.addClass(icon.parentNode, 'ft-link');
			icon.title += '\n' + OPEN_NEW;
			icon.dataset.url = url;
			Foxtrick.onClick(icon, function() {
				Foxtrick.newTab(this.dataset.url);
			});
		};

		var id = module.getDefaultTeamId(doc);
		var pid = Foxtrick.getParameterFromUrl(doc.location.href, 'PlayerID');
		var icons = doc.querySelectorAll('#stats .iconMatchtype img');
		var links = doc.querySelectorAll('#matches a');
		Foxtrick.forEach(function(link, i) {
			var icon = icons[i];

			module.fixLineupLink(link, id);
			module.addPlayerHighlight(link, pid);
			addLinkToMatchIcon(icon, link.href);
		}, links);
	},
	parseH2HLatestMatches: function(doc) {
		var module = this;

		var homeId = Foxtrick.getParameterFromUrl(doc.location.href, 'HomeTeamID');
		var awayId = Foxtrick.getParameterFromUrl(doc.location.href, 'AwayTeamID');

		var names = doc.querySelectorAll('#mainBody th');
		var home = names[0].textContent.trim();
		var homeRe = new RegExp('^' + Foxtrick.strToRe(home));
		var away = names[1].textContent.trim();
		var awayRe = new RegExp('^' + Foxtrick.strToRe(away));

		// links go in cycles of 6
		// home team match: match-link, match-home-lineup-link, match-away-lineup-link
		// away team match: match-link, match-home-lineup-link, match-away-lineup-link
		var links = doc.querySelectorAll('#mainBody td.left a');

		// add ids to lineup-links if away; we don't care about third-party teams
		var addTeamIdForAwayGame = function(lineupLink, teamId, matchLink, teamRe) {
			if (!teamRe.test(matchLink.textContent)) {
				// home team name does not match
				// assume away game
				lineupLink.href = module.addParam(lineupLink.href, 'teamId', teamId);
			}
		};

		for (var i = 0; i < links.length; i += 6) {
			// add ids to match-links first
			var homeTeamMatch = links[i], awayTeamMatch = links[i + 3];
			homeTeamMatch.href = module.addParam(homeTeamMatch.href, 'teamId', homeId);
			awayTeamMatch.href = module.addParam(awayTeamMatch.href, 'teamId', awayId);

			var homeTeamLineup = links[i + 2], awayTeamLineup = links[i + 5];
			addTeamIdForAwayGame(homeTeamLineup, homeId, homeTeamMatch, homeRe);
			addTeamIdForAwayGame(awayTeamLineup, awayId, awayTeamMatch, awayRe);
		}
	},
	parsePlayers: function(doc) {
		var module = this;

		var id = module.getMenuTeamId(doc);
		var isYouth = Foxtrick.isPage(doc, 'youthPlayers');
		var youthId = isYouth ? module.getYouthTeamId(doc) : null;

		var players = doc.getElementsByClassName('playerInfo');
		Foxtrick.forEach(function(p) {
			var pid = Foxtrick.util.id.findPlayerId(p);
			var matchLink = p.querySelector('a[href^="/Club/Matches/Match.aspx"]');
			if (!matchLink)
				return;

			module.fixLineupLink(matchLink, id, youthId);
			module.addPlayerHighlight(matchLink, pid);
		}, players);
	},

	run: function(doc) {

		var MATCHES = ['matches', 'matchesCup', 'matchesArchive'];

		if (Foxtrick.isPage(doc, 'match')) {
			// this might be a bit annoying as it causes match page to reload
			this.parseMatchPage(doc);
		}
		else if (Foxtrick.any(function(page) { return Foxtrick.isPage(doc, page); }, MATCHES))
			this.parseMatchesPage(doc);
		else if (Foxtrick.isPage(doc, 'playerStats'))
			this.parsePlayerStats(doc);
		else if (Foxtrick.isPage(doc, 'matchesLatest'))
			this.parseH2HLatestMatches(doc);
		else if (Foxtrick.isPage(doc, 'players') || Foxtrick.isPage(doc, 'youthPlayers'))
			this.parsePlayers(doc);
	},
};
