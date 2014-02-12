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
		var livereportsContainer =
			doc.getElementById('ctl00_ctl00_CPContent_CPMain_UpdatePanelMatch');
		if (livereportsContainer)
			Foxtrick.listen(livereportsContainer, 'DOMNodeInserted',
			  function(event) {
				if (event.target.className == 'liveReport') {
					react(event.target, true);
				}
			}, false);

		var lContainer = doc.getElementsByClassName('liveMatchContainer')[0];
		if (lContainer)
			Foxtrick.listen(lContainer, 'DOMNodeInserted',
			  function(event) {
				if (event.target.getAttribute && event.target.getAttribute('id') &&
					event.target.getAttribute('id') == 'ctl00_ctl00_CPContent_CPMain_repM') {
					var livereports = event.target.getElementsByClassName('liveReport');
					for (var i = 0; i < livereports.length; i++)
						react(livereports[i], true);
				}
			}, false);

		// firstload
		var livereports = doc.getElementsByClassName('liveReport');
		for (var i = 0; i < livereports.length; i++) {
			react(livereports[i], true);
		}
	},
};
