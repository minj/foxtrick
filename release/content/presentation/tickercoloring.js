/**
 * tickercoloring.js
 * Script which add colors to the ticker
 * @author htbaumanns
 */

var FoxtrickTickerColoring = {
	
    MODULE_NAME : "TickerColoring",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : true,
	
    init : function() {
            Foxtrick.registerPageHandler( 'all',
                                          FoxtrickTickerColoring);
    },

    run : function( page, doc ) {
        // dump(this.MODULE_NAME + '\n');
		var css = "chrome://foxtrick/content/resources/css/tickercoloring.css";
        Foxtrick.addStyleSheet( doc, css );
	},
	
	change : function( page, doc ) {
	
	}
};