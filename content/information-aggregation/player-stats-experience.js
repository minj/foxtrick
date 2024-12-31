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

	// TODO: globe?
	// eslint-disable-next-line max-len
	/** @typedef {'matchCup'|'matchCupA'|'matchCupB1'|'matchCupB2'|'matchCupB3'|'matchCupC'|'matchFriendly'|'matchLeague'|'matchMasters'|'matchNewbie'|'matchNtAfricaCup'|'matchNtAmericaCup'|'matchNtAsiaCup'|'matchNtEuropeCup'|'matchNtNationsCup'|'matchNtWildcard'|'matchNtWorldCup'|'matchQualification'|'matchSingleMatch'|'matchSingleMatchFast'|'matchTournament'|'matchTournamentFast'|'matchTournamentLadder'} MatchTypeClassRaw */

	// eslint-disable-next-line max-len
	/** @typedef {'series'|'cup'|'challenger_cup_1'|'challenger_cup_2'|'challenger_cup_3'|'consolation_cup'|'friendly'|'qualifier'|'masters'|'nt_worldcup'|'nations_cup'|'nt_wildcard'|'nt_cup_europe'|'nt_cup_americas'|'nt_cup_africa'|'nt_cup_asia'|'nt_worldcup_u21'|'nations_cup_u21'|'nt_wildcard_u21'|'nt_cup_europe_u21'|'nt_cup_americas_u21'|'nt_cup_africa_u21'|'nt_cup_asia_u21'} GameIconClass */
	// eslint-disable-next-line max-len
	/** @typedef {'series'|'cup'|'challenger_cup_1'|'challenger_cup_2'|'challenger_cup_3'|'consolation_cup'|'friendly'|'qualifier'|'masters'|'matchNtContinental'|'matchNtContinentalKO'|'matchNtNationsCup'|'matchNtNationsCupKO'|'matchNtWildcard'|'matchNtWorldCup'|'matchNtFriendly'|'matchNtLeague'|'matchNtFinals'|'matchNtFriendlyNew'|'matchNtWorldCupFinals'} MatchTypeClass */

	// don't randomly rename, parts of this are taken from hattrick using image classnames
	/** @type {Record<MatchTypeClass, number>} */
	XP: {
		// assume international friendly as default, considered in min-max,
		// minimum uses 1/2 of this value
		friendly: 0.7,
		series: 3.5,
		cup: 7.0,
		challenger_cup_1: 1.75,
		challenger_cup_2: 1.75,
		challenger_cup_3: 1.75,
		consolation_cup: 1.75,
		qualifier: 7,
		masters: 17.5,

		// globe: NaN,
		// matchCup: NaN,
		// matchNewbie: NaN,
		// matchSingleMatch: NaN,
		// matchSingleMatchFast: NaN,
		// matchTournament: NaN,
		// matchTournamentFast: NaN,
		// matchTournamentLadder: NaN,

		// old NT
		// fakenames: we generate these types
		matchNtFriendly: 7.0, // (iconsytle + gametype)
		matchNtLeague: 35.0, // (iconsytle + gametype + match date)
		matchNtFinals: 70.0, // (iconsytle + gametype + match date); semi+

		matchNtContinental: 14.0,
		matchNtContinentalKO: 21.0, // 1/4f+
		matchNtNationsCup: 7.0,
		matchNtNationsCupKO: 14.0, // 1/4f+

		matchNtWildcard: 14.0,
		matchNtWorldCup: 28.0,
		matchNtWorldCupFinals: 56.0, // semi+

		matchNtFriendlyNew: 3.5,
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

	// eslint-disable-next-line valid-jsdoc
	/**
	 * @param {document} doc
	 * @this {typeof Foxtrick.modules.PlayerStatsExperience}
	 */
	run: function(doc) {
		const module = this;
		const MAX_XP_MIN = 90.0;
		const PRECISION = 3;

		const WEEK_OF_FINALS = 16;
		const DAY_OF_FINAL = 0; // Sunday
		const DAY_OF_SEMIS = 5; // Friday
		const DAY_OF_FINAL_NEW = 5; // Friday
		const DAY_OF_SEMIS_NEW = 1; // Monday

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

				// var gameTypeImage = gametypeParent.querySelector('.iconMatchtype img');

				var iconParent = gametypeParent.querySelector('.iconMatchtype');
				return iconParent.getAttribute('style') !== null ||
					!!iconParent.querySelector('img[class^="matchNt"]');
			};

			/**
			 * new W.O detection
			 *
			 * @param  {HTMLTableRowElement} row
			 * @return {boolean}
			 */
			var isWalkover = function(row) {
				if (row.matches('.performanceIsWalkover'))
					return true;

				var starCell = [...row.cells]
					.filter(c => c.classList.contains('center')).pop();
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
			 * @param  {string}              isodate
			 * @param  {boolean}             juniors
			 * @return {MatchTypeClass}
			 */
			var getGameType = function(node, isodate, juniors) {
				let date = Foxtrick.util.time.getDateFromText(isodate);
				var { season, week } = Foxtrick.util.time.gregorianToHT(date);
				// eslint-disable-next-line no-bitwise
				var isFinalSeason = season % 2 ^ Number(juniors);

				// most games can be identified by the classname directly, NT needs some tricks
				/**
				 * @param  {HTMLTableRowElement} node
				 * @return {GameIconClass}
				 */
				var getGameIcon = function(node) {
					var gameIconParent = node.querySelector('td.keyColumn');
					var gameIconImage = gameIconParent.querySelector('.iconMatchtype img');
					var gameIconSrc = gameIconImage.getAttribute('src');
					const gameIconRegEx = /([\w-]+).svg/g;
					var gameIcon = gameIconRegEx.exec(gameIconSrc)[1]; // first match is with ".svg", 2nd match is the group match without ".svg"
					var gameIconWithoutDashes = gameIcon.replaceAll('-', '_');
					return /** @type {GameIconClass} */ (gameIconWithoutDashes);
				};

				/**
				 * @param  {GameIconClass} gameIcon
				 * @return {MatchTypeClass}
				 */
				// eslint-disable-next-line complexity
				var getNTType = function(gameIcon) {
					if (gameIcon == 'friendly') {
						if (juniors)
							// eslint-disable-next-line no-magic-numbers
							return season >= 77 ? 'matchNtFriendlyNew' : 'matchNtFriendly';

						// eslint-disable-next-line no-magic-numbers
						return season >= 78 ? 'matchNtFriendlyNew' : 'matchNtFriendly';
					}

					// TODO: what is this type of game? Do we still need it?
					// if (raw == 'matchLeague') {
					// 	// old NT
					// 	// oldies wc finals are in odd seasons, juniors in even seasons
					// 	if (!isFinalSeason)
					// 		return 'matchNtLeague';

					// 	let semifinal = date.getDay() == DAY_OF_SEMIS;
					// 	let final = date.getDay() === DAY_OF_FINAL;
					// 	if (week == WEEK_OF_FINALS && (semifinal || final))
					// 		return 'matchNtFinals';

					// 	return 'matchNtLeague';
					// }

					if (gameIcon.includes('nt_worldcup')) { // also catch u21, which has the addition "_u21" at the end
						if (!isFinalSeason)
							return 'matchNtWorldCup';

						let semifinal = date.getDay() == DAY_OF_SEMIS_NEW;
						let final = date.getDay() === DAY_OF_FINAL_NEW;
						if (week == WEEK_OF_FINALS && (semifinal || final))
							return 'matchNtWorldCupFinals';

						return 'matchNtWorldCup';
					}

					if (gameIcon.includes('nations_cup')) { // also catch u21, which has the addition "-u21" at the end
						// weeks 14-16 in final season are KO
						// eslint-disable-next-line no-magic-numbers
						return isFinalSeason && week >= 14
							? 'matchNtNationsCupKO'
							: 'matchNtNationsCup';
					}

					/** @type {GameIconClass[]} */
					const CONT_CUPS = [
						'nt_cup_europe',
						'nt_cup_americas',
						'nt_cup_africa',
						'nt_cup_asia'
					];
					for (var contCupName of CONT_CUPS) {
						if (gameIcon.includes(contCupName)) { // also catch u21, which has the addition "_u21" at the end
							// weeks 11-12 are KO
							// eslint-disable-next-line no-magic-numbers
							return !isFinalSeason && week >= 11
								? 'matchNtContinentalKO'
								: 'matchNtContinental';
						}
					}

					Foxtrick.log("WARNING: Unmatched gameIcon for NT", gameIcon); // TODO: Can this even happen?

					return gameIcon in module.XP ? /** @type {MatchTypeClass} */ (gameIcon) : null;
				};

				var gameIcon = getGameIcon(node);
				var isNT = isNTMatch(node);

				if (isNT) {
					let nt = getNTType(gameIcon);
					if (nt != null)
						return nt;
				}

				var ret = gameIcon in module.XP ? /** @type {MatchTypeClass} */ (gameIcon) : null;

				if (ret === null) {
					// report failure
					Foxtrick.log(new Error(`Type dection failed: ${gameIcon},
						d=${isodate} (${season}/${week}), isNT=${isNT}, junions=${juniors}
					`));
				}

				return ret;
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
				if (!ntMatch && gameType == 'friendly')
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
			
			// Brand new players have no stats table at all
			// Players that have not played yet with their current team do not have a best performance line (label + actual performance)
			if (statsTable.rows[1].id != "") {
			    var [header, ...statsRows] = [...statsTable.rows];
			} else {
			    var [header, bestPerf, ...statsRows] = [...statsTable.rows];
			    bestPerf.cells[0].colSpan += 1;
			}
			
			header.insertBefore(thXP, header.cells[8]);

			// sum up xp stuff
			for (let row of statsRows) {
				if (row.matches('.training-changes'))
					continue;

				let matchDate = row.querySelector('td.keyColumn');
				if (!matchDate)
					break;

				let tdXP = Foxtrick.insertFeaturedCell(row, module, module.XP_CELL_IDX + 1);
				Foxtrick.addClass(tdXP, 'stats');

				// current skilllevel
				let xpNow = parseInt(row.cells[module.XP_CELL_IDX].textContent, 10);
				// Best performance line appears in statsRows, but does not display any XP information
				if (Number.isNaN(xpNow))
					continue;

				// remember current XP Level to detect skilldowns
				if (store.currentSkill === null)
					store.currentSkill = xpNow;

				/** @type {HTMLElement} */
				let dateSpan = matchDate.querySelector('span.float_left');
				let ntMatch = isNTMatch(row);
				let juniors = /U-20|U21/.test(row.querySelector('a').textContent);
				let gameType = getGameType(row, dateSpan.dataset.dateiso, juniors);
				let minutes = getPlayedMinutes(row);
				let pseudoPoints = getXpGain(minutes, gameType); // for visualization
				let walkover = isWalkover(row);

				// reset both xp_gain and minute count if it's a WO
				let xpGain = walkover ? minutes = 0 : pseudoPoints;

				// set min/max values for friendlies
				let dxp = getXPMinMaxDifference(ntMatch, xpGain, gameType);
				if (xpNow === store.currentSkill) {
					if (gameType != null) {
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
				}
				else {
					// store.last points to the skill up row
					store.skillup = true;
				}

				if (walkover) {
					Foxtrick.addClass(tdXP, 'ft-xp-walkover');
					tdXP.textContent = pseudoPoints.toFixed(PRECISION);
					tdXP.title = WO_TITLE;
				}
				else {
					tdXP.textContent = xpGain.toFixed(PRECISION);
				}

				if (!ntMatch && gameType == 'friendly' && minutes > 0) {
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
