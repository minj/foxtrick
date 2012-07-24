"use strict";
/**
 * original-face.js
 * Show player's original face
 * @author smates
 */

Foxtrick.modules["OriginalFace"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["playerDetails", "players", "youthPlayer", "youthPlayers"],
	OPTIONS : ["HideTransfer", "HideInjury", "HideSuspended", "ColouredYouth"],
	OPTIONS_CSS : [
		Foxtrick.InternalPath + "resources/css/HideFaceTransferImages.css",
		Foxtrick.InternalPath + "resources/css/HideFaceInjuryImages.css",
		Foxtrick.InternalPath + "resources/css/HideFaceSuspendedImages.css",
		null
	],

	run : function(doc) {
		if (FoxtrickPrefs.isModuleOptionEnabled("OriginalFace", "ColouredYouth")) {
			if (Foxtrick.isPage("youthPlayer", doc)
				|| Foxtrick.isPage("youthPlayers", doc)) {
				var imgs = doc.getElementsByTagName("img");
				var avatarImages = Foxtrick.filter(function(n) { return (n.src.search(/\/Img\/Avatar/i) >= 0); }, imgs);
				Foxtrick.map(function(n) {
					n.src = n.src.replace(/y_/, "");
				}, avatarImages);
			}
		}
	}
};
