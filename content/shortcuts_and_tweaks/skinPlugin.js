/**
 * skinPlugin.js
 * Script which including skins
 * -------NOTE: this feature isn't ready for non-devs using!------------
 * @author smates
 */
var FoxtrickSkinPlugin = {
    
    MODULE_NAME : "SkinPlugin",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : false,

    init : function() {
        Foxtrick.registerPageHandler( 'all',
                                      FoxtrickSkinPlugin);
    },

    run : function( page, doc ) {
		  
		var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var PrefsBranch = prefObj.getBranch("foxtrick.skin.");
    
       //chrome://foxtrick/content/resources/skins/
		if (PrefsBranch.getBoolPref("useHattrickSkin")){
  			var CSSSKIN = PrefsBranch.getCharPref("cssSkin");
			var css =  CSSSKIN;     
			var path = "head[1]";
			var head = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;

			var link = doc.createElement("link");
				link.setAttribute("rel", "stylesheet");
				link.setAttribute("type", "text/css");
				link.setAttribute("media", "all");
				link.setAttribute("href", css);
				head.appendChild(link);
               
			try {
				var headID_s = doc.getElementsByTagName("link")[1];
					headID_s.parentNode.removeChild(headID_s); 
            } catch(e) {alert(e);}            
		}
	},
	
	change : function( page, doc ) {
	
	}
};




