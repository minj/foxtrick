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
	NEW_AFTER_VERSION: "0.4.8.1",
	LATEST_CHANGE:"Hide unknown youthskills",

    init : function() {
    },

    run : function( page, doc ) {
				var faceCardOn=false;
				var allDivs = doc.getElementsByTagName("div");
				for(var i = 0; i < allDivs.length; i++) {
					if (allDivs[i].className=="faceCard") faceCardOn=true;
					if(allDivs[i].className=="playerInfo") {
						var trs = allDivs[i].getElementsByTagName("tr");
						for(var j = 0; j < trs.length; j++) {
							var tds = trs[j].getElementsByTagName("td");// Foxtrick.dump(tds[1].getElementsByTagName('span')[0].innerHTML+'\n');
							if (tds[1] && tds[1].getElementsByTagName('span')[0] && tds[1].getElementsByTagName('span')[0].className=='shy')
								trs[j].setAttribute('style','display:none;');
						}
					}
				}
	},
	
	change : function( page, doc ) {
	
	},
}