'use strict';
/**
 * Formats the match report.
 * @author spambot, ryanli, CatzHoek, ljushaff
 */

/*
 * Match examples:
 * Match with penalty shoot-out:
 * https://www.hattrick.org/goto.ashx?path=/Club/Matches/Match.aspx?matchID=347558980
 */

Foxtrick.modules.MatchReportFormat = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	OPTIONS: ['ShowEventIcons'],
	CSS: Foxtrick.InternalPath + 'resources/css/match-report.css',

	run: function(doc) {

		var module = this;

		/*
		 * Construct a table row that resembles a valid HT-Live Event
		 * Has time, data-evnttype & event text
		 */
		var buildEventRow = function(doc, evnt) {
			var isHomeEvent = Foxtrick.util.matchEvent.isHomeEvent(evnt);
			var isAwayEvent = Foxtrick.util.matchEvent.isAwayEvent(evnt);
			var eventMinute = Foxtrick.util.matchEvent.getEventMinute(evnt);
			var eventId = Foxtrick.util.matchEvent.getEventId(evnt);

			var row = doc.createElement('tr');
			row.setAttribute('data-eventtype', eventId);

			if (isHomeEvent)
				Foxtrick.addClass(row, 'liveHomeEvent');
			else if (isAwayEvent)
				Foxtrick.addClass(row, 'liveAwayEvent');

			var dateCell = doc.createElement('td');
			var eventCell = doc.createElement('td');
			var eventDiv = doc.createElement('div');

			Foxtrick.addClass(dateCell, 'date');
			Foxtrick.addClass(eventCell, 'liveEvent');

			dateCell.textContent = eventMinute + "'";
			eventDiv.appendChild(evnt);

			row.appendChild(dateCell);
			eventCell.appendChild(eventDiv);
			row.appendChild(eventCell);

			return row;
		};

		/*
		 * Construct HT-Live like table from all events on this site
		 */
		var buildEventTable = function(doc) {
			var table = Foxtrick.createFeaturedElement(doc, module, 'table');
			var tbody = doc.createElement('tbody');
			table.appendChild(tbody);

			// work on the actual events
			var events = doc.querySelectorAll('#matchReport > .matchevent');
			Foxtrick.forEach(function(evnt) {
				var clonedEvent = evnt.cloneNode(true);
				var row = buildEventRow(doc, clonedEvent);
				tbody.appendChild(row);

				// hide the original event
				Foxtrick.addClass(evnt, 'hidden');
			}, events);
			return table;
		};

		var doMatchReport = function(doc, matchReport) {

			// steal HT-Live styling
			Foxtrick.addClass(matchReport, 'liveReport ft-matchReport');

			// match report header
			var reportHeader = Foxtrick.createFeaturedElement(doc, module, 'h2');
			Foxtrick.addClass(reportHeader, 'ft-expander-expanded');
			reportHeader.textContent = Foxtrick.L10n.getString('MatchReportFormat.MatchReport');
			matchReport.parentNode.insertBefore(reportHeader, matchReport);

			Foxtrick.onClick(reportHeader, function() {
				Foxtrick.toggleClass(reportHeader, 'ft-expander-unexpanded');
				Foxtrick.toggleClass(reportHeader, 'ft-expander-expanded');
				Foxtrick.toggleClass(matchReport, 'hidden');
			});

			// build HT-Live Style Table from existing events
			var table = buildEventTable(doc);

			// now we have the same thing as in HT-Live
			// We just need to decorate it
			var events = table.getElementsByTagName('tr');
			for (var i = 0; i < events.length; i++) {
				if (Foxtrick.Prefs.isModuleOptionEnabled('MatchReportFormat', 'ShowEventIcons'))
					Foxtrick.util.matchEvent.addEventIcons(events[i]);
			}

			matchReport.insertBefore(table, matchReport.firstChild);
		};

		if (Foxtrick.Pages.Match.isPrematch(doc))
			return;

		// do the stuff
		var matchReport = doc.getElementById('matchReport');
		doMatchReport(doc, matchReport);
		Foxtrick.util.matchEvent.addEventIndicators(matchReport);
	}
};
