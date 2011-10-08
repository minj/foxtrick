"use strict";
/**
 * Colors the player name in the match report.
 * @author tychobrailleur, Stephan57, convincedd, ryanli
 */

Foxtrick.util.module.register({
	MODULE_NAME : "MatchPlayerColouring",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ["match", "playerdetail"],
	OPTIONS : ["SeparateOwnPlayerColors"],
	NICE: +1, // needs to be after match-report-format

	CSS : Foxtrick.InternalPath + "resources/css/match-player-colouring.css",

	run : function(doc) {
		if (Foxtrick.isPage("playerdetail", doc)) {
			this.addHighlightParam(doc);
			return;
		}

		if (Foxtrick.Pages.Match.isPrematch(doc)
			|| Foxtrick.Pages.Match.inProgress(doc))
			return;

		if (doc.location.search.search(/&HighlightPlayerID=(\d+)/) != -1) {
			// highlight single player
			var playerId = doc.location.search.match(/&HighlightPlayerID=(\d+)/)[1];
			var links = doc.getElementById("mainWrapper").getElementsByTagName("a");
			for (var i = 0; i < links.length; ++i) {
				if (links[i].href.indexOf(playerId) > -1) {
					// add an arbitrarily home class
					Foxtrick.addClass(links[i], "ft-match-player-home");
				}
			}
			return;
		}

		// creating a loading note that lasts till XMLs are loaded
		var loading = Foxtrick.util.note.createLoading(doc);
		var notifyArea = doc.getElementById("ctl00_ctl00_CPContent_ucNotifications_updNotifications");
		notifyArea.appendChild(loading);

		var isYouth = (String(doc.location).search(/isYouth=True/i) > -1);
		var matchId = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);

		//Retrieve teams id
		if (FoxtrickPrefs.isModuleOptionEnabled("MatchPlayerColouring", "SeparateOwnPlayerColors"))
			var myTeamId = isYouth ? Foxtrick.util.id.getOwnYouthTeamId() : Foxtrick.util.id.getOwnTeamId();
		else
			var myTeamId = null;

		var isTeamLink = function(n) {
			return (n.href.search(/Club\/\?TeamID=\d+/) > -1)
				|| (n.href.search(/Youth\/Default\.aspx\?YouthTeamID=\d+/) > -1)
				|| (n.href.search(/NationalTeam\/NationalTeam\.aspx\?teamId=\d+/) > -1);
		};
		var sidebar = doc.getElementById("sidebar");
		var teams = sidebar.getElementsByTagName("table")[0].getElementsByTagName("a");
		teams = Foxtrick.filter(isTeamLink, teams);
		var homeTeam = teams[0];
		var awayTeam = teams[1];

		var homeTeamId = Foxtrick.util.id.getTeamIdFromUrl(homeTeam.href);
		var awayTeamId = Foxtrick.util.id.getTeamIdFromUrl(awayTeam.href);
		var homeClass = (myTeamId == homeTeamId) ? "ft-match-player-mine" : "ft-match-player-home";
		var awayClass = (myTeamId == awayTeamId) ? "ft-match-player-mine" : "ft-match-player-away";

		Foxtrick.addClass(homeTeam, homeClass);
		Foxtrick.addClass(awayTeam, awayClass);

		var mainWrapper = doc.getElementById("mainWrapper");
		var links = mainWrapper.getElementsByTagName("a");

		// arguments for retrieving XML
		var homeArgs = [
			["file", "matchlineup"],
			["matchID", matchId],
			["teamID", homeTeamId],
			["isYouth", isYouth],
			["version","1.6"]
		];
		var awayArgs = [
			["file", "matchlineup"],
			["matchID", matchId],
			["teamID", awayTeamId],
			["isYouth", isYouth],
			["version","1.6"]
		];

		var getPlayers = function(xml) {
			return Foxtrick.map(function(n) { return Number(n.textContent); },
				xml.getElementsByTagName("PlayerID"));
		};
		var getPlayerId =  function(a) {
			var m;
			if (m = a.href.match(/PlayerId=(\d+)/i))
				return Number(m[1]);
			return null;
		};
		Foxtrick.util.api.retrieve(doc, homeArgs,{cache_lifetime:'session' },
		function(homeXml, errorText) {
			Foxtrick.util.api.retrieve(doc, awayArgs,{ cache_lifetime:'session' },
			function(awayXml, errorText) {
				// remove the loading note
				if (loading) loading.parentNode.removeChild(loading);
				if (!homeXml || !awayXml)
					return;

				Foxtrick.log("Successfully retrieved lineup XML.");

				var homePlayers = getPlayers(homeXml);
				var awayPlayers = getPlayers(awayXml);

				Foxtrick.log("Home players: ", homePlayers);
				Foxtrick.log("Away players: ", awayPlayers);

				// colour all player links
				Foxtrick.map(function(n) {
					var id =  getPlayerId(n)
					if (id) {
						if (Foxtrick.member(id, homePlayers))
							Foxtrick.addClass(n, homeClass);
						else if (Foxtrick.member(id, awayPlayers))
							Foxtrick.addClass(n, awayClass);
					}
				}, links);

				// add class for sidebar event rows
				var sidebarLinks = sidebar.getElementsByTagName("a");
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
						"ft-match-event-home");
				}, homeLinks);
				Foxtrick.map(function(n) {
					Foxtrick.addClass(n.parentNode.parentNode,
						"ft-match-event-away");
				}, awayLinks);
			});
		});
	},

	change : function(doc) {
		if (Foxtrick.isPage("playerdetail", doc))
			this.addHighlightParam(doc);
	},

	// add match report highlight links to playerdetails
	addHighlightParam : function(doc) {
		var playerId = Foxtrick.Pages.Player.getId(doc);
		var as = doc.getElementById("mainBody").getElementsByTagName("a");
		for (var i = 0; i < as.length; ++i) {
			if (as[i].href.search(/Club\/Matches\/Match\.aspx\?matchID=/i) != -1
				&& as[i].href.search(/HighlightPlayerID/) == -1) {
				as[i].href += "&HighlightPlayerID=" + playerId;
			}
		}
	}
});
