/**
 * personalityImages.js
 * Script which add character image
 * @author smates
 */

var FoxtrickPersonalityImages = {
	
    MODULE_NAME : "PersonalityImages",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	
    init : function() {
            Foxtrick.registerPageHandler( 'playerdetail',
                                          FoxtrickPersonalityImages);
    },

    run : function( page, doc ) {
        // dump(this.MODULE_NAME + '\n');
		var css = "chrome://foxtrick/content/resources/personality/"+
			"characters.css";
		Foxtrick.addStyleSheet( doc, css );
	},
	
	change : function( page, doc ) {
	
	}
};