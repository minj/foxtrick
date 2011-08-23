/**
 * skin-plugin.js
 * Script which including skins
 * @author smates/convinced
 */
var FoxtrickSkinPlugin = {

	MODULE_NAME : "SkinPlugin",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('all'),
	OPTIONS : new Array('Skin1','Skin2'),
	OPTION_TEXTS : true,
	OPTION_TEXTS_TEXTFILE_LOAD_BUTTONS : new Array(true,true),
	OPTIONS_CSS: new Array ("",""),

	init : function() {
		if (Foxtrick.arch == "Gecko") {
			if (FoxtrickPrefs.isModuleOptionEnabled("SkinPlugin", 'Skin1')) {
				var skinlink = FoxtrickPrefs.getString("module." + this.MODULE_NAME + ".Skin1_text");
				this.OPTIONS_CSS[0] = skinlink;
			}
			if (FoxtrickPrefs.isModuleOptionEnabled("SkinPlugin", 'Skin2')) {
				var skinlink = FoxtrickPrefs.getString("module." + this.MODULE_NAME + ".Skin2_text");
				this.OPTIONS_CSS[1] = skinlink;
			}
		}
	},

	run : function(doc) {
		if (Foxtrick.arch != "Gecko") {
			if (FoxtrickPrefs.isModuleOptionEnabled("SkinPlugin", 'Skin1')) {
				var skin1 = FoxtrickPrefs.getString("module." + this.MODULE_NAME + ".Skin1_text");
				Foxtrick.util.inject.css(doc, skin1);
			}
			if (FoxtrickPrefs.isModuleOptionEnabled("SkinPlugin", 'Skin2')) {
				var skin2 = FoxtrickPrefs.getString("module." + this.MODULE_NAME + ".Skin2_text");
				Foxtrick.util.inject.css(doc, skin2);
			}
		}
	}
};
Foxtrick.util.module.register(FoxtrickSkinPlugin);
