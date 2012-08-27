"use strict";
/**
 * local-time.js
 * Show time in local time zone
 * @author ryanli
 */

Foxtrick.modules["LocalTime"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	NICE : -10, // place before HTDateFormat, below everything that adds dates
	CSS : Foxtrick.InternalPath + "resources/css/local-time.css",

	run : function(doc) {
		var updatePage = this.updatePage;

		var time = doc.getElementById("time");
		// icon for Hattrick time zone
		time.title = Foxtrickl10n.getString("LocalTime.hattrick.title");
		time = Foxtrick.makeFeaturedElement(time, this);
		
		// set up local time div at the header
		var localTime = doc.createElement("div");
		localTime.id = "ft-local-time";
		var updateTime = function() {
			localTime.textContent = Foxtrick.util.time.buildDate(null, true, true);
		};
		time.addEventListener('DOMCharacterDataModified',updateTime, false); // Chrome changes text node (optimised)
		time.addEventListener('DOMNodeInserted',updateTime, false); // FF creates a new node (correct behaviour)

		localTime.title = Foxtrickl10n.getString("LocalTime.local.title");
		localTime = Foxtrick.makeFeaturedElement(localTime, this);
		time.parentNode.insertBefore(localTime, time);

		// to tell whether #time or #ft-local-time should be hidden
		if (FoxtrickPrefs.getBool("module.LocalTime.local")) {
			updateTime();
			Foxtrick.addClass(time, "hidden");
		}
		else {
			Foxtrick.addClass(localTime, "hidden");
		}
		// add on-click events for toggling between local/HT times
		var toggleDisplay = function(ev) {
			FoxtrickPrefs.setBool("module.LocalTime.local", !FoxtrickPrefs.getBool("module.LocalTime.local"));
			Foxtrick.toggleClass(time, "hidden");
			Foxtrick.toggleClass(localTime, "hidden");
			updatePage(doc);
		};
		Foxtrick.onClick(time, toggleDisplay);
		Foxtrick.onClick(localTime, toggleDisplay);

		updatePage(doc);
	},

	change : function(doc) {
		this.updatePage(doc);
	},

	// updates all dates within the page
	updatePage : function(doc) {
		// only deal with nodes with class date in mainBody
		var mainBody = doc.getElementById("mainBody");
		if (!mainBody)
			return;
		// extract local and HT dates
		var dates = mainBody.getElementsByClassName("date");
		// if text doesn't have time (hours and minutes) in it,
		// ignore it
		dates = Foxtrick.filter(function(n) {
			return Foxtrick.util.time.hasTime(n.textContent);
		}, dates);
		var isLocalDate = function(n) { return n.hasAttribute("x-lt-proced"); };
		var localDates = Foxtrick.filter(isLocalDate, dates);
		var htDates = Foxtrick.filter(function(n) { return !isLocalDate(n); }, dates);
		if (FoxtrickPrefs.getBool("module.LocalTime.local")) {
			// turn HT dates to local dates
			Foxtrick.map(function(date) {
				date.setAttribute("x-lt-proced", "true");

				var htDate = Foxtrick.util.time.getDateFromText(date.textContent);
				if (!htDate)
					return; // may only contain time without date
				var tzDiff = Foxtrick.util.time.timezoneDiff(doc);
				var localDate = new Date();
				localDate.setTime(htDate.getTime() + tzDiff * 60 * 60 * 1000);
				// always build strings with hours and seconds, but
				// without seconds
				date.textContent = Foxtrick.util.time.buildDate(localDate, true, false);
				// set original time as attribute for reference from
				// other modules
				date.setAttribute("x-ht-date", htDate.getTime());
			}, htDates);
		}
		else {
			// turn local dates to HT dates
			Foxtrick.map(function(date) {
				var timestamp = new Date();
				timestamp.setTime(date.getAttribute("x-ht-date"));
				date.textContent = Foxtrick.util.time.buildDate(timestamp, true, false);
				date.removeAttribute("x-lt-proced");
				date.removeAttribute("x-ht-date");
			}, localDates);
		}
	}
};
