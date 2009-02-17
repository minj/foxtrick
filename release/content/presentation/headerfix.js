/**
 * headerfix.js
 * Script which fixes the header
 * @author htbaumanns, CSS by Catalyst2950  
 */

var FoxtrickHeaderFix = {
	
    MODULE_NAME : "HeaderFix",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : false,
	
    init : function() {
            Foxtrick.registerPageHandler( 'all',
                                          FoxtrickHeaderFix);
    },

    run : function( page, doc ) {
        // dump(this.MODULE_NAME + '\n');
		if ( !Foxtrick.isStandardLayout ( doc ) ) {
		var css = "chrome://foxtrick/content/resources/css/headerfix.css";
        Foxtrick.addStyleSheet( doc, css );
		}
	},
	
	change : function( page, doc ) {
	
	}
};