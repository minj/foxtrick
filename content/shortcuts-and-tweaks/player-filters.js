/*
 * player-filters.js
 * Add a select box for filtering players
 * @author OBarros, spambot, convinced, ryanli
 */

FoxtrickPlayerFilters = {
	MODULE_NAME : "PlayerFilters",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array("players", "YouthPlayers"),

	FILTER_SELECT_ID : "foxtrick-filter-select",

	run : function(doc) {
		if (doc.getElementById(this.FILTER_SELECT_ID))
			return;

		var sortSelect = doc.getElementById("ctl00_ctl00_CPContent_CPMain_ucSorting_ddlSortBy");
		if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
			sortSelect = doc.getElementById("ctl00_ctl00_CPContent_CPMain_ddlSortBy");
		}

		var filterSelect = doc.createElement("select");
		filterSelect.id = this.FILTER_SELECT_ID;

		var selectClick = function() {
			if (filterSelect.getAttribute("scanned") === "true") {
				// we only scan the players for once and mark it as scanned
				return;
			}

			var playerList = Foxtrick.Pages.Players.getPlayerList(doc);
			var lastMatch = 0;
			for (var i = 0; i < playerList.length; ++i) {
				if (playerList[i].lastMatch) {
					var matchDate = Foxtrick.util.time.getDateFromText(playerList[i].lastMatch.textContent).getTime();
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
					if (specialities[player.speciality] === undefined) {
						specialities[player.speciality] = specialityCount++;
					}
					allPlayers[i].setAttribute("speciality-" + specialities[player.speciality], "true");
				}
				if (Foxtrick.Pages.Players.isPropertyInList(playerList, "lastMatch")) {
					if (player.lastMatch
						&& (lastMatch === Foxtrick.util.time.getDateFromText(player.lastMatch.textContent).getTime())) {
						allPlayers[i].setAttribute("played-latest", "true");
					}
					else {
						allPlayers[i].setAttribute("not-played-latest", "true");
					}
				}
			}

			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "redCard")
				|| Foxtrick.Pages.Players.isPropertyInList(playerList, "yellowCard")) {
				var option = doc.createElement('option');
				option.value = "cards";
				option.textContent = Foxtrickl10n.getString("foxtrick.TeamStats.Cards.label");
				filterSelect.appendChild(option);
			}

			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "injured")
				|| Foxtrick.Pages.Players.isPropertyInList(playerList, "bruised")) {
				var option = doc.createElement("option");
				option.value = "injured";
				option.textContent = Foxtrickl10n.getString("foxtrick.TeamStats.Injured.label");
				filterSelect.appendChild(option);
			}

			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "transferListed")) {
				var option = doc.createElement("option");
				option.value = "transfer-listed";
				option.textContent = Foxtrickl10n.getString("foxtrick.TeamStats.TransferListed.label");
				filterSelect.appendChild(option);
			}

			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "lastMatch")) {
				var option = doc.createElement("option");
				option.value = "played-latest";
				option.textContent = Foxtrickl10n.getString("foxtrick.TeamStats.PlayedLatest.label");
				filterSelect.appendChild(option);

				var option = doc.createElement("option");
				option.value = "not-played-latest";
				option.textContent = Foxtrickl10n.getString("foxtrick.TeamStats.NotPlayedLatest.label");
				filterSelect.appendChild(option);
			}

			if (Foxtrick.Pages.Players.isPropertyInList(playerList, "speciality")) {
				for (var speciality in specialities) {
					var option = doc.createElement("option");
					option.value = "speciality-" + specialities[speciality];
					option.textContent = speciality;
					filterSelect.appendChild(option);
				}
			}

			var faceCards = doc.getElementsByClassName("faceCard");
			if (faceCards.length > 0) {
				var option = doc.createElement("option");
				option.value = "face";
				option.textContent = Foxtrickl10n.getString("foxtrick.TeamStats.Pictures.label");
				filterSelect.appendChild(option);
			}

			filterSelect.setAttribute("scanned", "true");
		};

		var changeListener = function(ev) {
			var begin = new Date();

			var filter = filterSelect.value;

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
							elem.style.display='block';
						}
						else if (Foxtrick.hasClass(elem, "category")
							|| Foxtrick.hasClass(elem, "playerInfo")
							|| Foxtrick.hasClass(elem, "borderSeparator")
							|| Foxtrick.hasClass(elem, "separator")
							|| Foxtrick.hasClass(elem, "youthnotes")) {
							// these are attached infomation divisions
							elem.style.display='none';
						}
					}

					// Face cards are floated to the left, so we need a
					// cleaner to maintain the container's length.
					var container = faceCards[0].parentNode;
					var cleaner = doc.createElement("div");
					cleaner.className = "clear";
					if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc)
						&& !Foxtrick.Pages.Players.isNtPlayersPage(doc)
						&& !Foxtrick.Pages.Players.isOldiesPage(doc)
						&& !Foxtrick.Pages.Players.isCoachesPage(doc)) {
						// If it's normal senior players list, there is an
						// a element in the bottom for navigating back to top,
						// and the cleaner should be inserted before it.
						var containerLinks = container.getElementsByTagName("a");
						var backTopAnchor = containerLinks[containerLinks.length - 1];
						container.insertBefore(cleaner, backTopAnchor);
					}
					else {
						container.appendChild(cleaner);
					}
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
							elem.style.display='block';
							hide = false;
							hideCategory = false;
						}
						else {
							elem.style.display='none';
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
							elem.style.display='none';
						}
						else {
							elem.style.display='block';
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
			h.textContent = h.textContent.replace(/\d+/, count);

			if (FoxtrickSkillTable.isTableCreated(doc)){
				var table = doc.getElementById("ft_skilltable");
				table.parentNode.removeChild(table);

				var tablediv = doc.getElementById("ft_skilltablediv");
				if (Foxtrick.hasClass(tablediv.getElementsByTagName('h2')[0], "ft_boxBodyUnfolded")) {
					setTimeout(function() { FoxtrickSkillTable.createTable(doc); }, 0);
				}
			}

			var end = new Date();
			var time = (end.getSeconds() - begin.getSeconds()) * 1000
				 + end.getMilliseconds() - begin.getMilliseconds();
			Foxtrick.log("calculate time: " + time + " ms");
		};

		filterSelect.addEventListener("click", function() {
			try {
				selectClick();
			}
			catch (e) {
				Foxtrick.log(e);
			}
		}, false);
		filterSelect.addEventListener("change", function() {
			try {
				changeListener();
			}
			catch (e) {
				Foxtrick.log(e);
			}
		}, false);

		// this is used to clear filters, and we use this to select all
		// players
		var option = doc.createElement("option");
		option.value = "all";
		option.textContent = "-- " + Foxtrickl10n.getString("Filter") + " --";
		filterSelect.appendChild(option);

		var parentNode = sortSelect.parentNode
		var insertBefore = sortSelect.nextSibling;
		sortSelect.parentNode.removeChild(sortSelect);

		var container = doc.createElement("div");
		container.className = "ft-select-container";
		container.appendChild(sortSelect);
		container.appendChild(filterSelect);

		parentNode.insertBefore(container, insertBefore);
	},

	change : function(doc) {
		this.run(doc);
	}
};
