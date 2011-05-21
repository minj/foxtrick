/**
 * Colors the player name in the match report.
 * @author tychobrailleur, Stephan57, convincedd, ryanli
 */

var FoxtrickMatchPlayerColouring = {
	MODULE_NAME : "MatchPlayerColouring",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ["match", "playerdetail"],
	ONPAGEPREF_PAGE : "match",
	OPTIONS : ["SeparateOwnPlayerColors"],

	CSS : Foxtrick.ResourcePath + "resources/css/match-player-colouring.css",

	run : function(page, doc) {
		if (page == "playerdetail") {
			this.addHighlightParam(doc);
			return;
		}

		if (Foxtrick.Pages.Match.isPrematch(doc))
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
		var matchId = FoxtrickHelper.getMatchIdFromUrl(doc.location.href);

		//Retrieve teams id
		if (Foxtrick.isModuleFeatureEnabled(this, "SeparateOwnPlayerColors"))
			var myTeamId = isYouth ? FoxtrickHelper.getOwnYouthTeamId() : FoxtrickHelper.getOwnTeamId();
		else
			var myTeamId = null;

		var isTeamLink = function(n) {
			return (n.href.search(/Club\/\?TeamID=\d+/) > -1)
				|| (n.href.search(/Youth\/Default\.aspx\?YouthTeamID=\d+/) > -1)
				|| (n.href.search(/NationalTeam\/NationalTeam\.aspx\?teamId=\d+/) > -1);
		};
		var sidebar = doc.getElementById("sidebar");
		var teams = sidebar.getElementsByTagName("table")[0].getElementsByTagName("a");
		teams = Foxtrick.filter(teams, isTeamLink);
		var homeTeam = teams[0];
		var awayTeam = teams[1];

		const homeTeamId = FoxtrickHelper.getTeamIdFromUrl(homeTeam.href);
		const awayTeamId = FoxtrickHelper.getTeamIdFromUrl(awayTeam.href);
		const homeClass = (myTeamId == homeTeamId) ? "ft-match-player-mine" : "ft-match-player-home";
		const awayClass = (myTeamId == awayTeamId) ? "ft-match-player-mine" : "ft-match-player-away";

		Foxtrick.addClass(homeTeam, homeClass);
		Foxtrick.addClass(awayTeam, awayClass);

		var mainWrapper = doc.getElementById("mainWrapper");
		var links = mainWrapper.getElementsByTagName("a");

		// arguments for retrieving XML
		var homeArgs = [
			["file", "matchlineup"],
			["matchID", matchId],
			["teamID", homeTeamId],
			["isYouth", isYouth]
		];
		var awayArgs = [
			["file", "matchlineup"],
			["matchID", matchId],
			["teamID", awayTeamId],
			["isYouth", isYouth]
		];

		var getPlayers = function(xml) {
			return Foxtrick.map(xml.getElementsByTagName("PlayerID"),
				function(n) { return Number(n.textContent); });
		};
		var getPlayerId =  function(a) {
			if (m = a.href.match(/PlayerId=(\d+)/i))
				return Number(m[1]);
			return null;
		};
		Foxtrick.ApiProxy.retrieve(doc, homeArgs, function(homeXml) {
			Foxtrick.ApiProxy.retrieve(doc, awayArgs, function(awayXml) {
				// remove the loading note
				loading.parentNode.removeChild(loading);
				Foxtrick.log("Successfully retrieved lineup XML.");

				var homePlayers = getPlayers(homeXml);
				var awayPlayers = getPlayers(awayXml);

				Foxtrick.log("Home players: ", homePlayers);
				Foxtrick.log("Away players: ", awayPlayers);

				// colour all player links
				Foxtrick.map(links, function(n) {
					if (id = getPlayerId(n)) {
						if (Foxtrick.some(homePlayers, function(n) { return n == id; }))
							Foxtrick.addClass(n, homeClass);
						else if (Foxtrick.some(awayPlayers, function(n) { return n == id; }))
							Foxtrick.addClass(n, awayClass);
					}
				});

				// add class for sidebar event rows
				var sidebarLinks = sidebar.getElementsByTagName("a");
				var homeLinks = Foxtrick.filter(sidebarLinks, function(n) {
					return (getPlayerId(n) != null)
						&& Foxtrick.hasClass(n, homeClass);
				});
				var awayLinks = Foxtrick.filter(sidebarLinks, function(n) {
					return (getPlayerId(n) != null)
						&& Foxtrick.hasClass(n, awayClass);
				});
				Foxtrick.map(homeLinks, function(n) {
					Foxtrick.addClass(n.parentNode.parentNode,
						"ft-match-event-home");
				});
				Foxtrick.map(awayLinks, function(n) {
					Foxtrick.addClass(n.parentNode.parentNode,
						"ft-match-event-away");
				});
			});
		});
	},

	change : function(page, doc) {
		if (page == "playerdetail") {
			this.addHighlightParam(doc);
		}
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
};
