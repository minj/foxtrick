/**
 * youthskillHideUnknown.js
 * hide unknown youthskills
 * @Authors:  convincedd
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickYouthSkillHideUnknown = {

	MODULE_NAME : "YouthSkillHideUnknown",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('YouthPlayers'),
	OPTIONS: new Array('HideUnknown','HideMaximalKeyWord'),

	run : function( page, doc ) {
		// checks whether a table cell (<td> element) is unknown
		var isUnknown = function(cell) {
			return cell.getElementsByClassName("youthSkillBar").length == 0
				&& cell.getElementsByClassName("highlight").length == 0;
		};

		var ownteamid = FoxtrickHelper.getOwnTeamId();
		var teamid = FoxtrickHelper.findTeamId(doc.getElementById('content').getElementsByTagName('div')[0]);
		var is_ownteam = (ownteamid==teamid);

		var faceCardOn=false;
		var allDivs = doc.getElementsByTagName("div");
		for(var i = 0; i < allDivs.length; i++) {
			if (allDivs[i].className=="faceCard") faceCardOn=true;
			if(allDivs[i].className=="playerInfo") {
				var trs = allDivs[i].getElementsByTagName('table')[0].getElementsByTagName("tr");
				for(var j = 0; j < trs.length; j++) {
					var tds = trs[j].getElementsByTagName("td");
					if (Foxtrick.isModuleFeatureEnabled( this, "HideUnknown" )) {
						if (isUnknown(tds[1]))
							Foxtrick.addClass(trs[j], "hidden");
					}
					if (Foxtrick.isModuleFeatureEnabled( this, "HideMaximalKeyWord" ) && is_ownteam) {
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
}
