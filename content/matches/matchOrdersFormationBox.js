/**
 * Formation Box - show select formation info in the match orders pages  
 * @author kolmis
 */

FoxtrickFormationBoxInMatchOrders = {
	
    MODULE_NAME : "FormationBoxInMatchOrders",
    MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
    DEFAULT_ENABLED : true,

    init : function() {
        Foxtrick.registerPageHandler('matchOrders', this);
    },

    run : function(page, doc) {
    
        Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/resources/css/matchorders.css");
        Foxtrick.addJavaScript(doc, "chrome://foxtrick/content/resources/js/matchorders.js");
                
        var div = doc.createElement("div");
        div.className = "foxtrick-formationbox";
        
        div.innerHTML = '<span>' + Foxtrickl10n.getString("foxtrick.matchorders.formation") + ': </span> \
                         <span id="foxtrick-formationinfo"></span><br />\
                         <span id="foxtrick-formationinfo-players-cd"></span>\
                         <span> ' + Foxtrickl10n.getString("foxtrick.matchorders.formationcds") + ', </span>\
                         <span id="foxtrick-formationinfo-players-im"></span>\
                         <span> ' + Foxtrickl10n.getString("foxtrick.matchorders.formationims") + ', </span>\
                         <span id="foxtrick-formationinfo-players-fwd"></span>\
                         <span> ' + Foxtrickl10n.getString("foxtrick.matchorders.formationforwards") + '</span>';
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

};
