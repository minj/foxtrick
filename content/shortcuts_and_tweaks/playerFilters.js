/*
 * playerFilters.js
 * Add a select box for filtering players
 * @author OBarros, spambot, convinced, ryanli
 */

FoxtrickPlayerFilters = {
	MODULE_NAME : "PlayerFilters",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array("players", "YouthPlayers"),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.1.3",
	LATEST_CHANGE : "Splitted player filters from TeamStats as a module.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

	init : function() {
	},

	run : function(page, doc) {
		try {
			playerList = Foxtrick.Pages.Players.getPlayerList(doc, true);
			var lastMatch = 0;
			for (var i = 0; i < playerList.length; ++i) {
				if (playerList[i].lastMatch) {
					var matchDate = Foxtrick.getUniqueDayfromCellHTML(playerList[i].lastMatch.innerHTML);
					if (matchDate > lastMatch) {
						lastMatch = matchDate;
					}
				}
			}

			var specialities = {};
			var specialityCount = 0;

			var allPlayers = doc.getElementsByClassName("playerInfo");
			for (var i = 0; i < allPlayers.length; ++i) {
				var id = Foxtrick.Pages.Players.getPlayerId(allPlayers[i]);
				var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);
				// All players have attribute "all" set to "true", so that the
				// filter can be cleared using an "all" filter
				allPlayers[i].setAttribute("all", "true");
				if (player.redCard || player.yellowCard) {
					allPlayers[i].setAttribute("cards", "true");
				}
				if (player.transferListed) {
					allPlayers[i].setAttribute("transfer-listed", "true");
				}
				if (player.bruised || player.injured) {
					allPlayers[i].setAttribute("injured", "true");
				}
				if (player.speciality) {
					if (!specialities[player.speciality]) {
						specialities[player.speciality] = specialityCount++;
					}
					allPlayers[i].setAttribute("speciality-" + specialities[player.speciality], "true");
				}
				if (player.lastMatch) {
					if (lastMatch === Foxtrick.getUniqueDayfromCellHTML(player.lastMatch.innerHTML)) {
						allPlayers[i].setAttribute("played-latest", "true");
					}
					else {
						allPlayers[i].setAttribute("not-played-latest", "true");
					}
				}
			}
			var sortbybox = doc.getElementById("ctl00_CPMain_ucSorting_ddlSortBy");
			if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
				sortbybox = doc.getElementById("ctl00_CPMain_ddlSortBy");
			}
			var filterselect = doc.createElement("select");
			Foxtrick.addEventListenerChangeSave(filterselect, "change", this.changeListener, false);

			// this is used to clear filters, and we use this to select all
			// players
			var option = doc.createElement("option");
			option.value = "all";
			option.innerHTML = "-- " + Foxtrickl10n.getString("Filter") + " --";
			filterselect.appendChild(option);

			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "redCard")
				|| Foxtrick.Pages.Players.isPropertyInList(playerList, "yellowCard")) {
				var option = doc.createElement('option');
				option.value = "cards";
				option.innerHTML = Foxtrickl10n.getString("foxtrick.FTTeamStats.Cards.label");
				filterselect.appendChild(option);
			}

			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "injured")
				|| Foxtrick.Pages.Players.isPropertyInList(playerList, "bruised")) {
				var option = doc.createElement("option");
				option.value = "injured";
				option.innerHTML = Foxtrickl10n.getString("foxtrick.FTTeamStats.Injured.label");
				filterselect.appendChild(option);
			}

			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "transferListed")) {
				var option = doc.createElement("option");
				option.value = "transfer-listed";
				option.innerHTML = Foxtrickl10n.getString("foxtrick.FTTeamStats.TransferListed.label");
				filterselect.appendChild(option);
			}

			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "lastMatch")) {
				var option = doc.createElement("option");
				option.value = "played-latest";
				option.innerHTML = Foxtrickl10n.getString("foxtrick.FTTeamStats.PlayedLatest.label");
				filterselect.appendChild(option);

				var option = doc.createElement("option");
				option.value = "not-played-latest";
				option.innerHTML = Foxtrickl10n.getString("foxtrick.FTTeamStats.NotPlayedLatest.label");
				filterselect.appendChild(option);
			}

			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "speciality")) {
				for (var speciality in specialities) {
					var option = doc.createElement("option");
					option.value = "speciality-" + specialities[speciality];
					option.innerHTML = speciality;
					filterselect.appendChild(option);
				}
			}

			var faceCards = doc.getElementsByClassName("faceCard");
			if (faceCards.length > 0) {
				var option = doc.createElement("option");
				option.value = "face";
				option.innerHTML = Foxtrickl10n.getString("foxtrick.FTTeamStats.Pictures.label");
				filterselect.appendChild(option);
			}

			var mainBody = doc.getElementById("mainBody");
			sortbybox = mainBody.removeChild(sortbybox);
			var container = doc.createElement("div");
			container.className = "ft-select-container";
			container.appendChild(sortbybox);
			container.appendChild(filterselect);
			mainBody.insertBefore(container, mainBody.firstChild);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	change : function(page, doc) {
	},

	changeListener : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var filter = ev.target.value;

			var body = doc.getElementById("mainBody");

			var allElems;
			if (doc.getElementsByClassName("playerList").length) {
				var playerList = doc.getElementsByClassName("playerList")[0];
				allElems = playerList.childNodes;
			}
			else {
				allElems = body.childNodes;
			}

			// recording how many players are shown
			var count = 0;
			if (filter === "face") {
				var faceCards = doc.getElementsByClassName("faceCard");
				if (faceCards.length > 0) {
					count = faceCards.length;
					for (var i = 0; i < allElems.length; ++i) {
						var elem = allElems[i];
						if (Foxtrick.hasClass(elem, "faceCard")) {
							Foxtrick.removeClass(elem, "hidden");
						}
						else if (Foxtrick.hasClass(elem, "category")
							|| Foxtrick.hasClass(elem, "playerInfo")
							|| Foxtrick.hasClass(elem, "borderSeparator")
							|| Foxtrick.hasClass(elem, "separator")
							|| Foxtrick.hasClass(elem, "youthnotes")) {
							// these are attached infomation divisions
							Foxtrick.addClass(elem, "hidden");
						}
					}

					// Face cards are floated to the left, so we need a
					// cleaner to maintain the container's length.
					var cleaner = doc.createElement("div");
					cleaner.style.clear = "both";
					faceCards[0].parentNode.appendChild(cleaner);
				}
			}
			else {
				var hide = false;
				var hideCategory = true;
				var lastCategory = null;
				var lastborderSeparator = null;
				var lastFace = null;

				for (var i = 0; i < allElems.length; ++i) {
					var elem = allElems[i];
					if (Foxtrick.hasClass(elem, "category")) {
						if (lastCategory) {
							if (hideCategory == true) {
								Foxtrick.addClass(lastCategory, "hidden");
							}
							else {
								Foxtrick.removeClass(lastCategory, "hidden");
							}
						}
						lastCategory = elem;
						hideCategory = true;
					}
					else if (Foxtrick.hasClass(elem, "faceCard")) {
						lastFace = elem;
					}
					else if (Foxtrick.hasClass(elem, "playerInfo")) {
						if (elem.getAttribute(filter) === "true") {
							Foxtrick.removeClass(elem, "hidden");
							hide = false;
							hideCategory = false;
						}
						else {
							Foxtrick.addClass(elem, "hidden");
							hide = true;
						}
						if (lastFace) {
							if (hide) {
								Foxtrick.addClass(lastFace, "hidden");
							}
							else {
								Foxtrick.removeClass(lastFace, "hidden");
							}
						}
						if (!hide) {
							++count;
						}
					}
					else if (Foxtrick.hasClass(elem, "borderSeparator")
						|| Foxtrick.hasClass(elem, "separator")
						|| Foxtrick.hasClass(elem, "youthnotes")) {
						if (hide === true) {
							Foxtrick.addClass(elem, "hidden");
						}
						else {
							Foxtrick.removeClass(elem, "hidden");
						}
					}
					if (Foxtrick.hasClass(elem, "borderSeparator")
						|| Foxtrick.hasClass(elem, "separator")) {
						lastborderSeparator = elem;
					}
				}
				if (lastCategory) {
					if (hideCategory === true) {
						Foxtrick.addClass(lastCategory, "hidden");
					}
					else {
						Foxtrick.removeClass(lastCategory, "hidden");
					}
				}
			}
			// update player count
			var h = body.getElementsByTagName("h1")[0];
			h.innerHTML = h.innerHTML.replace(/\d+/, count);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
};
