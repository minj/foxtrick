'use strict';
/**
 * skin-plugin.js
 * Script which including skins
 * @author smates/convinced
 */

Foxtrick.modules['SkinPlugin'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],

	OPTION_FUNC: function(doc) {
		var cont = doc.createElement('div');
		var holder = doc.createElement('textarea');
		holder.setAttribute('pref', 'module.SkinPlugin.skin');
		cont.appendChild(holder);

		var loader = Foxtrick.util.load.filePickerForText(doc, function(text) {
			holder.textContent += text + '\n';
		});
		cont.appendChild(loader);

		return cont;
	},

	init: function() {
		// import from old preferences
		var oldPrefs = ['module.SkinPlugin.Skin1_text', 'module.SkinPlugin.Skin2_text'];
		Foxtrick.map(function(key) {
			var pref = FoxtrickPrefs.getString(key);
			if (pref) {
				FoxtrickPrefs.setString('module.SkinPlugin.skin',
					FoxtrickPrefs.getString('module.SkinPlugin.skin') + '\n' + pref);
				FoxtrickPrefs.deleteValue(key);
			}
		}, oldPrefs);

		if (Foxtrick.arch == 'Gecko') {
			this.CSS = FoxtrickPrefs.getString('module.SkinPlugin.skin');
		}
	},

	run: function(doc) {
		if (Foxtrick.arch != 'Gecko') {
			var skin = FoxtrickPrefs.getString('module.SkinPlugin.skin');
			Foxtrick.util.inject.css(doc, skin);
		}
	}
};
