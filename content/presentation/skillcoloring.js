/**
 * skillcoloring.js
 * Script which add colorizes skills and shows numbers for the skills
 * @author spambot, thx to baumanns
 */

var FoxtrickSkillColoring = {

    MODULE_NAME : "SkillColoring",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('all'),
	DEFAULT_ENABLED : true,
    OPTIONS : new Array( "skill_color",
						  "only_skill_color",
						  "skill_number",
						  "skill_number_translated",
						  "skill_select",
						  "no_skill_links"),
	OPTIONS_CSS: new Array (	Foxtrick.ResourcePath+"resources/skillcolors/skill-color.css",
                                Foxtrick.ResourcePath+"resources/skillcolors/only-skill-color.css",
                                Foxtrick.ResourcePath+"resources/skillcolors/skill-number.css",
                                Foxtrick.ResourcePath+"resources/skillcolors/skill-number-translated.css",
                                Foxtrick.ResourcePath+"resources/skillcolors/skill-number-selectoption.css",
                                Foxtrick.ResourcePath+"resources/skillcolors/no-skill-links.css"
                           ),
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Numbers to team sprit and confidence. Small translated skills fix",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

    init : function() {
		if  ( Foxtrick.isModuleFeatureEnabled( this, "skill_number" ) && (Foxtrick.isModuleEnabled( FoxtrickPersonalityImages ) ) )
					this.OPTIONS_CSS[2] = Foxtrick.ResourcePath+"resources/skillcolors/skill-number-personal.css";
		if  ( Foxtrick.isModuleFeatureEnabled( this, "skill_number_translated" ) && (Foxtrick.isModuleEnabled( FoxtrickPersonalityImages ) ) )
                    this.OPTIONS_CSS[3] = Foxtrick.ResourcePath+"resources/skillcolors/skill-number-translated-personal.css";
    }
};
