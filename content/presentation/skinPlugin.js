/**
 * skinPlugin.js
 * Script which including skins
 *chrome://foxtrick/content/resources/css/mainr.css
 * @author smates
 */
var FoxtrickSkinPlugin = {
    
    MODULE_NAME : "SkinPlugin",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : false,
   // OPTIONS : {},
  
    init : function() {
        Foxtrick.registerPageHandler('all',this);
           // this.initOptions();
    },

    run : function( page, doc ) {  
		
        try {
            var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
            var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
            var uri = ios.newURI(FoxtrickPrefs.getString("cssSkin"), null, null);
           
            if (!FoxtrickPrefs.getBool("ActiveSkin")) {
                try {
                    sss.unregisterSheet(uri, sss.USER_SHEET);
                } 
                catch (ee) {
                    dump ( ' TOP sss.unregisterSheet: ' + ee + '\n');
                }
            }
            
			// unload on login page
			var loginpage=new RegExp(FoxtrickPrefs.getString("HTURL")+'\/$');
			if (doc.location.href.search(loginpage)!=-1) { 
				try {sss.unregisterSheet(uri, sss.USER_SHEET);}
				catch(e){}
				return;
			}
			// only load on myht
			if (doc.location.href.search(/\/MyHattrick\/$|Default.aspx\?authCode/)==-1) { dump('in\n');
				return;
			}
			
            if (FoxtrickPrefs.getBool("module.SkinPlugin.enabled")){
                
                if(!sss.sheetRegistered(uri, sss.USER_SHEET)){
                    sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
                }

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
                /*END*/
            }//module enabled
            
            if (!FoxtrickPrefs.getBool("ActiveSkin")) {
                try {
                    sss.unregisterSheet(uri, sss.USER_SHEET);
                } 
                catch (eee) {
                    dump ( ' BOTTOM sss.unregisterSheet: ' + '\n');
                }
            }
        } //try
        catch(e) {
            dump ('> SkinPlugin ' + e + '\n');
        }
    },

    change : function( page, doc ) {
	
	}/*,

    initOptions : function() {
        
        this.OPTIONS = new Array( 
                                    "ActiveSkin"
                                );
	}*/
};




