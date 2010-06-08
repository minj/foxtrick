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

			var table = doc.createElement("table");
			table.className = "smallText";
			var addHeader = function(label) {
				var row = doc.createElement("tr");
				var header = doc.createElement("th");
				header.setAttribute("colspan", "2");
				header.textContent = label;
				row.appendChild(header);
				table.appendChild(row);
				return row;
			}
			var addRow = function(label, data, isLabelNode, isDataNode) {
				var row = doc.createElement("tr");

				var labelCell = doc.createElement("td");
				labelCell.className = "ch";
				if (isLabelNode) {
					labelCell.appendChild(label);
				}
				else {
					labelCell.textContent = label;
				}
				row.appendChild(labelCell);

				var dataCell = doc.createElement("td");
				if (isDataNode) {
					dataCell.appendChild(data);
				}
				else {
					dataCell.textContent = data;
				}
				row.appendChild(dataCell);

				table.appendChild(row);
				return row;
			}

			//If NT displays Total TSI
			if (Foxtrick.Pages.Players.isNtPlayersPage(doc) && totalTSI) {
				const totalTSILabel = Foxtrickl10n.getString("foxtrick.FTTeamStats.totalTSI.label");
				addRow(totalTSILabel, totalTSI);
			}
			for (var speciality in specialities) {
				addRow(speciality, specialities[speciality]);
			}
			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "leadership")) {
				addRow(Foxtrickl10n.getString("Leadership"), Foxtrick.XMLData.getLevelByTypeAndValue("levels", avgLeadership));
			}
			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "aggressiveness")) {
				addRow(Foxtrickl10n.getString("Aggressiveness"), Foxtrick.XMLData.getLevelByTypeAndValue("aggressiveness", avgAggressiveness));
			}
			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "agreeability")) {
				addRow(Foxtrickl10n.getString("Agreeability"), Foxtrick.XMLData.getLevelByTypeAndValue("agreeability", avgAgreeability));
			}
			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "honesty")) {
				addRow(Foxtrickl10n.getString("Honesty"), Foxtrick.XMLData.getLevelByTypeAndValue("honesty", avgHonesty));
			}
			if (transferListed > 0) {
				var img = doc.createElement("img");
				img.src = "/Img/Icons/dollar.gif";
				img.className = "transferListed";
				addRow(img, transferListed, true);
			}
			if (yellowCards > 0) {
				var img = doc.createElement("img");
				img.src = "/Img/Icons/yellow_card.gif";
				img.className = "cardsOne";
				addRow(img, yellowCards, true);
			}
			if (twoYellowCards > 0) {
				var img = doc.createElement("img");
				img.src = "/Img/Icons/dual_yellow_card.gif";
				img.className = "cardsTwo";
				addRow(img, twoYellowCards, true);
			}
			if (redCards > 0) {
				var img = doc.createElement("img");
				img.src = "/Img/Icons/red_card.gif";
				img.className = "cardsOne";
				addRow(img, redCards, true);
			}
			if (bruised > 0) {
				var img = doc.createElement("img");
				img.src = "/Img/Icons/bruised.gif";
				img.className = "injuryBruised";
				addRow(img, bruised, true);
			}
			if (injured > 0) {
				var img = doc.createElement("img");
				img.src = "/Img/Icons/injured.gif";
				img.className = "injuryInjured";

				var data = doc.createElement("span");
				data.textContent = injured;
				data.appendChild(doc.createTextNode(" ("));
				var weeks = doc.createElement("strong");
				weeks.textContent = injuredWeeks;
				data.appendChild(weeks);
				data.appendChild(doc.createTextNode(")"));

				addRow(img, data, true, true);
			}

			if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
				var youngerThanNineteen = playerList.length - olderThanNineteen;
				var row = addRow(Foxtrickl10n.getString("foxtrick.FTTeamStats.PlayerNotToOld.label"), youngerThanNineteen);
				if (youngerThanNineteen < 9) {
					row.className = "red";
				}
				if (olderThanNineteen) {
					var row = addRow(Foxtrickl10n.getString("foxtrick.FTTeamStats.PlayerToOld.label"), olderThanNineteen);
					row.className = "red";
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
				addHeader(Foxtrickl10n.getString("foxtrick.FTTeamStats.countries.label"));
				for (var i in leagueSummary) {
					addRow(leagueSummary[i].name, leagueSummary[i].count);
				}
			}

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
