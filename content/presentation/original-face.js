/**
 * original-face.js
 * Show player's original face
 * @author smates
 */

var FoxtrickOriginalFace = {
	MODULE_NAME : "OriginalFace",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["playerdetail", "players", "YouthPlayer", "YouthPlayers"],
	OPTIONS : ["HideTransfer", "HideInjury", "HideSuspended", "ColouredYouth"],
	OPTIONS_CSS : [
		Foxtrick.ResourcePath + "resources/css/HideFaceTransferImages.css",
		Foxtrick.ResourcePath + "resources/css/HideFaceInjuryImages.css",
		Foxtrick.ResourcePath + "resources/css/HideFaceSuspendedImages.css",
		null
	],

	run : function(doc) {
		if (FoxtrickPrefs.isModuleOptionEnabled(this, "ColouredYouth")) {
			if (Foxtrick.isPage("YouthPlayer", doc)
				|| Foxtrick.isPage("YouthPlayers", doc)) {
				var imgs = doc.getElementsByTagName("img");
				var avatarImages = Foxtrick.filter(imgs, function(n) { return (n.src.search(/\/Img\/Avatar/i) >= 0); });
				Foxtrick.map(avatarImages, function(n) {
					n.src = n.src.replace(/y_/, "");
				});
			}
		}
	}
};
