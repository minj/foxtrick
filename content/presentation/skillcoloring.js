/**
 * skillcoloring.js
 * Script which add colorizes skills and shows numbers for the skills
 * @author spambot, thx to baumanns
 */

var FoxtrickSkillColoring = {
	
    MODULE_NAME : "SkillColoring",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : true,
    OPTIONS : {},
	NEW_AFTER_VERSION: "0.4.8.2",	
	LASTEST_CHANGE:"Optional translated skills",
    
	
    init : function() {
            Foxtrick.registerPageHandler( 'all', FoxtrickSkillColoring);
            this.initOptions();                          
    },

    run : function( page, doc ) {
        // dump(this.MODULE_NAME + '\n');
		var url = Foxtrick.getHref( doc );
        var isMessage = (url.match(/Forum/i) || url.match(/Inbox/i));
        // dump( '\n >> ' + url + '\n');
        if (isMessage) return;
 		
        
        var skillstyles = ["skill-color", "only-skill-color", "skill-number", "skill-number-translated", "skill-number-selectoption", "no-skill-links"];
        var displaystyles = [ Foxtrick.isModuleFeatureEnabled( this, "skill_color"  ), 
                          Foxtrick.isModuleFeatureEnabled( this, "only_skill_color" ), 
                          Foxtrick.isModuleFeatureEnabled( this, "skill_number" ), 
                          Foxtrick.isModuleFeatureEnabled( this, "skill_number_translated" ), 
                          Foxtrick.isModuleFeatureEnabled( this, "skill_select" ),
						  Foxtrick.isModuleFeatureEnabled( this, "no_skill_links" ),
                        ];
        for (var i = 0; i < skillstyles.length; i++) {
            // dump ('SKILLS: ' + i + ' - ' + displaystyles[i] + ' enabled.\n');
            if (displaystyles[i]) {
                
                var css = "chrome://foxtrick/content/resources/skillcolors/" + skillstyles[i] + ".css";
                if  ( (i == 2 || i == 3) && (Foxtrick.isModuleEnabled( FoxtrickPersonalityImages ) ) ) {
                    css = "chrome://foxtrick/content/resources/skillcolors/" + skillstyles[i] + "-personal.css";
                    //dump ('personal\n');
                }
                Foxtrick.addStyleSheet( doc, css );
            }   
        }
		// seems to cause a problem, it disables the player personalitiy on the simpleLayout, because it only loads the skill-numbers-width-fix.css
		if ( !Foxtrick.isStandardLayout ( doc ) &&
				(doc.location.href.search(/Club\/Players\/Player\.aspx\?PlayerID/i) != -1 ||
				doc.location.href.search(/Club\/Players\/YouthPlayers\.aspx\?YouthTeamID/i) != -1 )) {  
					Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/resources/skillcolors/skill-numbers-width-fix.css");
		}
	},
	
	change : function( page, doc ) {
	},
    
    initOptions : function() {
	this.OPTIONS = new Array( "skill_color",
								  "only_skill_color",
								  "skill_number",
								  "skill_number_translated",
								  "skill_select",
								  "no_skill_links");
	}
};