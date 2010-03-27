/**
	* skilltable.js
	* Show a skill table on players list page
	* @authors: convincedd, ryanli
	*/
////////////////////////////////////////////////////////////////////////////////

var FoxtrickSkillTable = {

	MODULE_NAME : "SkillTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array("players", "YouthPlayers"),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.1.2",
	LATEST_CHANGE : "Improves error catching, fixes non-showing table for some users, caching last XML for faster load and extra info also on old tabs.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	OPTIONS : new Array("OtherTeams"),

	// whether skill table is created
	// returns a Boolean
	isTableCreated : function(doc) {
		return Foxtrick.hasElement(doc, "ft_skilltable");
	},

	// returns full type of the document in this format:
	// { type : ["senior"|"youth"], subtype : ["own"|"others"|"nt"|"oldiesCoach"] }
	getFullType : function(doc) {
		var isOwn = Foxtrick.Pages.Players.isOwnPlayersPage(doc);

		var fullType = { type : "", subtype : "" };

		if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc)) {
			fullType.type = "senior";
			if (Foxtrick.Pages.Players.isNtPlayersPage(doc)) {
				fullType.subtype = "nt";
			}
			else if (Foxtrick.Pages.Players.isOldiesPage(doc)
				|| Foxtrick.Pages.Players.isCoachesPage(doc)) {
				fullType.subtype = "oldiesCoach";
			}
			else if (isOwn) {
				fullType.subtype = "own";
			}
			else {
				fullType.subtype = "others";
			}
		}
		else if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
			fullType.type = "youth";
			if (isOwn) {
				fullType.subtype = "own";
			}
			else {
				fullType.subtype = "others";
			}
		}

		return fullType;
	},

	init : function() {
	},

	run : function(page, doc) {
		try {
			if (!this.getFullType(doc).subtype === "own"
				&& !Foxtrick.isModuleFeatureEnabled(this, "OtherTeams")) {
				return;
			}
			FoxtrickSkillTable.addTableDiv(doc);
		}
		catch(e) {
			Foxtrick.dumpError(e);
		}
	},

	change : function(page, doc) {
	},

	createTable : function(doc) {
		try {
			var fullType = this.getFullType(doc);
			var playerList = Foxtrick.Pages.Players.getPlayerList(doc);

			var latestMatch = 0, secondLatestMatch = 0;
			if (fullType.subtype != "nt" && !fullType.subtype != "oldiesCoach") {
				var allPlayerInfo = doc.getElementsByClassName("playerInfo");
				for (var i = 0; i < allPlayerInfo.length; ++i) {
					var as = allPlayerInfo[i].getElementsByTagName("a");
					for (var j = 0; j < as.length; ++j) {
						if (as[j].href.search(/matchid/i) != -1) {
							var matchDay = Foxtrick.getUniqueDayfromCellHTML(as[j].innerHTML);
							if (matchDay > latestMatch) {
								secondLatestMatch = latestMatch;
								latestMatch = matchDay;
							}
							else if (matchDay > secondLatestMatch && matchDay < latestMatch) {
								secondLatestMatch = matchDay;
							}
						}
					}
				}
			}

			// functions used to attach data to table cell
			var node = function(cell, node) { cell.appendChild(node); };
			var category = function(cell, cat) {
				categories = ["GK", "WB", "CD", "W", "IM", "FW", "S", "R", "E1", "E2"];
				if (cat !== 0) {
					cell.appendChild(doc.createTextNode(Foxtrickl10n.getString("categories." + categories[cat - 1])));
					cell.setAttribute("index", cat);
				}
				else {
					// make the uncategoried at the bottom
					cell.setAttribute("index", 100);
				}
			}
			var number = function(cell, number) {
				if (number !== 100) {
					cell.appendChild(doc.createTextNode(number));
				}
				cell.setAttribute("index", number);
			};
			var nationality = function(cell, countryId) {
				var leagueId = Foxtrick.XMLData.getLeagueIdByCountryId(countryId);
				leagueName = "New Moon";
				if (leagueId) {
					leagueName = FoxtrickHelper.getLeagueDataFromId(leagueId).LeagueName;
				}
				var a = doc.createElement("a");
				a.href = "/World/Leagues/League.aspx?LeagueID=" + leagueId;
				a.className = "flag inner";
				var img = doc.createElement("img");
				var style = "vertical-align:top; margin-top:1px; background: transparent url(/Img/Flags/flags.gif) no-repeat scroll " + (-20) * leagueId + "px 0pt; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial;";
				img.setAttribute("style", style);
				img.alt = img.title = leagueName;
				img.src = "/Img/Icons/transparent.gif";
				a.appendChild(img);
				cell.appendChild(a);
				cell.setAttribute("index", leagueName);
			};
			var age = function(cell, age) {
				cell.appendChild(doc.createTextNode(age.years + "." + age.days));
				cell.setAttribute("index", age.years * 112 + age.days);
			};
			var skill = function(cell, skill) {
				if (typeof(skill) === "object") {
					// in youth team, returned skill is an object
					cell.setAttribute("index", skill.current * 9 + skill.max + skill.maxed);
					if (skill.maxed) {
						cell.className = "maxed";
					}
					if (skill.current !== 0 || skill.max !== 0) {
						var current = skill.current ? skill.current : "-";
						var max = skill.max ? skill.max : "-";
						cell.appendChild(doc.createTextNode(current + "/" + max));
					}
				}
				else {
					cell.appendChild(doc.createTextNode(skill));
				}
			};
			var noZero = function(cell, value) {
				if (value === true) {
					cell.appendChild(doc.createTextNode("1"));
				}
				else if (value) {
					cell.appendChild(doc.createTextNode(value));
				}
			};
			var perhapsUnavailable = function(cell, value) {
				if (value === -1) {
					cell.appendChild(doc.createTextNode("?"));
				}
				else {
					cell.appendChild(doc.createTextNode(value));
				}
			}
			var speciality = function(cell, spec) {
				var shortSpec = FoxtrickHelper.getShortSpeciality(spec);
				var abbr = doc.createElement("abbr");
				abbr.appendChild(doc.createTextNode(shortSpec));
				abbr.title = spec;
				cell.appendChild(abbr);
				cell.setAttribute("index", spec);
			};
			var lastMatch = function(cell, last) {
				if (last) {
					var matchDay = Foxtrick.getUniqueDayfromCellHTML(last.innerHTML);
					cell.appendChild(last);
					cell.setAttribute("index", matchDay);
					if (matchDay == latestMatch) {
						Foxtrick.addClass(cell, "latest-match");
					}
					else if (matchDay == secondLatestMatch) {
						Foxtrick.addClass(cell, "second-latest-match");
					}
				}
				else {
					cell.setAttribute("index", 0);
				}
			};
			var position = function(cell, pos) {
				var shortPos = FoxtrickHelper.getShortPosition(pos);
				var abbr = doc.createElement("abbr");
				abbr.appendChild(doc.createTextNode(shortPos));
				abbr.title = pos;
				cell.appendChild(abbr);
				cell.setAttribute("index", pos);
			};

// columns used for table information
// name: name of the column, used for fetching l10nized string
// property: value used to retrieve data from Foxtrick.Pages.Players.getPlayerList()
// method: which function to use in order to attach data to cell, should be a
//          function with two arguments, first is table cell(td), second is
//          raw data from playerList. By default the data is treated as plain
//          text and appended to the cell.
// sortAsc: whether to sort the column in ascending order, default is in
//           descending order.
// sortString: whether to sort the column with values as string, default is as
//              numbers. If set to true, sortAsc is always on.
// alignRight: whether to align the data cells to the right
// img: images used in table headers as substitution of text

			var columns = [
				{ name : "PlayerCategory", property : "category", method: category, sortAsc: true },
				{ name : "PlayerNumber", property : "number", method : number, sortAsc : true },
				{ name : "Nationality", property : "countryId", method : nationality, sortString : true },
				{ name : "Player", property : "nameLink", method : node, sortString : true },
				{ name : "Age", property : "age", method : age, sortAsc : true },
				{ name : "TSI", property : "tsi", alignRight : true },
				{ name : "Agreeability", property : "agreeability" },
				{ name : "Aggressiveness", property : "aggressiveness" },
				{ name : "Honesty", property : "honesty" },
				{ name : "Leadership", property : "leadership" },
				{ name : "Experience", property : "experience" },
				{ name : "Form", property : "form" },
				{ name : "Stamina", property : "stamina" },
				{ name : "Keeper", property : "keeper", method: skill },
				{ name : "Defending", property : "defending", method: skill },
				{ name : "Playmaking", property : "playmaking", method: skill },
				{ name : "Winger", property : "winger", method: skill },
				{ name : "Passing", property : "passing", method: skill },
				{ name : "Scoring", property : "scoring", method: skill },
				{ name : "Set_pieces", property : "setPieces", method: skill },
				{ name : "Yellow_card", property : "yellowCard", method : noZero, img : "/Img/Icons/yellow_card.gif" },
				{ name : "Red_card", property : "redCard", method : noZero, img : "/Img/Icons/red_card.gif" },
				{ name : "Bruised", property : "bruised", method : noZero, img : "/Img/Icons/bruised.gif" },
				{ name : "Injured", property : "injured", method : noZero, img : "/Img/Icons/injured.gif" },
				{ name : "Speciality", property : "speciality", method : speciality, sortString : true },
				{ name : "Last_match", property : "lastMatch", method : lastMatch },
				{ name : "Last_stars", property : "lastRating", img : "/Img/Matches/star_blue.png" },
				{ name : "Last_position", property : "lastPosition", method : position, sortString : true },
				{ name : "Salary", property : "salary", alignRight : true },
				{ name : "TransferListed", property : "transferListed", method : noZero, img : "/Img/Icons/dollar.gif" },
				{ name : "NrOfMatches", property : "matchCount" },
				{ name : "LeagueGoals", property : "leagueGoals" },
				{ name : "CareerGoals", property : "careerGoals" }
			];

			for (var j = 0; j < columns.length; ++j) {
				if (Foxtrick.Pages.Players.isPropertyInList(playerList, columns[j].property)) {
					columns[j].available = true;
					columns[j].enabled = FoxtrickSkillTable.getColumnEnabled(fullType, columns[j].name);
				}
				else {
					columns[j].available = false;
				}
			}

			var customizeTable = FoxtrickSkillTable.createCustomizeTable(columns, doc);
			Foxtrick.addClass(customizeTable, "ft_hidden");

			var table = doc.createElement("table");
			table.id = "ft_skilltable";
			table.className = "ft_skilltable";

			thead = doc.createElement("thead");
			var tr = doc.createElement("tr");
			thead.appendChild(tr);
			table.appendChild(thead);
			var s_index = 0;
			for (var j = 0; j < columns.length; j++) {
				if (columns[j].enabled) {
					var th = doc.createElement("th");
					th.setAttribute("s_index", s_index++);
					if (columns[j].sortString) {
						th.setAttribute("sort-string", true);
					}
					if (columns[j].sortAsc) {
						th.setAttribute("sort-asc", true);
					}
					Foxtrick.addEventListenerChangeSave(th, "click", FoxtrickSkillTable.sortClick, false);

					var fullName = Foxtrickl10n.getString(columns[j].name);
					var abbrName = Foxtrickl10n.getString(columns[j].name + ".abbr");
					var abbr = true;
					if (!abbrName || fullName === abbrName) {
						abbr = false;
					}
					if (abbr) {
						if (columns[j].img) {
							var img = doc.createElement("img");
							img.setAttribute("src", columns[j].img);
							img.setAttribute("alt", abbrName);
							img.setAttribute("title", fullName);
							th.appendChild(img);
						}
						else {
							var abbr = doc.createElement("abbr");
							abbr.setAttribute("title", fullName);
							abbr.appendChild(doc.createTextNode(abbrName));
							th.appendChild(abbr);
						}
					}
					else {
						if (columns[j].img) {
							var img = doc.createElement("img");
							img.setAttribute("src", columns[j].img);
							img.setAttribute("alt", fullName);
							img.setAttribute("title", fullName);
						}
						else {
							th.appendChild(doc.createTextNode(fullName));
						}
					}
					tr.appendChild(th);
				}
			}

			var tbody = doc.createElement("tbody");
			table.appendChild(tbody);

			for (var i in playerList) {
				var row = doc.createElement("tr");
				tbody.appendChild(row);
				for (var j in columns) {
					if (columns[j].enabled) {
						var cell = doc.createElement("td");
						row.appendChild(cell);
						if (playerList[i][columns[j].property] !== undefined) {
							if (columns[j].method) {
								columns[j].method(cell, playerList[i][columns[j].property]);
							}
							else {
								cell.appendChild(doc.createTextNode(playerList[i][columns[j].property]));
							}
							if (columns[j].alignRight) {
								Foxtrick.addClass(cell, "align-right");
							}
						}
					}
				}
			}

			var tablediv = doc.getElementById("ft_skilltablediv");
			FoxtrickSkillTable.insertCustomizeTable(tablediv, customizeTable);
			FoxtrickSkillTable.insertSkillTable(tablediv, table);

			var container = tablediv.getElementsByClassName("ft_skilltable_container")[0];
			if (FoxtrickPrefs.getBool("module.SkillTable.top")) {
				Foxtrick.addClass(container, "on_top");
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	/* sortCompare
		sortClick() will first check whether every cell in that column has the
		attribute `index'. If so, they will be ordered with that attribute as
		key. Otherwise, we use their textContent.
	*/

	sortCompare : function(a, b) {
		var aContent, bContent;
		if (FoxtrickSkillTable.sortByIndex) {
			aContent = a.cells[FoxtrickSkillTable.sortIndex].getAttribute("index");
			bContent = b.cells[FoxtrickSkillTable.sortIndex].getAttribute("index");
		}
		else {
			aContent = a.cells[FoxtrickSkillTable.sortIndex].textContent;
			bContent = b.cells[FoxtrickSkillTable.sortIndex].textContent;
		}
		if (FoxtrickSkillTable.sortString) {
			if (aContent === bContent) {
				return 0;
			}
			// place empty cells at the bottom
			if (aContent === "") {
				return 1;
			}
			if (bContent === "") {
				return -1;
			}
			// always sort by ascending order
			return aContent.localeCompare(bContent);
		}
		else {
			aContent = parseFloat(aContent);
			bContent = parseFloat(bContent);
			aContent = isNaN(aContent) ? 0 : aContent;
			bContent = isNaN(bContent) ? 0 : bContent;
			if (aContent === bContent) {
				return 0;
			}
			if (FoxtrickSkillTable.sortAsc) {
				return aContent > bContent;
			}
			else {
				return aContent < bContent;
			}
		}
	},

	sortClick : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			FoxtrickSkillTable.sortIndex = ev.currentTarget.getAttribute("s_index");
			FoxtrickSkillTable.sortAsc = ev.currentTarget.hasAttribute("sort-asc");
			FoxtrickSkillTable.sortString = ev.currentTarget.hasAttribute("sort-string");

			var table = doc.getElementById("ft_skilltable");
			var table_old = table.cloneNode(true);

			var rows = new Array();

			FoxtrickSkillTable.sortByIndex = true;
			for (var i = 1; i < table.rows.length; ++i) {
				if (!table_old.rows[i].cells[FoxtrickSkillTable.sortIndex].hasAttribute("index")) {
					FoxtrickSkillTable.sortByIndex = false;
				}
				rows.push(table_old.rows[i].cloneNode(true));
			}

			rows.sort(FoxtrickSkillTable.sortCompare);

			for (var i = 1; i < table.rows.length; ++i) {
				table_old.rows[i].innerHTML = rows[i-1].innerHTML;
			}
			table.innerHTML = table_old.innerHTML;

			for (var i = 0; i < table.rows[0].cells.length; ++i) {
				Foxtrick.addEventListenerChangeSave(table.rows[0].cells[i], "click", FoxtrickSkillTable.sortClick, false);
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
		finally {
			if (ev) ev.stopPropagation();
		}
		Foxtrick.dump_flush(doc);
	},

	toggleDisplay : function(ev) {
		try {
			Foxtrick.dump('SkillTable: toggleDisplay\n');

			var doc = ev.target.ownerDocument;
			var tablediv = doc.getElementById("ft_skilltablediv");

			if (!FoxtrickSkillTable.isTableCreated(doc)) {
				FoxtrickSkillTable.createTable(doc);
			}

			var h2 = tablediv.getElementsByTagName("h2")[0];
			Foxtrick.toggleClass(h2, "ft_boxBodyUnfolded");
			Foxtrick.toggleClass(h2, "ft_boxBodyCollapsed");
			var show = Foxtrick.hasClass(h2, "ft_boxBodyUnfolded");

			var links = tablediv.getElementsByClassName("ft_skilltable_links")[0];
			var customizeTable = tablediv.getElementsByClassName("ft_skilltable_customizetable")[0];
			var container = tablediv.getElementsByClassName("ft_skilltable_container")[0];
			if (show) {
				// show the objects
				Foxtrick.removeClass(links, "ft_hidden");
				Foxtrick.removeClass(container, "ft_hidden");
			}
			else {
				// hide the objects
				Foxtrick.removeClass(links, "customizing");
				Foxtrick.addClass(links, "ft_hidden");
				Foxtrick.addClass(customizeTable, "ft_hidden");
				Foxtrick.addClass(container, "ft_hidden");
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
		Foxtrick.dump_flush(doc);
	},

	view : function(ev) {
		var doc = ev.target.ownerDocument;
		var tablediv = doc.getElementById("ft_skilltablediv");
		var container = tablediv.getElementsByClassName("ft_skilltable_container")[0];
		Foxtrick.toggleClass(container, "on_top");

		FoxtrickPrefs.setBool("module.SkillTable.top", Foxtrick.hasClass(container, "on_top"));
	},

	customize : function(ev) {
		var doc = ev.target.ownerDocument;
		var links = doc.getElementsByClassName("ft_skilltable_links")[0];
		Foxtrick.addClass(links, "customizing");

		var customizeTable = doc.getElementsByClassName("ft_skilltable_customizetable")[0];
		Foxtrick.removeClass(customizeTable, "ft_hidden");

		var container = doc.getElementsByClassName("ft_skilltable_container")[0];
		Foxtrick.addClass(container, "ft_hidden");
	},

	save : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var fullType = FoxtrickSkillTable.getFullType(doc);

			var tablediv = doc.getElementById("ft_skilltablediv");
			var input = tablediv.getElementsByTagName("input");
			for (var i=0; i<input.length; ++i) {
				FoxtrickSkillTable.setColumnEnabled(fullType, input[i].id, input[i].checked);
			}
			doc.location.reload();
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	cancel : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var tablediv = doc.getElementById("ft_skilltablediv");
			var links = tablediv.getElementsByClassName("ft_skilltable_links")[0];
			var customizeTable = tablediv.getElementsByClassName("ft_skilltable_customizetable")[0];
			var container = tablediv.getElementsByClassName("ft_skilltable_container")[0];
			Foxtrick.removeClass(links, "customizing");
			Foxtrick.addClass(customizeTable, "ft_hidden");
			Foxtrick.removeClass(container, "ft_hidden");
		}
		catch(e) {
			Foxtrick.dumpError(e);
		}
	},

	addTableDiv : function(doc) {
		var tablediv = doc.createElement("div");
		tablediv.id = "ft_skilltablediv";
		tablediv.className = "ft_skilltablediv";

		// table div head
		var h2 = doc.createElement("h2");
		h2.className = "ft_boxBodyCollapsed";
		h2.appendChild(doc.createTextNode(Foxtrickl10n.getString("Skill_table")));
		Foxtrick.addEventListenerChangeSave(h2, "click", FoxtrickSkillTable.toggleDisplay, false);
		tablediv.appendChild(h2);

		// links
		var links = doc.createElement("div");
		links.className = "ft_skilltable_links";
		Foxtrick.addClass(links, "ft_hidden");
		// links: copy
		var copy = doc.createElement("a");
		copy.className = "customize_item secondary";
		copy.appendChild(doc.createTextNode(Foxtrickl10n.getString("Copy")));
		copy.setAttribute("title", Foxtrickl10n.getString("foxtrick.tweaks.copyskilltable"));
		Foxtrick.addEventListenerChangeSave(copy, "click", FoxtrickSkillTable.copyTable, false);
		// links: customize
		var customize = doc.createElement("a");
		customize.className = "customize_item";
		customize.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.buttonCustomize")));
		Foxtrick.addEventListenerChangeSave(customize, "click", FoxtrickSkillTable.customize, false);
		// links: save
		var save = doc.createElement("a");
		save.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.buttonSave")));
		Foxtrick.addEventListenerChangeSave(save, "click", FoxtrickSkillTable.save, false);
		// links: cancel
		var cancel = doc.createElement("a");
		cancel.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.buttonCancel")));
		Foxtrick.addEventListenerChangeSave(cancel, "click", FoxtrickSkillTable.cancel, false);
		// links: all children
		links.appendChild(copy);
		links.appendChild(customize);
		links.appendChild(save);
		links.appendChild(cancel);

		// customize table wrapper
		var customizeWrapper = doc.createElement("div");
		customizeWrapper.className = "ft_skilltable_customizewrapper";

		// table container
		var container = doc.createElement("div");
		container.className = "ft_skilltable_container";
		Foxtrick.addClass(container, "ft_hidden");
		// table container: switch view
		var switchView = doc.createElement("div");
		var switchViewLink = doc.createElement("a");
		switchViewLink.appendChild(doc.createTextNode(Foxtrickl10n.getString("Switch_view")));
		switchViewLink.setAttribute("title", Foxtrickl10n.getString("foxtrick.SkillTable.Switch_view_title"));
		Foxtrick.addEventListenerChangeSave(switchViewLink, "click", FoxtrickSkillTable.view, false);
		switchView.appendChild(switchViewLink);
		// table container: table wrapper
		var wrapper = doc.createElement("div");
		wrapper.className = "ft_skilltable_wrapper";
		// table container: all children
		container.appendChild(switchView);
		container.appendChild(wrapper);

		tablediv.appendChild(h2);
		tablediv.appendChild(links);
		tablediv.appendChild(customizeWrapper);
		tablediv.appendChild(container);

		// insert tablediv
		
	/*  var firstPlayer = doc.getElementsByClassName("playerInfo")[0];
		if (firstPlayer) {
			// only insert if there is at least one player
			var playerContainer = firstPlayer.parentNode;
			playerContainer.insertBefore(tablediv, firstPlayer);
		} 
	*/
		var header = doc.getElementsByTagName("h1")[0];
		header.parentNode.insertBefore(tablediv, header.nextSibling);

		return tablediv;
	},

	insertCustomizeTable : function(tablediv, customizeTable) {
		var wrapper = tablediv.getElementsByClassName("ft_skilltable_customizewrapper")[0];
		wrapper.appendChild(customizeTable);
	},

	insertSkillTable : function(tablediv, skillTable) {
		var wrapper = tablediv.getElementsByClassName("ft_skilltable_wrapper")[0];
		wrapper.appendChild(skillTable);
	},

	createCustomizeTable : function(properties, doc) {
		var table = doc.createElement("table");
		table.className = "ft_skilltable_customizetable";
		var thead = doc.createElement("thead");
		var tbody = doc.createElement("tbody");
		var headRow = doc.createElement("tr");
		var checkRow = doc.createElement("tr");
		table.appendChild(thead);
		table.appendChild(tbody);
		thead.appendChild(headRow);
		tbody.appendChild(checkRow);
		for (var i = 0; i < properties.length; ++i) {
			if (properties[i].available) {
				var th = doc.createElement("th");

				var fullName = Foxtrickl10n.getString(properties[i].name);
				var abbrName = Foxtrickl10n.getString(properties[i].name + ".abbr");
				var abbr = true;
				if (!abbrName || fullName === abbrName) {
					abbr = false;
				}
				if (abbr) {
					if (properties[i].img) {
						var img = doc.createElement("img");
						img.setAttribute("src", properties[i].img);
						img.setAttribute("alt", abbrName);
						img.setAttribute("title", fullName);
						th.appendChild(img);
					}
					else {
						var abbr = doc.createElement("abbr");
						abbr.setAttribute("title", fullName);
						abbr.appendChild(doc.createTextNode(abbrName));
						th.appendChild(abbr);
					}
				}
				else {
					if (properties[i].img) {
						var img = doc.createElement("img");
						img.setAttribute("src", properties[i].img);
						img.setAttribute("alt", fullName);
						img.setAttribute("title", fullName);
					}
					else {
						th.appendChild(doc.createTextNode(fullName));
					}
				}
				var td = doc.createElement("td");
				var check = doc.createElement("input");
				check.id = properties[i].name;
				check.setAttribute("type", "checkbox");
				if (properties[i].enabled) {
					check.setAttribute("checked", "checked");
				}
				td.appendChild(check);
				headRow.appendChild(th);
				checkRow.appendChild(td);
			}
		}
		return table;
	},

	getColumnEnabled : function(fullType, name) {
		return FoxtrickPrefs.getBool("module.SkillTable." + fullType.type + "." + fullType.subtype + "." + name);
	},

	setColumnEnabled : function(fullType, name, enabled) {
		FoxtrickPrefs.setBool("module.SkillTable." + fullType.type + "." + fullType.subtype + "." + name, enabled);
	},

	copyTable : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var table = doc.getElementsByClassName("ft_skilltable")[0];
			Foxtrick.copyStringToClipboard(FoxtrickSkillTable.toHtMl(table));
			if (FoxtrickPrefs.getBool( "copyfeedback" ))
				Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.skilltablecopied"));
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	toHtMl : function(table) {
		try {
			var ret = "[table]";
			for (var rowIndex = 0; rowIndex < table.rows.length; ++rowIndex) {
				var row = table.rows[rowIndex];
				ret += "[tr]";
				for (var cellIndex = 0; cellIndex < row.cells.length; ++cellIndex) {
					var cell = row.cells[cellIndex];
					var tagName = cell.tagName.toLowerCase();
					ret += "[" + tagName + "]" + this._getCell(cell) + "[/" + tagName +"]";
				}
				ret += "[/tr]";
			}
			ret += "[/table]";
			return ret;
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	_getCell : function(cell) {
		var imgs = cell.getElementsByTagName("img");
		var content = imgs.length ? imgs[0].getAttribute("alt") : cell.textContent;
		var maxed = Foxtrick.hasClass(cell, "maxed");
		if (maxed) {
			content = "[b]" + content + "[/b]";
		}
		return Foxtrick.trim(content);
	}
}
