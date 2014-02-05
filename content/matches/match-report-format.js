'use strict';
/**
 * Formats the match report.
 * @author spambot, ryanli, CatzHoek, ljushaff
 */

/*
 * Match examples:
 * Match with penalty shoot-out:
 * http://www.hattrick.org/Club/Matches/Match.aspx?matchID=347558980
 */

Foxtrick.modules.MatchReportFormat = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match', 'matchOld'],
	OPTIONS: ['ShowEventIcons'],
	CSS: Foxtrick.InternalPath + 'resources/css/match-report.css',

	run: function(doc) {

		/*
		 * Construct a table row that resembles a valid HT-Live Event
		 * Has time, data-eventtype & event text
		 */
		var buildEventRow = function(doc, event){
			var isHomeEvent 	= Foxtrick.util.matchEvent.isHomeEvent(event);
			var isAwayEvent 	= Foxtrick.util.matchEvent.isAwayEvent(event);
			var eventMinute 	= Foxtrick.util.matchEvent.getEventMinute(event);
			var eventId 	 	= Foxtrick.util.matchEvent.getEventId(event);

			var row = doc.createElement('tr');
			row.setAttribute('data-eventtype', eventId );

			if(isHomeEvent)
				Foxtrick.addClass(row, 'liveHomeEvent');
			else if(isAwayEvent)
				Foxtrick.addClass(row, 'liveAwayEvent');

			var dateCell = doc.createElement('td');
			var eventCell = doc.createElement('td');
			var eventDiv = doc.createElement('div');

			Foxtrick.addClass(dateCell, 'date');
			Foxtrick.addClass(eventCell, "liveEvent");

			dateCell.textContent = eventMinute + "'";
			eventDiv.appendChild(event);

			row.appendChild(dateCell);
			eventCell.appendChild(eventDiv);
			row.appendChild(eventCell);

			/*
				HT-Bodin:
				550 is the ball possession. 
				It's an old hack having it reported in there. 
				It's my change to add span-elements around every event that made these appear, 
				I'll have them removed again.
				---
				@Todo: Remove this. Required until the change hits production next week or so

			*/
			if(eventId == 550)
				Foxtrick.addClass(row, 'hidden');

			return row;
		}

		/*
		 * Construct HT-Live like table from all events on this site
		 */
		var buildEventTable = function(doc){
			var table = doc.createElement('table');
			var tbody = doc.createElement('tbody');
			table.appendChild(tbody);

			//work on the actual events
			var events = doc.querySelectorAll('#matchReport > .matchevent');
			for(var i = 0; i < events.length; i++){
				var event = events[i];	
				var clonedEvent = event.cloneNode(true);
				var row = buildEventRow(doc, clonedEvent);
				tbody.appendChild(row);

				//hide the original event
				Foxtrick.addClass(event, 'hidden');
			}
			return table;
		}

		/*
	     * Rebuild HT hover highlighting.
	     * HT works on the n-th child of the report
	     * which doesn't work for us we we can't easily hack their approach to work with the new report
			 */
		var fixHighlighting = function(doc){
			var addHighlight = function(){
				var eventIdx = this.querySelector('td[id^=matchEventIndex_]').getAttribute('id').match(/\d+/)[0];
				var ft_event = doc.querySelector('[ht-event-idx="' + eventIdx + '"]');
				Foxtrick.addClass(ft_event, "highlightReportEvent");
			}

			var removeHighlight = function(){
				var eventIdx = this.querySelector('td[id^=matchEventIndex_]').getAttribute('id').match(/\d+/)[0];
				var ft_event = doc.querySelector('[ht-event-idx="' + eventIdx + '"]');
				Foxtrick.removeClass(ft_event, "highlightReportEvent");
			}

			//register events for all rows in the sidebar that indicate events
			var eventHighlights = doc.querySelectorAll('.tblHighlights tr > td[id^=matchEventIndex_]');
				for(var ehl = 0; ehl < eventHighlights.length; ehl++){
					var row = eventHighlights[ehl].parentNode;
					row.addEventListener("mouseover", addHighlight, true);
					row.addEventListener("mouseout", removeHighlight, true);
				}
		}

		var doMatchReport = function(doc, matchReport){
			var matchReport = doc.getElementById('matchReport');

			//steal HT-Live styling
			Foxtrick.addClass(matchReport, 'liveReport');

			//match report header
			var reportHeader = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.MatchReportFormat, 'h2');
			matchReport.parentNode.insertBefore(reportHeader, matchReport);
			reportHeader.className = 'ft-expander-expanded';
			reportHeader.textContent = Foxtrick.L10n.getString('MatchReportFormat.MatchReport');

			Foxtrick.onClick(reportHeader, function() {
				Foxtrick.toggleClass(reportHeader, 'ft-expander-unexpanded');
				Foxtrick.toggleClass(reportHeader, 'ft-expander-expanded');
				Foxtrick.toggleClass(matchReport, 'hidden');
			});

			//build HT-Live Style Table from existing events
			var table = buildEventTable(doc);

			//now we have the same thing as in HT-Live
			//We just need to decorate it
			var events = table.getElementsByTagName('tr');
			for(var i=0; i < events.length; i++){
				if (Foxtrick.Prefs.isModuleOptionEnabled('MatchReportFormat', 'ShowEventIcons'))
					Foxtrick.util.matchEvent.addEventIcons(events[i]);

				//remember original event index to re-create HT event highlighting feature
				events[i].setAttribute('ht-event-idx', i);
			}

			matchReport.insertBefore(table, matchReport.firstChild);
		}

		if(!Foxtrick.Pages.Match.hasNewRatings(doc))
			return;

		if (Foxtrick.Pages.Match.isPrematch(doc)
			|| Foxtrick.Pages.Match.inProgress(doc))
			return;

		//do the stuff
		doMatchReport(doc);
		Foxtrick.util.matchEvent.addEventIndicators(matchReport);
		fixHighlighting(doc);
	}
};