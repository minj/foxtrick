/**
 * youthskillHideUnknown.js
 * hide unknown youthskills
 * @Authors:  convincedd
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickYouthSkillHideUnknown = {

    MODULE_NAME : "YouthSkillHideUnknown",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('YouthPlayers'),
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE: "Added option to hide 'maximal' key word to gain more space if facecards are enabled",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS: new Array('HideUnknown','HideMaximalKeyWord'),

    run : function( page, doc ) {
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
						if (tds[1] && tds[1].getElementsByTagName('span')[0] && tds[1].getElementsByTagName('span')[0].className=='shy')
							trs[j].setAttribute('style','display:none;');
					}
					if (Foxtrick.isModuleFeatureEnabled( this, "HideMaximalKeyWord" ) && is_ownteam) {
						if (tds[2]) {
							var childs = tds[2].childNodes;
							for (var k=0;k<childs.length;++k) {
								if (childs[k].nodeType==3) {
									if (k==2) childs[k].nodeValue=' / ';
									else childs[k].nodeValue=' ';
								}
							}
						}
					}
				}
			}
		}
	}
}
