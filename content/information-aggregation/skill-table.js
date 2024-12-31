/* eslint-disable complexity */
/**
 * skill-table.js
 * Show a skill table on players list page
 * @author convincedd, ryanli, LA-MJ
 */

'use strict';

Foxtrick.modules.SkillTable = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['allPlayers', 'youthPlayers', 'transferSearchResult'],
	OPTIONS: ['FrozenColumns', 'OtherTeams', 'ColouredYouth', 'FullNames'],
	CSS: Foxtrick.InternalPath + 'resources/css/skilltable.css',

	/**
	 * Update player link browseIds and table UI
	 * based on visible rows and their order.
	 * Can be called from other modules.
	 *
	 * table and playerIdList are optional.
	 * @param {document}         doc
	 * @param {HTMLTableElement} [skillTable]
	 * @param {string}           [playerIdList]
	 */
	updateUI: function(doc, skillTable, playerIdList) {
		const BROWSEIDS_RE = /BrowseIds=([0-9,]+)$/i;

		// player links are only in the first table
		let table = skillTable || doc.querySelector('.ft_skilltable');
		if (!table)
			return;

		let rows = Foxtrick.toArray(table.rows).slice(1); // skip header
		let visibleRows = Foxtrick.filter(function(row) {
			return !Foxtrick.hasClass(row, 'hidden');
		}, rows);

		let browseIds = playerIdList;
		if (!browseIds) {
			browseIds = Foxtrick.map(function(row) {
				return row.getAttribute('playerid');
			}, visibleRows).join(',');
		}
		browseIds = 'BrowseIds=' + browseIds;

		Foxtrick.forEach(function(row) {
			/** @type {HTMLAnchorElement} */
			let playerLink = row.querySelector('.ft-skilltable_player a');
			if (!playerLink)
				return;

			if (BROWSEIDS_RE.test(playerLink.href))
				playerLink.href = playerLink.href.replace(BROWSEIDS_RE, browseIds);
			else
				playerLink.href += '&' + browseIds;

		}, visibleRows);

		let hasHidden = rows.length !== visibleRows.length;
		let restoreBtn = doc.getElementById('ft_skilltable_restoreHidden');
		if (hasHidden)
			Foxtrick.removeClass(restoreBtn, 'hidden');
		else
			Foxtrick.addClass(restoreBtn, 'hidden');
	},

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		const TABLE_DIV_ID = 'ft_skilltablediv';

		const useFrozen = Foxtrick.Prefs.isModuleOptionEnabled(module, 'FrozenColumns');
		const useFullNames = Foxtrick.Prefs.isModuleOptionEnabled(module, 'FullNames');

		/** @type {(fullType?: SkillTableType) => void} */
		var createTable;
		var generateTable;

		/**
		 * @typedef {'senior'|'youth'|'transfer'|'oldiesAndOwn'} SkillTablePageType
		 * @typedef {'own'|'others'|'nt'|'oldiesCoach'} SkillTablePageSubType
		 * @typedef SkillTableType
		 * @prop {SkillTablePageType} type
		 * @prop {SkillTablePageSubType} [subType]
		 */
		/**
		 * Get the full skill table type
		 *
		 * @param  {document} doc
		 * @return {SkillTableType}
		 */
		var getFullType = function(doc) {
			/** @type {SkillTablePageType} */
			let type;

			/** @type {SkillTablePageSubType} */
			let subType;

			if (Foxtrick.Pages.TransferSearchResults.isPage(doc)) {
				type = 'transfer';
				return { type, subType };
			}

			if (Foxtrick.Pages.Players.isSenior(doc)) {
				type = 'senior';
				if (Foxtrick.Pages.Players.isOwn(doc))
					subType = 'own';
				else if (Foxtrick.Pages.Players.isNT(doc))
					subType = 'nt';
				else if (Foxtrick.Pages.Players.isOldies(doc) ||
				         Foxtrick.Pages.Players.isCoaches(doc))
					subType = 'oldiesCoach';
				else
					subType = 'others';
			}
			else if (Foxtrick.Pages.Players.isYouth(doc)) {
				type = 'youth';
				if (Foxtrick.isPage(doc, 'ownYouthPlayers'))
					subType = 'own';
				else
					subType = 'others';
			}

			return { type, subType };
		};

		/**
		 * @param  {SkillTableType} fullType
		 * @return {string}
		 */
		var fullTypeToString = function(fullType) {
			if (fullType.subType)
				return fullType.type + '.' + fullType.subType;

			return fullType.type;
		};

		/**
		 * @param  {SkillTableType} fullType
		 * @param  {string}  name
		 * @return {boolean}
		 */
		var getColumnEnabled = function(fullType, name) {
			let type = fullTypeToString(fullType);
			return Foxtrick.Prefs.getBool('module.SkillTable.' + type + '.' + name);
		};

		/**
		 * @param  {SkillTableType} fullType
		 * @param  {string}  name
		 * @param  {boolean} enabled
		 */
		var setColumnEnabled = function(fullType, name, enabled) {
			let type = fullTypeToString(fullType);
			Foxtrick.Prefs.setBool('module.SkillTable.' + type + '.' + name, enabled);
		};

		/**
		 * @return {{last: number, second: number}}
		 */
		var getLastMatchDates = function() {

			/**
			 * @param  {Element} playerInfo
			 * @return {number}
			 */
			var getMatchDate = function(playerInfo) {
				let links = playerInfo.querySelectorAll('a');
				let matchLink = Foxtrick.nth(function(link) {
					return /matchid/i.test(link.href);
				}, links);
				if (matchLink) {
					let date = Foxtrick.util.time.getDateFromText(matchLink.textContent);
					return date.getTime();
				}
				return 0;
			};

			let players = doc.querySelectorAll('.playerInfo');

			// (assumes that if there are less then 3 players at a match date
			// those were transfers and disregards them)
			const MIN_PLAYER_CT = 3;
			return Foxtrick.Pages.Players.getLastMatchDates(players, getMatchDate, MIN_PLAYER_CT);
		};

		/** @type {Listener<HTMLAnchorElement,MouseEvent>} */
		var addHomegrown = function() {
			// eslint-disable-next-line no-invalid-this
			Foxtrick.toggleClass(this, 'hidden');

			createTable({ type: 'oldiesAndOwn' });
		};

		/** @param {document} doc */
		var showOldiesAndOwn = function(doc) {
			// get normal oldies into oldiesList
			Foxtrick.Pages.Players.getPlayerList(doc, (oldiesList) => {
				// then get current squad (last parameter true) into currentSquadList
				Foxtrick.Pages.Players.getPlayerList(doc, (currentSquadList) => {
					// filter, concat with oldies and display
					let grownSquad = Foxtrick.filter(n => !!n.motherClubBonus, currentSquadList);
					let fullList = oldiesList.concat(grownSquad);

					Foxtrick.preventChange(doc, generateTable)(fullList);

				}, { currentSquad: true });
			});
		};

		/** @param {Player[]} players */
		generateTable = function(players) {
			/** @type {HTMLElement} */
			var tableDiv;

			/** @type {{last: number, second: number}} */
			var lastMatches;

			/** @type {SkillTableType} */
			var fullType;

			/**
			 * @typedef SkillTableColumn column used for skill table
			 * @prop {boolean} [available] set automatically
			 * @prop {boolean} [enabled] set automatically
			 * @prop {string} name name of the column, used for fetching l10n string
			 * @prop {keyof Player} [property] player value
			 * @prop {(keyof Player)[]} [properties] player values
			 * @prop {boolean} [frozen] whether this column should be frozen in fixed mode
			 * @prop {string} [method] which RENDERER function to use to attach data to cell;
			 *                         By default the data is appended to the cell as plain text
			 * @prop {boolean} [sortAsc] whether to sort the column in ascending order
			 * @prop {boolean} [sortAsString] treat column values as string, not number;
			 *                                sortAsc is always true for such
			 * @prop {boolean} [alignRight] whether to align the data cells to the right
			 * @prop {string} [img] image url used in table headers as substitution of text
			 * @prop {string} [title] player property to use for cell title
			 * @prop {string} [listener] one of LISTENERS to use as click handler
			 */

			/* eslint-disable comma-dangle */
			/* eslint-disable object-property-newline */

			/** @type {SkillTableColumn[]} */
			var COLUMNS = [
				{ name: 'SkillTableHide', property: 'id',
					method: 'hide', listener: 'hide', sortAsc: true, frozen: true, },
				{ name: 'PlayerNumber', property: 'number', sortAsc: true, frozen: true, },
				{ name: 'PlayerId', property: 'id', sortAsc: true, frozen: true, },
				{ name: 'PlayerCategory', property: 'category',
					method: 'category', sortAsc: true, frozen: true, },
				{ name: 'Nationality', property: 'countryId',
					method: 'nationality', sortAsString: true, frozen: true, },
				{ name: 'Player', properties: ['nameLink', 'nationalTeamId', 'trainerData'],
					method: 'playerName', sortAsString: true, frozen: true, },
				{ name: 'Specialty', property: 'specialty',
					method: 'specialty', sortAsString: true, frozen: true, },
				{ name: 'Status', properties: [
					'yellowCard', 'redCard', 'bruised', 'injured', 'injuredWeeks', 'transferListed',
				], method: 'status', frozen: true, },
				{ name: 'Age', property: 'age', method: 'age', sortAsc: true, frozen: true, },
				{ name: 'CanBePromotedIn', property: 'canBePromotedIn',
					method: 'promotion', frozen: true, },
				{ name: 'CurrentBid', property: 'currentBid',
					method: 'formatNum', alignRight: true, frozen: true, },
				{ name: 'Bookmark', property: 'bookmarkLink', method: 'link',
					sortAsString: true, frozen: true, },
				{ name: 'Hotlist', property: 'hotlistLink',
					method: 'link', sortAsString: true, frozen: true, },
				{ name: 'CurrentBidder', property: 'currentBidderLink',
					method: 'link', sortAsString: true, },
				{ name: 'CurrentBidderShort', property: 'currentBidderLinkShort',
					method: 'link', sortAsString: true, },
				{ name: 'JoinedSince', property: 'joinedSince', method: 'dateDiff', },
				{ name: 'TSI', property: 'tsi', alignRight: true, method: 'formatNum', },
				{ name: 'Leadership', property: 'leadership', method: 'skill', },
				{ name: 'Experience', property: 'experience', method: 'skill', },
				{ name: 'Form', property: 'form', method: 'skill', },
				{ name: 'Stamina', property: 'stamina', method: 'skill', },
				{ name: 'StaminaPrediction', property: 'staminaPrediction',
					method: 'staminaPrediction', },
				{ name: 'Loyalty', property: 'loyalty', method: 'skill', },
				{ name: 'MotherClubBonus', property: 'motherClubBonus',
					method: 'object', sortAsString: true, },
				{ name: 'Keeper', property: 'keeper', method: 'skill', },
				{ name: 'Defending', property: 'defending', method: 'skill', },
				{ name: 'Playmaking', property: 'playmaking', method: 'skill', },
				{ name: 'Winger', property: 'winger', method: 'skill', },
				{ name: 'Passing', property: 'passing', method: 'skill', },
				{ name: 'Scoring', property: 'scoring', method: 'skill', },
				{ name: 'Set_pieces', property: 'setPieces', method: 'skill', },
				{ name: 'PsicoTSI', property: 'psicoTSI', alignRight: true,
					method: 'formatNum', title: 'psicoTitle', },
				{
					name: 'PsicoWage', property: 'psicoWage', alignRight: true,
					method: 'formatNum', title: 'psicoTitle',
				},
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
					method: 'position', sortAsString: true, },
				{ name: 'Salary', property: 'salary', alignRight: true, method: 'formatNum', },
				{
					name: 'SalaryBase', property: 'salaryBase', alignRight: true,
					method: 'formatNum',
				},
				{ name: 'IsAbroad', property: 'isAbroad', method: 'bool', },
				{ name: 'U20Match', property: 'u21', method: 'def' },
				{ name: 'NrOfMatches', property: 'matchCount', }, // NT
				{ name: 'TeamMatches', property: 'matchesCurrentTeam', },
				{ name: 'LeagueGoals', property: 'leagueGoals', },
				{ name: 'CupGoals', property: 'cupGoals', },
				{ name: 'FriendliesGoals', property: 'friendliesGoals', },
				{ name: 'TeamGoals', property: 'goalsCurrentTeam', },
				{ name: 'CareerGoals', property: 'careerGoals', },

				{ name: 'Hattricks', property: 'careerHattricks', },
				{ name: 'Deadline', property: 'deadline', method: 'dateCell', },
				{ name: 'Current_club', property: 'currentClubLink',
					method: 'link', sortAsString: true, },
				{ name: 'Current_league', property: 'currentLeagueId',
					method: 'league', sortAsString: true, },
				{
					name: 'OwnerNotes', property: 'ownerNotes',
					method: 'notes', sortAsString: true,
				},
				{ name: 'TransferCompare', property: 'transferCompare', method: 'link', },
				{ name: 'PerformanceHistory', property: 'performanceHistory', method: 'link', },
				{ name: 'TwinLink', property: 'twinLink',
					img: Foxtrick.InternalPath + 'resources/img/twins/twin.png', method: 'link', },
				{ name: 'HyLink', property: 'hyLink', method: 'link', },
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
				{ name: 'BestPosition', property: 'bestPosition', sortAsString: true, },
				{ name: 'BestPositionValue', property: 'bestPositionValue', },
				{ name: 'MercattrickStats.filters', property: 'mtFilters',
					img: Foxtrick.modules['MercattrickStats'].IMAGES.FILTERS, },
				{ name: 'MercattrickStats.bookmarks', property: 'mtBookmarks',
					img: Foxtrick.modules['MercattrickStats'].IMAGES.BOOKMARKS, },
			];
			/* eslint-enable comma-dangle */
			/* eslint-enable object-property-newline */

			/**
			 * functions used to attach data to table cell
			 * should not touch table row: needs to handle split table
			 *
			 * should be a function with two arguments,
			 * first is table cell(td), second is raw data from playerList.
			 *
			 * If properties is given (multiple column),
			 * then the player object is given as data
			 *
			 * if property is given instead (single column),
			 * the specified property is given.
			 *
			 * By default the data is treated as plain text and appended to the cell.
			 */
			var RENDERERS = {
				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {number} id
				 */
				hide: function(cell, id) {
					let l10n = Foxtrick.L10n.getString('SkillTableHide');
					cell.textContent = '–';
					cell.setAttribute('aria-label', cell.title = l10n);
					cell.setAttribute('index', cell.dataset.id = String(id));
				},

				def: function(cell, def) {
					if (!def)
						return;

					let { value, text, title } = def;
					cell.setAttribute('index', String(value));
					cell.setAttribute('aria-label', cell.title = title);
					cell.textContent = text;
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {number} cat
				 */
				category: function(cell, cat) {
					// TODO extract to util
					const CATEGORIES = ['GK', 'WB', 'CD', 'W', 'IM', 'FW', 'S', 'R', 'E1', 'E2'];
					let category = CATEGORIES[cat - 1];
					cell.textContent = Foxtrick.L10n.getString('categories.' + category);
					cell.setAttribute('index', String(cat));
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {HTMLAnchorElement} link
				 */
				link: function(cell, link) {
					cell.appendChild(Foxtrick.cloneElement(link, true));
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {number} countryId
				 */
				nationality: function(cell, countryId) {
					let flag = Foxtrick.util.id.createFlagFromCountryId(doc, countryId);
					if (!flag)
						return;

					cell.appendChild(flag);

					// League name is a -> img.title
					let img = flag.querySelector('img');
					cell.setAttribute('index', img.title);
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {Player} player
				 */
				playerName: function(cell, player) {
					cell.setAttribute('role', 'rowheader');
					Foxtrick.addClass(cell, 'ft-skilltable_player');

					let nameLink = Foxtrick.cloneElement(player.nameLink, true);

					if (!useFullNames && nameLink.dataset.shortName) {
						nameLink.textContent = nameLink.dataset.shortName;
						cell.setAttribute('index', nameLink.dataset.fullName);
					}
					cell.appendChild(nameLink);

					if (player.nationalTeamId)
						cell.appendChild(doc.createTextNode(' (NT)'));

					if (player.trainerData) {
						let coach = Foxtrick.L10n.getString('Coach');

						// TODO promisify
						Foxtrick.addImage(doc, cell, {
							alt: coach,
							title: coach,
							class: 'ft-coach',
							src: Foxtrick.InternalPath + 'resources/img/cap.png',
						});
					}
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {PlayerAge} age
				 */
				age: function(cell, age) {
					Foxtrick.addClass(cell, 'align-left');
					cell.textContent = age.years + '.' + age.days;
					const DAYS_IN_SEASON = Foxtrick.util.time.DAYS_IN_SEASON;
					let index = age.years * DAYS_IN_SEASON + age.days;
					cell.setAttribute('index', String(index));
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {Player} p
				 */
				status: function(cell, p) {
					let index = 0;
					let img;

					/* eslint-disable no-magic-numbers */
					if (p.yellowCard === 1) {
						img = doc.createElement('img');
						img.src = '/Img/Icons/yellow_card.gif';
						img.alt = Foxtrick.L10n.getString('Yellow_card.abbr') + '×1';
						img.title = Foxtrick.L10n.getString('Yellow_card') + '×1';
						cell.appendChild(img);
						index += 10;
					}
					else if (p.yellowCard === 2) {
						img = doc.createElement('img');
						img.src = '/Img/Icons/dual_yellow_card.gif';
						img.alt = Foxtrick.L10n.getString('Yellow_card.abbr') + '×2';
						img.title = Foxtrick.L10n.getString('Yellow_card') + '×2';
						cell.appendChild(img);
						index += 20;
					}
					else if (p.redCard) {
						img = doc.createElement('img');
						img.src = '/Img/Icons/red_card.gif';
						img.alt = Foxtrick.L10n.getString('Red_card.abbr');
						img.title = Foxtrick.L10n.getString('Red_card');
						cell.appendChild(img);
						index += 30;
					}

					if (p.bruised) {
						img = doc.createElement('img');
						img.src = '/Img/Icons/bruised.gif';
						img.alt = Foxtrick.L10n.getString('Bruised.abbr');
						img.title = Foxtrick.L10n.getString('Bruised');
						cell.appendChild(img);
						index += 50;
					}
					else if (p.injuredWeeks || p.injured) {
						img = doc.createElement('img');
						img.src = '/Img/Icons/injured.gif';
						img.alt = Foxtrick.L10n.getString('Injured.abbr');
						img.title = Foxtrick.L10n.getString('Injured');
						cell.appendChild(img);

						// player.injured is number from players page
						// may not be available on the transfer result page
						if (typeof p.injuredWeeks == 'number') {
							let weeks = String(p.injuredWeeks);
							if (p.injuredWeeks == Infinity) {
								weeks = '\u221e';
								index += 1000;
							}
							else {
								index += p.injuredWeeks * 100;
							}
							cell.appendChild(doc.createTextNode(weeks));
						}
						else {
							index += 1000;
						}

					}

					if (p.transferListed) {
						img = doc.createElement('img');
						img.src = '/Img/Icons/dollar.gif';
						img.alt = Foxtrick.L10n.getString('TransferListed.abbr');
						img.title = Foxtrick.L10n.getString('TransferListed');
						cell.appendChild(img);
						index += 1;
					}
					Foxtrick.addClass(cell, 'status');
					cell.setAttribute('index', String(index));
					/* eslint-enable no-magic-numbers */
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {number|YouthSkill} skill
				 * @param {string} property
				 */
				// eslint-disable-next-line complexity
				skill: function(cell, skill, property) {
					if (typeof skill === 'object') {
						// in youth team, returned skill is an object

						// First we sort by the max of current and max skill,
						// (multiplied by 10 since maximum is 9 for youth players)
						// then only the current skill, finally whether it's maxed
						let maxed = skill.maxed ? 0 : 1;
						let index = Math.max(skill.current, skill.max) * 10 +
							skill.current + maxed;

						cell.setAttribute('index', String(index));
						if (skill.maxed)
							cell.className = 'maxed';

						let current = skill.current || '-';
						let max = skill.max || '-';
						cell.textContent = current + '/' + max;

						if (skill.top3)
							Foxtrick.addClass(cell, 'ft-hy-top3-skill');

						// and we deal with colors
						if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'ColouredYouth')) {
							/* eslint-disable no-magic-numbers */
							if (skill.max > 3 || skill.current > 3) {
								// normalized values for convenience in further calculations
								// skills below 4 are not regarded as interesting
								let skillBase = {
									current: Math.max(skill.current - 3, 0),
									max: Math.max(skill.max - 3, 0),
								};

								// default to current
								skillBase.max = skillBase.max || skillBase.current;

								// calculate color for capability of improvement
								let r = 0;
								if (skillBase.max > skillBase.current) {
									let diff = skillBase.max - skillBase.current;
									r = diff / skillBase.max * 255 + 51;
								}
								let g = 255;
								let b = 0;

								// apply alpha, indicating max skill
								let a = 1 - skillBase.max / 5;

								// assuming max skill will never exceed 8...
								a = a < 0 ? 0 : a; // but just to be sure
								if (a != 1) {
									r = Math.round(r + (255 - r) * a);
									g = Math.round(g + (255 - g) * a);
									b = Math.round(b + (255 - b) * a);
								}
								let rgbStr = 'rgb(' + r + ',' + g + ',' + b + ')';
								cell.style.backgroundColor = rgbStr;
							}
							else if (skill.max !== 0) {
								// display unimportant skills/low capabilities in gray
								cell.style.backgroundColor = 'rgb(204,204,204)';
								cell.style.color = 'rgb(102,102,102)';
							}
							/* eslint-enable no-magic-numbers */
						}
					}
					else {
						cell.textContent = String(skill);
						let levelType = property;
						if (!['agreeability', 'aggressiveness', 'honesty'].includes(levelType))
							levelType = 'levels';

						cell.title = Foxtrick.L10n.getLevelByTypeAndValue(levelType, skill);
					}
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {StaminaPrediction} pred
				 */
				staminaPrediction: function(cell, pred) {
					if (pred) {
						let value = String(pred.value);
						cell.textContent = value;
						let htDate = new Date(pred.date);
						let userDate = Foxtrick.util.time.toUser(doc, htDate);
						if (userDate)
							cell.title = Foxtrick.util.time.buildDate(userDate);
						cell.setAttribute('index', parseFloat(value).toFixed(2));
					}
					else {
						cell.textContent = '–';
						cell.title = Foxtrick.L10n.getString('StaminaPrediction.na');
						cell.setAttribute('index', '0');
					}
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {string} spec
				 */
				specialty: function(cell, spec) {
					let specIdx = Foxtrick.L10n.getNumberFromSpecialty(spec);
					if (specIdx) {
						Foxtrick.addSpecialty(cell, specIdx)
							.catch(Foxtrick.catch('SkillTable addSpecialty'));
					}
					cell.setAttribute('index', spec);
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {Player} p
				 */
				lastMatch: function(cell, p) {
					let last = p.lastMatch;
					if (last) {
						let matchDay = p.lastMatchDate.getTime();
						cell.appendChild(last);
						cell.setAttribute('index', String(matchDay));

						if (matchDay == lastMatches.last)
							Foxtrick.addClass(cell, 'latest-match');
						else if (matchDay == lastMatches.second)
							Foxtrick.addClass(cell, 'second-latest-match');

					}
					else {
						cell.setAttribute('index', '0');
					}
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {string} pos
				 */
				position: function(cell, pos) {
					let shortPos = Foxtrick.L10n.getShortPosition(pos);
					let abbr = doc.createElement('abbr');
					abbr.textContent = shortPos;
					abbr.title = pos;
					cell.appendChild(abbr);
					cell.setAttribute('index', shortPos);
				},
				promotion: (cell, days) => {
					cell.textContent = days;
					let today = Foxtrick.util.time.getHTDate(doc);
					if (today) {
						Foxtrick.util.time.setMidnight(today);
						let promoDate = Foxtrick.util.time.addDaysToDate(today, days);
						let title = Foxtrick.util.time.buildDate(promoDate);
						cell.setAttribute('aria-label', cell.title = title);
					}
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {number} leagueId
				 */
				league: function(cell, leagueId) {
					let link = doc.createElement('a');
					link.href = '/World/Leagues/League.aspx?LeagueID=' + leagueId;
					link.textContent = Foxtrick.L10n.getCountryName(leagueId);
					cell.appendChild(link);
				},
				notes: function(cell, notes) {
					if (!notes || !notes.trim())
						return;

					Foxtrick.addImage(doc, cell, {
						alt: notes,
						title: notes,
						class: 'ft-ownerNotes',
						src: Foxtrick.InternalPath + 'resources/img/speak.png',
					});
					cell.setAttribute('index', notes);
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {Date} deadline
				 */
				dateDiff: function(cell, deadline) {
					const MSEC = Foxtrick.util.time.MSECS_IN_SEC;
					let htDate = Foxtrick.util.time.getHTDate(doc);
					if (!htDate)
						return;

					let diff = Math.floor((htDate.getTime() - deadline.getTime()) / MSEC);
					let span = Foxtrick.util.time.timeDiffToSpan(doc, diff, { useDHM: false });
					cell.appendChild(span);

					let user = Foxtrick.util.time.toUser(doc, deadline);
					if (user)
						cell.title = Foxtrick.util.time.buildDate(user);
					Foxtrick.addClass(cell, 'align-left');
					cell.setAttribute('index', String(diff));
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {HTMLTableCellElement} deadline
				 */
				dateCell: function(cell, deadline) {
					let date = Foxtrick.util.time.getDateFromText(deadline.textContent) ||
						Foxtrick.util.time.getDateFromText(deadline.dataset.isodate);

					if (date == null) {
						cell.textContent = deadline.textContent;
						return;
					}

					let clone = Foxtrick.cloneElement(deadline, true);
					let index = date.getTime();
					clone.setAttribute('index', String(index));
					cell.parentNode.replaceChild(clone, cell);
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {number} num
				 */
				formatNum: function(cell, num) {
					cell.className = 'formatted-num';
					cell.textContent = Foxtrick.formatNumber(num, '\u00a0');
					cell.setAttribute('index', String(num));
				},
				bool: function(cell, val) {
					cell.setAttribute('index', String(Number(val)));
					cell.textContent = val ? '✔' : '✕';
				},

				/**
				 * @param {HTMLTableCellElement} cell
				 * @param {Node} val
				 */
				object: function(cell, val) {
					if (val)
						cell.appendChild(val);
				},
			};

			var LISTENERS = {
				/** @type {Listener<HTMLTableCellElement, MouseEvent>} */
				hide: function() {
					let doc = this.ownerDocument;
					let id = this.dataset.id;
					let rows = doc.querySelectorAll('.ft_skilltable tr[playerid="' + id + '"]');
					Foxtrick.forEach(function(row) {
						Foxtrick.addClass(row, 'hidden');
					}, rows);
					module.updateUI(doc);
				},
			};

			var checkAvailableColumns = function() {
				Foxtrick.forEach(function(column) {
					column.available = false;
					if (column.properties) {
						Foxtrick.any(function(prop) {
							if (!Foxtrick.Pages.Players.isPropertyInList(players, prop))
								return false;

							column.available = true;
							column.enabled = getColumnEnabled(fullType, column.name);
							return true;
						}, column.properties);
					}
					else if (column.property) {
						if (Foxtrick.Pages.Players.isPropertyInList(players, column.property)) {
							column.available = true;
							column.enabled = getColumnEnabled(fullType, column.name);
						}
					}
				}, COLUMNS);
			};

			var removeOldElements = function() {
				// clear old tables and loading note
				let oldTables = doc.querySelectorAll('.ft_skilltable');
				Foxtrick.forEach(oldTable => oldTable.remove(), oldTables);

				let oldNotes = doc.querySelector('.ft_skilltable_wrapper .ft-note');
				if (oldNotes)
					oldNotes.remove();

				let oldcustomizeTable = doc.querySelector('.ft_skilltable_customizetable');
				if (oldcustomizeTable)
					oldcustomizeTable.parentNode.removeChild(oldcustomizeTable);
			};

			/**
			 * @param {HTMLTableCellElement} th
			 * @param {SkillTableColumn} column
			 */
			var renderTH = function(th, column) {
				let fullName = Foxtrick.L10n.getString(column.name);
				let abbrName = Foxtrick.L10n.getString(column.name + '.abbr');
				let useAbbr = !!abbrName && fullName !== abbrName;
				if (useAbbr) {
					if (column.img) {
						// TODO convert to async
						Foxtrick.addImage(doc, th, {
							src: column.img,
							alt: abbrName,
							title: fullName,
							ariaLabel: fullName,
						});
					}
					else {
						let abbr = doc.createElement('abbr');
						Foxtrick.setAttributes(abbr, {
							title: fullName,
							ariaLabel: fullName,
							textContent: abbrName,
						});
						th.appendChild(abbr);
					}
				}
				else if (column.img) {
					Foxtrick.addImage(doc, th, {
						src: column.img,
						alt: fullName,
						title: fullName,
					});
				}
				else {
					th.textContent = fullName;
				}
			};

			/**
			 * @param  {SkillTableColumn[]} properties
			 * @return {HTMLTableElement}
			 */
			var createCustomizeTable = function(properties) {
				let table = doc.createElement('table');
				table.className = 'ft_skilltable_customizetable';
				let thead = doc.createElement('thead');
				let tbody = doc.createElement('tbody');
				let headRow = doc.createElement('tr');
				let checkRow = doc.createElement('tr');
				table.appendChild(thead);
				table.appendChild(tbody);
				thead.appendChild(headRow);
				tbody.appendChild(checkRow);

				Foxtrick.forEach(function(prop) {
					if (!prop.available)
						return;

					let th = doc.createElement('th');

					renderTH(th, prop);

					let td = doc.createElement('td');
					let check = doc.createElement('input');
					check.id = prop.name;
					check.type = 'checkbox';

					if (prop.enabled)
						check.setAttribute('checked', 'checked');

					td.appendChild(check);
					headRow.appendChild(th);
					checkRow.appendChild(td);
				}, properties);

				return table;
			};

			/** @param {HTMLTableElement} customizeTable */
			var insertCustomizeTable = function(customizeTable) {
				let wrapper = tableDiv.querySelector('.ft_skilltable_customizewrapper');
				wrapper.appendChild(customizeTable);
			};

			/**
			 * @param {HTMLTableElement} skillTable
			 * @param {string} type
			 */
			var insertSkillTable = function(skillTable, type) {
				let wrapper = tableDiv.querySelector('.ft_skilltable_wrapper' + type);
				wrapper.appendChild(skillTable);
			};

			var setViewMode = function() {
				if (Foxtrick.Prefs.getBool('module.SkillTable.top'))
					Foxtrick.addClass(tableDiv, 'on_top');
			};

			/** @param {ArrayLike<HTMLTableElement>} tables */
			var attachListeners = function(tables) {
				Foxtrick.forEach(function(table) {
					Foxtrick.listen(table, 'click', function(ev) {
						// @ts-ignore
						var target = ev.target.closest('.ft-skilltable_cellBtn');
						if (!target)
							return;

						let handler = LISTENERS[target.dataset.listener];
						if (handler)
							handler.call(target, ev);
					});
				}, tables);
			};

			// eslint-disable-next-line valid-jsdoc
			/** @type {Listener<HTMLTableCellElement, MouseEvent>} */
			var sortClick = function(ev) {
				try {
					// eslint-disable-next-line no-invalid-this, consistent-this
					var th = this;
					var table = th.closest('table');

					/**
					 * @param  {HTMLTableElement} table
					 * @param  {number} idx
					 * @return {boolean}
					 */
					var hasSortIndexForColumn = function(table, idx) {
						return Foxtrick.any(function(n) {
							return n.cells[idx].hasAttribute('index');
						}, table.rows);
					};

					/**
					 * @param  {HTMLTableElement} table
					 * @param  {number} n
					 * @return {boolean}
					 */
					var getSortAsStringFromColumn = function(table, n) {
						let head = table.rows[0].cells[n];
						return !!Number(head.dataset.sortAsString);
					};

					/** @type {NodeListOf<HTMLTableElement>} */
					let tables = doc.querySelectorAll('.ft_skilltable');
					let tableOther = Foxtrick.nth(tbl => tbl !== table, tables);

					// determine sort direction
					let sortAsc = !!Number(th.dataset.sortAsc);
					let lastSortColumnIdx = parseInt(table.dataset.lastSortColumnIdx, 10);
					let sortColumnIdx = Foxtrick.getChildIndex(th);
					if (sortColumnIdx === lastSortColumnIdx) {
						sortAsc = !sortAsc;
						th.dataset.sortAsc = Number(sortAsc).toString();
					}

					let modifierPressed = ev.ctrlKey && lastSortColumnIdx;
					if (!modifierPressed) {
						table.dataset.lastSortColumnIdx = String(sortColumnIdx);
						if (tableOther)
							tableOther.dataset.lastSortColumnIdx = '-1';
					}

					let sortAsString = !!Number(th.dataset.sortAsString);
					let hasSortIndex = hasSortIndexForColumn(table, sortColumnIdx);

					let rows = Foxtrick.map(function(row, i) {
						let ret = Foxtrick.cloneElement(row, true);

						// save previous index to sort rowsOther identically
						ret.dataset.prevIdx = String(i);
						return ret;
					}, [...table.rows].slice(1)); // skipping header

					/** @type {HTMLTableRowElement[]} */
					let rowsOther;
					if (tableOther) {
						rowsOther = Foxtrick.map(function(row) {
							return Foxtrick.cloneElement(row, true);
						}, [...tableOther.rows].slice(1)); // skipping header
					}

					/* sortCompare
						sortClick() will first check whether every cell in that column has the
						attribute 'index'. If so, they will be ordered with that attribute as
						key. Otherwise, we use their textContent.
					*/
					/**
					 * @param  {HTMLTableRowElement} a
					 * @param  {HTMLTableRowElement} b
					 * @return {number}
					 */
					let sortCompare = function(a, b) {
						/**
						 * @param  {HTMLTableRowElement} aRow
						 * @param  {HTMLTableRowElement} bRow
						 * @return {number}
						 */
						// eslint-disable-next-line complexity
						var doSort = function(aRow, bRow) {
							let aContent, bContent;
							let lastSort = Number(aRow.dataset.lastSort) -
								Number(bRow.dataset.lastSort);

							let aCell = aRow.cells[sortColumnIdx];
							let bCell = bRow.cells[sortColumnIdx];

							if (hasSortIndex) {
								aContent = aCell.getAttribute('index');
								bContent = bCell.getAttribute('index');
							}
							else {
								aContent = aCell.textContent;
								bContent = bCell.textContent;
							}

							if (aContent === bContent)
								return 0;

							// place empty cells at the bottom
							if (aContent === '' || aContent === 'X' || aContent == null)
								return 1;

							if (bContent === '' || bContent === 'X' || bContent == null)
								return -1;

							if (sortAsString) {
								return sortAsc ?
									bContent.localeCompare(aContent) :
									aContent.localeCompare(bContent);
							}

							aContent = parseFloat(aContent);
							bContent = parseFloat(bContent);
							aContent = isNaN(aContent) ? lastSort : aContent;
							bContent = isNaN(bContent) ? lastSort : bContent;

							if (aContent === bContent)
								return 0;

							// numeric sort is intentionally inverted
							return sortAsc ? aContent - bContent : bContent - aContent;
						};

						let aRow = a, bRow = b;
						if (modifierPressed) {
							// preserve new sort settings for later
							let tmp = {
								sortAsc,
								sortColumnIdx,
								sortAsString,
								sortByIndex: hasSortIndex,
								lastSortColumnIdx,
								aRow,
								bRow,
							};
							let lastTable = table;

							if (tableOther && lastSortColumnIdx == -1) {
								// different table
								lastTable = tableOther;
								lastSortColumnIdx =
									parseInt(tableOther.dataset.lastSortColumnIdx, 10);
								aRow = rowsOther[a.dataset.lastSort];
								bRow = rowsOther[b.dataset.lastSort];
							}

							// load previous sort settings
							let lastTh = lastTable.rows[0].cells[lastSortColumnIdx];
							sortAsc = !!Number(lastTh.dataset.sortAsc);
							sortColumnIdx = lastSortColumnIdx;
							sortAsString = getSortAsStringFromColumn(lastTable, lastSortColumnIdx);
							hasSortIndex = hasSortIndexForColumn(lastTable, lastSortColumnIdx);

							let result = doSort(aRow, bRow);

							// restore new settings
							sortAsc = tmp.sortAsc;
							sortColumnIdx = tmp.sortColumnIdx;
							hasSortIndex = tmp.sortByIndex;
							sortAsString = tmp.sortAsString;
							lastSortColumnIdx = tmp.lastSortColumnIdx;
							aRow = tmp.aRow;
							bRow = tmp.bRow;

							if (result === 0) {
								// previous sort was equal
								// do new sort
								let sortResult = doSort(aRow, bRow);
								return sortResult;
							}

							return result;
						}

						return doSort(aRow, bRow);
					};

					rows.sort(sortCompare);

					Foxtrick.forEach(function(row, i) {
						row.dataset.lastSort = String(i);

						// rows.length < table.rows.length because header was skipped
						let rowOld = table.rows[i + 1];
						rowOld.parentNode.replaceChild(row, rowOld);

						if (tableOther) {
							let prevIdx = parseInt(row.dataset.prevIdx, 10);
							let rowOther = rowsOther[prevIdx];
							rowOther.dataset.lastSort = String(i);
							let rowOldOther = tableOther.rows[i + 1];
							rowOldOther.parentNode.replaceChild(rowOther, rowOldOther);
						}
					}, rows);

					module.updateUI(doc);
				}
				catch (e) {
					Foxtrick.log(e);
				}
				Foxtrick.log.flush(doc);
			};

			var createSkillTables = function() {

				/**
				 * @param {HTMLTableElement} table
				 * @param {SkillTableColumn[]} columns
				 */
				var assemble = function(table, columns) {
					var thead, tbody, tr;

					/** @param {SkillTableColumn} column */
					var addTH = function(column) {
						if (!column.enabled)
							return;

						let th = doc.createElement('th');
						th.dataset.sortAsString = Number(!!column.sortAsString).toString();
						th.dataset.sortAsc = Number(!!column.sortAsc).toString();
						Foxtrick.onClick(th, sortClick);

						renderTH(th, column);

						tr.appendChild(th);
					};

					/** @param {Player} player */
					// eslint-disable-next-line complexity
					var addRow = function(player) {
						var row;

						/** @param {SkillTableColumn} column */
						var addCell = function(column) {
							let { enabled, method, property, title, listener, properties } = column;
							if (!enabled)
								return;

							let value = player[property];

							let cell = doc.createElement('td');
							row.appendChild(cell);

							if (column.alignRight)
								Foxtrick.addClass(cell, 'align-right');

							if (listener) {
								cell.dataset.listener = listener;
								Foxtrick.addClass(cell, 'ft-skilltable_cellBtn');
								Foxtrick.clickTarget(cell);
							}

							if (title)
								cell.title = player[title];

							if (properties) {
								if (method) {
									RENDERERS[method](cell, player, properties);
								}
								else {
									let texts = properties.map(prop => player[prop]);
									cell.textContent = texts.join(', ');
								}
							}
							else if (property && typeof value !== 'undefined') {
								if (method)
									RENDERERS[method](cell, value, property);
								else
									cell.textContent = String(value);
							}
						};

						row = doc.createElement('tr');

						// set row attributes for filter module
						row.setAttribute('playerid', String(player.id)); // TODO move to dataset
						if (player.hidden)
							Foxtrick.addClass(row, 'hidden');
						if (player.currentSquad)
							row.setAttribute('currentsquad', 'true');
						if (player.currentClubLink) {
							let url = player.currentClubLink.href;
							if (/\?TeamID=(\d+)/i.test(url)) {
								let teamId = Foxtrick.getUrlParam(url, 'TeamID');
								row.setAttribute('currentclub', teamId);
							}
						}
						if (player.injured)
							row.setAttribute('injured', 'true');
						if (player.cards)
							row.setAttribute('cards', 'true');
						if (player.transferListed)
							row.setAttribute('transfer-listed', 'true');
						else
							row.setAttribute('not-transfer-listed', 'true');

						if (player.specialty) {
							let spec = Foxtrick.L10n.getEnglishSpecialty(player.specialty);
							row.setAttribute('specialty-' + spec, 'true');
						}

						if (player.active)
							row.setAttribute('active', 'true');
						if (player.motherClubBonus)
							row.setAttribute('homegrown-player', 'true');
						else
							row.setAttribute('purchased-player', 'true');

						if (player.lastMatchDate &&
							player.lastMatchDate.getTime() === lastMatches.last)
							row.setAttribute('played-latest', 'true');
						else
							row.setAttribute('not-played-latest', 'true');

						tbody.appendChild(row);

						columns.forEach(addCell);
					};

					thead = doc.createElement('thead');
					tr = doc.createElement('tr');
					thead.appendChild(tr);
					table.appendChild(thead);

					columns.forEach(addTH);

					tbody = doc.createElement('tbody');
					table.appendChild(tbody);

					players.forEach(addRow);
				};

				let frozenColumns = Foxtrick.filter(c => c.frozen, COLUMNS);
				let otherColumns = Foxtrick.filter(c => !c.frozen, COLUMNS);

				let ret = [];
				if (useFrozen) {
					let tableLeft = doc.createElement('table');
					tableLeft.id = 'ft_skilltableLeft';
					tableLeft.className = 'ft_skilltable ft_skilltableLeft';
					assemble(tableLeft, frozenColumns);
					module.updateUI(doc, tableLeft);

					let tableRight = doc.createElement('table');
					tableRight.id = 'ft_skilltableRight';
					tableRight.className = 'ft_skilltable ft_skilltableRight ft_skilltableLong';
					assemble(tableRight, otherColumns);
					ret = [tableLeft, tableRight];
				}
				else {
					let table = doc.createElement('table');
					table.id = 'ft_skilltable';
					table.className = 'ft_skilltable ft_skilltableLong';
					assemble(table, COLUMNS);
					module.updateUI(doc, table);
					ret = [table];
				}
				attachListeners(ret);
				return ret;
			};

			try {
				tableDiv = doc.getElementById(TABLE_DIV_ID);

				fullType = getFullType(doc);

				let { type, subType } = fullType;

				// first determine lastMatchday
				if (type != 'transfer' && subType != 'nt' && subType != 'oldiesCoach')
					lastMatches = getLastMatchDates();

				checkAvailableColumns();

				removeOldElements();

				let customizeTable = createCustomizeTable(COLUMNS);
				Foxtrick.addClass(customizeTable, 'hidden');
				insertCustomizeTable(customizeTable);

				let tables = createSkillTables();
				if (useFrozen) {
					let [tableLeft, tableRight] = tables;
					insertSkillTable(tableLeft, 'Left');
					insertSkillTable(tableRight, 'Right');
				}
				else {
					let [table] = tables;
					insertSkillTable(table, '');
				}

				setViewMode();
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		/** @param {SkillTableType} [fullType] */
		createTable = function(fullType) {
			let { type } = fullType || getFullType(doc);

			if (type == 'transfer') {
				let playerList = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
				generateTable(playerList);
			}
			else {
				let loading = Foxtrick.util.note.createLoading(doc);
				let wrapper = doc.querySelector('.ft_skilltable_wrapper');
				wrapper.appendChild(loading);
				try {
					if (Foxtrick.Pages.Players.isOldies(doc) && type == 'oldiesAndOwn')
						showOldiesAndOwn(doc);
					else
						Foxtrick.Pages.Players.getPlayerList(doc, generateTable); // TODO promisify
				}
				catch (e) {
					Foxtrick.log(e);
					wrapper.removeChild(loading);
				}
			}
		};

		var addTableDiv = function() {
			var container, tableDiv, links, h2; // TODO unglobal

			var ensureTable = (function() {
				let tableCreated = false;
				return () => {
					if (tableCreated)
						return;

					tableCreated = true;
					createTable();
				};
			})();

			/** @param {HTMLDivElement} tableDiv */
			var insertTableDiv = function(tableDiv) {
				if (Foxtrick.Pages.TransferSearchResults.isPage(doc)) {
					// on transfer search page, insert after first separator
					var separator = doc.querySelector('#mainBody .borderSeparator');
					if (!separator)
						return;

					var insertBefore = separator.nextSibling;
					insertBefore.parentNode.insertBefore(tableDiv, insertBefore);
				}
				else if (Foxtrick.Pages.Player.isSenior(doc)) {
					var insertParent = doc.getElementById('mainBody');
					insertParent.appendChild(tableDiv);
				}
				else {
					var playerList = doc.querySelector('#mainBody > .playerList');
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
			};

			/** @type {Listener<HTMLHeadingElement, MouseEvent>} */
			var toggleDisplay = function() {
				try {
					ensureTable();

					Foxtrick.toggleClass(h2, 'ft-expander-expanded');
					Foxtrick.toggleClass(h2, 'ft-expander-unexpanded');
					let show = Foxtrick.hasClass(h2, 'ft-expander-expanded');

					let customizeTable = tableDiv.querySelector('.ft_skilltable_customizetable');
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

			/** @type {Listener<HTMLAnchorElement, MouseEvent>} */
			var copyTable = function() {
				const YOUTH_PLAYER_RE = /YouthPlayerID=(\d+)/i;
				const PLAYER_RE = /PlayerID=(\d+)/i;
				const COPIED = Foxtrick.L10n.getString('copy.skilltable.copied');

				/**
				 * get the text content in a node and return it.
				 * for player links, append the [playerid] HT-ML tag
				 * for images, return its alt attribute
				 *
				 * @param  {HTMLTableCellElement|HTMLAnchorElement|HTMLImageElement|Node} n
				 * @return {string}
				 */
				var getNode = function(n) {
					if ('href' in n && YOUTH_PLAYER_RE.test(n.href)) {
						let [_, youthId] = n.href.match(YOUTH_PLAYER_RE);
						return `${n.textContent} [youthplayerid=${youthId}]`;
					}
					else if ('href' in n && PLAYER_RE.test(n.href)) {
						let playerId = n.href.match(PLAYER_RE)[1];
						return `${n.textContent} [playerid=${playerId}]`;
					}
					else if (n.hasChildNodes()) {
						let ret = Foxtrick.map(function(child) {
							// recursively get the content of child nodes
							return getNode(child);
						}, n.childNodes).join(' ');
						return ret.trim();
					}
					else if ('alt' in n) {
						return n.alt;
					}

					return n.textContent;
				};

				/**
				 * @param  {HTMLTableElement} tableLeft
				 * @param  {HTMLTableElement} tableRight
				 * @return {string}
				 */
				var parseTables = function(tableLeft, tableRight) {
					/**
					 * @param  {HTMLTableCellElement} cell
					 * @return {string}
					 */
					var parseCell = function(cell) {
						let cellName = cell.tagName.toLowerCase();
						let cellContent = getNode(cell);
						if (Foxtrick.hasClass(cell, 'maxed'))
							cellContent = '[b]' + cellContent + '[/b]';
						else if (Foxtrick.hasClass(cell, 'formatted-num'))
							cellContent = String(Foxtrick.trimnum(cellContent));

						return `[${cellName}]${cellContent}[/${cellName}]`;
					};

					let rowText = Foxtrick.map(function(rowLeft, i) {
						if (Foxtrick.hasClass(rowLeft, 'hidden'))
							return '';

						let ret = '[tr]';
						ret += Foxtrick.map(parseCell, rowLeft.cells).join('');

						if (tableRight) {
							let rowRight = tableRight.rows[i];
							ret += Foxtrick.map(parseCell, rowRight.cells).join('');
						}

						ret += '[/tr]';
						return ret;

					}, tableLeft.rows).filter(Boolean).join('\n');

					return `[table]\n${rowText}\n[/table]`;
				};

				/** @type {NodeListOf<HTMLTableElement>} */
				let [left, right] = doc.querySelectorAll('.ft_skilltable');
				let copyStr = parseTables(left, right);
				Foxtrick.copy(doc, copyStr);

				let target = left.parentElement.parentElement;
				Foxtrick.util.note.add(doc, COPIED, 'ft-skilltable-copy-note', { at: target });
			};

			/** @return {HTMLDivElement} */
			var makeLinks = function() {
				// linkslinks
				var links = doc.createElement('div');
				links.className = 'ft_skilltable_links';
				Foxtrick.addClass(links, 'hidden');

				{
					// links: copy
					let copy = doc.createElement('a');
					copy.className = 'customize_item secondary';
					copy.textContent = Foxtrick.L10n.getString('button.copy');
					copy.title = Foxtrick.L10n.getString('copy.skilltable.title');
					Foxtrick.onClick(copy, copyTable);
					links.appendChild(copy);
				}

				{
					// links: customize
					let customize = doc.createElement('a');
					customize.className = 'customize_item';
					customize.textContent = Foxtrick.L10n.getString('button.customize');
					Foxtrick.onClick(customize, function() {
						// eslint-disable-next-line no-invalid-this
						let doc = this.ownerDocument;
						let links = doc.querySelector('.ft_skilltable_links');
						Foxtrick.addClass(links, 'customizing');

						let customizeTable = doc.querySelector('.ft_skilltable_customizetable');
						Foxtrick.removeClass(customizeTable, 'hidden');

						let container = doc.querySelector('.ft_skilltable_container');
						Foxtrick.addClass(container, 'hidden');
					});
					links.appendChild(customize);
				}

				{
					// links: show info
					let showInfo = doc.createElement('a');
					showInfo.className = 'customize_item';

					let imgInfo = doc.createElement('img');
					imgInfo.src = '/Img/Icons/info.png';
					imgInfo.alt = imgInfo.title = Foxtrick.L10n.getString('button.moreInfo');
					showInfo.appendChild(imgInfo);

					Foxtrick.onClick(showInfo, function() {
						// eslint-disable-next-line no-invalid-this
						let doc = this.ownerDocument;
						let info = doc.getElementById('ft-skilltable-infoDiv');
						Foxtrick.toggleClass(info, 'hidden');
					});
					links.appendChild(showInfo);
				}

				{
					// links: info
					let infoDiv = doc.createElement('div');
					infoDiv.id = 'ft-skilltable-infoDiv';
					infoDiv.className = 'alert_shy hidden';

					let infoParas = [
						['viewModes', 'actions'],
						['viewActions', 'browseIds', 'restore'],
						['sort.reverse', 'sort.secondary', 'sort.secondary.ex'],
						['customize', 'frozenColumns', 'fullNames'],
						['saveToReload'],
					];
					let paras = infoParas.map(function(para) {
						let p = doc.createElement('p');
						p.textContent = para.map(function(text) {
							return Foxtrick.L10n.getString('skilltable.info.' + text);
						}).join(' ');
						return p;
					});

					Foxtrick.append(infoDiv, paras);
					links.appendChild(infoDiv);
				}

				{
					// customization view
					// frozen columns
					let frozenDiv = doc.createElement('div');
					frozenDiv.id = 'ft-skilltable-frozenDiv';
					Foxtrick.addClass(frozenDiv, 'float_right ft-skilltable-checkDiv');

					let check = doc.createElement('input');
					check.id = 'ft-skilltable-FrozenColumnsCheck';
					check.type = 'checkbox';
					check.checked = useFrozen;
					frozenDiv.appendChild(check);

					let label = doc.createElement('label');
					label.setAttribute('for', 'ft-skilltable-FrozenColumnsCheck');
					label.textContent = Foxtrick.L10n.getString('SkillTable.useFrozenColumns');
					label.title = Foxtrick.L10n.getString('SkillTable.useFrozenColumns.title');
					frozenDiv.appendChild(label);
					links.appendChild(frozenDiv);
				}

				{
					let fullNameDiv = doc.createElement('div');
					fullNameDiv.id = 'ft-skilltable-fullNameDiv';
					Foxtrick.addClass(fullNameDiv, 'float_right ft-skilltable-checkDiv');

					let check = doc.createElement('input');
					check.id = 'ft-skilltable-FullNamesCheck';
					check.type = 'checkbox';
					check.checked = useFullNames;
					fullNameDiv.appendChild(check);

					let label = doc.createElement('label');
					label.setAttribute('for', 'ft-skilltable-FullNamesCheck');
					label.textContent = Foxtrick.L10n.getString('SkillTable.useFullNames');
					label.title = Foxtrick.L10n.getString('SkillTable.useFullNames.title');
					fullNameDiv.appendChild(label);
					links.appendChild(fullNameDiv);
				}

				{
					let actionDiv = doc.createElement('div');
					actionDiv.id = 'ft-skilltable-customizeActions';
					links.appendChild(actionDiv);

					// links: save
					let save = doc.createElement('a');
					save.textContent = Foxtrick.L10n.getString('button.save');
					Foxtrick.onClick(save, function() {
						// eslint-disable-next-line no-invalid-this
						let doc = this.ownerDocument;
						let fullType = getFullType(doc);

						for (let opt of ['FrozenColumns', 'FullNames']) {
							let check = /** @type {HTMLInputElement} */
								(doc.getElementById(`ft-skilltable-${opt}Check`));

							Foxtrick.Prefs.setModuleEnableState(`SkillTable.${opt}`, check.checked);
						}

						let tableDiv = doc.getElementById(TABLE_DIV_ID);
						let inputs = tableDiv.getElementsByTagName('input');
						Foxtrick.forEach(function(input) {
							setColumnEnabled(fullType, input.id, input.checked);
						}, inputs);

						doc.location.reload();
					});
					actionDiv.appendChild(save);

					// links: cancel
					let cancel = doc.createElement('a');
					cancel.textContent = Foxtrick.L10n.getString('button.cancel');
					Foxtrick.onClick(cancel, function() {
						// eslint-disable-next-line no-invalid-this
						let doc = this.ownerDocument;
						let tableDiv = doc.getElementById(TABLE_DIV_ID);
						let links = tableDiv.querySelector('.ft_skilltable_links');
						let table = tableDiv.querySelector('.ft_skilltable_customizetable');
						let container = tableDiv.querySelector('.ft_skilltable_container');
						Foxtrick.removeClass(links, 'customizing');
						Foxtrick.addClass(table, 'hidden');
						Foxtrick.removeClass(container, 'hidden');
					});
					actionDiv.appendChild(cancel);
				}

				return links;
			};

			/** @return {HTMLDivElement} */
			var makeOptions = function() {
				if (!Foxtrick.util.api.authorized())
					return void 0;

				let createLink = (opt) => {
					let link = doc.createElement('a');
					link.textContent = Foxtrick.L10n.getString(`SkillTable.${opt}`);
					link.title = Foxtrick.L10n.getString(`SkillTable.${opt}.title`);
					link.id = 'skilltable_addHomegrownId';
					Foxtrick.onClick(link, addHomegrown);
					return link;
				};

				let options = doc.createElement('div');
				if (Foxtrick.Pages.Players.isOldies(doc)) {
					let link = createLink('addHomegrown');
					options.appendChild(link);
				}
				else if (Foxtrick.Pages.Players.isRegular(doc)) {
					let link = createLink('showTimeInClub');
					options.appendChild(link);
				}
				return options;
			};

			tableDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
			tableDiv.id = TABLE_DIV_ID;
			Foxtrick.addClass(tableDiv, TABLE_DIV_ID);
			if (Foxtrick.Pages.TransferSearchResults.isPage(doc))
				Foxtrick.addClass(tableDiv, 'transfer');
			else if (useFullNames)
				Foxtrick.addClass(tableDiv, 'ft_skilltable_fullNames');

			// table div head
			h2 = doc.createElement('h2');
			h2.className = 'ft-expander-unexpanded';
			h2.textContent = Foxtrick.L10n.getString('SkillTable.header');
			Foxtrick.onClick(h2, toggleDisplay);
			tableDiv.appendChild(h2);

			links = makeLinks();
			tableDiv.appendChild(links);

			{
				// customize table wrapper
				let customizeWrapper = doc.createElement('div');
				customizeWrapper.className = 'ft_skilltable_customizewrapper';
				tableDiv.appendChild(customizeWrapper);
			}

			// table container
			container = doc.createElement('div');
			container.className = 'ft_skilltable_container';
			Foxtrick.addClass(container, 'hidden');

			// table container: switch view
			let viewOptions = doc.createElement('div');
			container.appendChild(viewOptions);
			{
				let switchViewLink = doc.createElement('a');
				switchViewLink.textContent = Foxtrick.L10n.getString('SkillTable.switchView');
				switchViewLink.title = Foxtrick.L10n.getString('SkillTable.switchView.title');
				Foxtrick.onClick(switchViewLink, function() {
					// eslint-disable-next-line no-invalid-this
					let doc = this.ownerDocument;
					let tableDiv = doc.getElementById(TABLE_DIV_ID);
					Foxtrick.toggleClass(tableDiv, 'on_top');

					let onTop = Foxtrick.hasClass(tableDiv, 'on_top');
					Foxtrick.Prefs.setBool('module.SkillTable.top', onTop);
				});
				viewOptions.appendChild(switchViewLink);

				let restoreLink = doc.createElement('a');
				restoreLink.id = 'ft_skilltable_restoreHidden';
				restoreLink.className = 'hidden';
				restoreLink.textContent = Foxtrick.L10n.getString('skilltable.restoreHidden');
				Foxtrick.onClick(restoreLink, function() {
					// eslint-disable-next-line no-invalid-this
					let doc = this.ownerDocument;

					let rows = doc.querySelectorAll('.ft_skilltable tr');
					for (let row of rows)
						Foxtrick.removeClass(row, 'hidden');

					module.updateUI(doc);
				});
				viewOptions.appendChild(restoreLink);
			}

			// table container: table wrapper
			let wrapper = doc.createElement('div');
			wrapper.className = 'ft_skilltable_wrapper';
			container.appendChild(wrapper);

			{
				let wrapperLeft = doc.createElement('div');
				wrapperLeft.className = 'ft_skilltable_wrapperLeft';
				wrapper.appendChild(wrapperLeft);
				let wrapperRight = doc.createElement('div');
				wrapperRight.className = 'ft_skilltable_wrapperRight';
				wrapper.appendChild(wrapperRight);
			}

			let options = makeOptions();
			if (options)
				container.appendChild(options);

			tableDiv.appendChild(container);

			insertTableDiv(tableDiv);
			return tableDiv;
		};

		if (doc.getElementById(TABLE_DIV_ID))
			return;

		if (Foxtrick.isPage(doc, 'transferSearchResult') ||
		    getFullType(doc).subType != 'others' ||
		    Foxtrick.Prefs.isModuleOptionEnabled('SkillTable', 'OtherTeams')) {

			// run
			addTableDiv();
		}
	},
};
