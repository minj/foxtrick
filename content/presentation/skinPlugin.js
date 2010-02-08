/**
 * skinPlugin.js
 * Script which including skins
 * chrome://foxtrick/content/resources/css/mainr.css
 * @author smates/convinced
 */
var FoxtrickSkinPlugin = {
    
    MODULE_NAME : "SkinPlugin",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MAIN,
	NEW_AFTER_VERSION: "0.4.7.5",
	LATEST_CHANGE:"Fixed skin unloading bug fix",
	CSS:"",
    OLD_CSS:"",
	
    init : function() {
		this.OLD_CSS = this.CSS;
		if (Foxtrick.BuildFor=='Chrome') Foxtrick.GetDataURIText(FoxtrickPrefs.getString("cssSkin"));			
		else this.CSS=FoxtrickPrefs.getString("cssSkin");
    },

    run : function(doc ) {

		/*OLD MEDALS SCRIPT*/
        if (FoxtrickPrefs.getBool("module.CustomMedals.enabled")){                    
                    var sidebar = doc.getElementById('sidebar');
                    if( sidebar ) {
                        var images = sidebar.getElementsByTagName('img');
                        for(var i = 0; i < images.length; i++) {
                            Foxtrick.dump(' => MEDAL ' + images[i].src + '\n');
                            var img = images[i];
                            var imgSrc = img.src;
                            var customMedals = "oldhtmedals";
                            var oldString = "Trophy";
                            var newString = Foxtrick.ResourcePath+"resources/img/"
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
		
    change : function( doc ) {	
	}
};




