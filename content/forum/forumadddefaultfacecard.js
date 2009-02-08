/**
 * forumadddefaultfacecard.js
 * Foxtrick Add default faceCard module
 * @author larsw84
 */

var FoxtrickAddDefaultFaceCard = {
	
    MODULE_NAME : "AddDefaultFaceCard",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickAddDefaultFaceCard );
    },

    run : function( page, doc ) { return;
		if(!Foxtrick.isModuleEnabled(FoxtrickHideManagerAvatar)) {
			var elems = doc.getElementsByTagName("div");
			for(var i=0; i < elems.length; i++) {
				if(elems[i].className=="cfUser") {
					var firstDiv = elems[i].getElementsByTagName("div")[0];
					if(firstDiv.className != "faceCard") {
						var defaultCardDiv = doc.createElement("div");
						defaultCardDiv.className = "faceCard";
						defaultCardDiv.setAttribute("style","background-image:"
							+ " url(/Img/Avatar/silhouettes/sil1.png);");
						elems[i].insertBefore(defaultCardDiv,firstDiv);
					}
				}
			}
		}
	},
	
	change : function( page, doc ) {
	
	}
};
