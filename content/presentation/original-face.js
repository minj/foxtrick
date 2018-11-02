/**
 * original-face.js
 * Show player's original face
 * @author smates
 */

'use strict';

Foxtrick.modules['OriginalFace'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['playerDetails', 'allPlayers', 'youthPlayerDetails', 'youthPlayers'],
	OPTIONS: ['HideTransfer', 'HideInjury', 'HideSuspended', 'ColouredYouth'],
	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/css/HideFaceTransferImages.css',
		Foxtrick.InternalPath + 'resources/css/HideFaceInjuryImages.css',
		Foxtrick.InternalPath + 'resources/css/HideFaceSuspendedImages.css',
		null,
	],

	run: function(doc) {
		if (Foxtrick.Prefs.isModuleOptionEnabled(this, 'ColouredYouth')) {
			if (Foxtrick.isPage(doc, 'youthPlayerDetails') ||
			    Foxtrick.isPage(doc, 'youthPlayers')) {

				let imgs = doc.querySelectorAll('img[src*="/Img/Avatar"]');
				for (let img of imgs)
					img.src = img.src.replace(/y_/, '');
			}
		}
	},
};
