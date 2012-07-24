"use strict";
/**
 * personality-images.js
 * Script which add character image
 * @author smates/convinced
 */

Foxtrick.modules["PersonalityImages"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array("playerDetails", "training"),

	run : function(doc) {
		var skills = doc.getElementsByClassName("skill");
		for (var j = 0; j < skills.length; ++j) {
			var skill = skills[j];
			if (!skill.href) {
				// it should be an <a> element
				continue;
			}
			if (skill.href.search(/lt\=honesty/i) > -1
				|| skill.href.search(/lt\=gentleness/i) > -1) {
				var level = skill.href.match(/ll\=(\d)/)[1];
				Foxtrick.addImage(doc, skill, { 
					className : "ft-personality-img",
					src : Foxtrick.InternalPath + "resources/personality/red2blue/" + level + ".jpg"
				});
			}
			else if (skill.href.search(/lt\=aggressiveness/i) > -1) {
				var level = skill.href.match(/ll\=(\d)/)[1];
				Foxtrick.addImage(doc, skill, { 
					className : "ft-personality-img",
					src : Foxtrick.InternalPath + "resources/personality/blue2red/" + level + ".jpg"
				});
			}
		}
	}
};
