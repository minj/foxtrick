/**
* htms-points.js
* Foxtrick show HTMS points in player page
* @author taised
*/

'use strict';

Foxtrick.modules.HTMSPoints = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails', 'transferSearchResult', 'players', 'ntPlayers'],
	OPTIONS: ['AddToPlayer', 'AddToSearchResult', 'AddToPlayerList'],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		/**
		 * @param  {string} skillQuery
		 * @return {HTMLAnchorElement}
		 */
		var getLink = function(skillQuery) {
			let lang = Foxtrick.Prefs.getString('htLanguage');
			let prefix = 'http://www.fantamondi.it/HTMS/index.php' +
				`?page=htmspoints&lang=${lang}&action=calc`;

			let link = doc.createElement('a');
			link.textContent = Foxtrick.L10n.getString('HTMSPoints');
			link.href = prefix + skillQuery;
			link.target = '_blank';
			link.rel = 'noopener';
			return link;
		};

		const AddToPlayer =
			Foxtrick.Prefs.isModuleOptionEnabled('HTMSPoints', 'AddToPlayer');
		const AddToSearchResult =
			Foxtrick.Prefs.isModuleOptionEnabled('HTMSPoints', 'AddToSearchResult');
		const AddToPlayerList =
			Foxtrick.Prefs.isModuleOptionEnabled('HTMSPoints', 'AddToPlayerList');

		const ITALIAN = {
			keeper: 'parate',
			defending: 'difesa',
			playmaking: 'regia',
			winger: 'cross',
			passing: 'passaggi',
			scoring: 'attacco',
			setPieces: 'cp',
		};

		if (Foxtrick.isPage(doc, 'playerDetails') && AddToPlayer) {
			if (Foxtrick.Pages.Player.wasFired(doc))
				return;

			// README: not youth
			let skills = /** @type {PlayerSkills} */ (Foxtrick.Pages.Player.getSkills(doc));
			if (skills === null)
				return; // no skills available, goodbye

			let age = Foxtrick.Pages.Player.getAge(doc);
			let { days, years } = age;

			let skillQuery = `&anni=${years}&giorni=${days}`;
			let totSkills = 0;
			for (let i in skills) {
				skillQuery += '&' + ITALIAN[i] + '=' + skills[i];
				totSkills += skills[i];
			}

			let def = Object.assign(age, skills);
			if (!totSkills)
				return;

			// creating the new element
			let { table } = Foxtrick.Pages.Player.getInfoTable(doc);
			let row = Foxtrick.insertFeaturedRow(table, module, table.rows.length);
			Foxtrick.addClass(row, 'ft-htms-points');
			let linkCell = row.insertCell(0);
			linkCell.appendChild(getLink(skillQuery));
			let pointsCell = row.insertCell(1);

			let [current, potential] = module.calc(def).map(String);
			let result = Foxtrick.L10n.getString('HTMSPoints.AbilityAndPotential');
			result = result.replace(/%1/, current).replace(/%2/, potential);
			pointsCell.textContent = result;

			row.dataset.htmsAbility = current;
			row.dataset.htmsPotential = potential;
		}
		else if (Foxtrick.isPage(doc, 'transferSearchResult') && AddToSearchResult) {
			let transferPlayers = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
			Foxtrick.forEach(function(p) {
				if (!p.skills)
					return;

				let totSkills = 0;

				/** @type {HTMSSkills} */
				var skills = {};
				let { years, days } = p.age;

				var skillQuery = `&anni=${years}&giorni=${days}`;
				for (let i in p.skills) {
					skills[i] = p.skills[i];
					skillQuery += '&' + ITALIAN[i] + '=' + skills[i];
					totSkills += skills[i];
				}
				skills.years = years;
				skills.days = days;

				if (!totSkills)
					return;

				// creating element
				let container = Foxtrick.createFeaturedElement(doc, module, 'span');
				Foxtrick.addClass(container, 'ft-htms-points');
				container.appendChild(getLink(skillQuery));
				container.appendChild(doc.createTextNode(' '));

				let pointsSpan = doc.createElement('span');
				let [current, potential] = module.calc(skills).map(String);
				let result = Foxtrick.L10n.getString('HTMSPoints.AbilityAndPotential');
				result = result.replace(/%1/, current).replace(/%2/, potential);
				pointsSpan.textContent = result;
				container.appendChild(pointsSpan);

				container.dataset.htmsAbility = current;
				container.dataset.htmsPotential = potential;

				let firstdiv = p.playerNode.querySelector('div');
				firstdiv.appendChild(container);

			}, transferPlayers);
		}
		else if (Foxtrick.isPage(doc, 'ownPlayers') && AddToPlayerList) {
			let players = Foxtrick.modules.Core.getPlayerList();

			Foxtrick.forEach(function(p) {
				if (!p.skills)
					return;

				let totSkills = 0;

				/** @type {HTMSSkills} */
				var skills = {};
				let { years, days } = p.age;

				var skillQuery = `&anni=${years}&giorni=${days}`;
				for (let i in p.skills) {
					skills[i] = p.skills[i];
					skillQuery += '&' + ITALIAN[i] + '=' + skills[i];
					totSkills += skills[i];
				}

				skills.years = years;
				skills.days = days;

				if (!totSkills)
					return;

				// create elements
				let container = Foxtrick.createFeaturedElement(doc, module, 'div');
				Foxtrick.addClass(container, 'ft-htms-points');
				container.appendChild(getLink(skillQuery));
				container.appendChild(doc.createTextNode(' '));

				let pointsSpan = doc.createElement('span');
				let [current, potential] = module.calc(skills).map(String);
				let result = Foxtrick.L10n.getString('HTMSPoints.AbilityAndPotential');
				result = result.replace(/%1/, current).replace(/%2/, potential);
				pointsSpan.textContent = result;
				container.appendChild(pointsSpan);

				container.dataset.htmsAbility = current;
				container.dataset.htmsPotential = potential;

				// insert it
				let table = p.playerNode.querySelector('table');
				table.parentElement.appendChild(container);

			}, players);
		}
	},

	/**
	 * @typedef {PlayerSkills & PlayerAge} HTMSSkills
	 */

	/**
	 * @param  {HTMSSkills} skills
	 * @return {[number, number]} [current, potential]
	 */
	calc: function(skills) {
		// training points per week at a certain age
		const WEEK_PTS_PER_AGE = {
			17: 10,
			18: 9.92,
			19: 9.81,
			20: 9.69,
			21: 9.54,
			22: 9.39,
			23: 9.22,
			24: 9.04,
			25: 8.85,
			26: 8.66,
			27: 8.47,
			28: 8.27,
			29: 8.07,
			30: 7.87,
			31: 7.67,
			32: 7.47,
			33: 7.27,
			34: 7.07,
			35: 6.87,
			36: 6.67,
			37: 6.47,
			38: 6.26,
			39: 6.06,
			40: 5.86,
			41: 5.65,
			42: 6.45,
			43: 6.24,
			44: 6.04,
			45: 5.83,
		};

		const MAX_AGE = Math.max(...Object.keys(WEEK_PTS_PER_AGE).map(Number));

		/* eslint-disable no-magic-numbers */
		// keeper, defending, playmaking, winger, passing, scoring, setPieces
		const SKILL_PTS_PER_LVL = [
			[0, 0, 0, 0, 0, 0, 0], // 0
			[2, 4, 4, 2, 3, 4, 1], // 1
			[12, 18, 17, 12, 14, 17, 2], // 2
			[23, 39, 34, 25, 31, 36, 5], // 3
			[39, 65, 57, 41, 51, 59, 9], // 4
			[56, 98, 84, 60, 75, 88, 15], // 5
			[76, 134, 114, 81, 104, 119, 21], // 6
			[99, 175, 150, 105, 137, 156, 28], // 7
			[123, 221, 190, 132, 173, 197, 37], // 8
			[150, 271, 231, 161, 213, 240, 46], // 9
			[183, 330, 281, 195, 259, 291, 56], // 10
			[222, 401, 341, 238, 315, 354, 68], // 11
			[268, 484, 412, 287, 381, 427, 81], // 12
			[321, 580, 493, 344, 457, 511, 95], // 13
			[380, 689, 584, 407, 540, 607, 112], // 14
			[446, 809, 685, 478, 634, 713, 131], // 15
			[519, 942, 798, 555, 738, 830, 153], // 16
			[600, 1092, 924, 642, 854, 961, 179], // 17
			[691, 1268, 1070, 741, 988, 1114, 210], // 18
			[797, 1487, 1247, 855, 1148, 1300, 246], // 19
			[924, 1791, 1480, 995, 1355, 1547, 287], // 20
			[1074, 1791, 1791, 1172, 1355, 1547, 334], // 21
			[1278, 1791, 1791, 1360, 1355, 1547, 388], // 22
			[1278, 1791, 1791, 1360, 1355, 1547, 450], // 23
		];
		/* eslint-enable no-magic-numbers */

		var current = SKILL_PTS_PER_LVL[skills.keeper][0];
		current += SKILL_PTS_PER_LVL[skills.defending][1];
		current += SKILL_PTS_PER_LVL[skills.playmaking][2];
		current += SKILL_PTS_PER_LVL[skills.winger][3];
		current += SKILL_PTS_PER_LVL[skills.passing][4];
		current += SKILL_PTS_PER_LVL[skills.scoring][5];
		// eslint-disable-next-line no-magic-numbers
		current += SKILL_PTS_PER_LVL[Math.min(23, skills.setPieces)][6];

		// now calculating the potential at 28yo
		const AGE_FACTOR = 28;
		const WEEKS_IN_SEASON = Foxtrick.util.time.WEEKS_IN_SEASON;
		const DAYS_IN_WEEK = Foxtrick.util.time.DAYS_IN_WEEK;
		const DAYS_IN_SEASON = Foxtrick.util.time.DAYS_IN_SEASON;

		var pointsDiff = 0;
		if (skills.years < AGE_FACTOR) {
			// add weeks to reach next birthday (112 days)
			let pointsPerWeek = WEEK_PTS_PER_AGE[skills.years];
			pointsDiff = (DAYS_IN_SEASON - skills.days) / DAYS_IN_WEEK * pointsPerWeek;

			// adding 16 weeks per whole year until 28 y.o.
			for (let i = skills.years + 1; i < AGE_FACTOR; i++)
				pointsDiff += WEEKS_IN_SEASON * WEEK_PTS_PER_AGE[i];
		}
		else if (skills.years <= MAX_AGE) {
			// subtract weeks to previous birthday
			pointsDiff = skills.days / DAYS_IN_WEEK * WEEK_PTS_PER_AGE[skills.years];

			// subtracting 16 weeks per whole year until 28
			for (let i = skills.years; i > AGE_FACTOR; i--)
				pointsDiff += WEEKS_IN_SEASON * WEEK_PTS_PER_AGE[i];

			pointsDiff = -pointsDiff;
		}
		else {
			pointsDiff = -current;
		}

		let potential = current + pointsDiff;
		return [current, Math.round(potential)];
	},
};
