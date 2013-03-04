'use strict';
/*
 * fix-links.js
 * Add various parameters to standartise HT links
 * @author LA-MJ
 */

Foxtrick.modules.FixLinks = {
	CORE_MODULE: true,
	PAGES: ['match'],
	NICE: -20, // place before all DOM mutating modules
	addParam: function(url, param, value) {
		var newUrl = url, urlParts = url.split('#'), hasQuery = /\?/.test(urlParts[0]);
		if (!new RegExp('[&?]' + param + '=[^&]+', 'i').test(urlParts[0]))
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
	fixLineupLink: function(link, teamId) {
		link.href = this.addAnchor(this.addParam(link.href, 'teamId', teamId), 'tab2');
	},
	getDefaultTeamId: function(doc) {
		var teamId = Foxtrick.getParameterFromUrl(doc.location.href, 'TeamId');
		if (!teamId)
			teamId = Foxtrick.util.id.getOwnTeamId();
		return teamId;
	},
	parseMatchPage: function(doc) {
		if (!Foxtrick.Pages.Match.hasNewRatings(doc))
			return;
		var links = doc.querySelectorAll('div.boxHead a, ul.MatchTabs a');
		var id = this.getDefaultTeamId(doc);
		for (var i = 0; i < links.length; ++i)
			links[i].href = this.addParam(links[i].href, 'teamId', id);
		links = doc.querySelectorAll('#oldMatchRatings table th a');
		this.fixLineupLink(links[0], Foxtrick.Pages.Match.getHomeTeamId(doc));
		this.fixLineupLink(links[1], Foxtrick.Pages.Match.getAwayTeamId(doc));
	},
	run: function(doc) {
		if (Foxtrick.isPage(doc, 'match'))
			this.parseMatchPage(doc);
			// this might be a bit annoying as it causes match page to reload
	},
};
