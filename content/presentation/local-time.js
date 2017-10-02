'use strict';
/**
 * local-time.js
 * Show time in local time zone
 * @author ryanli
 */

Foxtrick.modules['LocalTime'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	NICE: -10, // place before HTDateFormat, below everything that adds dates
	CSS: Foxtrick.InternalPath + 'resources/css/local-time.css',

	run: function(doc) {
		var updatePage = this.updatePage;

		var time = doc.getElementById('time');
		// icon for Hattrick time zone
		time.title = Foxtrick.L10n.getString('LocalTime.hattrick.title');
		time = Foxtrick.makeFeaturedElement(time, this);

		// set up local time div at the header
		var localTime = doc.createElement('div');
		localTime.id = 'ft-local-time';
		var updateTime = function() {
			localTime.textContent = Foxtrick.util.time.buildDate(null, { showSecs: true });
		};
		Foxtrick.onChange(time, updateTime, { characterData: true });
		// Chrome needs characterData, FF needs childList

		localTime.title = Foxtrick.L10n.getString('LocalTime.local.title');
		localTime = Foxtrick.makeFeaturedElement(localTime, this);
		time.parentNode.insertBefore(localTime, time);

		// to tell whether #time or #ft-local-time should be hidden
		if (Foxtrick.Prefs.getBool('module.LocalTime.local')) {
			updateTime();
			Foxtrick.addClass(time, 'hidden');
		}
		else {
			Foxtrick.addClass(localTime, 'hidden');
		}
		// add on-click events for toggling between local/user times
		var toggleDisplay = function(ev) {
			Foxtrick.Prefs.setBool('module.LocalTime.local',
			                      !Foxtrick.Prefs.getBool('module.LocalTime.local'));
			Foxtrick.toggleClass(time, 'hidden');
			Foxtrick.toggleClass(localTime, 'hidden');
			updatePage(doc);
		};
		Foxtrick.onClick(time, toggleDisplay);
		Foxtrick.onClick(localTime, toggleDisplay);

		updatePage(doc);
	},

	change: function(doc) {
		this.updatePage(doc);
	},

	// updates all dates within the page
	updatePage: function(doc) {
		// only deal with nodes with class date in mainBody
		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;
		// extract local and HT dates
		var dates = mainBody.getElementsByClassName('date');
		// if text doesn't have time (hours and minutes) in it,
		// ignore it
		dates = Foxtrick.filter(function(n) {
			return Foxtrick.util.time.hasTime(n.textContent);
		}, dates);
		var isLocalDate = function(n) { return n.dataset.localTime; };
		var localDates = Foxtrick.filter(isLocalDate, dates);
		var userDates = Foxtrick.filter(function(n) { return !isLocalDate(n); }, dates);
		if (Foxtrick.Prefs.getBool('module.LocalTime.local')) {
			// turn User dates to local dates
			Foxtrick.map(function(date) {
				date.dataset.localTime = '1';

				var userDate = Foxtrick.util.time.getDateFromText(date.textContent);
				if (!userDate)
					return; // may only contain time without date

				var localDate = Foxtrick.util.time.toLocal(doc, userDate);
				// always build strings with hours and seconds, but without seconds
				date.textContent = Foxtrick.util.time.buildDate(localDate);
				// set original time as attribute for reference from other modules
				date.dataset.userDate = userDate.getTime();
			}, userDates);
		}
		else {
			// turn local dates to user dates
			Foxtrick.map(function(date) {
				var timestamp = new Date();
				timestamp.setTime(date.dataset.userDate);
				date.textContent = Foxtrick.util.time.buildDate(timestamp);
				date.removeAttribute('data-local-time');
				date.removeAttribute('data-user-date');
			}, localDates);
		}
	},
};
