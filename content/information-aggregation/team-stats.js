'use strict';
/**
 * team-stats.js
 * Foxtrick team overview
 * @author OBarros, spambot, convinced, ryanli
 */

Foxtrick.modules['TeamStats'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['players', 'youthPlayers'],
	OPTIONS: [
		'General', 'Attributes', 'Skills', 'Match', 'Speciality',
		'Personality', 'Status', 'Current_league'
	],
	NICE: -1, // before FoxtrickLinksPlayers

	CSS: Foxtrick.InternalPath + 'resources/css/team-stats.css',

	/**
	 * @param	{document}	doc
	 */
	run: function(doc) {
		// delay execution after YouthSkills
		if (Foxtrick.isPage(doc, 'ownYouthPlayers') && Foxtrick.Prefs.isModuleEnabled('YouthSkills'))
			return;

		this.execute(doc);
	},

	execute: function(doc) {
		var show = function(playerList) {
		try {
				var attributeOptions = [
					{ category: 'TeamStats.General',	name: 'TSI.abbr', 		property: 'tsi', 		method: 'sum_avg',	pages: ['seniorPlayers', 'oldPlayers', 'ntPlayers'] },
					//{ category: 'TeamStats.General',	name: 'Age', 			property: 'ageYears', 	method: 'age',		pages: ['players', 'youthPlayers'] },
					{ category: 'TeamStats.General',	name: 'Salary', 		property: 'salary', 	method: 'sum_avg',	pages: ['players'] },
					{ category: 'TeamStats.Attributes', name: 'Form', 			property: 'form', 		method: 'skill',	pages: ['seniorPlayers', 'oldPlayers', 'ntPlayers']},
					{ category: 'TeamStats.Attributes', name: 'Stamina', 		property: 'stamina', 	method: 'skill',	pages: ['seniorPlayers', 'oldPlayers', 'ntPlayers']},
					{ category: 'TeamStats.Attributes', name: 'Experience', 	property: 'experience', method: 'skill',	pages: ['seniorPlayers', 'oldPlayers', 'ntPlayers'] },
					{ category: 'TeamStats.Attributes', name: 'Loyalty', 		property: 'loyalty', 	method: 'skill',	pages: ['seniorPlayers', 'oldPlayers']},
					{ category: 'TeamStats.Attributes', name: 'Leadership', 	property: 'leadership', method: 'skill',	pages: ['seniorPlayers', 'oldPlayers', 'ntPlayers'] },
					{ category: 'TeamStats.Skills', 	name: 'Keeper', 		property: 'keeper', 	method: 'skill',	pages: ['ownPlayers']},
					{ category: 'TeamStats.Skills', 	name: 'Defending', 	property: 'defending', method: 'skill',	pages: ['ownPlayers']},
					{ category: 'TeamStats.Skills', 	name: 'Playmaking', 	property: 'playmaking', method: 'skill',	pages: ['ownPlayers']},
					{ category: 'TeamStats.Skills', 	name: 'Winger', 		property: 'winger', 	method: 'skill',	pages: ['ownPlayers']},
					{ category: 'TeamStats.Skills', 	name: 'Passing', 		property: 'passing', 	method: 'skill',	pages: ['ownPlayers']},
					{ category: 'TeamStats.Skills', 	name: 'Scoring', 		property: 'scoring', 	method: 'skill',	pages: ['ownPlayers']},
					{ category: 'TeamStats.Skills', 	name: 'Set_pieces', 	property: 'setPieces', method: 'skill',	pages: ['ownPlayers']},
					/*{ category: 'TeamStats.Skills', name: 'HTMS_Ability', 		property: 'htmsAbility', 	method: 'average', pages: ['seniorPlayers'] },
					{ category: 'TeamStats.Skills', 	name: 'HTMS_Potential', 	property: 'htmsPotential' , pages: ['seniorPlayers']},
					{ category: 'TeamStats.Attributes', name: 'Agreeability', 		property: 'agreeability', 	pages: ['seniorPlayers']},
					{ category: 'TeamStats.Attributes', name: 'Aggressiveness', 	property: 'aggressiveness', pages: ['seniorPlayers']},
					{ category: 'TeamStats.Attributes', name: 'Honesty', 			property: 'honesty', 		pages: ['seniorPlayers']},*/
					{ category: 'Match', 	name: 'Last_stars', 			property: 'lastRating', 			method: 'sum_avg',	pages: ['seniorPlayers', 'youthPlayers']}/*,
					{ category: 'Match', 	name: 'Last_stars_EndOfGame', 	property: 'lastRatingEndOfGame', 	method: 'sum_avg',	pages: ['seniorPlayers']},
					{ category: 'Match', 	name: 'Last_stars_decline', 	property: 'lastRatingDecline', 	method: 'sum_avg',	pages: ['seniorPlayers']}*/
				];
				for (var i = 0; i < attributeOptions.length; ++i) {
					attributeOptions[i].value = 0;
				}

			var numPlayers = 0;
			var totalAge = 0;
			var olderThanNineteen = 0;
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
				if (playerList[i].hidden)
					continue;
				++numPlayers;

				if (current.age) {
					totalAge += current.age.years * 112 + current.age.days;
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
				if (current.injuredWeeks) {
					++injured;
					injuredWeeks += current.injuredWeeks;
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

				// sum attributeOptions values
				for (var j = 0; j < attributeOptions.length; ++j) {
					if (!Foxtrick.isOneOfPages(attributeOptions[j].pages, doc))
						continue;
					if (current[attributeOptions[j].property] == undefined)
						continue;

					attributeOptions[j].value += current[attributeOptions[j].property];
					// wildguess add subs to skills
					if (attributeOptions[j].method == 'skill'
					&& current[attributeOptions[j].property] > 0
					&& current[attributeOptions[j].property] < 20)
						attributeOptions[j].value += 0.5;
				}
			}
//Foxtrick.log('attributeOptions',attributeOptions);
//Foxtrick.log('playerList',playerList)
			var table = doc.createElement('table');
			table.id = 'team-stats-table';
			// label and data could either be strings or document nodes
			var addRow = function(category, label, data, filter, title) {
				var tbody = table.getElementsByClassName('TeamStats.' + category)[0];
				if (!tbody) {
					tbody = doc.createElement('tbody');
					tbody.className = 'TeamStats.' + category;
					var row = doc.createElement('tr');
					var header = doc.createElement('th');
					header.setAttribute('colspan', '2');
					header.textContent = Foxtrick.L10n.getString(category);
					row.appendChild(header);
					tbody.appendChild(row);
					table.appendChild(tbody);
				}

				var row = doc.createElement('tr');
				var addFilterShortcut = function(filter, title) {
					row.title = Foxtrick.L10n.getString('TeamStats.FilterFor') + ' ' + title;
					row.setAttribute('style', 'cursor:pointer');
					Foxtrick.onClick(row, function(ev) {
						var filterSelect = doc.getElementById('foxtrick-filter-select');
						// init filters
						var evt = doc.createEvent('HTMLEvents');
						evt.initEvent('change', true, true); // event type,bubbling,cancelable
						filterSelect.dispatchEvent(evt);
						// set filter
						filterSelect.value = filter;
						// call filter
						var evt2 = doc.createEvent('HTMLEvents');
						evt2.initEvent('change', true, true); // event type,bubbling,cancelable
						filterSelect.dispatchEvent(evt2);

						window.scroll(0, 0);
						window.scrollBy(0, doc.getElementById('ctl00_ctl00_CPContent_divStartMain').offsetTop);
					});
				};

				var labelCell = doc.createElement('td');
				labelCell.className = 'ch';
				if (typeof(label) === 'object') {
					labelCell.appendChild(label);
				}
				else {
					labelCell.textContent = label;
				}
				row.appendChild(labelCell);

				var dataCell = doc.createElement('td');
				if (typeof(data) === 'object') {
					dataCell.appendChild(data);
				}
				else {
					dataCell.textContent = data;
				}
				row.appendChild(dataCell);
				if (filter && Foxtrick.Prefs.isModuleEnabled('PlayerFilters'))
					addFilterShortcut(filter, title);

				tbody.appendChild(row);
				return row;
			};

			if (numPlayers) {

				if (Foxtrick.Prefs.isModuleOptionEnabled('TeamStats', 'General')) {
					var data = doc.createElement('span');
					var total = doc.createElement('span');
					total.className = 'nowrap';
					total.textContent = playerList.length;
					total.setAttribute('title', Foxtrick.L10n.getString('TeamStats.Total'));
					var selected = doc.createElement('span');
					selected.className = 'nowrap';
					selected.textContent = numPlayers;
					selected.setAttribute('title', Foxtrick.L10n.getString('TeamStats.Selected'));
					data.appendChild(selected);
					data.appendChild(doc.createTextNode(' / '));
					data.appendChild(total);
					addRow('TeamStats.General', Foxtrick.L10n.getString('TeamStats.Players'), data);
					if (totalAge) {
						var avgAge = Math.round(totalAge / numPlayers);
						var avgYears = Math.floor(avgAge / 112);
						var avgDays = avgAge % 112;
						addRow('TeamStats.General', Foxtrick.L10n.getString('Age'),
							   avgYears + '.' + avgDays);
					}
					if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
						var youngerThanNineteen = numPlayers - olderThanNineteen;
						var row = addRow('TeamStats.General', Foxtrick.L10n
										 .getString('TeamStats.PlayerNotToOld'), youngerThanNineteen);
						if (youngerThanNineteen < 9) {
							row.className = 'red';
						}
						if (olderThanNineteen) {
							var row = addRow('TeamStats.General', Foxtrick.L10n
											 .getString('TeamStats.PlayerToOld'), olderThanNineteen);
							row.className = 'red';
						}
					}
				}

				var methods = {
					sum_avg: function(val, numPlayers) {
						var avg = val / numPlayers;
						var data = doc.createElement('span');
						var total = doc.createElement('span');
						total.className = 'nowrap';
						total.textContent = Foxtrick.formatNumber(val, '\u00a0');
						total.setAttribute('title', Foxtrick.L10n.getString('TeamStats.Total'));
						var avgSpan = doc.createElement('span');
						avgSpan.className = 'nowrap';
						avgSpan.textContent = Foxtrick.formatNumber(avg.toFixed(1), '\u00a0');
						avgSpan.setAttribute('title', Foxtrick.L10n.getString('TeamStats.Average'));
						data.appendChild(total);
						data.appendChild(doc.createTextNode(' / '));
						data.appendChild(avgSpan);
						return data;
					},
					avergage: function(val, numPlayers) {
						return Math.round(val / numPlayers);
					},
					skill: function(val, numPlayers) {
						var span = doc.createElement('span');
						var avg = val / numPlayers;
						span.textContent = avg.toFixed(1);
						span.title = Foxtrick.L10n.getFullLevelByValue(avg);
						return span;
					},
					age: function(val, numPlayers) {
						return val;
					}
				};
				for (var j = 0; j < attributeOptions.length; ++j) {
					if (!Foxtrick.isOneOfPages(attributeOptions[j].pages, doc))
						continue;
					if (!Foxtrick.Prefs.isModuleOptionEnabled('TeamStats',
						attributeOptions[j].category.replace(/.+\./, '')))
						continue;
					if (Foxtrick.Pages.Players.isPropertyInList(playerList,
						attributeOptions[j].property)) {
						var text = methods[attributeOptions[j].method](attributeOptions[j].value,
																	   numPlayers);
						addRow(attributeOptions[j].category, Foxtrick.L10n
							   .getString(attributeOptions[j].name), text);
					}
				}

				if (Foxtrick.Prefs.isModuleOptionEnabled('TeamStats', 'Speciality')) {
					if (hasSpecialities) {
						var specSummary = [], speciality, i;
						for (speciality in specialities) {
							specSummary.push({ type: speciality, count: specialities[speciality] });
							specSummary.sort(function(a, b) { return a.type.localeCompare(b.type) });
							specSummary.sort(function(a, b) { return b.count - a.count });
						}
						for (i in specSummary) {
							addRow('Speciality', specSummary[i].type, specSummary[i].count,
								   'speciality-' + Foxtrick.L10n
								   .getEnglishSpeciality(specSummary[i].type), specSummary[i].type);
						}
					}
				}
				if (Foxtrick.Prefs.isModuleOptionEnabled('TeamStats', 'Personality')) {
					if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'aggressiveness')
						&& Foxtrick.Pages.Players.isPropertyInList(playerList, 'agreeability')
						&& Foxtrick.Pages.Players.isPropertyInList(playerList, 'honesty')) {
						var avgAggressiveness = Math.round(totalAggressiveness / numPlayers);
						var avgAgreeability = Math.round(totalAgreeability / numPlayers);
						var avgHonesty = Math.round(totalHonesty / numPlayers);
						addRow('Personality', Foxtrick.L10n.getString('Aggressiveness'),
							   Foxtrick.L10n.getLevelByTypeAndValue('aggressiveness', avgAggressiveness));
						addRow('Personality', Foxtrick.L10n.getString('Agreeability'),
							   Foxtrick.L10n.getLevelByTypeAndValue('agreeability', avgAgreeability));
						addRow('Personality', Foxtrick.L10n.getString('Honesty'),
							   Foxtrick.L10n.getLevelByTypeAndValue('honesty', avgHonesty));
					}
				}
				if (Foxtrick.Prefs.isModuleOptionEnabled('TeamStats', 'Status')) {
					if (transferListed > 0) {
						var img = doc.createElement('img');
						img.src = '/Img/Icons/dollar.gif';
						img.alt = Foxtrick.L10n.getString('TransferListed');
						img.className = 'transferListed';
						addRow('Status', img, transferListed, 'transfer-listed',
							   Foxtrick.L10n.getString('TeamStats.TransferListed'));
					}
					if (yellowCards > 0) {
						var img = doc.createElement('img');
						img.src = '/Img/Icons/yellow_card.gif';
						img.alt = Foxtrick.L10n.getString('Yellow_card');
						img.className = 'cardsOne';
						addRow('Status', img, yellowCards, 'cards',
							   Foxtrick.L10n.getString('TeamStats.Cards'));
					}
					if (twoYellowCards > 0) {
						var img = doc.createElement('img');
						img.src = '/Img/Icons/dual_yellow_card.gif';
						img.alt = '2 ' + Foxtrick.L10n.getString('Yellow_card');
						img.className = 'cardsTwo';
						addRow('Status', img, twoYellowCards, 'cards',
							   Foxtrick.L10n.getString('TeamStats.Cards'));
					}
					if (redCards > 0) {
						var img = doc.createElement('img');
						img.src = '/Img/Icons/red_card.gif';
						img.alt = Foxtrick.L10n.getString('Red_card');
						img.className = 'cardsOne';
						addRow('Status', img, redCards, 'cards',
							   Foxtrick.L10n.getString('TeamStats.Cards'));
					}
					if (bruised > 0) {
						var img = doc.createElement('img');
						img.src = '/Img/Icons/bruised.gif';
						img.alt = Foxtrick.L10n.getString('Bruised');
						img.className = 'injuryBruised';
						addRow('Status', img, bruised, 'injured',
							   Foxtrick.L10n.getString('TeamStats.Injured'));
					}
					if (injured > 0) {
						var img = doc.createElement('img');
						img.src = '/Img/Icons/injured.gif';
						img.alt = Foxtrick.L10n.getString('Injured');
						img.className = 'injuryInjured';

						var data = doc.createElement('span');
						data.textContent = injured;
						data.appendChild(doc.createTextNode(' ('));
						var weeks = doc.createElement('strong');
						weeks.textContent = injuredWeeks;
						data.appendChild(weeks);
						data.appendChild(doc.createTextNode(')'));

						addRow('Status', img, data, 'injured',
							   Foxtrick.L10n.getString('TeamStats.Injured'));
					}
				}
				if (Foxtrick.Prefs.isModuleOptionEnabled('TeamStats', 'Current_league')) {
					if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'currentLeagueId')
					|| Foxtrick.Pages.Players.isPropertyInList(playerList, 'countryId')) {

						var leagues = [];
						for (var i = 0; i < playerList.length; ++i) {
							var id = playerList[i].currentLeagueId || playerList[i].countryId;
							if (id !== undefined) {
								if (leagues[id] === undefined) {
									leagues[id] = 1;
								}
								else {
									++leagues[id];
								}
							}
						}
						var isLeague = false;
						var category = 'Nationality';
						if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'currentLeagueId')) {
							isLeague = true;
							category = 'Current_league';
						}
						var leagueSummary = [], i;
						for (i in leagues) {
							if (isLeague)
								var name = Foxtrick.XMLData.League[i].LeagueName;
							else
								var name = Foxtrick.XMLData.League[
									Foxtrick.XMLData.countryToLeague[i]
								].LeagueName;
							leagueSummary.push({ name: name, count: leagues[i] });
						}
						leagueSummary.sort(function(a, b) { return a.name.localeCompare(b.name) });
						leagueSummary.sort(function(a, b) { return b.count - a.count });
						for (var i = 0; i < leagueSummary.length; ++i) {
							addRow(category, leagueSummary[i].name, leagueSummary[i].count);
						}
					}
				}
			}

			var old_table = doc.getElementById('team-stats-table');
			if (old_table)
				old_table.parentNode.replaceChild(table, old_table);
			else
				boxBody.appendChild(table);
			var old_note = boxBody.getElementsByClassName('ft-note')[0];
			if (old_note)
				old_note.parentNode.removeChild(old_note);

		} catch (e) {
			Foxtrick.log(e);
		}
		};

		var	box = doc.getElementById('ft-team-stats-box');
		if (!box) {
			var	boxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrick.L10n.getString('TeamStats.boxheader');
			var box = Foxtrick.addBoxToSidebar(doc, header, boxBody, 1);
			box.id = 'ft-team-stats-box';

			var loading = Foxtrick.util.note.createLoading(doc);
			boxBody.appendChild(loading);
		}
		else {
			var boxBody = box.getElementsByTagName('div')[0];
		}
		Foxtrick.Pages.Players.getPlayerList(doc,
		  function(list) {
			try {
				Foxtrick.preventChange(doc, show)(list);
			}
			catch (e) {
				Foxtrick.log(e);
				boxBody.removeChild(loading);
			}
		});
	}
};
