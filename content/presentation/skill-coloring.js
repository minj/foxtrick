"use strict";
/**
 * skill-coloring.js
 * Script which add colorizes skills and shows numbers for the skills
 * @author spambot, thx to baumanns
 */

Foxtrick.modules["SkillColoring"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	OPTIONS : [
		"skill_color",
		"only_skill_color",
		"skill_number",
		"skill_number_translated",
		"skill_select",
		"no_skill_links"
	],
	CSS : Foxtrick.InternalPath+"resources/skillcolors/common.css",
	OPTIONS_CSS : [
		Foxtrick.InternalPath+"resources/skillcolors/skill-color.css",
		Foxtrick.InternalPath+"resources/skillcolors/only-skill-color.css",
		Foxtrick.InternalPath+"resources/skillcolors/skill-number.css",
		Foxtrick.InternalPath+"resources/skillcolors/skill-number-translated.css",
		Foxtrick.InternalPath+"resources/skillcolors/skill-number-selectoption.css",
		Foxtrick.InternalPath+"resources/skillcolors/no-skill-links.css"
	],

	init : function() {
		if (FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "skill_number") && (FoxtrickPrefs.isModuleEnabled("PersonalityImages")))
			this.OPTIONS_CSS[2] = Foxtrick.InternalPath+"resources/skillcolors/skill-number-personal.css";
		if (FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "skill_number_translated") && (FoxtrickPrefs.isModuleEnabled("PersonalityImages")))
			this.OPTIONS_CSS[3] = Foxtrick.InternalPath+"resources/skillcolors/skill-number-translated-personal.css";
	},
	
	run : function (doc) {
		
		var playerDetailsChange = function (ev) { 
			//Foxtrick.log('playerDetailsChange')
			var percentImages = doc.getElementById('details').querySelectorAll("img.percentImage, img.ft-percentImage");
			for (var i=0; i<percentImages.length; ++i) {
				var td = percentImages[i].parentNode;
				if (Foxtrick.hasClass(td, 'skill_number'))
					continue;
				Foxtrick.addClass(td, 'skill_number');
				td.appendChild(doc.createTextNode( ' ('+percentImages[i].title.match(/\d+/)+')' ));
			}
		};

		// add skillnumbers to the dynamically filled player details div on the lineup page
		if ( Foxtrick.isPage('matchOrder', doc) && 
			(FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "skill_number")
			|| FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "skill_number_translated"))) {
			Foxtrick.addMutationEventListener(doc.getElementById('details'), "DOMNodeInserted", playerDetailsChange, false);
		}
	}
};
