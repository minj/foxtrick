/**
 * skillcoloring.js
 * Script which add colorizes skills and shows numbers for the skills
 * @author spambot, thx to baumanns
 */

var FoxtrickSkillColoring = {
	
    MODULE_NAME : "SkillColoring",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
    OPTIONS : {},
	
    init : function() {
            Foxtrick.registerPageHandler( 'all', FoxtrickSkillColoring);
            this.initOptions();                          
    },

    run : function( page, doc ) {
        // dump(this.MODULE_NAME + '\n');
        skillstyles = ["skill-color", "only-skill-color", "skill-number", "skill-number-selectoption"];
        displaystyles = [ Foxtrick.isModuleFeatureEnabled( this, "skill_color"  ), 
                          Foxtrick.isModuleFeatureEnabled( this, "only_skill_color" ), 
                          Foxtrick.isModuleFeatureEnabled( this, "skill_number" ), 
                          Foxtrick.isModuleFeatureEnabled( this, "skill_select" ) 
                        ];
        for (var i = 0; i < skillstyles.length; i++) {
            // dump ('SKILLS: ' + i + ' - ' + displaystyles[i] + ' enabled.\n');
            if (displaystyles[i]) {
                
                var css = "chrome://foxtrick/content/resources/skillcolors/" + skillstyles[i] + ".css";
                if  ( (i == 1) && (Foxtrick.isModuleEnabled( FoxtrickPersonalityImages ) ) ) {
                    css = "chrome://foxtrick/content/resources/skillcolors/" + skillstyles[i] + "-personal.css";
                    //dump ('personal\n');
                }
                Foxtrick.addStyleSheet( doc, css );
            }   
        }
	},
	
	change : function( page, doc ) {
	},
    
    initOptions : function() {
		this.OPTIONS = new Array( "skill_color",
								  "only_skill_color",
								  "skill_number",
								  "skill_select");
	}
};