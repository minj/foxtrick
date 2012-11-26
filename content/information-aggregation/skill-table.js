"use strict";
/**
 * skill-table.js
 * Show a skill table on players list page
 * @authors: convincedd, ryanli
 */

Foxtrick.modules["SkillTable"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["players", "oldCoaches", "youthPlayers", "transferSearchResult"],
	OPTIONS : ["OtherTeams", "ColouredYouth"],
	CSS : Foxtrick.InternalPath + "resources/css/skilltable.css",

	run : function(doc) { 
		// returns full type of the document in this format:
		// { type : ["senior"|"youth"|"transfer"], subtype : ["own"|"others"|"nt"|"oldiesCoach"] }
		var getFullType = function() {
			var fullType = { type : "", subtype : "" };

			if (Foxtrick.Pages.TransferSearchResults.isTransferSearchResultsPage(doc)) {
				fullType.type = "transfer";
				return fullType;
			}

			var isOwn = Foxtrick.Pages.Players.isOwnPlayersPage(doc);

			if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc) || Foxtrick.Pages.Players.isCoachesPage(doc)) {
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
		};
		var fullTypeToString = function(fullType) {
			if (fullType.subtype) {
				return fullType.type + "." + fullType.subtype;
			}
			return fullType.type;
		};
		var getColumnEnabled = function(fullType, name) {
			return FoxtrickPrefs.getBool("module.SkillTable." + fullTypeToString(fullType) + "." + name);
		};
		var setColumnEnabled = function(fullType, name, enabled) {
			FoxtrickPrefs.setBool("module.SkillTable." + fullTypeToString(fullType) + "." + name, enabled);
		};
		var showTable = function(playerList) {
			try { 
				// clear old table and loading note
				var old_table = doc.getElementById('ft_skilltable');
				if (old_table)
					old_table.parentNode.removeChild(old_table);
				var old_notes = doc.getElementsByClassName('ft_skilltable_wrapper')[0].getElementsByClassName('ft-note')[0];
				if (old_notes)
					old_notes.parentNode.removeChild(old_notes);
				
				var fullType = getFullType(doc);
				var allPlayerInfo, pid;
				var i, j;
				// first determine lastMatchday
				if (fullType.type != "transfer"
					&& fullType.subtype != "nt"
					&& fullType.subtype != "oldiesCoach") {
					
					var getLastMatchDates = function (PlayerInfo) {
						pid = Foxtrick.Pages.Players.getPlayerId(PlayerInfo);
						var as = PlayerInfo.getElementsByTagName("a");
						for (j = 0; j < as.length; ++j) {
							if (as[j].href.search(/matchid/i) != -1) {
								return Foxtrick.util.time.getDateFromText(as[j].textContent).getTime();
							}
						}
						return 0;
					};
					
					allPlayerInfo = doc.getElementsByClassName("playerInfo");
					// (assumes that if there are less then 7 players at a match date that is was a transfer and disregards those)
					var dates = Foxtrick.Pages.Players.getLastMatchDates(allPlayerInfo, getLastMatchDates, 7);
					
					var lastMatchDate = dates.lastMatchDate;
					var secondLastMatchDate = dates.secondLastMatchDate;
				}

				if (fullType.type == "transfer") {
					allPlayerInfo = doc.getElementsByClassName("transferPlayerInfo");
					for (i = 0; i < allPlayerInfo.length; ++i) {
						pid = Foxtrick.Pages.Players.getPlayerId(allPlayerInfo[i]);
						var divs = allPlayerInfo[i].getElementsByTagName('div');
						var psicoTSIs = allPlayerInfo[i].textContent.match(/\[[^\[]+=[^\[]+\]=(\d+\.\d+)/g);
						if (psicoTSIs && psicoTSIs.length>0) {
							// second last is average form
							var psicoTSI = psicoTSIs[psicoTSIs.length-2].match(/\d+\.\d+/g);
							Foxtrick.map(function(n) {if (n.id==pid) n.psicoTSI = psicoTSI; }, playerList);
						}
					}
				}
				// functions used to attach data to table cell
				var category = function(cell, cat) {
					var categories = ["GK", "WB", "CD", "W", "IM", "FW", "S", "R", "E1", "E2"];
					cell.appendChild(doc.createTextNode(Foxtrickl10n.getString("categories." + categories[cat - 1])));
					cell.setAttribute("index", cat);
				}
				var link = function(cell, link) {
					cell.appendChild(link.cloneNode(true));
				};
				var nationality = function(cell, countryId) {
					var flag = Foxtrick.util.id.createFlagFromCountryId(doc, countryId);
					if (flag) {
						cell.appendChild(flag);
						// League name is a -> img.title
						cell.setAttribute("index", flag.firstChild.title);
					}
				};
				var playerName = function(cell, player) {
					cell.appendChild(player.nameLink.cloneNode(true));
					var extras = "";
					if (player.nationalTeamId) {
						extras = " (NT";
						if (player.trainerData) {
							extras += ", " + Foxtrickl10n.getString("Coach");
						}
						extras += ")";
					}
					else if (player.trainerData) {
						extras = " (" + Foxtrickl10n.getString("Coach") + ")";
					}
					if (extras !== "") {
						cell.appendChild(doc.createTextNode(extras));
					}
				};
				var age = function(cell, age) {
					cell.setAttribute('class','align-left');
					cell.appendChild(doc.createTextNode(age.years + "." + age.days));
					cell.setAttribute("index", age.years * 112 + age.days);
				};
				var status = function(cell, player) {
					var index = 0;
					if (player.yellowCard) {
						if (player.yellowCard === 1) {
							var img = doc.createElement("img");
							img.src = "/Img/Icons/yellow_card.gif";
							img.alt = Foxtrickl10n.getString("Yellow_card.abbr") + "×1";
							img.title = Foxtrickl10n.getString("Yellow_card") + "×1";
							cell.appendChild(img);
						}
						else if (player.yellowCard === 2) {
							var img = doc.createElement("img");
							img.src = "/Img/Icons/dual_yellow_card.gif";
							img.alt = Foxtrickl10n.getString("Yellow_card.abbr") + "×2";
							img.title = Foxtrickl10n.getString("Yellow_card") + "×2";
							cell.appendChild(img);
						}
						index += 10 * player.yellowCard;
					}
					if (player.redCard) {
						var img = doc.createElement("img");
						img.src = "/Img/Icons/red_card.gif";
						img.alt = Foxtrickl10n.getString("Red_card.abbr");
						img.title = Foxtrickl10n.getString("Red_card");
						cell.appendChild(img);
						index += 30;
					}
					if (player.bruised) {
						var img = doc.createElement("img");
						img.src = "/Img/Icons/bruised.gif";
						img.alt = Foxtrickl10n.getString("Bruised.abbr");
						img.title = Foxtrickl10n.getString("Bruised");
						cell.appendChild(img);
						index += 50;
					} else if (player.injuredWeeks || player.injured) {
						var img = doc.createElement("img");
						img.src = "/Img/Icons/injured.gif";
						img.alt = Foxtrickl10n.getString("Injured.abbr");
						img.title = Foxtrickl10n.getString("Injured");
						cell.appendChild(img);
						// player.injured is number from players page,
						// or boolean from transfer result page.
						if (typeof(player.injuredWeeks) == "number") {
							cell.appendChild(doc.createTextNode(player.injuredWeeks));
							index += player.injuredWeeks * 100;
						}
						else {
							index += 100;
						}
					}
					if (player.transferListed) {
						var img = doc.createElement("img");
						img.src = "/Img/Icons/dollar.gif";
						img.alt = Foxtrickl10n.getString("TransferListed.abbr");
						img.title = Foxtrickl10n.getString("TransferListed");
						cell.appendChild(img);
						index += 1;
					}
					Foxtrick.addClass(cell, "status");
					cell.setAttribute("index", index);
				};
				var skill = function(cell, skill, property) {
					if (typeof(skill) === "object") {
						// in youth team, returned skill is an object

						// First we sort by the max of current and max skill,
						// (multiplied by 10 since maximum is 9 for youth players)
						// then only the current skill, finally whether it's maxed
						cell.setAttribute("index", Math.max(skill.current, skill.max) * 10 + skill.current + !skill.maxed);
						if (skill.maxed) {
							cell.className = "maxed";
						}
						if (skill.current !== 0 || skill.max !== 0) {
							var current = skill.current || "-";
							var max = skill.max || "-";
							cell.appendChild(doc.createTextNode(current + "/" + max));
							// and we deal with colours
							if (FoxtrickPrefs.isModuleOptionEnabled("SkillTable", "ColouredYouth")) {
								if (skill.max > 3) {
									// normalized values for convenience in further calculations
									var skillBase = {}; // skills below 4 are not regarded as interesting
									skillBase.max = skill.max>3 ? skill.max-3 : 0;
									skillBase.current = skill.current>3 ? skill.current-3 : 0;

									// calculate color for capability of improvement
									var r = 0;
									if (skillBase.max > skillBase.current)
										r = ((skillBase.max - skillBase.current) / skillBase.max)*255+51;
									var g = 255;
									var b = 0;

									// apply alpha, indicating max skill
									var a = 1 - skillBase.max / 5; // assuming max skill will never exceed 8...
									a = (a < 0) ? 0 : a; //... but just to be sure
									if (a != 1) {
										r = Math.round(r+(255-r)*a);
										g = Math.round(g+(255-g)*a);
										b = Math.round(b+(255-b)*a);
									}
									cell.style.backgroundColor='rgb('+r+','+g+','+b+')';
								}
								else if (skill.max != 0) {
									// display unimportant skills/low capabilities in gray
									cell.style.backgroundColor = "rgb(204,204,204)";
									cell.style.color = "rgb(102,102,102)";
								}
							}
						}
					}
					else {
						cell.appendChild(doc.createTextNode(skill));
						var lang = FoxtrickPrefs.getString("htLanguage");
						if (property != "agreeability" &&
							property != "aggressiveness" &&
							property != "honesty") {
								property = "levels";
						}
						var path = "language/" +property+ "/level[@value=\"" +skill + "\"]";
						cell.title = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "text");
					}
				};
				var speciality = function(cell, spec) {
					var shortSpec = Foxtrickl10n.getShortSpeciality(spec);
					var abbr = doc.createElement("abbr");
					abbr.appendChild(doc.createTextNode(shortSpec));
					abbr.title = spec;
					cell.appendChild(abbr);
					cell.setAttribute("index", spec);
				};
				var lastMatch = function(cell, last) {
					if (last) {
						var matchDay = Foxtrick.util.time.getDateFromText(last.textContent).getTime();
						cell.appendChild(last);
						cell.setAttribute("index", matchDay);
						if (matchDay == lastMatchDate) {
							Foxtrick.addClass(cell, "latest-match");
							cell.parentNode.setAttribute('played-latest', true);
						}
						else if (matchDay == secondLastMatchDate) {
							Foxtrick.addClass(cell, "second-latest-match");
							cell.parentNode.setAttribute('not-played-latest', true);
						}
						else
							cell.parentNode.setAttribute('not-played-latest', true);

					}
					else {
						cell.setAttribute("index", 0);
					}
				};
				var position = function(cell, pos) {
					var shortPos = Foxtrickl10n.getShortPosition(pos);
					var abbr = doc.createElement("abbr");
					abbr.appendChild(doc.createTextNode(shortPos));
					abbr.title = pos;
					cell.appendChild(abbr);
					cell.setAttribute("index", pos);
				};
				var league = function(cell, leagueId) {
					var link = doc.createElement("a");
					link.href = "/World/Leagues/League.aspx?LeagueID=" + leagueId;
					link.textContent = Foxtrick.XMLData.League[leagueId].LeagueName;
					cell.appendChild(link);
				};
				var dateText = function(cell, deadline) {
					var dateObj = Foxtrick.util.time.getDateFromText(deadline, "yyyymmdd");
					var htDate = Foxtrick.util.time.getHtDate(doc);
					var joined_s = Math.floor((htDate.getTime() - dateObj.getTime()) / 1000); //Sec
					var JoinedSpan = Foxtrick.util.time.timeDifferenceToElement (doc, joined_s , true, false);
					cell.appendChild(JoinedSpan);
					cell.title = deadline;
					cell.setAttribute('class','align-left');
					cell.setAttribute("index",joined_s);
				};
				var dateCell = function(cell, deadline) { 
					deadline.setAttribute("index", Foxtrick.util.time.getDateFromText(deadline.textContent).getTime());
					cell.parentNode.replaceChild(deadline, cell);
				};
				var formatNum = function(cell, num) {
					cell.className = "formatted-num";
					cell.textContent = Foxtrick.formatNumber(num, "\u00a0");
					cell.setAttribute("index", num);
				};
				var object = function(cell, val) {
					if (val) 
						cell.appendChild(playerList[i][columns[j].property]);
				};
				var date = function(cell, val) {
					cell.textContent = val;
					cell.setAttribute("date", "true");
				}
					
				// columns used for table information
				// name: name of the column, used for fetching l10nized string
				// property: value used to retrieve data from Foxtrick.Pages.Players.getPlayerList()
				// method: which function to use in order to attach data to cell, should be a
				//   function with two arguments, first is table cell(td), second is
				//   raw data from playerList. If properties is given (multiple column),
				//   then the player is given as date; if property is given instead
				//   (single column), the specified property is given. By default the
				//   data is treated as plain text and appended to the cell.
				// sortAsc: whether to sort the column in ascending order, default is in
				//   descending order.
				// sortString: whether to sort the column with values as string, default is as
				//   numbers. If set to true, sortAsc is always on.
				// alignRight: whether to align the data cells to the right
				// img: images used in table headers as substitution of text

				var columns = [
					{ name : "PlayerNumber", property : "number", sortAsc : true },
					{ name : "PlayerCategory", property : "category", method: category, sortAsc: true },
					{ name : "Nationality", property : "countryId", method : nationality, sortString : true },
					{ name : "Player", properties : ["nameLink", "nationalTeamId", "trainerData"], method : playerName, sortString : true },
					{ name : "Bookmark", property : "bookmarkLink", method : link, sortString : true },
					{ name : "CurrentBid", property : "currentBid", method : formatNum, alignRight : true },
					{ name : "CurrentBidder", property : "currentBidderLink", method : link, sortString : true },
					{ name : "CurrentBidderShort", property : "currentBidderLinkShort", method : link, sortString : true },
					{ name : "Hotlist", property : "hotlistLink", method : link, sortString : true },
					{ name : "Age", property : "age", method : age, sortAsc : true },
					{ name : "JoinedSince", property : "joinedSince", method : dateText},
					{ name : "CanBePromotedIn", property : "canBePromotedIn"},
					{ name : "TSI", property : "tsi", alignRight : true, method : formatNum },
					{ name : "Status", properties : ["yellowCard", "redCard", "bruised", "injuredWeeks", "transferListed"], method : status },
					{ name : "Speciality", property : "speciality", method : speciality, sortString : true },
					{ name : "Leadership", property : "leadership", method : skill },
					{ name : "Experience", property : "experience", method : skill },
					{ name : "Form", property : "form", method : skill },
					{ name : "Stamina", property : "stamina", method : skill },
					{ name : "Loyalty", property : "loyalty", method : skill },
					{ name : "MotherClubBonus", property : "motherClubBonus", method : object, sortString : true },
					{ name : "Keeper", property : "keeper", method: skill },
					{ name : "Defending", property : "defending", method: skill },
					{ name : "Playmaking", property : "playmaking", method: skill },
					{ name : "Winger", property : "winger", method: skill },
					{ name : "Passing", property : "passing", method: skill },
					{ name : "Scoring", property : "scoring", method: skill },
					{ name : "Set_pieces", property : "setPieces", method: skill },
					{ name : "PsicoTSI", property : "psicoTSI", alignRight : true, method: formatNum, title:'psicoTitle' },
					{ name : "HTMS_Ability", property : "htmsAbility" },
					{ name : "HTMS_Potential", property : "htmsPotential" },
					{ name : "Agreeability", property : "agreeability", method: skill },
					{ name : "Aggressiveness", property : "aggressiveness", method: skill },
					{ name : "Honesty", property : "honesty", method: skill },
					{ name : "Last_match", property : "lastMatch", method : lastMatch },
					{ name : "Last_stars", property : "lastRating", img : "/Img/Matches/star_yellow_to_brown.png" },
					{ name : "Last_stars_EndOfGame", property : "lastRatingEndOfGame", img : "/Img/Matches/star_yellow.png" },
					{ name : "Last_stars_decline", property : "lastRatingDecline", img : "/Img/Matches/star_brown.png" },
					{ name : "Last_position", property : "lastPosition", method : position, sortString : true },
					{ name : "Salary", property : "salary", alignRight : true, method : formatNum },
					{ name : "NrOfMatches", property : "matchCount" },
					{ name : "LeagueGoals", property : "leagueGoals" },
					{ name : "CupGoals", property : "cupGoals" },
					{ name : "FriendliesGoals", property : "friendliesGoals" },
					{ name : "CareerGoals", property : "careerGoals" },
					{ name : "Hattricks", property : "hattricks" },
					{ name : "Deadline", property : "deadline", method : dateCell },
					{ name : "Current_club", property : "currentClubLink", method : link, sortString : true },
					{ name : "Current_league", property : "currentLeagueId", method: league, sortString : true },
					{ name : "TransferCompare", property : "transferCompare", method : link},
					{ name : "OwnerNotes", property : "OwnerNotes"}
				];

				for (j = 0; j < columns.length; ++j) {
					columns[j].available = false;
					if (columns[j].properties) {
						var pIndex;
						for (pIndex in columns[j].properties) {
							if (Foxtrick.Pages.Players.isPropertyInList(playerList, columns[j].properties[pIndex])) {
								columns[j].available = true;
								columns[j].enabled = getColumnEnabled(fullType, columns[j].name);
								break;
							}
						}
					}
					else if (columns[j].property) {
						if (Foxtrick.Pages.Players.isPropertyInList(playerList, columns[j].property)) {
							columns[j].available = true;
							columns[j].enabled = getColumnEnabled(fullType, columns[j].name);
						}
					}
				}

				var createCustomizeTable = function(properties) {
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
					for (i = 0; i < properties.length; ++i) {
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
				};

				var oldcustomizeTable = doc.getElementsByClassName("ft_skilltable_customizetable")[0];
				if (oldcustomizeTable) oldcustomizeTable.parentNode.removeChild(oldcustomizeTable);
				var customizeTable = createCustomizeTable(columns);
				Foxtrick.addClass(customizeTable, "hidden");

				var table = doc.createElement("table");
				table.id = "ft_skilltable";
				table.className = "ft_skilltable";

				var thead = doc.createElement("thead");
				var tr = doc.createElement("tr");
				thead.appendChild(tr);
				table.appendChild(thead);
				var sortClick = function(ev) {
					var modifierPressed = ev.ctrlKey;
					try {
						var head = ev.currentTarget;

						var table = doc.getElementById("ft_skilltable");
						// determine sort direction
						var lastSortIndex = table.getAttribute("lastSortIndex");
						var sortIndex = Foxtrick.getChildIndex(head);
						var sortAsc = head.hasAttribute("sort-asc");
						if (sortIndex == lastSortIndex) {
							if (sortAsc) head.removeAttribute("sort-asc");
							else head.setAttribute("sort-asc","true");
							sortAsc = !Boolean(sortAsc);
						}
						if(!modifierPressed)
							table.setAttribute('lastSortIndex', sortIndex);

						var sortString = head.hasAttribute("sort-string");

						var rows = [];

						var getSortByIndex = function(index){
							var res = Foxtrick.any(function(n) {
								return n.cells[index].hasAttribute("index");
							}, table.rows);
							return res;
						}
						var sortByIndex = getSortByIndex(sortIndex);

						for (i = 1; i < table.rows.length; ++i)
							rows.push(table.rows[i].cloneNode(true));

						/* sortCompare
							sortClick() will first check whether every cell in that column has the
							attribute `index'. If so, they will be ordered with that attribute as
							key. Otherwise, we use their textContent.
						*/
						var sortCompare = function(a, b) {
							var doSort = function(aa, bb){
								var aContent, bContent;
								var lastSort = Number(aa.getAttribute('lastSort'))-Number(bb.getAttribute('lastSort'));
								
								if (sortByIndex) {
									aContent = aa.cells[sortIndex].getAttribute("index");
									bContent = bb.cells[sortIndex].getAttribute("index");
								}
								else {
									aContent = aa.cells[sortIndex].textContent;
									bContent = bb.cells[sortIndex].textContent;
								}
								
								if (aContent === bContent) {
									return 0;
								}
								// place empty cells at the bottom
								if (aContent === "" || aContent === null || aContent === undefined) {
									return 1;
								}
								if (bContent === "" || bContent === null || bContent === undefined) {
									return -1;
								}
								if (sortString) {
									// always sort by ascending order
									// why? This works perfectly, doesn't it?
									var res = aContent.localeCompare(bContent)
									if (sortAsc)
										res = bContent.localeCompare(aContent);
									
									return res;
								}
								else {
									aContent = parseFloat(aContent);
									bContent = parseFloat(bContent);
									aContent = isNaN(aContent) ? lastSort : aContent;
									bContent = isNaN(bContent) ? lastSort : bContent;
									if (aContent === bContent) {
										return 0;
									}
									if (sortAsc) {
										return (aContent - bContent);
									}
									else {
										return bContent - aContent;
									}
								}
							}

							var getSortStringByIndex = function(n) {
								var table = doc.getElementById("ft_skilltable");
								var head = table.rows[0].cells[n];
								return head.hasAttribute("sort-string");
							}

							if(modifierPressed){
								var tmp_sortIndex = sortIndex;
								var tmp_sortString = sortString;
								var tmp_sortByIndex = sortByIndex;
								sortString = getSortStringByIndex(lastSortIndex);
								sortIndex = lastSortIndex;
								sortByIndex = getSortByIndex(lastSortIndex);
								var result = doSort(a,b);
								sortByIndex = tmp_sortByIndex;
								sortIndex = tmp_sortIndex;
								sortString = tmp_sortString;
								if(result === 0){
									var sortResult = doSort(a,b);
									return sortResult;
								} else {
									return result;
								}
							}
							else{
								return doSort(a,b);
							}
						};

						rows.sort(sortCompare);

						for (i = 0; i < rows.length; ++i) {
							rows[i].setAttribute('lastSort',i);
							table.rows[i+1].parentNode.replaceChild(rows[i], table.rows[i+1]);
						}
					}
					catch (e) {
						Foxtrick.log(e);
					}
					finally {
						if (ev)
							ev.stopPropagation();
					}
					Foxtrick.log.flush(doc);
				};
				for (j = 0; j < columns.length; j++) {
					if (columns[j].enabled) {
						var th = doc.createElement("th");
						if (columns[j].sortString) {
							th.setAttribute("sort-string", true);
						}
						if (columns[j].sortAsc) {
							th.setAttribute("sort-asc", true);
						}
						Foxtrick.onClick(th, sortClick);

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

				for (var i=0; i<playerList.length; ++i) {
					var row = doc.createElement("tr");
					
					// set row attributes for filter module
					row.setAttribute('playerid', playerList[i].id);
					if (playerList[i].hidden) Foxtrick.addClass(row,'hidden');
					if (playerList[i].currentSquad) row.setAttribute('currentsquad', playerList[i].currentSquad);
					if (playerList[i].currentClubLink) row.setAttribute('currentclub', playerList[i].currentClubLink.href.match(/\/Club\/\?TeamID=(\d+)/i)[1]);
					if (playerList[i].injured) row.setAttribute('injured', playerList[i].injured);
					if (playerList[i].cards) row.setAttribute('cards', playerList[i].cards);
					if (playerList[i].transferListed) row.setAttribute('transfer-listed', 'true');
					else row.setAttribute('not-transfer-listed', 'true');
					if (playerList[i].speciality) row.setAttribute('speciality-'+Foxtrickl10n.getEnglishSpeciality(playerList[i].speciality),true);
					if (playerList[i].active) row.setAttribute('active', playerList[i].active);
					if (playerList[i].motherClubBonus) row.setAttribute("homegrown-player", "true");
					else row.setAttribute("purchased-player", "true");
					
					tbody.appendChild(row);
					
					for (var j = 0; j < columns.length; j++) {
						if (columns[j].enabled) {
							var cell = doc.createElement("td");
							row.appendChild(cell);
							if (columns[j].properties) { 
								if (columns[j].method) {
									columns[j].method(cell, playerList[i]);
								}
								else {
									var pIndex;
									for (pIndex = 0; pIndex < columns[j].properties.length; ++pIndex) {
										cell.appendChild(doc.createTextNode(playerList[i][columns[j].properties[pIndex]]));
										if (pIndex !== columns[j].properties.length) {
											cell.appendChild(doc.createTextNode(", "));
										}
									}
								}
							}
							else if (columns[j].property && playerList[i][columns[j].property] !== undefined) {
								if (columns[j].method) {
									columns[j].method(cell, playerList[i][columns[j].property], columns[j].property);
								}
								else {
									cell.textContent = playerList[i][columns[j].property];
								}
								if (columns[j].title) {
									cell.title = playerList[i][columns[j].title];
								}
							}
							if (columns[j].alignRight) {
								Foxtrick.addClass(cell, "align-right");
							}
						}
					}
				}

				var tablediv = doc.getElementById("ft_skilltablediv");
				var insertCustomizeTable = function(customizeTable) {
					var wrapper = tablediv.getElementsByClassName("ft_skilltable_customizewrapper")[0];
					wrapper.appendChild(customizeTable);
				};

				var insertSkillTable = function(skillTable) {
					var wrapper = tablediv.getElementsByClassName("ft_skilltable_wrapper")[0];
					wrapper.appendChild(skillTable);
				};

				insertCustomizeTable(customizeTable);
				insertSkillTable(table);

				var container = tablediv.getElementsByClassName("ft_skilltable_container")[0];
				if (FoxtrickPrefs.getBool("module.SkillTable.top")) {
					Foxtrick.addClass(container, "on_top");
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};
		var createTable = function(fullType) {
			if (!fullType)
				fullType = getFullType(doc);
			if (fullType.type == "transfer") {
				var playerList = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
				showTable(playerList);
			}
			else {
				var loading = Foxtrick.util.note.createLoading(doc);
				doc.getElementsByClassName("ft_skilltable_wrapper")[0].appendChild(loading);
				try {
					if (Foxtrick.Pages.Players.isOldiesPage(doc) && fullType.type == "oldiesAndOwn") {
						showOldiesAndOwn(doc);
					}
					else {
						Foxtrick.Pages.Players.getPlayerList(doc, function(list) {
							showTable(list);
						});
					}
				} catch(e) {
					Foxtrick.log(e);
					doc.getElementsByClassName("ft_skilltable_wrapper")[0].removeChild(loading);
				}
			}
		};
		var AddHomegrown = function() {
			Foxtrick.toggleClass(doc.getElementById('skilltable_addHomegrownId'), 'hidden');

			var fullType = { type : "oldiesAndOwn"};
			createTable(fullType);
		};
		var showTimeInClub = function() {
			Foxtrick.toggleClass(doc.getElementById('skilltable_showTimeInClubId'), 'hidden');

			var loading = Foxtrick.util.note.createLoading(doc);
			doc.getElementsByClassName("ft_skilltable_wrapper")[0].appendChild(loading);

			var setHomeGrownAndJoinedSinceFromTransfers = function(xml, list) {
				var player_id = xml.getElementsByTagName('PlayerID')[0].textContent;
				var TeamId = xml.getElementsByTagName('TeamId')[0].textContent;
				var Transfers = xml.getElementsByTagName('Transfer');
				if (Transfers.length > 0) {
					var Transfer = Transfers[Transfers.length - 1]; // oldest and first transfer
					var seller =
						Number(Transfer.getElementsByTagName('SellerTeamID')[0].textContent);
					if (seller == TeamId) {
						Foxtrick.map(function(n) {
							if (n.id == player_id) {
								n.motherClubBonus = doc.createElement('span');
								n.motherClubBonus.textContent = '*';
								n.motherClubBonus.title = Foxtrickl10n
									.getString('skilltable.rebought_youthplayer');
							}
						}, list);
					}


					var Transfer = Transfers[0]; //last transfer
					var buyerId = Number(Transfer.getElementsByTagName('BuyerTeamID')[0]
										 .textContent);
					if (TeamId == buyerId) {
						// legitimate transfer
						var Deadline = Transfer.getElementsByTagName('Deadline')[0].textContent;
						Foxtrick.map(function(n) {
							if (n.id == player_id) n.joinedSince = Deadline;
						}, list);
						return true;
					}
					else {
						// prolly external coach
						// let setJoinedSinceFromPullDate handle it
						return false;
					}
				}
				else
					return false;
			};
			// return false if from own starting squad
			var setJoinedSinceFromPullDate = function(xml, list) {
				// check PlayerEventTypeID==20 -> pulled from YA, 13->pulled from SN, 12->coach
				// posibilities:
				// 1) external coach pulled elsewhere
				// 2) player pulled here (never sold)
				// 3) internal coach pulled here
				// 4) external coach pulled here (is that even possible? let's hope not)*
				// 5) player from starting squad (return false)
				// 6) internal coach from starting squad (return false)
				// 7) external coach from starting squad (is that even possible? let's hope not)*
				// 8) external coach from someone else's starting squad
				// * not taken care off
				var pulled_here = false;
				var pulled_elsewhere = false;
				var is_coach = false;
				var pid = xml.getElementsByTagName('PlayerID')[0].textContent;
				var PlayerEvents = xml.getElementsByTagName('PlayerEvent');
				for (i = 0; i < PlayerEvents.length; ++i) {
					var PlayerEvent = PlayerEvents[i];
					var PlayerEventTypeID = Number(PlayerEvent
					                               .getElementsByTagName('PlayerEventTypeID')[0]
					                               .textContent);
					if (PlayerEventTypeID == 12 && !is_coach) {
						// consider only the last coach contract
						// is a coach
						is_coach = true;
						var coachDate =
							PlayerEvent.getElementsByTagName('EventDate')[0].textContent;
						Foxtrick.map(function(n) {
							if (n.id == pid) n.joinedSince = coachDate;
						}, list);
					}
					if (PlayerEventTypeID == 20 || PlayerEventTypeID == 13) {
						// check to see if pulled from this team
						if (PlayerEvent.getElementsByTagName('EventText')[0]
							.textContent.match(Foxtrick.util.id
											   .getTeamIdFromUrl(doc.location.href))) {
							// cases 2) & 3) -> pullDate
							pulled_here = true;
							var PullDate = PlayerEvent.getElementsByTagName('EventDate')[0]
								.textContent;
							Foxtrick.map(function(n) {
								if (n.id == pid) {
									n.joinedSince = PullDate;
								}
							}, list);
							// pull is a last-ish and most important event
							// we can safely return
							return true;
						}
						else
							pulled_elsewhere = true;
					}
				}
				// pulled_here already dealt with above
				// it's either pulled elsewhere which is 1): should have event 12 -> coachDate
				// or starting in other team 8): motherClubBonus is undefined -> also coachDate
				// or starting in own team  5) & 6): return false -> activationDate
				var hasMCBonus = true;
				Foxtrick.map(function(n) {
					if (n.id == pid && typeof(n.motherClubBonus) == 'undefined') {
						hasMCBonus = false;
					}
				}, list);
				return pulled_elsewhere || !hasMCBonus;
			};

			// first get teams activation date. we'll need it later
			var TeamId = Foxtrick.Pages.All.getTeamId(doc);
			var args = [ ["TeamId", TeamId], ["file", "teamdetails"]];
			Foxtrick.util.api.retrieve(doc, args, {cache_lifetime:'session' }, function(xml, errorText) {
				if (xml) {
					var activationDate = xml.getElementsByTagName("ActivationDate")[0].textContent;
					Foxtrick.Pages.Players.getPlayerList(doc, function (list) {
						// first we check transfers
						var argsTransfersPlayer = [];
						Foxtrick.map(function(player) {
							argsTransfersPlayer.push([ ["playerid", player.id], ["file", "transfersPlayer"] ]);
						}, list);
						Foxtrick.util.api.batchRetrieve(doc, argsTransfersPlayer, {cache_lifetime:'session' }, function(xmls) {
							var argsPlayerevents = [], i;
							for (i=0; i<xmls.length; ++i) {
								if (xmls[i]) {
									// if there is a transfer, we are finished with this player
									var hasTransfers = setHomeGrownAndJoinedSinceFromTransfers(xmls[i], list);
									if ( !hasTransfers ) {
										// so, he's from home. need to get pull date from playerevents below
										var pid = xmls[i].getElementsByTagName("PlayerID")[0].textContent;
										argsPlayerevents.push([ ["playerid", pid], ["file", "playerevents"] ]);
									}
								}
							}
							// try set joined date from pull date
							Foxtrick.util.api.batchRetrieve(doc, argsPlayerevents, {cache_lifetime:'session' }, function(xmls) {
								for (i=0; i<xmls.length; ++i) {
									if (xmls[i]) {
										var was_pulled = setJoinedSinceFromPullDate(xmls[i], list);
										if ( !was_pulled ) { 
											// no pull date = from starting squad. JoinedSince=activationDate
											var pid = xmls[i].getElementsByTagName("PlayerID")[0].textContent;
											Foxtrick.map(function(n) {if (n.id==pid) n.joinedSince = activationDate;}, list);
										}
									}
								}
							
								// finished. now display results
								Foxtrick.preventChange(doc, showTable)(list);
							});
						});
					});
				}
				else {
					loading.parentNode.removeChild(loading);
					if (status==503) {
						var note = Foxtrick.util.note.create(doc, Foxtrickl10n.getString("api.serverUnavailable"));
						doc.getElementsByClassName("ft_skilltable_wrapper")[0].appendChild(note);
					}
					else {
						var note = Foxtrick.util.note.create(doc, Foxtrickl10n.getString("error"));
						doc.getElementsByClassName("ft_skilltable_wrapper")[0].appendChild(note);
					}
				}
			});
		};
		var showOldiesAndOwn = function(doc) {
			// get normal oldies into oldies_list
			Foxtrick.Pages.Players.getPlayerList(doc, function(oldies_list) {
				// then get current squad (last parameter true) into current_squad_list
				Foxtrick.Pages.Players.getPlayerList(doc, function(current_squad_list) {
					var argsTransfersPlayer = [];
					Foxtrick.map(function(player) {
						argsTransfersPlayer.push([ ["playerid", player.id], ["file", "transfersPlayer"] ]);
					}, current_squad_list);
					Foxtrick.util.api.batchRetrieve(doc, argsTransfersPlayer, {cache_lifetime:'session' }, function(xmls) {
						// filter, concat with oldies and display
						current_squad_list = Foxtrick.filter(function(n) {return n.motherClubBonus;}, current_squad_list);
						var full_list = oldies_list.concat(current_squad_list);
						Foxtrick.preventChange(doc, showTable)(full_list);
					});
				}, {current_squad : 'true'} );
			});
		};
		var addTableDiv = function() {
			var tablediv = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.SkillTable, "div");
			tablediv.id = "ft_skilltablediv";
			tablediv.className = "ft_skilltablediv";
			if (Foxtrick.Pages.TransferSearchResults.isTransferSearchResultsPage(doc)) {
				Foxtrick.addClass(tablediv, "transfer");
			}

			var tableCreated = false;

			// table div head
			var h2 = doc.createElement("h2");
			h2.className = "ft-expander-unexpanded";
			h2.appendChild(doc.createTextNode(Foxtrickl10n.getString("SkillTable.header")));
			var toggleDisplay = function() {
				try {
					if (!tableCreated) {
						tableCreated = true;
						createTable();
					}

					Foxtrick.toggleClass(h2, "ft-expander-expanded");
					Foxtrick.toggleClass(h2, "ft-expander-unexpanded");
					var show = Foxtrick.hasClass(h2, "ft-expander-expanded");

					var customizeTable = tablediv.getElementsByClassName("ft_skilltable_customizetable")[0];
					if (show) {
						// show the objects
						Foxtrick.removeClass(links, "hidden");
						Foxtrick.removeClass(container, "hidden");
					}
					else {
						// hide the objects
						Foxtrick.removeClass(links, "customizing");
						Foxtrick.addClass(links, "hidden");
						Foxtrick.addClass(customizeTable, "hidden");
						Foxtrick.addClass(container, "hidden");
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			};
			Foxtrick.onClick(h2, toggleDisplay);
			tablediv.appendChild(h2);

			// links
			var links = doc.createElement("div");
			links.className = "ft_skilltable_links";
			Foxtrick.addClass(links, "hidden");
			// links: copy
			var copy = doc.createElement("a");
			copy.className = "customize_item secondary";
			copy.appendChild(doc.createTextNode(Foxtrickl10n.getString("button.copy")));
			copy.setAttribute("title", Foxtrickl10n.getString("copy.skilltable.title"));
			Foxtrick.onClick(copy, function() {
					/* get the text content in a node and return it.
					 * for player links, append the [playerid] HT-ML tag
					 * for images, return its alt attribute
					 */
					var getNode = function(node) {
						var youthPlayerRe = new RegExp("YouthPlayerID=(\\d+)", "i");
						var playerRe = new RegExp("PlayerID=(\\d+)", "i");
						if (node.nodeName.toLowerCase() == "a" && node.href.search(youthPlayerRe) != -1) {
							var ret = node.textContent;
							ret += " [youthplayerid=";
							ret += node.href.match(youthPlayerRe)[1];
							ret += "]";
							return ret;
						}
						else if (node.nodeName.toLowerCase() == "a" && node.href.search(playerRe) != -1) {
							var ret = node.textContent;
							ret += " [playerid=";
							ret += node.href.match(playerRe)[1];
							ret += "]";
							return ret;
						}
						else if (node.hasChildNodes()) {
							var children = node.childNodes;
							var ret = "";
							var i;
							for (i = 0; i < children.length; ++i) {
								// recursively get the content of child nodes
								ret += getNode(children[i]) + " ";
							}
							return Foxtrick.trim(ret);
						}
						else {
							if (node.nodeName.toLowerCase() == "img") {
								return node.getAttribute("alt");
							}
							else {
								return node.textContent;
							}
						}
					};
					var toHtMl = function(table) {
						var ret = "[table]\n";
						var rowIndex;
						for (rowIndex = 0; rowIndex < table.rows.length; ++rowIndex) {
							var row = table.rows[rowIndex];
							if (Foxtrick.hasClass(row, 'hidden'))
								continue;
							ret += "[tr]";
							var cellIndex;
							for (cellIndex = 0; cellIndex < row.cells.length; ++cellIndex) {
								var cell = row.cells[cellIndex];
								var cellName = cell.tagName.toLowerCase();
								var cellContent = getNode(cell);
								if (Foxtrick.hasClass(cell, "maxed")) {
									cellContent = "[b]" + getNode(cell) + "[/b]";
								}
								else if (Foxtrick.hasClass(cell, "formatted-num")){
									cellContent = Foxtrick.trimnum(getNode(cell));
								}
								ret += "[" + cellName + "]" + cellContent + "[/" + cellName +"]";
							}
							ret += "[/tr]\n";
						}
						ret += "[/table]";
						return ret;
					};
					var table = doc.getElementsByClassName("ft_skilltable")[0];
					Foxtrick.copyStringToClipboard(toHtMl(table));

					var note = Foxtrick.util.note.add(doc, table, "ft-skilltable-copy-note", Foxtrickl10n.getString("copy.skilltable.copied"), null, true);
				});
			// links: customize
			var customize = doc.createElement("a");
			customize.className = "customize_item";
			customize.appendChild(doc.createTextNode(Foxtrickl10n.getString("button.customize")));
			Foxtrick.onClick(customize, function() {
					var links = doc.getElementsByClassName("ft_skilltable_links")[0];
					Foxtrick.addClass(links, "customizing");

					var customizeTable = doc.getElementsByClassName("ft_skilltable_customizetable")[0];
					Foxtrick.removeClass(customizeTable, "hidden");

					var container = doc.getElementsByClassName("ft_skilltable_container")[0];
					Foxtrick.addClass(container, "hidden");
				});
			// links: save
			var save = doc.createElement("a");
			save.appendChild(doc.createTextNode(Foxtrickl10n.getString("button.save")));
			Foxtrick.onClick(save, function() {
					var fullType = getFullType(doc);

					var tablediv = doc.getElementById("ft_skilltablediv");
					var input = tablediv.getElementsByTagName("input");
					var i;
					for (i = 0; i < input.length; ++i) {
						setColumnEnabled(fullType, input[i].id, input[i].checked);
					}
					doc.location.reload();
				});
			// links: cancel
			var cancel = doc.createElement("a");
			cancel.appendChild(doc.createTextNode(Foxtrickl10n.getString("button.cancel")));
			Foxtrick.onClick(cancel, function() {
					var tablediv = doc.getElementById("ft_skilltablediv");
					var links = tablediv.getElementsByClassName("ft_skilltable_links")[0];
					var customizeTable = tablediv.getElementsByClassName("ft_skilltable_customizetable")[0];
					var container = tablediv.getElementsByClassName("ft_skilltable_container")[0];
					Foxtrick.removeClass(links, "customizing");
					Foxtrick.addClass(customizeTable, "hidden");
					Foxtrick.removeClass(container, "hidden");
				});
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
			Foxtrick.addClass(container, "hidden");
			// table container: switch view
			var switchView = doc.createElement("div");
			var switchViewLink = doc.createElement("a");
			switchViewLink.appendChild(doc.createTextNode(Foxtrickl10n.getString("SkillTable.switchView")));
			switchViewLink.setAttribute("title", Foxtrickl10n.getString("SkillTable.switchView.title"));
			Foxtrick.onClick(switchViewLink, function() {
					var tablediv = doc.getElementById("ft_skilltablediv");
					var container = tablediv.getElementsByClassName("ft_skilltable_container")[0];
					Foxtrick.toggleClass(container, "on_top");

					FoxtrickPrefs.setBool("module.SkillTable.top", Foxtrick.hasClass(container, "on_top"));
				});
			switchView.appendChild(switchViewLink);

			if (Foxtrick.util.api.authorized() ) {
				if (Foxtrick.Pages.Players.isOldiesPage(doc)) {
					var options = doc.createElement("div");
					var addHomegrownLink = doc.createElement("a");
					addHomegrownLink.appendChild(doc.createTextNode(Foxtrickl10n.getString("SkillTable.addHomegrown")));
					addHomegrownLink.setAttribute("title", Foxtrickl10n.getString("SkillTable.addHomegrown.title"));
					addHomegrownLink.setAttribute("id","skilltable_addHomegrownId");
					Foxtrick.onClick(addHomegrownLink, AddHomegrown);
					options.appendChild(addHomegrownLink);

				}
				else if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc)) {
					var options = doc.createElement("div");
					var addHomegrownLink = doc.createElement("a");
					addHomegrownLink.appendChild(doc.createTextNode(Foxtrickl10n.getString("SkillTable.showTimeInClub")));
					addHomegrownLink.setAttribute("title", Foxtrickl10n.getString("SkillTable.showTimeInClub.title"));
					addHomegrownLink.setAttribute("id","skilltable_showTimeInClubId");
					Foxtrick.onClick(addHomegrownLink, showTimeInClub);
					options.appendChild(addHomegrownLink);
				}
			}
			// table container: table wrapper
			var wrapper = doc.createElement("div");
			wrapper.className = "ft_skilltable_wrapper";
			// table container: all children
			container.appendChild(switchView);
			container.appendChild(wrapper);
			if (options) container.appendChild(options);

			tablediv.appendChild(h2);
			tablediv.appendChild(links);
			tablediv.appendChild(customizeWrapper);
			tablediv.appendChild(container);

			// insert tablediv
			if (Foxtrick.Pages.TransferSearchResults.isTransferSearchResultsPage(doc)) {
				// on transfer search page, insert after first separator
				var insertBefore = doc.getElementById("mainBody").getElementsByClassName("borderSeparator")[0].nextSibling;
				insertBefore.parentNode.insertBefore(tablediv, insertBefore);
			}
			else {
				var playerList = doc.getElementsByClassName("playerList")[0];
				if (playerList) {
					// If there is playerList, as there is in youth/senior teams,
					// insert before it. In such cases, there would be category headers
					// for supporters, inserting before the first player would clutter
					// up with the headers. Additionally, inserting before the list
					// would be organized in a better way.
					playerList.parentNode.insertBefore(tablediv, playerList);
				}
				else {
					// otherwise, insert before the first player if there is any
					var firstFace = doc.getElementsByClassName("faceCard")[0];
					if (firstFace) {
						// without playerList, players would have faces shown before
						// playerInfo, if user enabled faces
						firstFace.parentNode.insertBefore(tablediv, firstFace);
					}
					else {
						var firstPlayer = doc.getElementsByClassName("playerInfo")[0];
						if (firstPlayer) {
							// or... users haven't enabled faces
							firstPlayer.parentNode.insertBefore(tablediv, firstPlayer);
						}
					}
				}
			}
			return tablediv;
		};
	
		if (doc.getElementById("ft_skilltablediv"))
			return;

		if ( Foxtrick.isPage("transferSearchResult", doc)
			|| getFullType().subtype != "others"
			|| FoxtrickPrefs.isModuleOptionEnabled("SkillTable", "OtherTeams")) {
			
			addTableDiv();
		}
	},
};
