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

		var newImg = doc.createElement("img");
		newImg.setAttribute("src",Foxtrick.ResourcePath+"resources/img/speak.png");
		newImg.setAttribute("title",contentSpeak+"");
		newImg.setAttribute("style","left: 65px; top: 134px;");
		var elemsa = doc.getElementsByTagName("div");
		for ( var b=0; b < elemsa.length; b++) {
			if( elemsa[b].className=='faceCard' && contentSpeak != "") {
				elemsa[b].appendChild(newImg); Foxtrick.dump('add\n');
			}
		}
	}
};
Foxtrick.util.module.register(FoxtrickMovePlayerStatement);
