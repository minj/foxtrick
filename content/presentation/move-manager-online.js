/**
 * move-manager-online.js
 * Move online managers to the top of the page on region page
 * @author convinced, ryanli
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMoveManagerOnline= {
	MODULE_NAME : "MoveManagerOnline",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["region"],

	run : function(page, doc) {
		var isManagersList = function(node) {
			var table = node.getElementsByTagName("table")[0];
			return table && !Foxtrick.hasClass(table, "thin");
		};
		var mainBody = doc.getElementById("mainBody");
		var mainBoxes = mainBody.getElementsByClassName("mainBox");
		var target = doc.getElementsByClassName("separator")[0].nextSibling;
		for (var i = 0; i < mainBoxes.length; ++i) {
			var box = mainBoxes[i];
			if (isManagersList(box)) {
				var div = mainBody.removeChild(box);
				mainBody.insertBefore(div, target);
				break;
			}
		}
	}
}
