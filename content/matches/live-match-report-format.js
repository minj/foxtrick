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
			for (var i = 0; i < events.length; i++) {
				var event = events[i];

				// no event, stuff like the indicators or our indicators
				if (!event.getAttribute('data-eventtype')) {
					event.firstChild.setAttribute('colspan', '4');
					continue;
				}

				Foxtrick.util.matchEvent.addEventIcons(event);
			}
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

		var livereportsContainer =
			doc.getElementById('ctl00_ctl00_CPContent_CPMain_UpdatePanelMatch');
		if (livereportsContainer)
			Foxtrick.onChange(livereportsContainer, reactAll, { subtree: false });
	},
};
