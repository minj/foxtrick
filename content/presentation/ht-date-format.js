/*
 * ht-date-format.js
 * displays week and season next to date
 * @author spambot, ryanli
 */

var FoxtrickHTDateFormat = {
	MODULE_NAME : "HTDateFormat",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ['transfersTeam','transfersPlayer','transfer','transferCompare','match',
		'matches','matchesarchiv','teamPageGeneral','achievements','playerevents',
		'teamevents','history','arena','league','hallOfFame','statsMatchesHeadToHead'],
	ONPAGEPREF_PAGE : 'all',
	OPTIONS : ["LocalSeason", "FirstDayOfWeekOffset"],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DISABLED_LIST : [true, false],

	run : function(page, doc) {
		var mainBody = doc.getElementById("mainBody");
		if (!mainBody) return;

		const useLocal = Foxtrick.isModuleFeatureEnabled(this, "LocalSeason");
		const weekOffset = FoxtrickPrefs.getString("module." + this.MODULE_NAME + ".FirstDayOfWeekOffset_text");

		var modifyDate = function(node) {
			if (Foxtrick.hasClass(node, "ft-date"))
				return;
			if (node.hasAttribute("x-ht-date")) {
				// attribute x-ht-date set by LocalTime, while inner
				// text is not HT date but local date
				var date = new Date();
				date.setTime(node.getAttribute("x-ht-date"));
			}
			else
				var date = Foxtrick.util.time.getDateFromText(node.textContent);
			if (date) {
				var htDate = Foxtrick.util.time.gregorianToHT(date, weekOffset, useLocal);
				Foxtrick.addClass(node, "ft-date");
				node.textContent = node.textContent + " (" + htDate.week + "/" + htDate.season + ")";
			}
		};

		var dates = mainBody.getElementsByClassName("date");
		Foxtrick.map(dates, modifyDate);
	}
};
