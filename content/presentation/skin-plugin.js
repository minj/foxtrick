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

		var loader = Foxtrick.util.load.filePickerForText(doc,
		  function(text) {
			holder.textContent += text + '\n';
			holder.dispatchEvent(new Event('input'));
		});
		cont.appendChild(loader);

		return cont;
	},

	init: function() {
		// import from old preferences
		var oldPrefs = ['module.SkinPlugin.Skin1_text', 'module.SkinPlugin.Skin2_text'];
		Foxtrick.map(function(key) {
			var pref = Foxtrick.Prefs.getString(key);
			if (pref) {
				Foxtrick.Prefs.setString('module.SkinPlugin.skin',
					Foxtrick.Prefs.getString('module.SkinPlugin.skin') + '\n' + pref);
				Foxtrick.Prefs.deleteValue(key);
			}
		}, oldPrefs);

		if (Foxtrick.arch == 'Gecko') {
			this.CSS = Foxtrick.Prefs.getString('module.SkinPlugin.skin');
		}
	},

	run: function(doc) {
		if (Foxtrick.arch != 'Gecko') {
			var skin = Foxtrick.Prefs.getString('module.SkinPlugin.skin');
			Foxtrick.util.inject.css(doc, skin, 'skin-plugin');
		}
	}
};
