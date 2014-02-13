'use strict';
/*
 * fix-links.js
 * Add various parameters to standartise HT links
 * @author LA-MJ
 */

Foxtrick.modules.FixLinks = {
	CORE_MODULE: true,
	PAGES: ['match', 'matches', 'matchesArchive', 'playerStats', 'matchesLatest'],
	NICE: -20, // place before all DOM mutating modules
	addParam: function(url, param, value, replace) {
		var newUrl = url, urlParts = url.split('#'), hasQuery = /\?/.test(urlParts[0]);
		if (replace) {
			urlParts[0] = urlParts[0].replace(new RegExp('([&?])' + param + '=[^&]+&?', 'i'), '$1');
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
	fixLineupLink: function(link, teamId, youthTeamId) {
		var url = this.addAnchor(this.addParam(link.href, 'teamId', teamId), 'tab2');
		if (youthTeamId)
			url = this.addParam(url, 'youthTeamId', youthTeamId);
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
	parseMatchPage: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc) || Foxtrick.Pages.Match.inProgress(doc))
			return;

		var browseLinks = doc.querySelectorAll('.speedBrowser a');
		for (var i = 0; i < browseLinks.length; i++) {
			var link = browseLinks[i];
			Foxtrick.onClick(link, (function(link) {
				return function(e) {
					var l = doc.location.href.match(/(#.*)/);
					var a = link.href.match(/(#.*)/);
					if (l && !a)
						link.href = link.href + l[1];
			}})(link));
		}

		var links = doc.querySelectorAll('div.boxHead a');
		var id = this.getDefaultTeamId(doc);
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var youthid = Foxtrick.util.id.getYouthTeamIdFromUrl(doc.location.href);
		if (isYouth && !youthid) {
			var menu = doc.getElementsByClassName('subMenu')[0];
			youthid = menu ? Foxtrick.util.id.findYouthTeamId(menu) : null;
		}
		for (var i = 0; i < links.length; ++i) {
			var url = this.addParam(links[i].href, 'teamId', id);
			if (youthid)
				url = this.addParam(url, 'youthTeamId', youthid);
			links[i].href = url;
		}
		links = doc.querySelectorAll('#oldMatchRatings table th a');
		if (isYouth) {
			this.fixLineupLink(links[0], id, Foxtrick.Pages.Match.getHomeTeamId(doc));
			this.fixLineupLink(links[1], id, Foxtrick.Pages.Match.getAwayTeamId(doc));
		}
		else {
			this.fixLineupLink(links[0], Foxtrick.Pages.Match.getHomeTeamId(doc));
			this.fixLineupLink(links[1], Foxtrick.Pages.Match.getAwayTeamId(doc));
		}
	},
	parseMatchesPage: function(doc) {
		var lineupImgs = doc.querySelectorAll('#mainBody table img.matchOrder');
		var id = this.getDefaultTeamId(doc);
		var youthid = Foxtrick.util.id.getYouthTeamIdFromUrl(doc.location.href);
		for (var i = 0; i < lineupImgs.length; i++) {
			var link = lineupImgs[i].parentNode;
			this.fixLineupLink(link, id, youthid);
			if (youthid) {
				// add youthteamid to report link
				var row = link.parentNode.parentNode;
				var reportLink = Foxtrick.nth(0, function(a) {
					return a.href && /Match\.aspx/.test(a.href) && !/#/.test(a.href);
				}, row.getElementsByTagName('a'));
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
			links[i].href = this.addParam(links[i].href, 'HighlightPlayerID', pid);
		}
	},
	parseH2HLatestMatches: function(doc) {
		var homeId = Foxtrick.getParameterFromUrl(doc.location.href, 'HomeTeamID');
		var awayId = Foxtrick.getParameterFromUrl(doc.location.href, 'AwayTeamID');
		var names = doc.querySelectorAll('#mainBody th');
		var home = Foxtrick.trim(names[0].textContent), away = Foxtrick.trim(names[1].textContent);
		var links = doc.querySelectorAll('#mainBody td.left a');
		// links go in cycles of 6
		// home team match: match-link, match-home-lineup-link, match-away-lineup-link
		// away team match: match-link, match-home-lineup-link, match-away-lineup-link

		var addTeamIdIfAway = function(match, lineup, name, id) {
			if (!new RegExp('^' + name).test(match.textContent))
				lineup.href = Foxtrick.modules.FixLinks.addParam(lineup.href, 'teamId', id);
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
	},
};
