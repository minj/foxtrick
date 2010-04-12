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
					allPlayers[i].setAttribute(player.speciality, "true");
					if (!specialities[player.speciality]) {
						specialities[player.speciality] = true;
					}
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
			option.innerHTML = Foxtrickl10n.getString("Filter");
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
					option.value = speciality;
					option.innerHTML = speciality;
					filterselect.appendChild(option);
				}
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

			var allDivs;
			if (doc.getElementsByClassName("playerList").length) {
				var playerList = doc.getElementsByClassName("playerList")[0];
				allDivs = playerList.getElementsByTagName("div");
			}
			else {
				allDivs = body.getElementsByTagName("div");
			}

			// recording how many players are shown
			var count = 0;

			var hide = false;
			var hideCategory = true;
			var lastCategory = null;
			var lastborderSeparator = null;
			var lastFace = null;

			for (var i = 0; i < allDivs.length; ++i) {
				var div = allDivs[i];
				if (Foxtrick.hasClass(div, "category")) {
					if (lastCategory) {
						if (hideCategory == true) {
							Foxtrick.addClass(lastCategory, "ft_hidden");
						}
						else {
							Foxtrick.removeClass(lastCategory, "ft_hidden");
						}
					}
					lastCategory = div;
					hideCategory = true;
				}
				else if (Foxtrick.hasClass(div, "faceCard")) {
					lastFace = div;
				}
				else if (Foxtrick.hasClass(div, "playerInfo")) {
					if (div.getAttribute(filter) === "true") {
						Foxtrick.removeClass(div, "ft_hidden");
						hide = false;
						hideCategory = false;
					}
					else {
						Foxtrick.addClass(div, "ft_hidden");
						hide = true;
					}
					if (lastFace) {
						if (hide) {
							Foxtrick.addClass(lastFace, "ft_hidden");
						}
						else {
							Foxtrick.removeClass(lastFace, "ft_hidden");
						}
					}
					if (!hide) {
						++count;
					}
				}
				else if (Foxtrick.hasClass(div, "borderSeparator")
					|| Foxtrick.hasClass(div, "separator")
					|| Foxtrick.hasClass(div, "youthnotes")) {
					if (hide === true) {
						Foxtrick.addClass(div, "ft_hidden");
					}
					else {
						Foxtrick.removeClass(div, "ft_hidden");
					}
				}
				if (Foxtrick.hasClass(div, "borderSeparator")
					|| Foxtrick.hasClass(div, "separator")) {
					lastborderSeparator = div;
				}
			}
			if (lastCategory) {
				if (hideCategory === true) {
					Foxtrick.addClass(lastCategory, "ft_hidden");
				}
				else {
					Foxtrick.removeClass(lastCategory, "ft_hidden");
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
