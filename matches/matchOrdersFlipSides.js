/**
 * Flip Sides by a click in the match orders page 
 * @author kolmis
 */

//Foxtrick.modules.FlipSidesInMatchOrders = {
FoxtrickFlipSidesInMatchOrders = {
	
    MODULE_NAME : "FlipSidesInMatchOrders",
    MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('matchOrders'), 
    DEFAULT_ENABLED : false,

    init : function() {
    },

    run : function(page, doc) {
    
		var startLineupElement = doc.getElementById('startlineup');
		if(startLineupElement) {
			Foxtrick.addStyleSheet(doc, Foxtrick.ResourcePath+"resources/"
				+ "css/matchorders.css");
			Foxtrick.addJavaScript(doc, Foxtrick.ResourcePath+"resources/"
				+ "js/matchorders.js");
    
			var div = doc.createElement("div");
			div.className = "foxtrick-flipsides";
			var divId = "foxtrick-flipsides-div";
			div.setAttribute( "id", divId );
          
			var flipsides = doc.createElement("a");
			flipsides.innerHTML = Foxtrickl10n.getString("foxtrick.matchorders"
				+ ".flipsides");
			flipsides.href="javascript:FoxtrickMatchOrders.flipSides()";
			div.appendChild(flipsides);
			
			if( !doc.getElementById( divId ) ) {
				// Only do this if it's not already there
				startLineupElement.appendChild(div);
			}
		}
    },
	
	change : function( page, doc ) {
	
	}
};