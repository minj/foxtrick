/**
 * newmail.js
 * Script which makes the new mails more visible
 * @author htbaumanns
 */

var FoxtrickNewMail = {
	
    MODULE_NAME : "NewMail",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : true,
	
    init : function() {
            Foxtrick.registerPageHandler( 'all',
                                          FoxtrickNewMail);
    },

    run : function( page, doc ) {
        // dump(this.MODULE_NAME + '\n');
		var css = "chrome://foxtrick/content/resources/css/newmail.css";
        Foxtrick.addStyleSheet( doc, css );
	},
	
	change : function( page, doc ) {
	
	}
};