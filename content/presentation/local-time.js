/**
 * local-time.js
 * Show time in local time zone
 * @author ryanli
 */

var FoxtrickLocalTime = {
	MODULE_NAME : "LocalTime",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	NICE : -10, // place before HTDateFormat, bellow everything that adds dates
	CSS : Foxtrick.ResourcePath + "resources/css/local-time.css",
	CSS_SIMPLE: Foxtrick.ResourcePath + "resources/css/local-time-simple.css",
	CSS_RTL : Foxtrick.ResourcePath + "resources/css/local-time-rtl.css",
	CSS_SIMPLE_RTL: Foxtrick.ResourcePath + "resources/css/local-time-simple-rtl.css",

	run : function(doc) {
		var time = doc.getElementById("time");
		// icon for Hattrick time zone
		time.title = Foxtrickl10n.getString("LocalTime.hattrick.title");

		// set up local time div at the header
		var localTime = doc.createElement("div");
		localTime.id = "ft-local-time";
		var updateTime = function() {
			localTime.textContent = Foxtrick.util.time.buildDate(null, true, true);
		};
		time.addEventListener('DOMCharacterDataModified',updateTime, false);
		
		localTime.title = Foxtrickl10n.getString("LocalTime.local.title");
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
			FoxtrickLocalTime.updatePage(doc);
		};
		time.addEventListener("click", toggleDisplay, false);
		localTime.addEventListener("click", toggleDisplay, false);

		FoxtrickLocalTime.updatePage(doc);
	},

	change : function(doc) {
		FoxtrickLocalTime.updatePage(doc);
	},
	
	updatePage : function(doc) {
		// updates all dates within the page
		if (!FoxtrickPrefs.getBool("module.LocalTime.local"))
			return;
		// only deal with nodes with class date in mainBody
		var mainBody = doc.getElementById("mainBody");
		if (!mainBody)
			return;
		var dates = mainBody.getElementsByClassName("date");
		dates = Foxtrick.filter(dates, function(n) { return !n.hasAttribute("x-lt-proced"); });

		Foxtrick.map(dates, function(date) {
			date.setAttribute("x-lt-proced", "true");
			// if text doesn't have time (hours and minutes) in it,
			// ignore it
			var hasTime = Foxtrick.util.time.hasTime(date.textContent);
			if (!hasTime)
				return;

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
		});
	}
}
Foxtrick.util.module.register(FoxtrickLocalTime);
