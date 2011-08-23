/**
 * move-player-statement.js
 * Move player statement to face
 * @author smates
 */

var FoxtrickMovePlayerStatement = {

	MODULE_NAME : "MovePlayerStatement",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('playerdetail','YouthPlayer'),

	run : function(doc) {
		var contentSpeak = "";
		var elems = doc.getElementsByTagName("em");
		for(var i=0; i < elems.length; i++) {
			if( elems[i].getAttribute("class","shy") ) {
				contentSpeak = elems[i].innerHTML;
				elems[i].parentNode.removeChild(elems[i]);
			}
		}

		var elemsa = doc.getElementsByTagName("div");
		for ( var b=0; b < elemsa.length; b++) {
			if( elemsa[b].className=='faceCard' && contentSpeak != "") {
				Foxtrick.addImage(doc, elemsa[b], { 
					src : Foxtrick.InternalPath+"resources/img/speak.png",
					title : contentSpeak+"",
					style : "left: 65px; top: 134px;"
				});
			}
		}
	}
};
Foxtrick.util.module.register(FoxtrickMovePlayerStatement);
