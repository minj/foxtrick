/**
 * highlight-ownerless.js
 * Highlight ownerless teams
 * @author ljushaff, ryanli
 */

var FoxtrickHighlightOwnerless = {
	MODULE_NAME : "HighlightOwnerless",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["league"],

	run : function(doc) {
		var span = doc.getElementById("ctl00_ctl00_CPContent_CPMain_repLeagueTable");
		var table = span.getElementsByTagName("table")[0];
		var ownerless = table.getElementsByClassName("shy");
		for (var i = 0; i < ownerless.length; ++i) {
			Foxtrick.addClass(ownerless[i], "ft-ownerless");
		}
	}
};
Foxtrick.util.module.register(FoxtrickHighlightOwnerless);
