/**
 * Formation Box - show select formation info in the match orders pages  
 * @author kolmis
 */

FoxtrickFormationBoxInMatchOrders = {
	
    MODULE_NAME : "FormationBoxInMatchOrders",
    MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('matchOrders'), 
    DEFAULT_ENABLED : true,

    init : function() {
    },

    run : function(page, doc) {
        
        if (doc.getElementById( 'ctl00_CPMain_pnlFlash' ) != null ) return;
            
        Foxtrick.addStyleSheet(doc, Foxtrick.ResourcePath+"resources/css/matchorders.css");
        Foxtrick.addJavaScript(doc, Foxtrick.ResourcePath+"resources/js/matchorders.js");
                
        var div = doc.createElement("div");
        div.className = "foxtrick-formationbox";
		var divId = "foxtrick-formationbox-div";
		div.setAttribute( "id", divId );
        
        div.innerHTML = '<span>' + Foxtrickl10n.getString("foxtrick.matchorders.formation") + ': </span> \
                         <span id="foxtrick-formationinfo"></span><br />\
                         <span id="foxtrick-formationinfo-players-cd"></span>\
                         <span> ' + Foxtrickl10n.getString("foxtrick.matchorders.formationcds") + ', </span>\
                         <span id="foxtrick-formationinfo-players-im"></span>\
                         <span> ' + Foxtrickl10n.getString("foxtrick.matchorders.formationims") + ', </span>\
                         <span id="foxtrick-formationinfo-players-fwd"></span>\
                         <span> ' + Foxtrickl10n.getString("foxtrick.matchorders.formationforwards") + '</span>';
		if( !doc.getElementById( divId ) ) {
			// Only do this the first time Foxtrick is loaded
			doc.getElementById('startlineup').appendChild(div);
			Foxtrick.addJavaScriptSnippet(doc, 'FoxtrickMatchOrders.updateFormationBox();')
			var form = doc.forms.namedItem('aspnetForm');
			for (var i=0; i< form.elements.length; i++) {
				var element = form.elements.item(i);
				if (element.tagName == 'SELECT') {
					if (element.getAttribute("onclick")) {
						element.setAttribute("onclick", element.getAttribute("onclick") + "; FoxtrickMatchOrders.updateFormationBox()();");
					}
					element.setAttribute("onchange", element.getAttribute("onchange") + "; FoxtrickMatchOrders.updateFormationBox()();");
				}
			}
		}
    },
	
	change : function( page, doc ) {
	
	}
};
