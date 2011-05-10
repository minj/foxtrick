/**
 * youth-skill-hide-unknown.js
 * Hide unknown skills and/or "maximum" word on youth players page
 * @author convincedd
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickYouthSkillHideUnknown = {
	MODULE_NAME : "YouthSkillHideUnknown",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["YouthPlayers"],
	OPTIONS: ["HideUnknown", "HideMaximalKeyWord"],

	run : function( page, doc ) {
		// checks whether a table cell (<td> element) is unknown
		var isUnknown = function(cell) {
			return cell.getElementsByClassName("youthSkillBar").length == 0
				&& cell.getElementsByClassName("highlight").length == 0;
		};

		// only for own team
		var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		if (ownTeamId != teamId)
			return;

		var playerInfos = doc.getElementsByClassName("playerInfo");
		for (var i = 0; i < playerInfos.length; i++) {
			var playerInfo = playerInfos[i];
			var trs = playerInfo.getElementsByTagName("table")[0].getElementsByTagName("tr");
			for (var j = 0; j < trs.length; j++) {
				var tds = trs[j].getElementsByTagName("td");
				if (Foxtrick.isModuleFeatureEnabled(this, "HideUnknown")) {
					if (isUnknown(tds[1]))
						Foxtrick.addClass(trs[j], "hidden");
				}
				if (Foxtrick.isModuleFeatureEnabled(this, "HideMaximalKeyWord")) {
					var skillBars = doc.getElementsByClassName("youthSkillBar");
					for (var k = 0; k < skillBars.length; ++k) {
						var skillBar = skillBars[k];
						var textNodeIndex = 0;
						for (var l = 0; l < skillBar.childNodes.length; ++l) {
							if (skillBar.childNodes[l].nodeType == Node.TEXT_NODE) {
								if (textNodeIndex++ == 1)
									skillBar.childNodes[l].textContent = " / ";
								else
									skillBar.childNodes[l].textContent = " ";
							}
						}
					}
				}
			}
		}
	}
}
