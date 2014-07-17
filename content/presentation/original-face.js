'use strict';
/**
 * original-face.js
 * Show player's original face
 * @author smates
 */

Foxtrick.modules['OriginalFace'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['playerDetails', 'allPlayers', 'youthPlayerDetails', 'youthPlayers'],
	OPTIONS: ['HideTransfer', 'HideInjury', 'HideSuspended', 'ColouredYouth'],
	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/css/HideFaceTransferImages.css',
		Foxtrick.InternalPath + 'resources/css/HideFaceInjuryImages.css',
		Foxtrick.InternalPath + 'resources/css/HideFaceSuspendedImages.css',
		null
	],

	run: function(doc) {
		if (Foxtrick.Prefs.isModuleOptionEnabled('OriginalFace', 'ColouredYouth')) {
			if (Foxtrick.isPage(doc, 'youthPlayerDetails')
				|| Foxtrick.isPage(doc, 'youthPlayers')) {
				var imgs = doc.getElementsByTagName('img');
				var avatarImages = Foxtrick.filter(function(n) {
					return (n.src.search(/\/Img\/Avatar/i) >= 0); }, imgs);
				Foxtrick.map(function(n) {
					n.src = n.src.replace(/y_/, '');
				}, avatarImages);
			}
		}
	}
};
