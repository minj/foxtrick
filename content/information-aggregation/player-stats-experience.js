/**
 * player-stats-experience.js
 * show how much experience a player gained in individual matches
 * and shows current subskill
 * this currently works on the assumption that 28.571 pts
 * are the fixed margin for a skillup,
 * even if that might not be 100% true for all levels
 * @author CatzHoek, LA-MJ
 */

'use strict';

Foxtrick.modules.PlayerStatsExperience = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerStats', 'playerDetails'],
	OPTIONS: ['AlwaysShowAll'],
	CSS: Foxtrick.InternalPath + 'resources/css/player-stats.css',
	XP_PTS_PER_LEVEL: 100,
	XP_CELL_IDX: 7, // current xp is the <integer>-th column in the table

	/** @typedef {{min: number, max: number}} XPRecord */
	/**
	 * @typedef XpMatchTypeRecord
	 * @prop {XPRecord} minutes
	 * @prop {XPRecord} count
	 * @prop {XPRecord} xp
	 */

	/**
	 * @typedef LastXPRecordMixin
	 * @prop {Element} node
	 * @prop {MatchTypeClass} gameType
	 */

	/** @typedef {XPRecord & {minutes: number, count: number} & LastXPRecordMixin} LastXPRecord */

	// eslint-disable-next-line max-len
	/** @typedef {'matchFriendly'|'matchLeague'|'matchCupA'|'matchCupB1'|'matchCupB2'|'matchCupB3'|'matchCupC'|'matchQualification'|'matchMasters'|'matchNtFriendly'|'matchNtLeague'|'matchNtFinals'} MatchTypeClass */

	// don't randomly rename, parts of this are taken from hattrick using image classnames
	/** @type {Record<MatchTypeClass, number>} */
	XP: {
		// assume international friendly as default, considered in min-max,
		// minimum uses 1/2 of this value
		matchFriendly: 0.7,
		matchLeague: 3.5,
		matchCupA: 7.0,
		matchCupB1: 1.75,
		matchCupB2: 1.75,
		matchCupB3: 1.75,
		matchCupC: 1.75,
		matchQualification: 7,
		matchMasters: 17.5,

		// NT
		// fakenames: we generate these types
		matchNtFriendly: 7, // (iconsytle + gametype)
		matchNtLeague: 35.0, // (iconsytle + gametype + match date)
		matchNtFinals: 70.0, // (iconsytle + gametype + match date)
	},

	store: {
		xp: { points: { min: 0.0, max: 0.0 }, xp: { min: 0.0, max: 0.0 }},
		skillup: false,

		/** @type {Record<MatchTypeClass, XpMatchTypeRecord>} */
		matches: null,

		/** @type {number} */
		currentSkill: null,

		/** @type {LastXPRecord} */
		last: null,
	},

	/** @type {MatchTypeClass[]} */
	matchTypes: [],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		const MAX_XP_MIN = 90.0;
		const PRECISION = 3;

		const WEEK_OF_FINALS = 16;
		const DAY_OF_FINAL = 0; // Sunday
		const DAY_OF_SEMIS = 5; // Saturday

		// setup the 'database'
		module.matchTypes = /** @type {MatchTypeClass[]} */ (Object.keys(module.XP));
		let entries = module.matchTypes.map(type => [type, {
			minutes: { min: 0, max: 0 },
			count: { min: 0.0, max: 0.0 },
			xp: { min: 0.0, max: 0.0 },
		}]);
		module.store.matches = Object.fromEntries(entries);

		// define algorithm

		/** @param {HTMLTableElement} statsTable */
		// eslint-disable-next-line complexity
		var runStatsTable = function(statsTable) {

			// START ROW UTILS

			/**
			 * figure out if a match is a NT match
			 *
			 * quite fragile, only NT matches have styles atm
			 *
			 * @param  {Element} node
			 * @return {boolean}
			 */
			var isNTMatch = function(node) {
				var gametypeParent = node.querySelector('td.keyColumn');
				var gameTypeImage = gametypeParent.querySelector('.iconMatchtype img');
				return gameTypeImage.parentElement.getAttribute('style') !== null;
			};

			/**
			 * new W.O detection
			 *
			 * @param  {Element} node
			 * @return {boolean}
			 */
			var isWalkover = function(node) {
				var starCell = node.querySelector('td:last-child');
				var starImg = starCell.querySelector('img[class^="star"]');
				var stars = starCell.textContent.trim();

				// stars in standard || no perform || stars in simple
				if (stars.length === 0 || !!starImg || stars.match(/^[0-9,.\s()]+$/))
					return false;

				return true;
			};

			/**
			 * get minutes played, maximum 90 minutes though
			 *
			 * @param  {Element} node
			 * @return {number}
			 */
			var getPlayedMinutes = function(node) {
				// sum up the diff positions
				var minutes = 0;

				let playtimes = node.querySelector('td.endColumn1');
				let matches = playtimes.textContent.match(/\d+/g);
				if (matches !== null) {
					for (let minStr of [...matches]) {
						let min = parseInt(minStr, 10);
						if (!Number.isNaN(min))
							minutes += min;
					}
				}

				// max 90'
				return Math.min(MAX_XP_MIN, minutes);
			};

			/**
			 * figure out the gametype, most important to figure out how many xp pts are gained
			 *
			 * @param  {HTMLTableRowElement} node
			 * @param  {Date}           date
			 * @param  {boolean}        u20
			 * @return {MatchTypeClass}
			 */
			var getGameType = function(node, date, u20) {
				// most games can be identified by the classname directly, NT needs some tricks
				/**
				 * @param  {HTMLTableRowElement} node
				 * @return {MatchTypeClass}
				 */
				var getBasicGameType = function(node) {
					var gametypeParent = node.querySelector('td.keyColumn');
					var gameTypeImage = gametypeParent.querySelector('.iconMatchtype img');
					return /** @type {MatchTypeClass} */ (gameTypeImage.className);
				};

				var gameType = getBasicGameType(node);
				var isNT = isNTMatch(node);
				if (!isNT)
					return gameType;

				if (gameType == 'matchFriendly')
					return 'matchNtFriendly';

				if (gameType == 'matchLeague') {
					let { season, week } = Foxtrick.util.time.gregorianToHT(date);

					// oldies wc finals are in odd seasons, u20 in even seasons
					// eslint-disable-next-line no-bitwise
					let isWcFinalSeason = season % 2 ^ Number(u20);
					if (!isWcFinalSeason)
						return 'matchNtLeague';

					let semifinal = date.getDay() == DAY_OF_SEMIS;
					let final = date.getDay() === DAY_OF_FINAL;
					if (week == WEEK_OF_FINALS && (semifinal || final))
						return 'matchNtFinals';

					return 'matchNtLeague';
				}

				return null;
			};

			/**
			 * get xp gain by gametype
			 *
			 * @param  {number} minutes
			 * @param  {MatchTypeClass} gametype
			 * @return {number}
			 */
			var getXpGain = function(minutes, gametype) {
				return module.XP[gametype] / MAX_XP_MIN * minutes;
			};

			/**
			 * adjust min and max values to take care of international vs. national friendlies
			 *
			 * @param  {boolean} ntMatch
			 * @param  {number} xpGain
			 * @param  {MatchTypeClass} gameType
			 * @return {XPRecord}
			 */
			var getXPMinMaxDifference = function(ntMatch, xpGain, gameType) {
				var dxp = { min: xpGain, max: xpGain };
				if (!ntMatch && gameType == 'matchFriendly')
					dxp.min /= 2;

				return dxp;
			};

			// END ROW UTILS

			// var offset = 'module.HTDateFormat.FirstDayOfWeekOffset_text';
			// var weekOffset = Foxtrick.Prefs.getString(offset);

			var WO_TITLE = Foxtrick.L10n.getString('PlayerStatsExperience.Walkover');

			// header
			// add XP column
			let thXP = doc.createElement('th');
			Foxtrick.makeFeaturedElement(thXP, module);
			Foxtrick.addClass(thXP, 'stats');
			thXP.textContent =
				Foxtrick.L10n.getString('PlayerStatsExperience.ExperienceChange.title.abbr');
			thXP.title = Foxtrick.L10n.getString('PlayerStatsExperience.ExperienceChange.title');

			var store = module.store;
			var [header, ...statsRows] = [...statsTable.rows];
			header.insertBefore(thXP, header.cells[8]);

			// sum up xp stuff
			for (let row of statsRows) {
				if (row.matches('.training-changes'))
					continue;

				let matchDate = row.querySelector('td.keyColumn');
				if (!matchDate)
					break;

				/** @type {HTMLElement} */
				let dateSpan = matchDate.querySelector('span.float_left');
				let dateStr = dateSpan.title || dateSpan.dataset.dateiso;
				let date = Foxtrick.util.time.getDateFromText(dateStr);

				// current skilllevel
				let xpNow = parseInt(row.cells[module.XP_CELL_IDX].textContent, 10);

				// remember current XP Level to detect skilldowns
				if (store.currentSkill === null)
					store.currentSkill = xpNow;

				let u20 = /U-20/.test(row.querySelector('a').textContent);
				let ntMatch = isNTMatch(row);
				let gameType = getGameType(row, date, u20);
				let minutes = getPlayedMinutes(row);
				let pseudoPoints = getXpGain(minutes, gameType); // for visualization
				let walkover = isWalkover(row);

				// reset both xp_gain and minute count if it's a WO
				let xpGain = walkover ? minutes = 0 : pseudoPoints;

				// set min/max values for friendlies
				let dxp = getXPMinMaxDifference(ntMatch, xpGain, gameType);
				if (xpNow === store.currentSkill) {
					// store all until XP is lower than curremt
					store.matches[gameType].xp.min += dxp.min;
					store.matches[gameType].xp.max += dxp.max;
					store.matches[gameType].minutes.min += minutes;
					store.matches[gameType].minutes.max += minutes;
					store.matches[gameType].count.min += minutes / MAX_XP_MIN;
					store.matches[gameType].count.max += minutes / MAX_XP_MIN;

					store.xp.points.min += dxp.min;
					store.xp.points.max += dxp.max;
					store.xp.xp.min += dxp.min / module.XP_PTS_PER_LEVEL;
					store.xp.xp.max += dxp.max / module.XP_PTS_PER_LEVEL;

					store.last = {
						node: row,
						gameType: gameType,
						min: dxp.min,
						max: dxp.max,
						minutes: minutes,
						count: minutes / MAX_XP_MIN,
					};
				}
				else {
					// store.last points to the skill up row
					store.skillup = true;
				}

				let tdXP = Foxtrick.insertFeaturedCell(row, module, module.XP_CELL_IDX + 1);
				Foxtrick.addClass(tdXP, 'stats');
				if (walkover) {
					Foxtrick.addClass(tdXP, 'ft-xp-walkover');
					tdXP.textContent = pseudoPoints.toFixed(PRECISION);
					tdXP.title = WO_TITLE;
				}
				else {
					tdXP.textContent = xpGain.toFixed(PRECISION);
				}

				if (!ntMatch && gameType == 'matchFriendly' && minutes > 0) {
					tdXP.textContent =
						(xpGain / 2.0).toFixed(PRECISION) + '/' + xpGain.toFixed(PRECISION);
				}
			}

			if (!store.last)
				return;

			// highlight the relevant skillup game in the table
			Foxtrick.addClass(store.last.node, 'ft-xp-skillup');

			// adjust minimum gained xp depending on the relevant skillup game
			store.matches[store.last.gameType].minutes.min -= store.last.minutes;
			store.matches[store.last.gameType].count.min -= store.last.minutes / MAX_XP_MIN;
			store.matches[store.last.gameType].xp.min -= store.last.min;

			store.xp.points.min -= store.last.min;
			store.xp.xp.min -= store.last.min / module.XP_PTS_PER_LEVEL;
		};

		/** @param {HTMLTableElement} table */
		var addHead = function(table) {
			var thead = doc.createElement('thead');
			table.appendChild(thead);

			var cell;
			var theadRow = doc.createElement('tr');

			cell = doc.createElement('th');
			cell.textContent = Foxtrick.L10n.getString('PlayerStatsExperience.MatchesSinceSkilup');
			theadRow.appendChild(cell);

			cell = doc.createElement('th');
			Foxtrick.addClass(cell, 'ft-xp-data-value');
			cell.textContent = Foxtrick.L10n.getString('PlayerStatsExperience.matches');
			theadRow.appendChild(cell);

			cell = doc.createElement('th');
			Foxtrick.addClass(cell, 'ft-xp-data-value');
			cell.textContent = Foxtrick.L10n.getString('PlayerStatsExperience.minutes');
			theadRow.appendChild(cell);

			cell = doc.createElement('th');
			Foxtrick.addClass(cell, 'ft-xp-data-value');
			cell.textContent = Foxtrick.L10n.getString('PlayerStatsExperience.minXPpts');
			theadRow.appendChild(cell);

			cell = doc.createElement('th');
			Foxtrick.addClass(cell, 'ft-xp-data-value');
			cell.textContent = Foxtrick.L10n.getString('PlayerStatsExperience.maxXPpts');
			theadRow.appendChild(cell);

			thead.appendChild(theadRow);
		};

		/** @param {HTMLTableElement} table */
		var addBody = function(table) {
			var tbody = doc.createElement('tbody');
			table.appendChild(tbody);

			var types = module.matchTypes;
			var store = module.store;

			/**
			 * @param  {number} value
			 * @return {number}
			 */
			var format = function(value) {
				return value - Math.floor(value) > 0
					? parseFloat(value.toFixed(PRECISION))
					: Math.floor(value);
			};

			var addTotals = function() {

				var isCompleteClass = module.store.skillup ? 'ft-xp-complete' : 'ft-xp-incomplete';

				// xp pts
				var row = doc.createElement('tr');
				var cell;
				cell = doc.createElement('td');
				cell.textContent = Foxtrick.L10n.getString('PlayerStatsExperience.sum');
				row.appendChild(cell);

				cell = doc.createElement('td');
				cell.colSpan = 2;
				row.appendChild(cell);

				cell = doc.createElement('td');
				cell.id = 'ft-xp-min-pts';
				Foxtrick.addClass(cell, 'ft-xp-data-value ' + isCompleteClass);
				cell.textContent = String(format(store.xp.points.min));
				row.appendChild(cell);

				cell = doc.createElement('td');
				cell.id = 'ft-xp-max-pts';
				Foxtrick.addClass(cell, 'ft-xp-data-value ' + isCompleteClass);
				cell.textContent = String(format(store.xp.points.max));
				row.appendChild(cell);
				tbody.appendChild(row);

				// xp actual
				row = doc.createElement('tr');
				cell = doc.createElement('td');
				var bold = doc.createElement('strong');
				bold.textContent = Foxtrick.L10n.getString('PlayerStatsExperience.Experience');
				cell.appendChild(bold);
				row.appendChild(cell);

				cell = doc.createElement('td');
				cell.colSpan = 2;
				row.appendChild(cell);

				cell = doc.createElement('td');
				cell.id = 'ft-xp-min';
				Foxtrick.addClass(cell, 'ft-xp-data-value ' + isCompleteClass);
				cell.textContent = String(format(store.currentSkill + store.xp.xp.min));
				row.appendChild(cell);

				cell = doc.createElement('td');
				cell.id = 'ft-xp-max';
				Foxtrick.addClass(cell, 'ft-xp-data-value ' + isCompleteClass);
				cell.textContent = String(format(store.currentSkill + store.xp.xp.max));
				row.appendChild(cell);

				tbody.appendChild(row);

			};

			/**
			 * @param {string} type
			 * @param {XPRecord} count
			 * @param {XPRecord} minutes
			 * @param {XPRecord} xp
			 * @param {number} i
			 */
			var addRow = function(type, count, minutes, xp, i) {
				var row = doc.createElement('tr');

				if (i % 2)
					Foxtrick.addClass(row, 'darkereven');
				else
					Foxtrick.addClass(row, 'odd');

				var cell = doc.createElement('td');
				cell.id = `ft-xp-${type}-desc`;
				cell.textContent = Foxtrick.L10n.getString(`PlayerStatsExperience.${type}`);
				row.appendChild(cell);

				cell = doc.createElement('td');
				if (count.min === count.max)
					cell.textContent = String(count.max);
				else
					cell.textContent = `${count.min} - ${count.max}`;
				cell.id = `ft-xp-${type}-count`;
				Foxtrick.addClass(cell, 'ft-xp-data-value');
				row.appendChild(cell);

				cell = doc.createElement('td');
				if (minutes.min === minutes.max)
					cell.textContent = String(minutes.max);
				else
					cell.textContent = `${minutes.min} - ${minutes.max}`;
				cell.id = `ft-xp-${type}-minutes`;
				Foxtrick.addClass(cell, 'ft-xp-data-value');
				row.appendChild(cell);

				// marks the game that causes prediction error (first game after skillup)
				var skillup = '';
				if (store.last.gameType === type && store.skillup)
					skillup = 'ft-xp-skillup';

				cell = doc.createElement('td');
				cell.id = `ft-xp-${type}-min`;
				Foxtrick.addClass(cell, `ft-xp-data-value ${skillup}`);
				cell.textContent = String(xp.min);
				row.appendChild(cell);

				cell = doc.createElement('td');
				cell.id = `ft-xp-${type}-max`;
				Foxtrick.addClass(cell, `ft-xp-data-value ${skillup}`);
				cell.textContent = String(xp.max);
				row.appendChild(cell);

				tbody.appendChild(row);
			};

			let j = 0;
			for (let type of types) {
				let { minutes, count, xp } = store.matches[type];

				count.min = format(count.min);
				count.max = format(count.max);
				xp.min = format(xp.min);
				xp.max = format(xp.max);

				if (xp.max) {
					// don't show empty rows
					addRow(type, count, minutes, xp, j++);
				}
			}
			addTotals();
		};

		/**
		 * @param {Element} commentDiv
		 * @param {HTMLAnchorElement} showAllLink
		 */
		var addComments = function(commentDiv, showAllLink) {
			var span = doc.createElement('span');
			commentDiv.appendChild(span);
			commentDiv.appendChild(doc.createElement('br'));

			span = doc.createElement('span');
			var ptsPerLevel = Foxtrick.L10n.getString('PlayerStatsExperience.PtsPerLevel');
			span.textContent = ptsPerLevel.replace(/%1/, module.XP_PTS_PER_LEVEL.toFixed(1));
			commentDiv.appendChild(span);
			commentDiv.appendChild(doc.createElement('br'));

			if (!module.store.skillup) {
				span = doc.createElement('span');
				let str = showAllLink ?
					'PlayerStatsExperience.NotAllMatchesVisible' :
					'PlayerStatsExperience.NoSkillUpFound';

				span.textContent = Foxtrick.L10n.getString(str);
				commentDiv.appendChild(span);
				commentDiv.appendChild(doc.createElement('br'));
			}
		};

		var convertLinksToShowAll = function() {
			for (let link of doc.getElementsByTagName('a')) {
				if (/PlayerStats\.aspx/i.test(link.href)) {
					if (!/ShowAll=True/i.test(link.href))
						link.href += '&ShowAll=True';
				}
			}
		};

		// START

		// find showAllLink if any
		// used for comments and cloning
		var showAllLink = null;
		if (!/ShowAll=True/i.test(doc.location.href)) {
			let links = doc.getElementsByTagName('a');
			showAllLink = Foxtrick.nth(function(link) {
				return /ShowAll=True/i.test(link.href);
			}, links);
		}

		// get all possible links to show max amount of games
		if (Foxtrick.Prefs.isModuleOptionEnabled('PlayerStatsExperience', 'AlwaysShowAll')) {
			// makes sure all links pointing to other player stats will show all possible matches
			convertLinksToShowAll();
		}

		if (Foxtrick.isPage(doc, 'playerDetails'))
			return;

		/** @type {HTMLTableElement} */
		let statsTable = doc.querySelector('.alltidMatches');
		if (!statsTable)
			return;

		runStatsTable(statsTable);

		var matchListTable = Foxtrick.createFeaturedElement(doc, module, 'div');
		let table = doc.createElement('table');
		Foxtrick.addClass(table, 'ft-ignore-changes');
		matchListTable.appendChild(table);
		addHead(table);
		addBody(table);

		var commentDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
		addComments(commentDiv, showAllLink);

		var entry = doc.querySelector('.mainBox');

		let xpHeader = doc.createElement('h2');
		let headerTitle = Foxtrick.L10n.getString('PlayerStatsExperience.Experience');
		xpHeader.textContent = headerTitle;
		entry.parentNode.insertBefore(xpHeader, entry);
		entry.parentNode.insertBefore(matchListTable, entry);
		entry.parentNode.insertBefore(commentDiv, entry);

		// if more matches are required, clone showall link for easier access to top of table
		if (showAllLink && !module.store.skillup) {
			let showAllLinkClone = Foxtrick.cloneElement(showAllLink, true);
			entry.parentNode.insertBefore(showAllLinkClone, entry);
		}

		// header for the old table
		let tableHeader = doc.createElement('h2');
		tableHeader.title = Foxtrick.L10n.getString('PlayerStatsExperience.PerformanceHistory');
		entry.parentNode.insertBefore(tableHeader, entry);
	},
};
