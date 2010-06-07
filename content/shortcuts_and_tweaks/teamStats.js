/**
 * teamStats.js
 * Foxtrick team overview
 * @author OBarros, spambot, convinced, ryanli
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.TeamStats = {

	MODULE_NAME : "FTTeamStats",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array("players", "YouthPlayers"),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Added rows for leadership and personalities.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

	init : function() {
	},

	change : function(page, doc) {
	},

	run : function(page, doc) {
		try {
			var totalTSI = 0;
			var olderThanNineteen = 0;
			var transferListed = 0;
			var redCards = 0;
			var yellowCards = 0;
			var twoYellowCards = 0;
			var injured = 0;
			var injuredWeeks = 0;
			var bruised = 0;
			var totalLeadership = 0;
			var totalAgreeability = 0;
			var totalAggressiveness = 0;
			var totalHonesty = 0;
			var specialities = {};

			// we don't need to load XML data here
			var playerList = Foxtrick.Pages.Players.getPlayerList(doc);
			for (var i = 0; i < playerList.length; ++i) {
				var current = playerList[i];
				if (current.tsi) {
					totalTSI += current.tsi;
				}
				if (current.age.years >= 19) {
					++olderThanNineteen;
				}
				if (current.speciality) {
					if (!specialities[current.speciality]) {
						specialities[current.speciality] = 0;
					}
					++specialities[current.speciality];
				}
				if (current.transferListed) {
					++transferListed;
				}
				if (current.yellowCard === 1) {
					++yellowCards;
				}
				if (current.yellowCard === 2) {
					++twoYellowCards;
				}
				if (current.redCard) {
					++redCards;
				}
				if (current.injured) {
					++injured;
					injuredWeeks += current.injured;
				}
				if (current.bruised) {
					++bruised;
				}
				if (current.leadership !== undefined) {
					totalLeadership += current.leadership;
				}
				if (current.agreeability !== undefined) {
					totalAgreeability += current.agreeability;
				}
				if (current.aggressiveness !== undefined) {
					totalAggressiveness += current.aggressiveness;
				}
				if (current.honesty !== undefined) {
					totalHonesty += current.honesty;
				}
			}

			var avgLeadership = Math.round(totalLeadership / playerList.length);
			var avgAggressiveness = Math.round(totalAggressiveness / playerList.length);
			var avgAgreeability = Math.round(totalAgreeability / playerList.length);
			var avgHonesty = Math.round(totalHonesty / playerList.length);

			var specsTable = "";
			//If NT displays Total TSI
			if (Foxtrick.Pages.Players.isNtPlayersPage(doc) && totalTSI) {
				const totalTSILabel = Foxtrickl10n.getString("foxtrick.FTTeamStats.totalTSI.label");
				specsTable += "<tr><td class=\"ch\">" + totalTSILabel + "</td><td>" + totalTSI + "</td></tr>";
			}
			for (var speciality in specialities) {
				specsTable += "<tr><td class=\"ch\">" + speciality + "</td><td>" + specialities[speciality] + "</td></tr>";
			}
			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "leadership")) {
				specsTable += "<tr><td class=\"ch\">" + Foxtrickl10n.getString("Leadership") + "</td><td>" + Foxtrick.XMLData.getLevelByTypeAndValue("levels", avgLeadership) + "</td></tr>";
			}
			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "aggressiveness")) {
				specsTable += "<tr><td class=\"ch\">" + Foxtrickl10n.getString("Aggressiveness") + "</td><td>" + Foxtrick.XMLData.getLevelByTypeAndValue("aggressiveness", avgAggressiveness) + "</td></tr>";
			}
			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "agreeability")) {
				specsTable += "<tr><td class=\"ch\">" + Foxtrickl10n.getString("Agreeability") + "</td><td>" + Foxtrick.XMLData.getLevelByTypeAndValue("agreeability", avgAgreeability) + "</td></tr>";
			}
			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "honesty")) {
				specsTable += "<tr><td class=\"ch\">" + Foxtrickl10n.getString("Honesty") + "</td><td>" + Foxtrick.XMLData.getLevelByTypeAndValue("honesty", avgHonesty) + "</td></tr>";
			}
			if (transferListed > 0) {
				var img = '<img src="/Img/Icons/dollar.gif" class="transferListed" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + transferListed + "</td></tr>";
			}
			if (yellowCards > 0) {
				var img = '<img src="/Img/Icons/yellow_card.gif" class="cardsOne" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + yellowCards + "</td></tr>";
			}
			if (twoYellowCards > 0) {
				var img = '<img src="/Img/Icons/dual_yellow_card.gif" class="cardsTwo" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + twoYellowCards + "</td></tr>";
			}
			if (redCards > 0) {
				var img = '<img src="/Img/Icons/red_card.gif" class="cardsOne" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + redCards + "</td></tr>";
			}
			if (bruised > 0) {
				var img = '<img src="/Img/Icons/bruised.gif" class="injuryBruised" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + bruised + "</td></tr>";
			}
			if (injured > 0) {
				var img = '<img src="/Img/Icons/injured.gif" class="injuryInjured" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + injured + " (<b>" + injuredWeeks + "</b>)" + "</td></tr>";
			}

			if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
				var youngerThanNineteen = playerList.length - olderThanNineteen;
				var style = "";
				if (youngerThanNineteen < 9) {
					style = "color: red !important; font-weight: bold !important;";
				}
				specsTable += "<tr style='"+style+"'><td class=\"ch\">" + Foxtrickl10n.getString("foxtrick.FTTeamStats.PlayerNotToOld.label") + "</td><td>" + youngerThanNineteen + "</td></tr>";
				if (olderThanNineteen) {
					specsTable += "<tr><td class=\"ch\">" + Foxtrickl10n.getString("foxtrick.FTTeamStats.PlayerToOld.label") + "</td><td>" + olderThanNineteen + "</td></tr>";
				}
			}

			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "currentLeagueId")) {
				var leagues = [];
				for (var i in playerList) {
					var id = playerList[i].currentLeagueId;
					if (id !== undefined) {
						if (leagues[id] === undefined) {
							leagues[id] = 1;
						}
						else {
							++leagues[id];
						}
					}
				}
				var leagueSummary = [];
				for (var i in leagues) {
					leagueSummary.push({ name: Foxtrick.XMLData.League[i].LeagueName, count: leagues[i] });
				}
				leagueSummary.sort(function (a,b) { return a.name.localeCompare(b.name) });
				leagueSummary.sort(function (a,b) { return b.count - a.count });
				var leagueTable = "<tr><th colspan=\"2\">" + Foxtrickl10n.getString("foxtrick.FTTeamStats.countries.label") + "</th></tr>";
				for (var i in leagueSummary) {
					leagueTable += "<tr><td>" + leagueSummary[i].name + "</td><td>" + leagueSummary[i].count + "</td></tr>";
				}
				specsTable += leagueTable;
			}

			var	table = doc.createElement("table");
			table.className = "smallText";
			table.innerHTML = specsTable;

			var ownBoxId = "foxtrick_FTTeamStats_box";
			var	ownBoxBody = doc.createElement("div");
			ownBoxBody.id = "foxtrick_FTTeamStats_content";
			ownBoxBody.appendChild(table);
			var header = Foxtrickl10n.getString("foxtrick.FTTeamStats.label");
			Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, ownBoxId, "last", "");
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
};
