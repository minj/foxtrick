'use strict';
/*
 * live-alert.js
 * Alerting HT Live goals
 * @author ryanli
 */

Foxtrick.modules['LiveMatchReportFormat'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['matchesLive'],
	NICE: 1,

	run: function(doc) {
		var react = function(liveReport, indicators) {
			var events = liveReport.getElementsByTagName('tr');
			Foxtrick.forEach(function(evnt) {
				// no event, stuff like the indicators or our indicators
				if (!evnt.getAttribute('data-eventtype')) {
					evnt.firstChild.colSpan = 4;
					return;
				}

				Foxtrick.util.matchEvent.addEventIcons(evnt);
			}, events);
			if (indicators)
				Foxtrick.util.matchEvent.addEventIndicators(liveReport);
		};
		var reactAll = function(doc) {
			var livereports = doc.getElementsByClassName('liveReport');
			Foxtrick.forEach(function(report) {
				react(report, true);
			}, livereports);
		};

		// firstload
		reactAll(doc);

		var livereportsContainer = Foxtrick.Pages.Match.getLiveContainer(doc);
		if (livereportsContainer)
			Foxtrick.onChange(livereportsContainer, reactAll, { subtree: false });
	},
};
