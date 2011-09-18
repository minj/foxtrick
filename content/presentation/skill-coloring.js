/**
 * skill-coloring.js
 * Script which add colorizes skills and shows numbers for the skills
 * @author spambot, thx to baumanns
 */

Foxtrick.util.module.register({
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
	}
});
