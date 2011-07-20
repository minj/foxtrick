/**
 * skin-plugin.js
 * Script which including skins
 * @author smates/convinced
 */
var FoxtrickSkinPlugin = {

	MODULE_NAME : "SkinPlugin",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	OPTIONS : new Array('Skin1','Skin2'),
	OPTION_TEXTS : true,
	OPTION_TEXTS_LOAD_BUTTONS : new Array(true,true),
	OPTIONS_CSS: new Array ("",""),
	CSS:'',

	init : function() {
		if (FoxtrickPrefs.isModuleOptionEnabled( this, 'Skin1')) {
			var skinlink = FoxtrickPrefs.getString("module." + this.MODULE_NAME + ".Skin1_text");
			this.CSS = skinlink;
		}
		if (FoxtrickPrefs.isModuleOptionEnabled( this, 'Skin2')) {
			var skinlink = FoxtrickPrefs.getString("module." + this.MODULE_NAME + ".Skin2_text");
			this.CSS = skinlink;
		}
	},

	run : function(doc) {
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
	}
};
