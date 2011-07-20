/**
 * skill-coloring.js
 * Script which add colorizes skills and shows numbers for the skills
 * @author spambot, thx to baumanns
 */

var FoxtrickSkillColoring = {

	MODULE_NAME : "SkillColoring",
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
	OPTIONS_CSS : [
		Foxtrick.ResourcePath+"resources/skillcolors/skill-color.css",
		Foxtrick.ResourcePath+"resources/skillcolors/only-skill-color.css",
		Foxtrick.ResourcePath+"resources/skillcolors/skill-number.css",
		Foxtrick.ResourcePath+"resources/skillcolors/skill-number-translated.css",
		Foxtrick.ResourcePath+"resources/skillcolors/skill-number-selectoption.css",
		Foxtrick.ResourcePath+"resources/skillcolors/no-skill-links.css"
	],

	init : function() {
		if ( FoxtrickPrefs.isModuleOptionEnabled( this, "skill_number" ) && (FoxtrickPrefs.isModuleEnabled( FoxtrickPersonalityImages ) ) )
			this.OPTIONS_CSS[2] = Foxtrick.ResourcePath+"resources/skillcolors/skill-number-personal.css";
		if ( FoxtrickPrefs.isModuleOptionEnabled( this, "skill_number_translated" ) && (FoxtrickPrefs.isModuleEnabled( FoxtrickPersonalityImages ) ) )
			this.OPTIONS_CSS[3] = Foxtrick.ResourcePath+"resources/skillcolors/skill-number-translated-personal.css";
	}
};
