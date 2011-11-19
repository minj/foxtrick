/*
 * ht-date-format.js
 * displays week and season next to date
 * @author spambot, ryanli
 */

var FoxtrickHTDateFormat = {
	MODULE_NAME : "HTDateFormat",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	NICE : 20, // after anthing that adds dates
	OPTIONS : ["LocalSeason", "FirstDayOfWeekOffset"],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DISABLED_LIST : [true, false],

	run : function(doc) {
		const pages = ["transfersTeam", "transfersPlayer", "transfer",
			"transferCompare", "match", "matches", "matchesarchiv",
			"teamPageGeneral", "achievements", "playerevents",
			"teamevents", "history", "arena", "league", "hallOfFame",
			"statsMatchesHeadToHead", "seriesHistory"];
		// don't show on where not needed and cluttering
		if (!Foxtrick.any(function(page) {
				return Foxtrick.isPage(page, doc);
			}, pages)) {
			return;
		}

		var mainBody = doc.getElementById("mainBody");
		if (!mainBody) return;

		const useLocal = FoxtrickPrefs.isModuleOptionEnabled("HTDateFormat", "LocalSeason");
		const weekOffset = FoxtrickPrefs.getString("module." + this.MODULE_NAME + ".FirstDayOfWeekOffset_text");
		var seperator=' ';
		// some table fixing for simple skin
		if (!Foxtrick.util.layout.isStandard(doc)) {
			if (Foxtrick.isPage("matches", doc))
				seperator = '<br/>';
		}
		if (Foxtrick.isPage("seriesHistory", doc))
			seperator = '<br/>';


		var modifyDate = function(node) {
			if (Foxtrick.hasClass(node, "ft-date") || Foxtrick.hasClass(node, "matchdate"))
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
				node.innerHTML = node.innerHTML + seperator + "(" + htDate.week + "/" + htDate.season + ")";
			}
		};

		var dates = mainBody.getElementsByClassName("date");
		Foxtrick.map(modifyDate, dates);
	},

	change : function(doc, ev) {
		FoxtrickHTDateFormat.run(doc);
	}
};
Foxtrick.util.module.register(FoxtrickHTDateFormat);
