'use strict';
/**
 * skill-table.js
 * Show a skill table on players list page
 * @author	convincedd, ryanli
 */

Foxtrick.modules['SkillTable'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['allPlayers', 'youthPlayers', 'transferSearchResult'],
	OPTIONS: ['OtherTeams', 'ColouredYouth'],
	CSS: Foxtrick.InternalPath + 'resources/css/skilltable.css',

	run: function(doc) {
		var module = this;
		var DEFAULT_CACHE = { cache_lifetime: 'session' };
		var TABLE_DIV_ID = 'ft_skilltablediv';

		// returns full type of the document in this format:
		// { type: ['senior'|'youth'|'transfer'], subtype: ['own'|'others'|'nt'|'oldiesCoach'] }
		var getFullType = function() {
			var fullType = { type: '', subtype: '' };

			if (Foxtrick.Pages.TransferSearchResults.isPage(doc)) {
				fullType.type = 'transfer';
				return fullType;
			}

			if (Foxtrick.Pages.Players.isSenior(doc)) {
				fullType.type = 'senior';
				if (Foxtrick.Pages.Players.isOwn(doc)) {
					fullType.subtype = 'own';
				}
				else if (Foxtrick.Pages.Players.isNT(doc)) {
					fullType.subtype = 'nt';
				}
				else if (Foxtrick.Pages.Players.isOldies(doc) ||
				         Foxtrick.Pages.Players.isCoaches(doc)) {
					fullType.subtype = 'oldiesCoach';
				}
				else {
					fullType.subtype = 'others';
				}
			}
			else if (Foxtrick.Pages.Players.isYouth(doc)) {
				fullType.type = 'youth';
				if (Foxtrick.isPage(doc, 'ownYouthPlayers')) {
					fullType.subtype = 'own';
				}
				else {
					fullType.subtype = 'others';
				}
			}

			return fullType;
		};
		var fullTypeToString = function(fullType) {
			if (fullType.subtype) {
				return fullType.type + '.' + fullType.subtype;
			}
			return fullType.type;
		};
		var getColumnEnabled = function(fullType, name) {
			var type = fullTypeToString(fullType);
			return Foxtrick.Prefs.getBool('module.SkillTable.' + type + '.' + name);
		};
		var setColumnEnabled = function(fullType, name, enabled) {
			var type = fullTypeToString(fullType);
			Foxtrick.Prefs.setBool('module.SkillTable.' + type + '.' + name, enabled);
		};
		var showTable = function(playerList) {
			// columns used for table information
			// name: name of the column, used for fetching l10n string
			// property: value used to retrieve data from Foxtrick.Pages.Players.getPlayerList()
			// method: which RENDERER function to use in order to attach data to cell,
			//   should be a function with two arguments,
			//   first is table cell(td), second is raw data from playerList.
			//   If properties is given (multiple column),
			//   then the player is given as date; if property is given instead
			//   (single column), the specified property is given. By default the
			//   data is treated as plain text and appended to the cell.
			// sortAsc: whether to sort the column in ascending order, default is in
			//   descending order.
			// sortString: whether to sort the column with values as string, default is as
			//   numbers. If set to true, sortAsc is always on.
			// alignRight: whether to align the data cells to the right
			// img: images used in table headers as substitution of text
			var COLUMNS = [
				{ name: 'PlayerNumber', property: 'number', sortAsc: true },
				{ name: 'PlayerCategory', property: 'category',
					method: 'category', sortAsc: true, },
				{ name: 'Nationality', property: 'countryId',
					method: 'nationality', sortString: true, },
				{ name: 'Player', properties: ['nameLink', 'nationalTeamId', 'trainerData'],
					method: 'playerName', sortString: true, },
				{ name: 'Bookmark', property: 'bookmarkLink', method: 'link',
					sortString: true, },
				{ name: 'CurrentBid', property: 'currentBid',
					method: 'formatNum', alignRight: true, },
				{ name: 'CurrentBidder', property: 'currentBidderLink',
					method: 'link', sortString: true, },
				{ name: 'CurrentBidderShort', property: 'currentBidderLinkShort',
					method: 'link', sortString: true, },
				{ name: 'Hotlist', property: 'hotlistLink',
					method: 'link', sortString: true, },
				{ name: 'Age', property: 'age', method: 'age', sortAsc: true, },
				{ name: 'JoinedSince', property: 'joinedSince', method: 'dateDiff', },
				{ name: 'CanBePromotedIn', property: 'canBePromotedIn', },
				{ name: 'TSI', property: 'tsi', alignRight: true, method: 'formatNum', },
				{ name: 'Status', properties: [
					'yellowCard', 'redCard', 'bruised', 'injuredWeeks', 'transferListed',
				], method: 'status', },
				{ name: 'Speciality', property: 'speciality',
					method: 'speciality', sortString: true, },
				{ name: 'Leadership', property: 'leadership', method: 'skill', },
				{ name: 'Experience', property: 'experience', method: 'skill', },
				{ name: 'Form', property: 'form', method: 'skill', },
				{ name: 'Stamina', property: 'stamina', method: 'skill', },
				{ name: 'StaminaPrediction', property: 'staminaPrediction',
					method: 'staminaPrediction', },
				{ name: 'Loyalty', property: 'loyalty', method: 'skill', },
				{ name: 'MotherClubBonus', property: 'motherClubBonus',
					method: 'object', sortString: true, },
				{ name: 'Keeper', property: 'keeper', method: 'skill', },
				{ name: 'Defending', property: 'defending', method: 'skill', },
				{ name: 'Playmaking', property: 'playmaking', method: 'skill', },
				{ name: 'Winger', property: 'winger', method: 'skill', },
				{ name: 'Passing', property: 'passing', method: 'skill', },
				{ name: 'Scoring', property: 'scoring', method: 'skill', },
				{ name: 'Set_pieces', property: 'setPieces', method: 'skill', },
				{ name: 'PsicoTSI', property: 'psicoTSI', alignRight: true,
					method: 'formatNum', title: 'psicoTitle', },
				{ name: 'HTMS_Ability', property: 'htmsAbility', },
				{ name: 'HTMS_Potential', property: 'htmsPotential', },
				{ name: 'Agreeability', property: 'agreeability', method: 'skill', },
				{ name: 'Aggressiveness', property: 'aggressiveness', method: 'skill', },
				{ name: 'Honesty', property: 'honesty', method: 'skill', },
				{ name: 'Last_match', properties: ['lastMatch', 'lastMatchDate'],
					method: 'lastMatch', },
				{ name: 'Last_stars', property: 'lastRating',
					img: '/Img/Matches/star_yellow.png', },
				{ name: 'Last_position', property: 'lastPosition',
					method: 'position', sortString: true, },
				{ name: 'Salary', property: 'salary', alignRight: true, method: 'formatNum', },
				{ name: 'NrOfMatches', property: 'matchCount', },
				{ name: 'LeagueGoals', property: 'leagueGoals', },
				{ name: 'CupGoals', property: 'cupGoals', },
				{ name: 'FriendliesGoals', property: 'friendliesGoals', },
				{ name: 'CareerGoals', property: 'careerGoals', },
				{ name: 'Hattricks', property: 'hattricks', },
				{ name: 'Deadline', property: 'deadline', method: 'dateCell', },
				{ name: 'Current_club', property: 'currentClubLink',
					method: 'link', sortString: true, },
				{ name: 'Current_league', property: 'currentLeagueId',
					method: 'league', sortString: true, },
				{ name: 'TransferCompare', property: 'transferCompare', method: 'link', },
				{ name: 'PerformanceHistory', property: 'performanceHistory', method: 'link', },
				{ name: 'OwnerNotes', property: 'OwnerNotes', },
				{ name: 'kpPosition', property: 'kp', },
				{ name: 'wbdPosition', property: 'wbd', },
				{ name: 'wbPosition', property: 'wb', },
				{ name: 'wbtmPosition', property: 'wbtm', },
				{ name: 'wboPosition', property: 'wbo', },
				{ name: 'cdPosition', property: 'cd', },
				{ name: 'cdtwPosition', property: 'cdtw', },
				{ name: 'cdoPosition', property: 'cdo', },
				{ name: 'wdPosition', property: 'wd', },
				{ name: 'wPosition', property: 'w', },
				{ name: 'wtmPosition', property: 'wtm', },
				{ name: 'woPosition', property: 'wo', },
				{ name: 'imdPosition', property: 'imd', },
				{ name: 'imPosition', property: 'im', },
				{ name: 'imtwPosition', property: 'imtw', },
				{ name: 'imoPosition', property: 'imo', },
				{ name: 'fwPosition', property: 'fw', },
				{ name: 'fwdPosition', property: 'fwd', },
				{ name: 'fwtwPosition', property: 'fwtw', },
				{ name: 'tdfPosition', property: 'tdf', },
				{ name: 'BestPosition', property: 'bestPosition', sortString: true, },
				{ name: 'BestPositionValue', property: 'bestPositionValue', },
			];

			// functions used to attach data to table cell
			var RENDERERS = {
				category: function(cell, cat) {
					var categories = ['GK', 'WB', 'CD', 'W', 'IM', 'FW', 'S', 'R', 'E1', 'E2'];
					cell.textContent = Foxtrick.L10n.getString('categories.' + categories[cat - 1]);
					cell.setAttribute('index', cat);
				},
				link: function(cell, link) {
					cell.appendChild(link.cloneNode(true));
				},
				nationality: function(cell, countryId) {
					var flag = Foxtrick.util.id.createFlagFromCountryId(doc, countryId);
					if (flag) {
						cell.appendChild(flag);
						// League name is a -> img.title
						cell.setAttribute('index', flag.firstChild.title);
					}
				},
				playerName: function(cell, player) {
					cell.appendChild(player.nameLink.cloneNode(true));
					if (player.nationalTeamId) {
						cell.appendChild(doc.createTextNode(' (NT)'));
					}
					if (player.trainerData) {
						var coach = Foxtrick.L10n.getString('Coach');
						Foxtrick.addImage(doc, cell, {
							alt: coach,
							title: coach,
							src: Foxtrick.InternalPath + 'resources/img/cap.png',
						});
					}
				},
				age: function(cell, age) {
					Foxtrick.addClass(cell, 'align-left');
					cell.textContent = age.years + '.' + age.days;
					cell.setAttribute('index', age.years * 112 + age.days);
				},
				status: function(cell, player) {
					var index = 0;
					var img;
					if (player.yellowCard) {
						if (player.yellowCard === 1) {
							img = doc.createElement('img');
							img.src = '/Img/Icons/yellow_card.gif';
							img.alt = Foxtrick.L10n.getString('Yellow_card.abbr') + '×1';
							img.title = Foxtrick.L10n.getString('Yellow_card') + '×1';
							cell.appendChild(img);
						}
						else if (player.yellowCard === 2) {
							img = doc.createElement('img');
							img.src = '/Img/Icons/dual_yellow_card.gif';
							img.alt = Foxtrick.L10n.getString('Yellow_card.abbr') + '×2';
							img.title = Foxtrick.L10n.getString('Yellow_card') + '×2';
							cell.appendChild(img);
						}
						index += 10 * player.yellowCard;
					}
					else if (player.redCard) {
						img = doc.createElement('img');
						img.src = '/Img/Icons/red_card.gif';
						img.alt = Foxtrick.L10n.getString('Red_card.abbr');
						img.title = Foxtrick.L10n.getString('Red_card');
						cell.appendChild(img);
						index += 30;
					}
					if (player.bruised) {
						img = doc.createElement('img');
						img.src = '/Img/Icons/bruised.gif';
						img.alt = Foxtrick.L10n.getString('Bruised.abbr');
						img.title = Foxtrick.L10n.getString('Bruised');
						cell.appendChild(img);
						index += 50;
					}
					else if (player.injuredWeeks || player.injured) {
						img = doc.createElement('img');
						img.src = '/Img/Icons/injured.gif';
						img.alt = Foxtrick.L10n.getString('Injured.abbr');
						img.title = Foxtrick.L10n.getString('Injured');
						cell.appendChild(img);
						// player.injured is number from players page,
						// or boolean from transfer result page.
						if (typeof player.injuredWeeks === 'number') {
							cell.appendChild(doc.createTextNode(player.injuredWeeks));
							index += player.injuredWeeks * 100;
						}
						else {
							index += 100;
						}
					}
					if (player.transferListed) {
						img = doc.createElement('img');
						img.src = '/Img/Icons/dollar.gif';
						img.alt = Foxtrick.L10n.getString('TransferListed.abbr');
						img.title = Foxtrick.L10n.getString('TransferListed');
						cell.appendChild(img);
						index += 1;
					}
					Foxtrick.addClass(cell, 'status');
					cell.setAttribute('index', index);
				},
				skill: function(cell, skill, property) {
					if (typeof skill === 'object') {
						// in youth team, returned skill is an object

						// First we sort by the max of current and max skill,
						// (multiplied by 10 since maximum is 9 for youth players)
						// then only the current skill, finally whether it's maxed
						var index = Math.max(skill.current, skill.max) * 10 +
							skill.current + !skill.maxed;
						cell.setAttribute('index', index);
						if (skill.maxed) {
							cell.className = 'maxed';
						}
						if (skill.current !== 0 || skill.max !== 0) {
							var current = skill.current || '-';
							var max = skill.max || '-';
							cell.textContent = current + '/' + max;
							// and we deal with colors
							if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'ColouredYouth')) {
								if (skill.max > 3 || skill.current > 3) {
									// normalized values for convenience in further calculations
									var skillBase = {};
									// skills below 4 are not regarded as interesting
									skillBase.current = skill.current > 3 ? skill.current - 3 : 0;
									skillBase.max = skill.max > 3 ? skill.max - 3 :
										skillBase.current; // default to current

									// calculate color for capability of improvement
									var r = 0;
									if (skillBase.max > skillBase.current) {
										var diff = skillBase.max - skillBase.current;
										r = diff / skillBase.max * 255 + 51;
									}
									var g = 255;
									var b = 0;

									// apply alpha, indicating max skill
									var a = 1 - skillBase.max / 5;
									// assuming max skill will never exceed 8...
									a = a < 0 ? 0 : a; // but just to be sure
									if (a != 1) {
										r = Math.round(r + (255 - r) * a);
										g = Math.round(g + (255 - g) * a);
										b = Math.round(b + (255 - b) * a);
									}
									var rgbStr = 'rgb(' + r + ',' + g + ',' + b + ')';
									cell.style.backgroundColor = rgbStr;
								}
								else if (skill.max !== 0) {
									// display unimportant skills/low capabilities in gray
									cell.style.backgroundColor = 'rgb(204,204,204)';
									cell.style.color = 'rgb(102,102,102)';
								}
							}
						}
					}
					else {
						cell.textContent = skill;
						if (property != 'agreeability' &&
						    property != 'aggressiveness' &&
						    property != 'honesty') {
							property = 'levels';
						}
						cell.title = Foxtrick.L10n.getLevelByTypeAndValue(property, skill);
					}
				},
				staminaPrediction: function(cell, pred) {
					if (pred) {
						cell.textContent = pred.value;
						cell.title = Foxtrick.util.time.buildDate(new Date(pred.date));
						cell.setAttribute('index', parseFloat(pred.value));
					}
					else {
						cell.textContent = '–';
						cell.title = Foxtrick.L10n.getString('StaminaPrediction.na');
						cell.setAttribute('index', '0');
					}
				},
				speciality: function(cell, spec) {
					var specIdx = Foxtrick.L10n.getNumberFromSpeciality(spec);
					if (specIdx) {
						var specImageUrl = Foxtrick.getSpecialtyImagePathFromNumber(specIdx);
						Foxtrick.addImage(doc, cell, {
							alt: spec,
							title: spec,
							src: specImageUrl,
						});
					}
					cell.setAttribute('index', spec);
				},
				lastMatch: function(cell, p) {
					var last = p.lastMatch;
					if (last) {
						var matchDay = p.lastMatchDate.getTime();
						cell.appendChild(last);
						cell.setAttribute('index', matchDay);
						if (matchDay == lastMatchDate) {
							Foxtrick.addClass(cell, 'latest-match');
							cell.parentNode.setAttribute('played-latest', true);
						}
						else if (matchDay == secondLastMatchDate) {
							Foxtrick.addClass(cell, 'second-latest-match');
							cell.parentNode.setAttribute('not-played-latest', true);
						}
						else {
							cell.parentNode.setAttribute('not-played-latest', true);
						}
					}
					else {
						cell.setAttribute('index', 0);
					}
				},
				position: function(cell, pos) {
					var shortPos = Foxtrick.L10n.getShortPosition(pos);
					var abbr = doc.createElement('abbr');
					abbr.textContent = shortPos;
					abbr.title = pos;
					cell.appendChild(abbr);
					cell.setAttribute('index', pos);
				},
				league: function(cell, leagueId) {
					var link = doc.createElement('a');
					link.href = '/World/Leagues/League.aspx?LeagueID=' + leagueId;
					link.textContent = Foxtrick.L10n.getCountryName(leagueId);
					cell.appendChild(link);
				},
				dateDiff: function(cell, deadline) {
					var htDate = Foxtrick.util.time.getHtDate(doc);
					var diff = Math.floor((htDate.getTime() - deadline.getTime()) / 1000); // Sec
					var span = Foxtrick.util.time.timeDifferenceToElement(doc, diff, true, false);
					cell.appendChild(span);
					cell.title = Foxtrick.util.time.buildDate(deadline);
					Foxtrick.addClass(cell, 'align-left');
					cell.setAttribute('index', diff);
				},
				dateCell: function(cell, deadline) {
					var date = Foxtrick.util.time.getDateFromText(deadline.textContent);
					var index = date.getTime();
					deadline.setAttribute('index', index);
					cell.parentNode.replaceChild(deadline, cell);
				},
				formatNum: function(cell, num) {
					cell.className = 'formatted-num';
					cell.textContent = Foxtrick.formatNumber(num, '\u00a0');
					cell.setAttribute('index', num);
				},
				object: function(cell, val) {
					if (val)
						cell.appendChild(val);
				},
			};

			var createCustomizeTable = function(properties) {
				var table = doc.createElement('table');
				table.className = 'ft_skilltable_customizetable';
				var thead = doc.createElement('thead');
				var tbody = doc.createElement('tbody');
				var headRow = doc.createElement('tr');
				var checkRow = doc.createElement('tr');
				table.appendChild(thead);
				table.appendChild(tbody);
				thead.appendChild(headRow);
				tbody.appendChild(checkRow);
				Foxtrick.forEach(function(prop) {
					if (prop.available) {
						var th = doc.createElement('th');

						renderTH(th, prop);
						var td = doc.createElement('td');
						var check = doc.createElement('input');
						check.id = prop.name;
						check.type = 'checkbox';
						if (prop.enabled) {
							check.setAttribute('checked', 'checked');
						}
						td.appendChild(check);
						headRow.appendChild(th);
						checkRow.appendChild(td);
					}
				}, properties);
				return table;
			};

			var insertCustomizeTable = function(customizeTable) {
				var wrapper = tableDiv.querySelector('.ft_skilltable_customizewrapper');
				wrapper.appendChild(customizeTable);
			};

			var insertSkillTable = function(skillTable) {
				var wrapper = tableDiv.querySelector('.ft_skilltable_wrapper');
				wrapper.appendChild(skillTable);
			};

			var setViewMode = function() {
				var container = tableDiv.querySelector('.ft_skilltable_container');
				if (Foxtrick.Prefs.getBool('module.SkillTable.top')) {
					Foxtrick.addClass(container, 'on_top');
				}
			};

			var sortClick = function(ev) {
				var modifierPressed = ev.ctrlKey;
				try {
					var head = ev.currentTarget;

					var table = doc.getElementById('ft_skilltable');
					// determine sort direction
					var lastSortIndex = table.getAttribute('lastSortIndex');
					var sortIndex = Foxtrick.getChildIndex(head);
					var sortAsc = head.hasAttribute('sort-asc');
					if (sortIndex == lastSortIndex) {
						if (sortAsc)
							head.removeAttribute('sort-asc');
						else
							head.setAttribute('sort-asc', 'true');
						sortAsc = !Boolean(sortAsc);
					}
					if (!modifierPressed)
						table.setAttribute('lastSortIndex', sortIndex);

					var sortString = head.hasAttribute('sort-string');

					var getSortByIndex = function(index) {
						var res = Foxtrick.any(function(n) {
							return n.cells[index].hasAttribute('index');
						}, table.rows);
						return res;
					};
					var sortByIndex = getSortByIndex(sortIndex);

					var rows = Foxtrick.map(function(row) {
						return row.cloneNode(true);
					}, table.rows).slice(1); // skipping header

					/* sortCompare
						sortClick() will first check whether every cell in that column has the
						attribute 'index'. If so, they will be ordered with that attribute as
						key. Otherwise, we use their textContent.
					*/
					var sortCompare = function(a, b) {
						var doSort = function(aa, bb) {
							var aContent, bContent;
							var lastSort = Number(aa.getAttribute('lastSort')) -
								Number(bb.getAttribute('lastSort'));

							if (sortByIndex) {
								aContent = aa.cells[sortIndex].getAttribute('index');
								bContent = bb.cells[sortIndex].getAttribute('index');
							}
							else {
								aContent = aa.cells[sortIndex].textContent;
								bContent = bb.cells[sortIndex].textContent;
							}

							if (aContent === bContent) {
								return 0;
							}
							// place empty cells at the bottom
							if (aContent === '' || aContent === 'X' ||
							    aContent === null || aContent === undefined) {
								return 1;
							}
							if (bContent === '' || bContent === 'X' ||
							    bContent === null || bContent === undefined) {
								return -1;
							}
							if (sortString) {
								// always sort by ascending order
								// why? This works perfectly, doesn't it?
								var res = aContent.localeCompare(bContent);
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
									return aContent - bContent;
								}
								else {
									return bContent - aContent;
								}
							}
						};

						var getSortStringByIndex = function(n) {
							var table = doc.getElementById('ft_skilltable');
							var head = table.rows[0].cells[n];
							return head.hasAttribute('sort-string');
						};

						if (modifierPressed) {
							var tmp = {
								sortIndex: sortIndex,
								sortString: sortString,
								sortByIndex: sortByIndex,
							};
							sortString = getSortStringByIndex(lastSortIndex);
							sortIndex = lastSortIndex;
							sortByIndex = getSortByIndex(lastSortIndex);
							var result = doSort(a, b);
							sortByIndex = tmp.sortByIndex;
							sortIndex = tmp.sortIndex;
							sortString = tmp.sortString;
							if (result === 0) {
								var sortResult = doSort(a, b);
								return sortResult;
							}
							else {
								return result;
							}
						}
						else {
							return doSort(a, b);
						}
					};

					rows.sort(sortCompare);

					Foxtrick.forEach(function(row, i) {
						row.setAttribute('lastSort', i);
						// rows.length < table.rows.length because header was skipped
						table.rows[i + 1].parentNode.replaceChild(row, table.rows[i + 1]);
					}, rows);
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

			var renderTH = function(th, column) {
				var fullName = Foxtrick.L10n.getString(column.name);
				var abbrName = Foxtrick.L10n.getString(column.name + '.abbr');
				var useAbbr = true;
				if (!abbrName || fullName === abbrName) {
					useAbbr = false;
				}
				var img;
				if (useAbbr) {
					if (column.img) {
						img = doc.createElement('img');
						img.src = column.img;
						img.alt = abbrName;
						img.title = fullName;
						th.appendChild(img);
					}
					else {
						var abbr = doc.createElement('abbr');
						abbr.title = fullName;
						abbr.textContent = abbrName;
						th.appendChild(abbr);
					}
				}
				else {
					if (column.img) {
						img = doc.createElement('img');
						img.src = column.img;
						img.alt = fullName;
						img.title = fullName;
						th.appendChild(img);
					}
					else {
						th.textContent = fullName;
					}
				}
			};

			try {
				var tableDiv = doc.getElementById(TABLE_DIV_ID);

				var fullType = getFullType(doc);

				// first determine lastMatchday
				var lastMatchDate, secondLastMatchDate;
				if (fullType.type != 'transfer' &&
				    fullType.subtype != 'nt' && fullType.subtype != 'oldiesCoach') {
					var getMatchDate = function(playerInfo) {
						var links = playerInfo.getElementsByTagName('a');
						return Foxtrick.nth(function(link) {
							if (/matchid/i.test(link.href)) {
								var date = Foxtrick.util.time.getDateFromText(link.textContent);
								return date.getTime();
							}
						}, links) || 0;
					};

					var players = doc.getElementsByClassName('playerInfo');
					// (assumes that if there are less then 3 players at a match date
					// those were transfers and disregards them)
					var dates = Foxtrick.Pages.Players.getLastMatchDates(players, getMatchDate, 3);

					lastMatchDate = dates.last;
					secondLastMatchDate = dates.second;
				}

				Foxtrick.forEach(function(column) {
					column.available = false;
					if (column.properties) {
						Foxtrick.any(function(prop) {
							if (Foxtrick.Pages.Players.isPropertyInList(playerList, prop)) {
								column.available = true;
								column.enabled = getColumnEnabled(fullType, column.name);
								return true;
							}
							return false;
						}, column.properties);
					}
					else if (column.property) {
						if (Foxtrick.Pages.Players.isPropertyInList(playerList,
						    column.property)) {
							column.available = true;
							column.enabled = getColumnEnabled(fullType, column.name);
						}
					}
				}, COLUMNS);

				// clear old table and loading note
				var oldTable = doc.getElementById('ft_skilltable');
				if (oldTable)
					oldTable.parentNode.removeChild(oldTable);

				var oldNotes = doc.querySelector('.ft_skilltable_wrapper .ft-note');
				if (oldNotes)
					oldNotes.parentNode.removeChild(oldNotes);

				var oldcustomizeTable = doc.querySelector('.ft_skilltable_customizetable');
				if (oldcustomizeTable)
					oldcustomizeTable.parentNode.removeChild(oldcustomizeTable);

				var customizeTable = createCustomizeTable(COLUMNS);
				Foxtrick.addClass(customizeTable, 'hidden');

				var table = doc.createElement('table');
				table.id = 'ft_skilltable';
				table.className = 'ft_skilltable';

				var thead = doc.createElement('thead');
				var tr = doc.createElement('tr');
				thead.appendChild(tr);
				table.appendChild(thead);

				Foxtrick.forEach(function(column) {
					if (column.enabled) {
						var th = doc.createElement('th');
						if (column.sortString) {
							th.setAttribute('sort-string', true);
						}
						if (column.sortAsc) {
							th.setAttribute('sort-asc', true);
						}
						Foxtrick.onClick(th, sortClick);

						renderTH(th, column);

						tr.appendChild(th);
					}
				}, COLUMNS);

				var tbody = doc.createElement('tbody');
				table.appendChild(tbody);

				Foxtrick.forEach(function(player) {
					var row = doc.createElement('tr');

					// set row attributes for filter module
					row.setAttribute('playerid', player.id);
					if (player.hidden)
						Foxtrick.addClass(row, 'hidden');
					if (player.currentSquad)
						row.setAttribute('currentsquad', player.currentSquad);
					if (player.currentClubLink) {
						var clubM = player.currentClubLink.href.match(/\/Club\/\?TeamID=(\d+)/i);
						if (clubM) {
							row.setAttribute('currentclub', clubM[1]);
						}
					}
					if (player.injured)
						row.setAttribute('injured', player.injured);
					if (player.cards)
						row.setAttribute('cards', player.cards);
					if (player.transferListed)
						row.setAttribute('transfer-listed', 'true');
					else
						row.setAttribute('not-transfer-listed', 'true');
					if (player.speciality) {
						var spec = Foxtrick.L10n.getEnglishSpeciality(player.speciality);
						row.setAttribute('speciality-' + spec, true);
					}
					if (player.active)
						row.setAttribute('active', player.active);
					if (player.motherClubBonus)
						row.setAttribute('homegrown-player', 'true');
					else
						row.setAttribute('purchased-player', 'true');

					tbody.appendChild(row);

					Foxtrick.forEach(function(column) {
						if (column.enabled) {
							var method = column.method;
							var property = column.property;
							var value = player[property];

							var cell = doc.createElement('td');
							row.appendChild(cell);
							if (column.properties) {
								if (method) {
									RENDERERS[method](cell, player);
								}
								else {
									var texts = Foxtrick.map(function(prop) {
										return player[prop];
									}, column.properties);
									cell.textContent = texts.join(', ');
								}
							}
							else if (property && typeof value !== 'undefined') {
								if (method) {
									RENDERERS[column.method](cell, value, property);
								}
								else {
									cell.textContent = value;
								}
								if (column.title) {
									cell.title = player[column.title];
								}
							}
							if (column.alignRight) {
								Foxtrick.addClass(cell, 'align-right');
							}
						}
					}, COLUMNS);
				}, playerList);
				insertCustomizeTable(customizeTable);
				insertSkillTable(table);

				setViewMode();
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};
		var createTable = function(fullType) {
			if (!fullType)
				fullType = getFullType(doc);
			if (fullType.type == 'transfer') {
				var playerList = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
				showTable(playerList);
			}
			else {
				var loading = Foxtrick.util.note.createLoading(doc);
				var wrapper = doc.querySelector('.ft_skilltable_wrapper');
				wrapper.appendChild(loading);
				try {
					if (Foxtrick.Pages.Players.isOldies(doc) && fullType.type == 'oldiesAndOwn') {
						showOldiesAndOwn(doc);
					}
					else {
						Foxtrick.Pages.Players.getPlayerList(doc, function(list) {
							showTable(list);
						});
					}
				}
				catch (e) {
					Foxtrick.log(e);
					wrapper.removeChild(loading);
				}
			}
		};
		var addHomegrown = function() {
			Foxtrick.toggleClass(this, 'hidden');

			var fullType = { type: 'oldiesAndOwn' };
			createTable(fullType);
		};
		var showTimeInClub = function() {
			Foxtrick.toggleClass(this, 'hidden');

			var loading = Foxtrick.util.note.createLoading(doc);
			var wrapper = doc.querySelector('.ft_skilltable_wrapper');
			wrapper.appendChild(loading);

			var setHomeGrownAndJoinedSinceFromTransfers = function(xml, list) {
				var PlayerID = xml.num('PlayerID');
				var player = Foxtrick.Pages.Players.getPlayerFromListById(list, PlayerID);
				var TeamId = xml.num('TeamId');
				var Transfers = xml.getElementsByTagName('Transfer');
				if (Transfers.length > 0) {
					var FirstTransfer = Transfers[Transfers.length - 1];
					var seller = xml.num('SellerTeamID', FirstTransfer);
					if (seller === TeamId) {
						player.motherClubBonus = doc.createElement('span');
						player.motherClubBonus.textContent = '*';
						player.motherClubBonus.title =
							Foxtrick.L10n.getString('skilltable.rebought_youthplayer');
					}

					var LastTransfer = Transfers[0];
					var BuyerTeamID = xml.num('BuyerTeamID', LastTransfer);
					if (TeamId === BuyerTeamID) {
						// legitimate transfer
						var Deadline = xml.time('Deadline', LastTransfer);
						player.joinedSince = Deadline;
						return true;
					}
					else {
						// probably external coach
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
				// possibilities:
				// 1) external coach pulled elsewhere
				// 2) player pulled here (never sold)
				// 3) internal coach pulled here
				// 4) external coach pulled here (is that even possible? let's hope not)*
				// 5) player from starting squad (return false)
				// 6) internal coach from starting squad (return false)
				// 7) external coach from starting squad (is that even possible? let's hope not)*
				// 8) external coach from someone else's starting squad
				// * not taken care off
				var teamId = Foxtrick.Pages.All.getId(doc);
				var pulledHere = false;
				var pulledElsewhere = false;
				var isCoach = false;
				var PlayerID = xml.num('PlayerID');
				var player = Foxtrick.Pages.Players.getPlayerFromListById(list, PlayerID);
				var PlayerEvents = xml.getElementsByTagName('PlayerEvent');

				var done = Foxtrick.any(function(PlayerEvent) {
					var PlayerEventTypeID = xml.num('PlayerEventTypeID', PlayerEvent);
					if (PlayerEventTypeID == 12 && !isCoach) {
						// consider only the last coach contract
						isCoach = true;
						var coachDate = xml.time('EventDate', PlayerEvent);
						player.joinedSince = coachDate;
					}
					if (PlayerEventTypeID == 20 || PlayerEventTypeID == 13) {
						// check to see if pulled from this team
						var evnt = xml.text('EventText', PlayerEvent);
						if (evnt.match(teamId)) {
							// cases 2) & 3) -> pullDate
							pulledHere = true;
							var EventDate = xml.time('EventDate', PlayerEvent);
							player.joinedSince = EventDate;
							// pull is a last-ish and most important event
							// we are done
							return true;
						}
						else
							pulledElsewhere = true;
					}
					// not done yet
					return false;
				}, PlayerEvents);

				if (done)
					return;

				// pulledHere already dealt with above
				// it's either pulled elsewhere which is 1): should have event 12 -> coachDate
				// or starting in other team 8): motherClubBonus is undefined -> also coachDate
				// or starting in own team  5) & 6): return false -> activationDate
				var hasMCBonus = typeof player.motherClubBonus !== 'undefined';
				return pulledElsewhere || !hasMCBonus;
			};

			// first get teams activation date. we'll need it later
			var teamId = Foxtrick.Pages.All.getTeamId(doc);
			var args = [['file', 'teamdetails'], ['version', '2.9'], ['teamId', teamId]];
			Foxtrick.util.api.retrieve(doc, args, DEFAULT_CACHE,
			  function(xml, errorText) {
				if (xml && !errorText) {
					var teams = xml.getElementsByTagName('TeamID');
					var TeamIDEl = Foxtrick.nth(function(team) {
						if (team.textContent === teamId.toString())
							return true;
						return false;
					}, teams);
					var Team = TeamIDEl.parentNode;
					var activationDate = xml.time('FoundedDate', Team);
					Foxtrick.Pages.Players.getPlayerList(doc,
					  function(list) {
						// first we check transfers
						var argsTransfersPlayer = Foxtrick.map(function(player) {
							return [['file', 'transfersplayer'], ['playerId', player.id]];
						}, list);

						Foxtrick.util.api.batchRetrieve(doc, argsTransfersPlayer, DEFAULT_CACHE,
						  function(xmls, errors) {
							var argsPlayerevents = [];
							Foxtrick.forEach(function(xml, i) {
								var error = errors[i];
								if (xml && !error) {
									// if there is a transfer, we are finished with this player
									var hasTransfers =
										setHomeGrownAndJoinedSinceFromTransfers(xml, list);
									if (!hasTransfers) {
										// so, he's from home.
										// need to get pull date from playerevents below
										var PlayerID = xml.num('PlayerID');
										argsPlayerevents.push([
											['file', 'playerevents'], ['playerId', PlayerID],
										]);
									}
								}
								else {
									Foxtrick.log('No XML in batchRetrieve', error, xml,
									             argsTransfersPlayer[i]);
								}
							}, xmls);
							// try set joined date from pull date
							Foxtrick.util.api.batchRetrieve(doc, argsPlayerevents, DEFAULT_CACHE,
							  function(xmls, errors) {
								Foxtrick.forEach(function(xml, i) {
									var error = errors[i];
									if (xml && !error) {
										var wasPulled = setJoinedSinceFromPullDate(xml, list);
										if (!wasPulled) {
											// no pull date = from starting squad.
											// joinedSince = activationDate
											var PlayerID = xml.num('PlayerID');
											Foxtrick.map(function(p) {
												if (p.id == PlayerID)
													p.joinedSince = activationDate;
											}, list);
										}
									}
									else {
										Foxtrick.log('No XML in batchRetrieve', error, xml,
										             argsPlayerevents[i]);
									}
								}, xmls);

								// finished. now display results
								Foxtrick.preventChange(doc, showTable)(list);
							});
						});
					});
				}
				else {
					loading.parentNode.removeChild(loading);
					var target = doc.querySelector('.ft_skilltable_wrapper');
					var str = status == 503 ? 'api.serverUnavailable' : 'error';
					var msg = Foxtrick.L10n.getString(str);
					Foxtrick.util.note.add(doc, msg, null, { to: target });
				}
			});
		};
		var showOldiesAndOwn = function(doc) {
			// get normal oldies into oldiesList
			Foxtrick.Pages.Players.getPlayerList(doc,
			  function(oldiesList) {
				// then get current squad (last parameter true) into currentSquadList
				Foxtrick.Pages.Players.getPlayerList(doc,
				  function(currentSquadList) {
					// filter, concat with oldies and display
					currentSquadList = Foxtrick.filter(function(n) {
						return n.motherClubBonus;
					}, currentSquadList);
					var fullList = oldiesList.concat(currentSquadList);
					Foxtrick.preventChange(doc, showTable)(fullList);
				}, { currentSquad: true });
			});
		};
		var addTableDiv = function() {
			var tableDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
			tableDiv.id = TABLE_DIV_ID;
			Foxtrick.addClass(tableDiv, TABLE_DIV_ID);
			if (Foxtrick.Pages.TransferSearchResults.isPage(doc)) {
				Foxtrick.addClass(tableDiv, 'transfer');
			}

			var tableCreated = false;

			// table div head
			var h2 = doc.createElement('h2');
			h2.className = 'ft-expander-unexpanded';
			h2.textContent = Foxtrick.L10n.getString('SkillTable.header');
			var toggleDisplay = function() {
				try {
					if (!tableCreated) {
						tableCreated = true;
						createTable();
					}

					Foxtrick.toggleClass(h2, 'ft-expander-expanded');
					Foxtrick.toggleClass(h2, 'ft-expander-unexpanded');
					var show = Foxtrick.hasClass(h2, 'ft-expander-expanded');

					var customizeTable = tableDiv.querySelector('.ft_skilltable_customizetable');
					if (show) {
						// show the objects
						Foxtrick.removeClass(links, 'hidden');
						Foxtrick.removeClass(container, 'hidden');
					}
					else {
						// hide the objects
						Foxtrick.removeClass(links, 'customizing');
						Foxtrick.addClass(links, 'hidden');
						Foxtrick.addClass(customizeTable, 'hidden');
						Foxtrick.addClass(container, 'hidden');
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			};
			Foxtrick.onClick(h2, toggleDisplay);
			tableDiv.appendChild(h2);

			// links
			var links = doc.createElement('div');
			links.className = 'ft_skilltable_links';
			Foxtrick.addClass(links, 'hidden');

			// links: copy
			var copy = doc.createElement('a');
			copy.className = 'customize_item secondary';
			copy.textContent = Foxtrick.L10n.getString('button.copy');
			copy.title = Foxtrick.L10n.getString('copy.skilltable.title');
			Foxtrick.onClick(copy, function() {
				/* get the text content in a node and return it.
				 * for player links, append the [playerid] HT-ML tag
				 * for images, return its alt attribute
				 */
				var YOUTH_PLAYER_RE = /YouthPlayerID=(\d+)/i;
				var PLAYER_RE = /PlayerID=(\d+)/i;
				var getNode = function(node) {
					var nodeName = node.nodeName.toLowerCase();
					var ret = '';
					if (nodeName == 'a' && YOUTH_PLAYER_RE.test(node.href)) {
						ret = node.textContent;
						ret += ' [youthplayerid=';
						ret += node.href.match(YOUTH_PLAYER_RE)[1];
						ret += ']';
						return ret;
					}
					else if (nodeName == 'a' && PLAYER_RE.test(node.href)) {
						ret = node.textContent;
						ret += ' [playerid=';
						ret += node.href.match(PLAYER_RE)[1];
						ret += ']';
						return ret;
					}
					else if (node.hasChildNodes()) {
						Foxtrick.forEach(function(child) {
							// recursively get the content of child nodes
							ret += getNode(child) + ' ';
						}, node.childNodes);
						return ret.trim();
					}
					else {
						if (nodeName == 'img') {
							return node.alt;
						}
						else {
							return node.textContent;
						}
					}
				};
				var toHtMl = function(table) {
					var ret = '[table]\n';
					Foxtrick.forEach(function(row) {
						if (Foxtrick.hasClass(row, 'hidden'))
							return;

						ret += '[tr]';

						Foxtrick.forEach(function(cell) {
							var cellName = cell.tagName.toLowerCase();
							var cellContent = getNode(cell);
							if (Foxtrick.hasClass(cell, 'maxed')) {
								cellContent = '[b]' + cellContent + '[/b]';
							}
							else if (Foxtrick.hasClass(cell, 'formatted-num')) {
								cellContent = Foxtrick.trimnum(cellContent);
							}
							ret += '[' + cellName + ']' + cellContent + '[/' + cellName + ']';
						}, row.cells);

						ret += '[/tr]\n';
					}, table.rows);

					ret += '[/table]';
					return ret;
				};
				var table = doc.querySelector('.ft_skilltable');
				Foxtrick.copyStringToClipboard(toHtMl(table));

				Foxtrick.util.note.add(doc, Foxtrick.L10n.getString('copy.skilltable.copied'),
				                       'ft-skilltable-copy-note', { at: table });
			});

			// links: customize
			var customize = doc.createElement('a');
			customize.className = 'customize_item';
			customize.textContent = Foxtrick.L10n.getString('button.customize');
			Foxtrick.onClick(customize, function() {
				var links = doc.querySelector('.ft_skilltable_links');
				Foxtrick.addClass(links, 'customizing');

				var customizeTable = doc.querySelector('.ft_skilltable_customizetable');
				Foxtrick.removeClass(customizeTable, 'hidden');

				var container = doc.querySelector('.ft_skilltable_container');
				Foxtrick.addClass(container, 'hidden');
			});

			// links: save
			var save = doc.createElement('a');
			save.textContent = Foxtrick.L10n.getString('button.save');
			Foxtrick.onClick(save, function() {
				var fullType = getFullType(doc);

				var tableDiv = doc.getElementById(TABLE_DIV_ID);
				var inputs = tableDiv.getElementsByTagName('input');
				Foxtrick.forEach(function(input) {
					setColumnEnabled(fullType, input.id, input.checked);
				}, inputs);
				doc.location.reload();
			});

			// links: cancel
			var cancel = doc.createElement('a');
			cancel.textContent = Foxtrick.L10n.getString('button.cancel');
			Foxtrick.onClick(cancel, function() {
				var tableDiv = doc.getElementById(TABLE_DIV_ID);
				var links = tableDiv.querySelector('.ft_skilltable_links');
				var customizeTable = tableDiv.querySelector('.ft_skilltable_customizetable');
				var container = tableDiv.querySelector('.ft_skilltable_container');
				Foxtrick.removeClass(links, 'customizing');
				Foxtrick.addClass(customizeTable, 'hidden');
				Foxtrick.removeClass(container, 'hidden');
			});

			// links: add all children
			links.appendChild(copy);
			links.appendChild(customize);
			links.appendChild(save);
			links.appendChild(cancel);

			// customize table wrapper
			var customizeWrapper = doc.createElement('div');
			customizeWrapper.className = 'ft_skilltable_customizewrapper';

			// table container
			var container = doc.createElement('div');
			container.className = 'ft_skilltable_container';
			Foxtrick.addClass(container, 'hidden');

			// table container: switch view
			var switchView = doc.createElement('div');
			var switchViewLink = doc.createElement('a');
			switchViewLink.textContent = Foxtrick.L10n.getString('SkillTable.switchView');
			switchViewLink.title = Foxtrick.L10n.getString('SkillTable.switchView.title');
			Foxtrick.onClick(switchViewLink, function() {
				var tableDiv = doc.getElementById(TABLE_DIV_ID);
				var container = tableDiv.querySelector('.ft_skilltable_container');
				Foxtrick.toggleClass(container, 'on_top');

				var onTop = Foxtrick.hasClass(container, 'on_top');
				Foxtrick.Prefs.setBool('module.SkillTable.top', onTop);
			});
			switchView.appendChild(switchViewLink);

			var options;
			if (Foxtrick.util.api.authorized()) {
				options = doc.createElement('div');
				if (Foxtrick.Pages.Players.isOldies(doc)) {
					var addHomegrownLink = doc.createElement('a');
					addHomegrownLink.textContent =
						Foxtrick.L10n.getString('SkillTable.addHomegrown');
					addHomegrownLink.title =
						Foxtrick.L10n.getString('SkillTable.addHomegrown.title');
					addHomegrownLink.id = 'skilltable_addHomegrownId';
					Foxtrick.onClick(addHomegrownLink, addHomegrown);
					options.appendChild(addHomegrownLink);
				}
				else if (Foxtrick.Pages.Players.isRegular(doc)) {
					options = doc.createElement('div');
					var showTimeLink = doc.createElement('a');
					showTimeLink.textContent =
						Foxtrick.L10n.getString('SkillTable.showTimeInClub');
					showTimeLink.title =
						Foxtrick.L10n.getString('SkillTable.showTimeInClub.title');
					showTimeLink.id = 'skilltable_showTimeInClubId';
					Foxtrick.onClick(showTimeLink, showTimeInClub);
					options.appendChild(showTimeLink);
				}
			}

			// table container: table wrapper
			var wrapper = doc.createElement('div');
			wrapper.className = 'ft_skilltable_wrapper';

			// table container: add all children
			container.appendChild(switchView);
			container.appendChild(wrapper);
			if (options)
				container.appendChild(options);

			tableDiv.appendChild(h2);
			tableDiv.appendChild(links);
			tableDiv.appendChild(customizeWrapper);
			tableDiv.appendChild(container);

			// insert tableDiv
			if (Foxtrick.Pages.TransferSearchResults.isPage(doc)) {
				// on transfer search page, insert after first separator
				var separator = doc.querySelector('#mainBody .borderSeparator');
				var insertBefore = separator.nextSibling;
				insertBefore.parentNode.insertBefore(tableDiv, insertBefore);
			}
			else if (Foxtrick.Pages.Player.isSenior(doc)) {
				var insertParent = doc.getElementById('mainBody');
				insertParent.appendChild(tableDiv);
			}
			else {
				var playerList = doc.querySelector('.playerList');
				if (playerList) {
					// If there is playerList, as there is in youth/senior teams,
					// insert before it. In such cases, there would be category headers
					// for supporters, inserting before the first player would clutter
					// up with the headers. Additionally, inserting before the list
					// would be organized in a better way.
					playerList.parentNode.insertBefore(tableDiv, playerList);
				}
				else {
					// otherwise, insert before the first player if there is any
					var firstFace = doc.querySelector('.faceCard');
					if (firstFace) {
						// without playerList, players would have faces shown before
						// playerInfo, if user enabled faces
						firstFace.parentNode.insertBefore(tableDiv, firstFace);
					}
					else {
						var firstPlayer = doc.querySelector('.playerInfo');
						if (firstPlayer) {
							// or... users haven't enabled faces
							firstPlayer.parentNode.insertBefore(tableDiv, firstPlayer);
						}
					}
				}
			}
			return tableDiv;
		};

		if (doc.getElementById(TABLE_DIV_ID))
			return;

		if (Foxtrick.isPage(doc, 'transferSearchResult') ||
		    getFullType().subtype != 'others' ||
		    Foxtrick.Prefs.isModuleOptionEnabled('SkillTable', 'OtherTeams')) {

			addTableDiv();
		}
	},
};
