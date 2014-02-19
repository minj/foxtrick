'use strict';
/**
 * Colors the player name in the match report.
 * @author tychobrailleur, Stephan57, convincedd, ryanli
 */


Foxtrick.modules.MatchPlayerColouring = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	OPTIONS: ['SeparateOwnPlayerColors'],
	NICE: 1, // after match-report-format

	CSS: Foxtrick.InternalPath + 'resources/css/match-player-colouring.css',

	run: function(doc) {
		this.color(doc);
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


		var isTeamLink = function(n) {
			return (n.href.search(/Club\/\?TeamID=\d+/) > -1) ||
				(n.href.search(/Youth\/(Default\.aspx)?\?YouthTeamID=\d+/) > -1) ||
				(n.href.search(/NationalTeam\/NationalTeam\.aspx\?teamId=\d+/) > -1);
		};

		var sidebar = doc.getElementsByClassName('tblHighlights')[0];
		var teams = doc.getElementById('testingNewHeader').getElementsByTagName('h1')[0].
			getElementsByTagName('a');
		teams = Foxtrick.filter(isTeamLink, teams);
		var homeClass = this.getPlayerClass(doc, true);
		var awayClass = this.getPlayerClass(doc, false);
		Foxtrick.addClass(teams[0], homeClass);
		Foxtrick.addClass(teams[1], awayClass);

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

		var hl = doc.location.search.match(/&HighlightPlayerID=(\d+)/);
		if (hl) {
			// highlight single player
			var playerId = hl[1];
			var links = doc.querySelectorAll('a[href*="layerId=' + playerId + '"]');
			// add an arbitrarily home class
			Foxtrick.map(function(a) {
				Foxtrick.addClass(a, 'ft-match-player-hl');
			}, links);
		}
	}
};
