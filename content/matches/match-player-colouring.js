'use strict';
/**
 * Colors the player name in the match report.
 * @author tychobrailleur, Stephan57, convincedd, ryanli
 */


Foxtrick.modules.MatchPlayerColouring = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match', 'matchesLive'],
	OPTIONS: ['SeparateOwnPlayerColors'],
	NICE: 1, // after match-report-format

	CSS: Foxtrick.InternalPath + 'resources/css/match-player-colouring.css',

	run: function(doc) {
		this.color(doc);
		if (Foxtrick.isPage(doc, 'matchesLive')) {
			var watchHighlights = function(doc) {
				var highlight = doc.querySelector('.liveTabsContainer');
				if (highlight)
					Foxtrick.onChange(highlight, this.color.bind(this));
			};

			var react = function(doc) {
				this.color(doc);
				watchHighlights.bind(this)(doc);
			};

			var livereportsContainer = Foxtrick.Pages.Match.getLiveContainer(doc);
			if (livereportsContainer)
				Foxtrick.onChange(livereportsContainer, react.bind(this), { subtree: false });
		}
	},

	getPlayerClass: function(doc, home) {
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		//Retrieve teams id
		var myTeamId = null;
		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchPlayerColouring',
		    'SeparateOwnPlayerColors'))
			myTeamId = isYouth ? Foxtrick.util.id.getOwnYouthTeamId() :
				Foxtrick.util.id.getOwnTeamId();

		if (home) {
			var homeTeamId = Foxtrick.Pages.Match.getHomeTeamId(doc);
			return (myTeamId == homeTeamId) ? 'ft-match-player-mine' :
				'ft-match-player-home';
		}
		else {
			var awayTeamId = Foxtrick.Pages.Match.getAwayTeamId(doc);
			return (myTeamId == awayTeamId) ? 'ft-match-player-mine' :
			'ft-match-player-away';
		}
	},

	color: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc))
			return;

		var sidebar = doc.getElementsByClassName('tblHighlights')[0];
		var homeClass = this.getPlayerClass(doc, true);
		var awayClass = this.getPlayerClass(doc, false);
		var homeTeam = Foxtrick.Pages.Match.getHomeTeam(doc);
		var awayTeam = Foxtrick.Pages.Match.getAwayTeam(doc);
		Foxtrick.addClass(homeTeam, homeClass);
		Foxtrick.addClass(awayTeam, awayClass);

		// colour all player links
		Foxtrick.forEach(function(n) {
			Foxtrick.addClass(n, homeClass);
		}, doc.querySelectorAll('a.homeplayer, .highlightHome a'));
		Foxtrick.forEach(function(n) {
			Foxtrick.addClass(n, awayClass);
		}, doc.querySelectorAll('a.awayplayer, .highlightAway a'));

		if (!sidebar) {
			// layout error
			// probably WO, stop
			return;
		}

		// add class for sidebar event rows (aligns cards etc according to team)
		var sidebarLinks = Foxtrick.filter(function(n) {
			return n.hasAttribute('href');
		}, sidebar.getElementsByTagName('a'));
		var homeLinks = Foxtrick.filter(function(n) {
			return Foxtrick.hasClass(n, homeClass);
		}, sidebarLinks);
		var awayLinks = Foxtrick.filter(function(n) {
			return Foxtrick.hasClass(n, awayClass);
		}, sidebarLinks);
		Foxtrick.map(function(n) {
			Foxtrick.addClass(n.parentNode.parentNode, 'ft-match-event-home');
		}, homeLinks);
		Foxtrick.map(function(n) {
			Foxtrick.addClass(n.parentNode.parentNode, 'ft-match-event-away');
		}, awayLinks);

		var hl = Foxtrick.getParameterFromUrl(doc.location.search, 'HighlightPlayerID');
		if (hl) {
			// highlight single player
			var links = doc.querySelectorAll('#mainBody a');
			Foxtrick.map(function(a) {
				var pId = Foxtrick.getParameterFromUrl(a.href, 'playerId');
				var yPId = Foxtrick.getParameterFromUrl(a.href, 'youthPlayerId');
				if (pId === hl || yPId === hl)
					Foxtrick.addClass(a, 'ft-match-player-hl');
			}, links);
		}
	}
};
