/**
 * ht-date-format.js
 * displays week and season next to date
 * @author spambot, ryanli, LA-MJ
 */

'use strict';

Foxtrick.modules.HTDateFormat = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	NICE: 20, // after anthing that adds dates
	OPTIONS: ['LocalSeason', 'FirstDayOfWeekOffset'],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: [true, false],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		let weekOffsetText =
			Foxtrick.Prefs.getString(`module.${module.MODULE_NAME}.FirstDayOfWeekOffset_text`);

		const WEEK_OFFSET = parseInt(weekOffsetText, 10) || 0;
		const USE_LOCAL = Foxtrick.Prefs.isModuleOptionEnabled(module, 'LocalSeason');

		// set up function for separating date and week/season,
		/** @param {Node} node */
		var separate = function(node) {
			node.appendChild(doc.createTextNode(' '));
		};

		/** @param {HTMLElement} node */
		var modifyDate = function(node) {
			if (Foxtrick.hasClass(node, 'ft-date') ||
			    Foxtrick.hasClass(node, 'matchdate') && !Foxtrick.isPage(doc, 'playerStats'))
				return;

			var date;
			if (node.dataset.userDate) {
				// attribute data-user-date set by LocalTime, while inner
				// text is not user date but local date
				date = new Date();
				date.setTime(Number(node.dataset.userDate));
			}
			else {
				date = Foxtrick.util.time.getDateFromText(node.textContent);
			}

			if (date) {
				let { week, season } =
					Foxtrick.util.time.gregorianToHT(date, WEEK_OFFSET, USE_LOCAL);

				Foxtrick.addClass(node, 'ft-date');
				separate(node);
				let wsDate = Foxtrick.createFeaturedElement(doc, module, 'span');
				wsDate.textContent = `(${week}/${season})`;
				node.appendChild(wsDate);
			}
		};

		var now = Foxtrick.util.time.getDate(doc);
		if (!now) {
			Foxtrick.log('User time missing');
			return;
		}

		let { week } = Foxtrick.util.time.gregorianToHT(now, WEEK_OFFSET, USE_LOCAL);
		let online = doc.getElementById('online');
		online.textContent = online.textContent.trim().replace(/\d+$/, String(week));

		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		/** @type {PAGE[]} */
		var pages = [
			'transfersTeam', 'transfersPlayer', 'transfer',
			'transferCompare', 'match', 'matches', 'matchesCup', 'matchesArchive',
			'teamPageAny', 'achievements', 'playerEvents',
			'teamEvents', 'history', 'arena', 'country', 'hallOfFame',
			'statsMatchesHeadToHead', 'seriesHistory', 'seriesHistoryNew', 'playerStats',
		];

		// don't show on where not needed and cluttering
		if (!Foxtrick.isPage(doc, pages))
			return;

		/** @type {NodeListOf<HTMLElement>} */
		var dates = mainBody.querySelectorAll('.date');
		Foxtrick.map(modifyDate, dates);
	},

	/** @param {document} doc */
	change: function(doc) {
		this.run(doc);
	},
};
