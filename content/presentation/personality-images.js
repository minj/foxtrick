/**
 * personality-images.js
 * Script which add character image
 * @author smates/convinced
 */

var FoxtrickPersonalityImages = {
	MODULE_NAME : "PersonalityImages",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array("playerdetail", "training"),

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
				var img = doc.createElement("img");
				img.className = "ft-personality-img";
				img.src = Foxtrick.ResourcePath + "resources/personality/red2blue/" + level + ".jpg";
				skill.appendChild(img);
			}
			else if (skill.href.search(/lt\=aggressiveness/i) > -1) {
				var level = skill.href.match(/ll\=(\d)/)[1];
				var img = doc.createElement("img");
				img.className = "ft-personality-img";
				img.src = Foxtrick.ResourcePath + "resources/personality/blue2red/" + level + ".jpg";
				skill.appendChild(img);
			}
		}
	}
};
Foxtrick.util.module.register(FoxtrickPersonalityImages);
