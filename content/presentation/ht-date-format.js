'use strict';
/*
 * ht-date-format.js
 * displays week and season next to date
 * @author spambot, ryanli
 */

Foxtrick.modules['HTDateFormat'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	NICE: 20, // after anthing that adds dates
	OPTIONS: ['LocalSeason', 'FirstDayOfWeekOffset'],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: [true, false],

	run: function(doc) {
		var module = this;

		var useLocal = Foxtrick.Prefs.isModuleOptionEnabled('HTDateFormat', 'LocalSeason');
		var weekOffset = Foxtrick.Prefs.getString('module.' + this.MODULE_NAME +
		                                         '.FirstDayOfWeekOffset_text');
		// set up function for separating date and week/season,
		var separate = function(node) {
			node.appendChild(doc.createTextNode(' '));
		};

		var modifyDate = function(node) {
			if (Foxtrick.hasClass(node, 'ft-date') ||
			    (Foxtrick.hasClass(node, 'matchdate') && !Foxtrick.isPage(doc, 'playerStats')))
				return;

			var date;
			if (node.hasAttribute('x-ht-date')) {
				// attribute x-ht-date set by LocalTime, while inner
				// text is not HT date but local date
				date = new Date();
				date.setTime(node.getAttribute('x-ht-date'));
			}
			else
				date = Foxtrick.util.time.getDateFromText(node.textContent);

			if (date) {
				var htDate = Foxtrick.util.time.gregorianToHT(date, weekOffset, useLocal);
				Foxtrick.addClass(node, 'ft-date');
				separate(node);
				var wsDate = Foxtrick.createFeaturedElement(doc, module, 'span');
				wsDate.textContent = '(w/s)'.replace(/w/, htDate.week).replace(/s/, htDate.season);
				node.appendChild(wsDate);
			}
		};

		var now = Foxtrick.util.time.getHtDate(doc);
		var htDate = Foxtrick.util.time.gregorianToHT(now, weekOffset, useLocal);
		var online = doc.getElementById('online');
		online.textContent = online.textContent.trim().replace(/\d+$/, htDate.week);

		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		var pages = [
			'transfersTeam', 'transfersPlayer', 'transfer',
			'transferCompare', 'match', 'matches', 'matchesArchive',
			'teamPageAny', 'achievements', 'playerEvents',
			'teamEvents', 'history', 'arena', 'country', 'hallOfFame',
			'statsMatchesHeadToHead', 'seriesHistory', 'playerStats',
		];
		// don't show on where not needed and cluttering
		if (!Foxtrick.any(function(page) {
				return Foxtrick.isPage(doc, page);
			}, pages)) {
			return;
		}

		var dates = mainBody.getElementsByClassName('date');
		Foxtrick.map(modifyDate, dates);
	},

	change: function(doc, ev) {
		this.run(doc);
	}
};
