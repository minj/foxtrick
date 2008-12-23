/**
 * Flip Sides by a click in the match orders page 
 * @author kolmis
 */

//Foxtrick.modules.FlipSidesInMatchOrders = {
FoxtrickFlipSidesInMatchOrders = {
	
    MODULE_NAME : "FlipSidesInMatchOrders",
    MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
    DEFAULT_ENABLED : true,

    init : function() {
        Foxtrick.registerPageHandler('matchOrders', this);
    },

    run : function(page, doc) {
    
		var startLineupElement = doc.getElementById('startlineup');
		if(startLineupElement) {
			Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/resources/"
				+ "css/matchorders.css");
			Foxtrick.addJavaScript(doc, "chrome://foxtrick/content/resources/"
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
     }

};