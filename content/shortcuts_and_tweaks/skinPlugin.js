/**
 * skinPlugin.js
 * Script which including skins
 *
 * @author smates
 */
var FoxtrickSkinPlugin = {
    
  MODULE_NAME : "SkinPlugin",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : false,
  
  
    init : function() {
        Foxtrick.registerPageHandler('all',FoxtrickSkinPlugin);
            
    },

    run : function( page, doc ) {  
		var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var PrefsBranch = prefObj.getBranch("foxtrick.skin.");
    

		
		
		
var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);




var uri = ios.newURI(PrefsBranch.getCharPref("cssSkin"), null, null);

       //chrome://foxtrick/content/resources/skins/
       //if (PrefsBranch.getBoolPref("useHattrickSkin") == false){}
       if (!FoxtrickPrefs.getBool("module.SkinPlugin.enabled")){sss.unregisterSheet(uri, sss.USER_SHEET);}
      // if (!Foxtrick.isModuleFeatureEnabled(this, "ActivatedSkin")){sss.unregisterSheet(uri, sss.USER_SHEET);}
       
       if (PrefsBranch.getBoolPref("useHattrickSkin")){
       
		   sss.loadAndRegisterSheet(uri, sss.USER_SHEET);


		
		
		
  			/*var CSSSKIN = PrefsBranch.getCharPref("cssSkin");
			var css =  CSSSKIN;  
      
       //var cssSkin = encodeURIComponent(PrefsBranch.getCharPref("cssSkin"));
      var css = "chrome://foxtrick/content/skins/retro/Retro.css";
         
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
            } catch(e) {alert(e);}     */   
		
		
		
		/*OLD MEDALS SCRIPT*/
		/*var sidebar = doc.getElementById('sidebar');
		if( sidebar ) {
			var images = sidebar.getElementsByTagName('img');
			for(var i = 0; i < images.length; i++) {
				var img = images[i];
				var imgSrc = img.src;
				var customMedals = "oldhtmedals";
				var oldString = "Trophy";
				var newString = "chrome://foxtrick/content/resources/img/"
					+ "custommedals/" + customMedals + "/";
				if(imgSrc.search(oldString) != -1) {
					var startPos = imgSrc.lastIndexOf("=") + 1;
					imgSrc = imgSrc.substr(startPos);
					imgSrc = imgSrc.replace("png","gif");
					img.src = newString + imgSrc;
				}
			}
		}*/
		/*END*/
		}
	},

		
	
	change : function( page, doc ) {
	
	}
	
	
	
};




