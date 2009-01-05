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
            Foxtrick.registerPageHandler( 'all',
                                          FoxtrickSkillColoring);
            this.initOptions();                          
    },

    run : function( page, doc ) {
        skillstyles = ["skill-color", "skill-number", "skill-number-selectoption"];
        displaystyles = [ Foxtrick.isModuleFeatureEnabled( this, "skill_color"), 
                    Foxtrick.isModuleFeatureEnabled( this, "skill_number"), 
                    Foxtrick.isModuleFeatureEnabled( this, "skill_select") ];
        for (var i = 0; i < skillstyles.length; i++) {
            // dump ('SKILLS: ' + i + ' - ' + displaystyles[i] + ' enabled.\n');
            if (displaystyles[i]) {
                
                var css = "chrome://foxtrick/content/resources/skillcolors/" + skillstyles[i] + ".css";
                var path = "head[1]";
                var head = doc.evaluate(path,doc.documentElement,null,
                    doc.DOCUMENT_NODE,null).singleNodeValue;

                var link = doc.createElement("link");
                link.setAttribute("rel", "stylesheet");
                link.setAttribute("type", "text/css");
                link.setAttribute("media", "all");
                link.setAttribute("href", css);
                head.appendChild(link);
            }   
        }
	},
	
	change : function( page, doc ) {
	},
    
    initOptions : function() {
		this.OPTIONS = new Array( "skill_color",
								  "skill_number",
								  "skill_select");
	}
};