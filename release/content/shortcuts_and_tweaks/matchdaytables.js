/**
* matchdaytables.js
* Foxtrick Displays next & last matches with long team names
* @author spambot
*/

var FoxtrickMatchDayTables = {

	MODULE_NAME : "MatchDayTables",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : false,

	init : function() {
		Foxtrick.registerPageHandler( 'league', this );
	},
	
	run : function( page, doc ) { 
		var table = doc.getElementById( 'ft_matchdaytable' );
		if( table != null ) return;
        
        try {
            
        } catch(e) {dump('MatchDayTables: '+e+'\n');}
	},
	
	change : function( page, doc ) {
		var table = doc.getElementById( 'ft_matchdaytable' );
		if( table == null ) {
			this.run( page, doc );
		}
	},	
};