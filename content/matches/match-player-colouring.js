'use strict';
/**
 * Colors the player name in the match report.
 * @author tychobrailleur, Stephan57, convincedd, ryanli
 */


Foxtrick.modules.MatchPlayerColouring = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match', 'matchOld'],
	OPTIONS: ['SeparateOwnPlayerColors'],

	CSS: Foxtrick.InternalPath + 'resources/css/match-player-colouring.css',

	run: function(doc) {
		this.color(doc);
	},

	color: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc)
			|| Foxtrick.Pages.Match.inProgress(doc))
			return;

		if (doc.location.search.search(/&HighlightPlayerID=(\d+)/) != -1) {
			// highlight single player
			var playerId = doc.location.search.match(/&HighlightPlayerID=(\d+)/)[1];
			var links = doc.getElementById('ctl00_ctl00_CPContent_divStartMain').getElementsByTagName('a');
			links = Foxtrick.filter(function(a) {
				return a.hasAttribute('href') && a.getAttribute('href').indexOf(playerId) > -1;
				//must use getAttribute because #anchor links (tabs) include the original url
			}, links);
			// add an arbitrarily home class
			Foxtrick.map(function(a) {
				Foxtrick.addClass(a, 'ft-match-player-home');
			}, links);
			return;
		}

		// creating a loading note that lasts till XMLs are loaded
		var loading = Foxtrick.util.note.createLoading(doc);
		var notifyArea =
			doc.getElementById('ctl00_ctl00_CPContent_ucNotifications_updNotifications');
		notifyArea.appendChild(loading);

		var SourceSystem = 'Hattrick';
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var isHTOIntegrated = Foxtrick.Pages.Match.isHTOIntegrated(doc);
		if (isYouth)
			SourceSystem = 'Youth';
		if (isHTOIntegrated)
			SourceSystem = 'HTOIntegrated';
		var matchId = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);

		//Retrieve teams id
		if (FoxtrickPrefs.isModuleOptionEnabled('MatchPlayerColouring',
			'SeparateOwnPlayerColors'))
			var myTeamId = isYouth ? Foxtrick.util.id.getOwnYouthTeamId() :
				Foxtrick.util.id.getOwnTeamId();
		else
			var myTeamId = null;

		var isTeamLink = function(n) {
			return (n.href.search(/Club\/\?TeamID=\d+/) > -1)
				|| (n.href.search(/Youth\/Default\.aspx\?YouthTeamID=\d+/) > -1)
				|| (n.href.search(/NationalTeam\/NationalTeam\.aspx\?teamId=\d+/) > -1);
		};

		if (Foxtrick.Pages.Match.hasNewRatings(doc))
			var teams = doc.getElementsByTagName('h1')[0].getElementsByTagName('a');
		else {
			var sidebar = doc.getElementById('sidebar');
			var teams = sidebar.getElementsByTagName('table')[0].getElementsByTagName('a');
		}

		teams = Foxtrick.filter(isTeamLink, teams);
		var homeTeam = teams[0];
		var awayTeam = teams[1];

		var homeTeamId = Foxtrick.util.id.getTeamIdFromUrl(homeTeam.href);
		var awayTeamId = Foxtrick.util.id.getTeamIdFromUrl(awayTeam.href);


		var homeClass = (myTeamId == homeTeamId) ? 'ft-match-player-mine' :
			'ft-match-player-home';
		var awayClass = (myTeamId == awayTeamId) ? 'ft-match-player-mine' :
			'ft-match-player-away';

		Foxtrick.addClass(homeTeam, homeClass);
		Foxtrick.addClass(awayTeam, awayClass);

		var mainWrapper = doc.getElementById('ctl00_ctl00_CPContent_divStartMain').parentNode;
		var links = Foxtrick.filter(function(n) {
			return n.hasAttribute('href');
		}, mainWrapper.getElementsByTagName('a'));

		// arguments for retrieving XML
		var homeArgs = [
			['file', 'matchlineup'],
			['matchID', matchId],
			['teamID', homeTeamId],
			['SourceSystem', SourceSystem],
			['version', '1.8']
		];
		var awayArgs = [
			['file', 'matchlineup'],
			['matchID', matchId],
			['teamID', awayTeamId],
			['SourceSystem', SourceSystem],
			['version', '1.8']
		];

		var getPlayers = function(xml) {
			var field_start_end =
				Array.prototype.slice.call(xml.getElementsByTagName('PlayerID'));
			var subs_in =
				Array.prototype.slice.call(xml.getElementsByTagName('SubjectPlayerID'));
			var players = field_start_end.concat(subs_in);

			return Foxtrick.map(function(n) {
					return Number(n.textContent);
				}, players);
		};
		var getPlayerId = function(a) {
			var m;
			if (!a.hasAttribute('data-do-not-color')
				&& (m = a.href.match(/PlayerId=(\d+)/i)))
				return Number(m[1]);
			return null;
		};
		Foxtrick.util.api.retrieve(doc, homeArgs, { cache_lifetime: 'session' },
		  function(homeXml, errorText) {
			Foxtrick.util.api.retrieve(doc, awayArgs, { cache_lifetime: 'session' },
			  function(awayXml, errorText) {
				// remove the loading note
				if (loading) loading.parentNode.removeChild(loading);
				if (!homeXml || !awayXml)
					return;

				Foxtrick.log('Successfully retrieved lineup XML.');

				var homePlayers = getPlayers(homeXml);
				var awayPlayers = getPlayers(awayXml);

				// colour all player links
				Foxtrick.map(function(n) {
					if (
						Foxtrick.isDescendantOf(n, doc.getElementById('playersField'))
						||
						Foxtrick.isDescendantOf(n, doc.getElementById('playersBench'))
					)
						return;

					var id = getPlayerId(n);
					if (id) {
						if (Foxtrick.member(id, homePlayers))
							Foxtrick.addClass(n, homeClass);
						else if (Foxtrick.member(id, awayPlayers))
							Foxtrick.addClass(n, awayClass);
					}
				}, links);

				if (!Foxtrick.Pages.Match.hasNewRatings(doc)) {
					// add class for sidebar event rows
					var sidebarLinks = Foxtrick.filter(function(n) {
						return n.hasAttribute('href');
					}, sidebar.getElementsByTagName('a'));
					var homeLinks = Foxtrick.filter(function(n) {
						return (getPlayerId(n) != null)
							&& Foxtrick.hasClass(n, homeClass);
					}, sidebarLinks);
					var awayLinks = Foxtrick.filter(function(n) {
						return (getPlayerId(n) != null)
							&& Foxtrick.hasClass(n, awayClass);
					}, sidebarLinks);
					Foxtrick.map(function(n) {
						Foxtrick.addClass(n.parentNode.parentNode,
							'ft-match-event-home');
					}, homeLinks);
					Foxtrick.map(function(n) {
						Foxtrick.addClass(n.parentNode.parentNode,
							'ft-match-event-away');
					}, awayLinks);
				}
			});
		});
	}
};
