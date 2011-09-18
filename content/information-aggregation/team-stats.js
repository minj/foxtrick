/**
 * team-stats.js
 * Foxtrick team overview
 * @author OBarros, spambot, convinced, ryanli
 */

Foxtrick.util.module.register({
	MODULE_NAME : "TeamStats",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["players", "YouthPlayers"],
	OPTIONS : ["General", "Speciality", "Personality", "Status", "Current_league"],
	NICE : -1, // before FoxtrickLinksPlayers

	CSS : Foxtrick.InternalPath + "resources/css/team-stats.css",

	run : function(doc) {
		var show = function(playerList) {
			var totalTSI = 0;
			var totalAge = 0;
			var olderThanNineteen = 0;
			var totalExperience = 0;
			var totalLeadership = 0;
			var transferListed = 0;
			var redCards = 0;
			var yellowCards = 0;
			var twoYellowCards = 0;
			var injured = 0;
			var injuredWeeks = 0;
			var bruised = 0;
			var totalAgreeability = 0;
			var totalAggressiveness = 0;
			var totalHonesty = 0;
			var hasSpecialities = false;
			var specialities = {};

			for (var i = 0; i < playerList.length; ++i) {
				var current = playerList[i];
				if (current.tsi) {
					totalTSI += current.tsi;
				}
				if (current.age) {
					totalAge += current.age.years * 112 + current.age.days;
				}
				if (current.experience) {
					totalExperience += current.experience;
				}
				if (current.leadership) {
					totalLeadership += current.leadership;
				}
				if (current.age.years >= 19) {
					++olderThanNineteen;
				}
				if (current.speciality) {
					if (!specialities[current.speciality]) {
						hasSpecialities = true;
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

			var table = doc.createElement("table");
			var addHeader = function(label) {
				var row = doc.createElement("tr");
				var header = doc.createElement("th");
				header.setAttribute("colspan", "2");
				header.textContent = label;
				row.appendChild(header);
				table.appendChild(row);
				return row;
			};
			// label and data could either be strings or document nodes
			var addRow = function(label, data, filter, title) {
				var row = doc.createElement("tr");
				var addFilterShortcut = function (filter, title) {
					row.title = Foxtrickl10n.getString("Filter")+': '+title;
					row.setAttribute('style','cursor:pointer')
					row.addEventListener("click", function(ev) {
						var filterSelect = doc.getElementById('foxtrick-filter-select');
						// init filters
						var evt = doc.createEvent("HTMLEvents");
						evt.initEvent('click', true, true ); // event type,bubbling,cancelable
						filterSelect.dispatchEvent(evt);
						// set filter
						filterSelect.value = filter;
						// call filter
						var evt2 = doc.createEvent("HTMLEvents");
						evt2.initEvent('change', true, true ); // event type,bubbling,cancelable
						filterSelect.dispatchEvent(evt2);

						window.scroll(0, 0);
						window.scrollBy(0, doc.getElementById('mainWrapper').offsetTop);
					},false)
				}

				var labelCell = doc.createElement("td");
				labelCell.className = "ch";
				if (typeof(label) === "object") {
					labelCell.appendChild(label);
				}
				else {
					labelCell.textContent = label;
				}
				row.appendChild(labelCell);

				var dataCell = doc.createElement("td");
				if (typeof(data) === "object") {
					dataCell.appendChild(data);
				}
				else {
					dataCell.textContent = data;
				}
				row.appendChild(dataCell);
				if (filter && FoxtrickPrefs.isModuleEnabled('PlayerFilters'))
					addFilterShortcut(filter,title);
				table.appendChild(row);
				return row;
			};

			if (FoxtrickPrefs.isModuleOptionEnabled("TeamStats", "General")) {
				addHeader(Foxtrickl10n.getString("General"));
				if (totalTSI) {
					var avgTSI = Math.round(totalTSI / playerList.length);
					var data = doc.createElement("span");
					var total = doc.createElement("span");
					total.className = "nowrap";
					total.textContent = Foxtrick.formatNumber(totalTSI, " ");
					var avg = doc.createElement("span");
					avg.className = "nowrap";
					avg.textContent = Foxtrick.formatNumber(avgTSI, " ");
					data.appendChild(total);
					data.appendChild(doc.createTextNode(" / "));
					data.appendChild(avg);
					addRow(Foxtrickl10n.getString("TSI.abbr"), data);
				}
				if (totalAge) {
					var avgAge = Math.round(totalAge / playerList.length);
					var avgYears = Math.floor(avgAge / 112);
					var avgDays = avgAge % 112;
					addRow(Foxtrickl10n.getString("Age"), avgYears + "." + avgDays);
				}
				if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
					var youngerThanNineteen = playerList.length - olderThanNineteen;
					var row = addRow(Foxtrickl10n.getString("foxtrick.TeamStats.PlayerNotToOld.label"), youngerThanNineteen);
					if (youngerThanNineteen < 9) {
						row.className = "red";
					}
					if (olderThanNineteen) {
						var row = addRow(Foxtrickl10n.getString("foxtrick.TeamStats.PlayerToOld.label"), olderThanNineteen);
						row.className = "red";
					}
				}
				if (Foxtrick.Pages.Players.isPropertyInList(playerList, "experience")) {
					var avgExperience = Math.round(totalExperience / playerList.length);
					addRow(Foxtrickl10n.getString("Experience"), Foxtrickl10n.getLevelByTypeAndValue("levels", avgExperience));
				}
				if (Foxtrick.Pages.Players.isPropertyInList(playerList, "leadership")) {
					var avgLeadership = Math.round(totalLeadership / playerList.length);
					addRow(Foxtrickl10n.getString("Leadership"), Foxtrickl10n.getLevelByTypeAndValue("levels", avgLeadership));
				}
			}
			if (FoxtrickPrefs.isModuleOptionEnabled("TeamStats", "Speciality")) {
				if (hasSpecialities) {
					addHeader(Foxtrickl10n.getString("Speciality"));
					var specSummary = [];
					for (var speciality in specialities) {
						specSummary.push({ type: speciality, count: specialities[speciality] });
						specSummary.sort(function (a, b) { return a.type.localeCompare(b.type) });
						specSummary.sort(function (a, b) { return b.count - a.count } );
					}
					for (var i in specSummary) {
						addRow(specSummary[i].type, specSummary[i].count, "speciality-" + specSummary[i].type, specSummary[i].type);
					}
				}
			}
			if (FoxtrickPrefs.isModuleOptionEnabled("TeamStats", "Personality")) {
				if (Foxtrick.Pages.Players.isPropertyInList(playerList, "aggressiveness")
					&& Foxtrick.Pages.Players.isPropertyInList(playerList, "agreeability")
					&& Foxtrick.Pages.Players.isPropertyInList(playerList, "honesty")) {
					addHeader(Foxtrickl10n.getString("Personality"));
					var avgAggressiveness = Math.round(totalAggressiveness / playerList.length);
					var avgAgreeability = Math.round(totalAgreeability / playerList.length);
					var avgHonesty = Math.round(totalHonesty / playerList.length);
					addRow(Foxtrickl10n.getString("Aggressiveness"), Foxtrickl10n.getLevelByTypeAndValue("aggressiveness", avgAggressiveness));
					addRow(Foxtrickl10n.getString("Agreeability"), Foxtrickl10n.getLevelByTypeAndValue("agreeability", avgAgreeability));
					addRow(Foxtrickl10n.getString("Honesty"), Foxtrickl10n.getLevelByTypeAndValue("honesty", avgHonesty));
				}
			}
			if (FoxtrickPrefs.isModuleOptionEnabled("TeamStats", "Status")) {
				if (transferListed || yellowCards || twoYellowCards || redCards || bruised || injured) {
					addHeader(Foxtrickl10n.getString("Status"));
				}
				if (transferListed > 0) {
					var img = doc.createElement("img");
					img.src = "/Img/Icons/dollar.gif";
					img.className = "transferListed";
					addRow(img, transferListed, "transfer-listed", Foxtrickl10n.getString("foxtrick.TeamStats.TransferListed.label"));
				}
				if (yellowCards > 0) {
					var img = doc.createElement("img");
					img.src = "/Img/Icons/yellow_card.gif";
					img.className = "cardsOne";
					addRow(img, yellowCards, "cards",Foxtrickl10n.getString("foxtrick.TeamStats.Cards.label"));
				}
				if (twoYellowCards > 0) {
					var img = doc.createElement("img");
					img.src = "/Img/Icons/dual_yellow_card.gif";
					img.className = "cardsTwo";
					addRow(img, twoYellowCards, "cards",Foxtrickl10n.getString("foxtrick.TeamStats.Cards.label"));
				}
				if (redCards > 0) {
					var img = doc.createElement("img");
					img.src = "/Img/Icons/red_card.gif";
					img.className = "cardsOne";
					addRow(img, redCards, "cards",Foxtrickl10n.getString("foxtrick.TeamStats.Cards.label"));
				}
				if (bruised > 0) {
					var img = doc.createElement("img");
					img.src = "/Img/Icons/bruised.gif";
					img.className = "injuryBruised";
					addRow(img, bruised, "injured",Foxtrickl10n.getString("foxtrick.TeamStats.Injured.label"));
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

					addRow(img, data, "injured",Foxtrickl10n.getString("foxtrick.TeamStats.Injured.label"));
				}
			}
			if (FoxtrickPrefs.isModuleOptionEnabled("TeamStats", "Current_league")) {
				if (Foxtrick.Pages.Players.isPropertyInList(playerList, "currentLeagueId")) {
					addHeader(Foxtrickl10n.getString("Current_league"));
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
					for (var i in leagueSummary) {
						addRow(leagueSummary[i].name, leagueSummary[i].count);
					}
				}
			}
			boxBody.textContent = "";
			boxBody.appendChild(table);
		};

		var	boxBody = doc.createElement("div");
		var header = Foxtrickl10n.getString("foxtrick.TeamStats.label");
		var box = Foxtrick.addBoxToSidebar(doc, header, boxBody, 1);
		box.id = "ft-team-stats-box";

		var loading = Foxtrick.util.note.createLoading(doc);
		boxBody.appendChild(loading);

		Foxtrick.Pages.Players.getPlayerList(doc, function(list) {
			try {
				show(list);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		});
	}
});
