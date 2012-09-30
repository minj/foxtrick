'use strict';
/*
 * ht-date-format.js
 * displays week and season next to date
 * @author spambot, ryanli
 */

Foxtrick.modules['HTDateFormat'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	NICE: 20, // after anthing that adds dates
	OPTIONS: ['LocalSeason', 'FirstDayOfWeekOffset'],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: [true, false],

	run: function(doc) {
		var pages = ['transfersTeam', 'transfersPlayer', 'transfer',
			'transferCompare', 'match', 'matches', 'matchesArchive',
			'teamPageGeneral', 'achievements', 'playerEvents',
			'teamEvents', 'history', 'arena', 'country', 'hallOfFame',
			'statsMatchesHeadToHead', 'seriesHistory', 'playerStats'];
		// don't show on where not needed and cluttering
		if (!Foxtrick.any(function(page) {
				return Foxtrick.isPage(page, doc);
			}, pages)) {
			return;
		}

		var mainBody = doc.getElementById('mainBody');
		if (!mainBody) return;

		var useLocal = FoxtrickPrefs.isModuleOptionEnabled('HTDateFormat', 'LocalSeason');
		var weekOffset = FoxtrickPrefs.getString('module.' + this.MODULE_NAME +
		                                         '.FirstDayOfWeekOffset_text');
		// set up function for separating date and week/season,
		// with concerns of some table fixing for simple skin
		if ((!Foxtrick.util.layout.isStandard(doc) && Foxtrick.isPage('matches', doc))
			|| Foxtrick.isPage('seriesHistory', doc)) {
			var separate = function(node) {
				node.appendChild(doc.createElement('br'));
			};
		}
		else {
			var separate = function(node) {
				node.appendChild(doc.createTextNode(' '));
			};
		}

		var modifyDate = function(node) {
			if (Foxtrick.hasClass(node, 'ft-date') || (Foxtrick.hasClass(node, 'matchdate')
			    && !Foxtrick.isPage('playerStats', doc)))
				return;
			if (node.hasAttribute('x-ht-date')) {
				// attribute x-ht-date set by LocalTime, while inner
				// text is not HT date but local date
				var date = new Date();
				date.setTime(node.getAttribute('x-ht-date'));
			}
			else
				var date = Foxtrick.util.time.getDateFromText(node.textContent);

			if (date) {
				var htDate = Foxtrick.util.time.gregorianToHT(date, weekOffset, useLocal);
				Foxtrick.addClass(node, 'ft-date');
				separate(node);
				var wsDate = Foxtrick.createFeaturedElement(doc,
				                                            Foxtrick.modules.HTDateFormat, 'span');
				wsDate.textContent = '(w/s)'
					.replace(/w/, htDate.week)
					.replace(/s/, htDate.season);
				node.appendChild(wsDate);
			}
		};

		var dates = mainBody.getElementsByClassName('date');
		Foxtrick.map(modifyDate, dates);
	},

	change: function(doc, ev) {
		this.run(doc);
	}
};
