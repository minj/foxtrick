/**
 * skinPlugin.js
 * Script which including skins
 * chrome://foxtrick/content/resources/css/mainr.css
 * @author smates/convinced
 */
var FoxtrickSkinPlugin = {
    
    MODULE_NAME : "SkinPlugin",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MAIN,
	DEFAULT_ENABLED : false,
   
    init : function() {
        Foxtrick.registerAllPagesHandler(this);
    },

    run : function(doc ) {
		this.load(doc);

		/*OLD MEDALS SCRIPT*/
        if (FoxtrickPrefs.getBool("module.CustomMedals.enabled")){                    
                    var sidebar = doc.getElementById('sidebar');
                    if( sidebar ) {
                        var images = sidebar.getElementsByTagName('img');
                        for(var i = 0; i < images.length; i++) {
                            dump(' => MEDAL ' + images[i].src + '\n');
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
                        } //images
                    } //sidebar
        } //old medals
    },
		
    load : function( doc ) {  	
		var prefs_changed = false;
		if (doc==null) prefs_changed = true;
		
        try {
			try {
				var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
				var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
				var uri = ios.newURI(FoxtrickPrefs.getString("cssSkin"), null, null);
            } catch(e) {dump('no or wrong skin url\n');return;} 
            // unloading (if inactive or on login page)
			var loginpage = new RegExp(FoxtrickPrefs.getString("HTURL")+'\/$'); 
			if (!FoxtrickPrefs.getBool("module.SkinPlugin.enabled") || (!prefs_changed && doc.location.href.search(loginpage)!=-1)) {				
                try {
                    if (sss.sheetRegistered(uri, sss.USER_SHEET)) sss.unregisterSheet(uri, sss.USER_SHEET);
                } 
                catch (ee) {
                    dump ( ' TOP sss.unregisterSheet: ' + ee + '\n');
                }
            }
            
			// load (on myht or after pref change)
			if (FoxtrickPrefs.getBool("module.SkinPlugin.enabled")                
				&& (prefs_changed || doc.location.href.search(/\/MyHattrick\/$|Default.aspx\?authCode/)!=-1) ) {
					
					if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
						sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
					}
			}
            /*END*/        
		} //try
        catch(e) {
            dump ('> SkinPlugin ' + e + '\n');
        }
    },

    change : function( doc ) {	
	}
};




