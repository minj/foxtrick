/**
 * Highlight Bot teams
 * @author ljushaff, ryanli
 */

FoxtrickHighlightBotTeams = {
	MODULE_NAME : "HighlightBotTeams",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('league'),
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Highlight Bot teams on series pages",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

	CSS : Foxtrick.ResourcePath + "resources/css/highlight-bots.css",

	run : function(page, doc) {
		var span = doc.getElementById("ctl00_CPMain_repLeagueTable");
		var table = span.getElementsByTagName("table")[0];
		var bots = table.getElementsByClassName("shy");
		for (var i = 0; i < bots.length; ++i) {
			Foxtrick.addClass(bots[i], "ft-bot");
		}
	}
};
