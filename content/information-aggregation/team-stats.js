/**
 * team-stats.js
 * Foxtrick team overview
 * @author OBarros, spambot, convinced, ryanli, LA-MJ
 */

'use strict';

Foxtrick.modules.TeamStats = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['allPlayers', 'youthPlayers'],
	OPTIONS: [
		'General', 'Attributes', 'Skills', 'Match', 'Specialty',
		'Personality', 'Status', 'Current_league',
	],
	NICE: -1, // before FoxtrickLinksPlayers

	CSS: Foxtrick.InternalPath + 'resources/css/team-stats.css',

	/** @param {document} doc */
	run: function(doc) {
		// delay execution after YouthSkills
		if (Foxtrick.isPage(doc, 'ownYouthPlayers') &&
		    Foxtrick.Prefs.isModuleEnabled('YouthSkills'))
			return;

		this.execute(doc);
	},

	/** @param {document} doc */
	execute: function(doc) {
		/** @type {Element} */
		var box = doc.getElementById('ft-team-stats-box');
		var boxBody = box ? box.querySelector('div') : null;

		/** @type {HTMLElement} */
		var loading = null;
		if (!box) {
			boxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			let header = Foxtrick.L10n.getString('TeamStats.boxheader');
			box = Foxtrick.addBoxToSidebar(doc, header, boxBody, 1);
			if (!box)
				return;

			box.id = 'ft-team-stats-box';
			box.querySelector('h2').id = 'ft-team-stats-header';

			loading = Foxtrick.util.note.createLoading(doc);
			boxBody.appendChild(loading);
		}

		/** @param {Player[]} playerList */
		// eslint-disable-next-line complexity
		var show = function(playerList) {
			var methods = {
				/**
				 * @param  {any} val
				 * @param  {number} numPlayers
				 * @return {HTMLElement}
				 */
				sumAvg: function(val, numPlayers) {
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

				/**
				 * @param  {any} val
				 * @param  {number} numPlayers
				 * @return {number}
				 */
				average: function(val, numPlayers) {
					return Math.round(val / numPlayers);
				},

				/**
				 * @param  {any} val
				 * @param  {number} numPlayers
				 * @return {HTMLElement}
				 */
				skill: function(val, numPlayers) {
					var span = doc.createElement('span');
					var avg = val / numPlayers;
					span.textContent = avg.toFixed(1);
					span.title = Foxtrick.L10n.getFullLevelByValue(avg);
					return span;
				},

				/**
				 * @param  {any} val
				 * @param  {number} _
				 * @return {number}
				 */
				age: function(val, _) {
					return val;
				},
			};

			/**
			 * @typedef TeamStatsOpt
			 * @prop {PlayerKey} property
			 * @prop {string} name l10n key for property
			 * @prop {string} category l10n key for category
			 * @prop {keyof methods} method
			 * @prop {PAGE[]} pages
			 * @prop {any} [value]
			 */

			/**
			 * @type {TeamStatsOpt[]}
			 */
			/* eslint-disable max-len */
			var attributeOptions = [
				{ category: 'TeamStats.General',	name: 'TSI.abbr', 		property: 'tsi', 		method: 'sumAvg',	pages: ['allPlayers'] },

				// { category: 'TeamStats.General',	name: 'Age', 			property: 'ageYears', 	method: 'age',		pages: ['players', 'youthPlayers'] },
				{ category: 'TeamStats.General',	name: 'Salary', 		property: 'salary', 	method: 'sumAvg',	pages: ['players', 'oldPlayers', 'oldCoaches'] },
				{ category: 'TeamStats.Attributes', name: 'Form', 			property: 'form', 		method: 'skill',	pages: ['allPlayers'] },
				{ category: 'TeamStats.Attributes', name: 'Stamina', 		property: 'stamina', 	method: 'skill',	pages: ['allPlayers'] },
				{ category: 'TeamStats.Attributes', name: 'Experience', 	property: 'experience', method: 'skill',	pages: ['allPlayers'] },
				{ category: 'TeamStats.Attributes', name: 'Loyalty', 		property: 'loyalty', 	method: 'skill',	pages: ['allPlayers'] },
				{ category: 'TeamStats.Attributes', name: 'Leadership', 	property: 'leadership', method: 'skill',	pages: ['allPlayers'] },
				{ category: 'TeamStats.Skills', 	name: 'Keeper', 		property: 'keeper', 	method: 'skill',	pages: ['ownPlayers'] },
				{ category: 'TeamStats.Skills', 	name: 'Defending', 	property: 'defending', method: 'skill',	pages: ['ownPlayers'] },
				{ category: 'TeamStats.Skills', 	name: 'Playmaking', 	property: 'playmaking', method: 'skill',	pages: ['ownPlayers'] },
				{ category: 'TeamStats.Skills', 	name: 'Winger', 		property: 'winger', 	method: 'skill',	pages: ['ownPlayers'] },
				{ category: 'TeamStats.Skills', 	name: 'Passing', 		property: 'passing', 	method: 'skill',	pages: ['ownPlayers'] },
				{ category: 'TeamStats.Skills', 	name: 'Scoring', 		property: 'scoring', 	method: 'skill',	pages: ['ownPlayers'] },
				{ category: 'TeamStats.Skills', 	name: 'Set_pieces', 	property: 'setPieces', method: 'skill',	pages: ['ownPlayers'] },

				/*
				{ category: 'TeamStats.Skills', name: 'HTMS_Ability', 		property: 'htmsAbility', 	method: 'average', pages: ['players'] },
				{ category: 'TeamStats.Skills', 	name: 'HTMS_Potential', 	property: 'htmsPotential' , pages: ['players'] },
				{ category: 'TeamStats.Attributes', name: 'Agreeability', 		property: 'agreeability', 	pages: ['players'] },
				{ category: 'TeamStats.Attributes', name: 'Aggressiveness', 	property: 'aggressiveness', pages: ['players'] },
				{ category: 'TeamStats.Attributes', name: 'Honesty', 			property: 'honesty', 		pages: ['players'] },
				*/

				{ category: 'Match', 	name: 'Last_stars', 			property: 'lastRating', 			method: 'sumAvg',	pages: ['players', 'youthPlayers'] },

				/*
				{ category: 'Match', 	name: 'Last_stars_EndOfGame', 	property: 'lastRatingEndOfGame', 	method: 'sumAvg',	pages: ['players'] },
				{ category: 'Match', 	name: 'Last_stars_decline', 	property: 'lastRatingDecline', 	method: 'sumAvg',	pages: ['players'] }
				*/
			];
			/* eslint-enable max-len */

			for (let opt of attributeOptions)
				opt.value = 0;

			const OLD_YOUTH_THRESHOLD = 19;
			const MIN_LINEUP_CT = 9;

			var numPlayers = 0;
			var totalAge = 0;
			var older = 0;
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
			var hasSpecialties = false;

			/** @type {Record<string, number>} */
			var specialties = {};

			var DAYS_IN_SEASON = Foxtrick.util.time.DAYS_IN_SEASON;

			for (let current of playerList) {
				if (current.hidden)
					continue;

				++numPlayers;

				if (current.age)
					totalAge += current.age.years * DAYS_IN_SEASON + current.age.days;

				if (current.age.years >= OLD_YOUTH_THRESHOLD)
					++older;

				if (current.specialty) {
					if (!specialties[current.specialty]) {
						hasSpecialties = true;
						specialties[current.specialty] = 0;
					}
					++specialties[current.specialty];
				}
				if (current.transferListed)
					++transferListed;

				if (current.yellowCard === 1)
					++yellowCards;

				if (current.yellowCard === 2)
					++twoYellowCards;

				if (current.redCard)
					++redCards;

				if (current.injuredWeeks) {
					++injured;
					injuredWeeks += current.injuredWeeks;
				}
				if (current.bruised)
					++bruised;

				if (typeof current.agreeability !== 'undefined')
					totalAgreeability += current.agreeability;

				if (typeof current.aggressiveness !== 'undefined')
					totalAggressiveness += current.aggressiveness;

				if (typeof current.honesty !== 'undefined')
					totalHonesty += current.honesty;


				// sum attributeOptions values
				for (let opt of attributeOptions) {
					if (!Foxtrick.isPage(doc, opt.pages))
						continue;
					if (typeof current[opt.property] == 'undefined')
						continue;

					opt.value += current[opt.property];
				}
			}

			// Foxtrick.log('attributeOptions',attributeOptions);
			// Foxtrick.log('playerList',playerList)

			var table = doc.createElement('table');
			table.id = 'team-stats-table';


			/**
			 * @param {HTMLTableRowElement} row summary row
			 * @param {string} filter value of the option under foxtrick-filter-select
			 * @param {string} title row title
			 * @param {Element} labelCell
			 * @param {Element} dataCell
			 */
			var addFilterShortcut = function(row, filter, title, labelCell, dataCell) {
				row.setAttribute('style', 'cursor:pointer');
				row.title = `${Foxtrick.L10n.getString('TeamStats.FilterFor')} ${title}`;

				labelCell.setAttribute('aria-label', row.title + '.');
				labelCell.id = 'ft-team-stats-filter-' + Math.random().toString(16).slice(2);
				dataCell.id = 'ft-team-stats-filter-ct-' + Math.random().toString(16).slice(2);
				let label = `ft-team-stats-header ${labelCell.id} ${dataCell.id} ft-team-stats-ct`;
				row.setAttribute('aria-labelledby', label);

				Foxtrick.onClick(row, function() {
					// eslint-disable-next-line no-invalid-this
					var doc = this.ownerDocument;
					var win = doc.defaultView;

					/** @type {HTMLSelectElement} */
					var filterSelect = doc.querySelector('#foxtrick-filter-select');

					// init filters
					filterSelect.dispatchEvent(new Event('change'));

					// set filter
					filterSelect.value = filter;

					// call filter
					filterSelect.dispatchEvent(new Event('change'));

					win.scroll(0, 0);
					let main = doc.getElementById('mainBody');
					win.scrollBy(0, main.offsetTop);
				});
			};


			/**
			 * label and data could either be strings or document nodes
			 *
			 * @param  {string} category category name
			 * @param  {string|Element} label labelCell contents
			 * @param  {string|number|Element} data dataCell contents
			 * @param  {string} [filter] value of the option under foxtrick-filter-select
			 * @param  {string} [title] row title
			 * @return {HTMLTableRowElement} summary row
			 */
			var addRow = function(category, label, data, filter, title) {
				var className = category.replace(/^TeamStats\./, '');
				var tbody = table.querySelector(`.TeamStats-${className}`);
				if (!tbody) {
					tbody = doc.createElement('tbody');
					tbody.className = `TeamStats-${className}`;
					let row = doc.createElement('tr');
					let header = doc.createElement('th');
					header.colSpan = 2;
					header.textContent = Foxtrick.L10n.getString(category);
					row.appendChild(header);
					tbody.appendChild(row);
					table.appendChild(tbody);
				}

				var row = doc.createElement('tr');

				let labelCell = doc.createElement('td');
				labelCell.className = 'ch';
				if (typeof label === 'object')
					labelCell.appendChild(label);
				else
					labelCell.textContent = label;

				row.appendChild(labelCell);

				let dataCell = doc.createElement('td');
				if (typeof data === 'object')
					dataCell.appendChild(data);
				else
					dataCell.textContent = String(data);

				row.appendChild(dataCell);
				if (filter && Foxtrick.Prefs.isModuleEnabled('PlayerFilters'))
					addFilterShortcut(row, filter, title, labelCell, dataCell);

				tbody.appendChild(row);
				return row;
			};

			if (numPlayers) {

				if (Foxtrick.Prefs.isModuleOptionEnabled('TeamStats', 'General')) {
					let data = doc.createElement('span');
					let total = doc.createElement('span');
					total.className = 'nowrap';
					total.textContent = String(playerList.length);
					total.setAttribute('title', Foxtrick.L10n.getString('TeamStats.Total'));
					let selected = doc.createElement('span');
					selected.className = 'nowrap';
					selected.textContent = String(numPlayers);
					selected.setAttribute('title', Foxtrick.L10n.getString('TeamStats.Selected'));
					data.appendChild(selected);
					data.appendChild(doc.createTextNode(' / '));
					data.appendChild(total);
					{
						let playersL10n = Foxtrick.L10n.getString('TeamStats.Players');
						let row = addRow('TeamStats.General', playersL10n, data);
						row.cells[0].id = 'ft-team-stats-ct';
					}

					if (totalAge) {
						let avgAge = Math.round(totalAge / numPlayers);
						let avgYears = Math.floor(avgAge / DAYS_IN_SEASON);
						let avgDays = avgAge % DAYS_IN_SEASON;
						let agel10n = Foxtrick.L10n.getString('Age');
						addRow('TeamStats.General', agel10n, `${avgYears}.${avgDays}`);
					}
					if (Foxtrick.Pages.Players.isYouth(doc)) {
						let notOldL10n = Foxtrick.L10n.getString('TeamStats.PlayerNotToOld');
						let oldL10n = Foxtrick.L10n.getString('TeamStats.PlayerToOld');

						let youngerThanNineteen = numPlayers - older;
						let row = addRow('TeamStats.General', notOldL10n, youngerThanNineteen);
						if (youngerThanNineteen < MIN_LINEUP_CT)
							row.className = 'red';

						if (older) {
							let row = addRow('TeamStats.General', oldL10n, older);
							row.className = 'red';
						}
					}
				}

				for (let opt of attributeOptions) {
					if (!Foxtrick.isPage(doc, opt.pages))
						continue;

					let optName = opt.category.replace(/.+\./, '');
					if (!Foxtrick.Prefs.isModuleOptionEnabled('TeamStats', optName))
						continue;

					if (!Foxtrick.Pages.Players.isPropertyInList(playerList, opt.property))
						continue;

					let text = methods[opt.method](opt.value, numPlayers);
					addRow(opt.category, Foxtrick.L10n.getString(opt.name), text);
				}

				if (Foxtrick.Prefs.isModuleOptionEnabled('TeamStats', 'Specialty')) {
					if (hasSpecialties) {
						/** @type {{ type: string, count: number }[]} */
						let specSummary = [];
						for (let specialty in specialties) {
							specSummary.push({
								type: specialty,
								count: specialties[specialty],
							});
						}
						specSummary.sort((a, b) => a.type.localeCompare(b.type));
						specSummary.sort((a, b) => b.count - a.count);

						for (let spec of specSummary) {
							let { type, count } = spec;
							let filter = `specialty-${Foxtrick.L10n.getEnglishSpecialty(type)}`;
							addRow('Specialty', type, count, filter, type);
						}
					}
				}
				if (Foxtrick.Prefs.isModuleOptionEnabled('TeamStats', 'Personality')) {
					/** @type {PlayerKey[]} */
					let props = ['aggressiveness', 'agreeability', 'honesty'];
					if (props.every(p => Foxtrick.Pages.Players.isPropertyInList(playerList, p))) {
						let l10n = props.map(k => k.slice(0, 1).toUpperCase() + k.slice(1));
						let totals = [totalAggressiveness, totalAgreeability, totalHonesty];
						let avgs = totals.map(t => Math.round(t / numPlayers));
						for (let [i, prop] of props.entries()) {
							let lKey = l10n[i];
							let avg = avgs[i];

							let l10nstring = Foxtrick.L10n.getString(lKey);
							let level = Foxtrick.L10n.getLevelByTypeAndValue(prop, avg);
							addRow('Personality', l10nstring, level);
						}
					}
				}
				if (Foxtrick.Prefs.isModuleOptionEnabled('TeamStats', 'Status')) {
					if (transferListed > 0) {
						let img = doc.createElement('img');
						img.src = '/Img/Icons/dollar.gif';
						img.alt = Foxtrick.L10n.getString('TransferListed');
						img.className = 'transferListed';
						addRow('Status', img, transferListed, 'transfer-listed',
						       Foxtrick.L10n.getString('TeamStats.TransferListed'));
					}
					if (yellowCards > 0) {
						let img = doc.createElement('img');
						img.src = '/Img/Icons/yellow_card.gif';
						img.alt = Foxtrick.L10n.getString('Yellow_card');
						img.className = 'cardsOne';
						addRow('Status', img, yellowCards, 'cards',
						       Foxtrick.L10n.getString('TeamStats.Cards'));
					}
					if (twoYellowCards > 0) {
						let img = doc.createElement('img');
						img.src = '/Img/Icons/dual_yellow_card.gif';
						img.alt = '2 ' + Foxtrick.L10n.getString('Yellow_card');
						img.className = 'cardsTwo';
						addRow('Status', img, twoYellowCards, 'cards',
						       Foxtrick.L10n.getString('TeamStats.Cards'));
					}
					if (redCards > 0) {
						let img = doc.createElement('img');
						img.src = '/Img/Icons/red_card.gif';
						img.alt = Foxtrick.L10n.getString('Red_card');
						img.className = 'cardsOne';
						addRow('Status', img, redCards, 'cards',
						       Foxtrick.L10n.getString('TeamStats.Cards'));
					}
					if (bruised > 0) {
						let img = doc.createElement('img');
						img.src = '/Img/Icons/bruised.gif';
						img.alt = Foxtrick.L10n.getString('Bruised');
						img.className = 'injuryBruised';
						addRow('Status', img, bruised, 'injured',
						       Foxtrick.L10n.getString('TeamStats.Injured'));
					}
					if (injured > 0) {
						let img = doc.createElement('img');
						img.src = '/Img/Icons/injured.gif';
						img.alt = Foxtrick.L10n.getString('Injured');
						img.className = 'injuryInjured';

						let data = doc.createElement('span');
						data.textContent = String(injured);
						data.appendChild(doc.createTextNode(' ('));
						let weeks = doc.createElement('strong');
						weeks.textContent = String(injuredWeeks);
						data.appendChild(weeks);
						data.appendChild(doc.createTextNode(')'));

						addRow('Status', img, data, 'injured',
						       Foxtrick.L10n.getString('TeamStats.Injured'));
					}
				}
				if (Foxtrick.Prefs.isModuleOptionEnabled('TeamStats', 'Current_league')) {
					if (Foxtrick.Pages.Players.isPropertyInList(playerList, 'currentLeagueId') ||
					    Foxtrick.Pages.Players.isPropertyInList(playerList, 'countryId')) {

						/** @type {Record<number, number>} */
						let leageCounts = {};
						for (let player of playerList) {
							let id = player.currentLeagueId || player.countryId;
							if (typeof id !== 'undefined') {
								if (typeof leageCounts[id] === 'undefined')
									leageCounts[id] = 1;
								else
									++leageCounts[id];
							}
						}
						let isCountry = true;
						let category = 'Nationality';
						let cli =
							Foxtrick.Pages.Players.isPropertyInList(playerList, 'currentLeagueId');

						if (cli) {
							isCountry = false;
							category = 'Current_league';
						}

						/** @type {{ name: string, count: number }[]} */
						let leagueSummary = [];
						for (let k of Object.keys(leageCounts)) {
							let id = Number(k);
							let leagueId =
								isCountry ? Foxtrick.XMLData.getLeagueIdByCountryId(id) : id;

							let name = Foxtrick.L10n.getCountryName(leagueId);
							leagueSummary.push({ name, count: leageCounts[id] });
						}
						leagueSummary.sort((a, b) => a.name.localeCompare(b.name));
						leagueSummary.sort((a, b) => b.count - a.count);

						for (let league of leagueSummary)
							addRow(category, league.name, league.count);
					}
				}
			}

			let oldTable = doc.getElementById('team-stats-table');
			if (oldTable)
				oldTable.parentNode.replaceChild(table, oldTable);
			else
				boxBody.appendChild(table);

			let oldNote = boxBody.querySelector('.ft-note');
			if (oldNote)
				oldNote.remove();
		};

		Foxtrick.Pages.Players.getPlayerList(doc, function(list) {
			if (!list || !list.length) {
				box.remove();
				return;
			}

			/** @param {Player[]} list */
			var cb = (list) => {
				try {
					show(list);
				}
				catch (e) {
					Foxtrick.log(e);
					boxBody.removeChild(loading);
				}
			};

			Foxtrick.preventChange(doc, cb)(list);
		});
	},
};
