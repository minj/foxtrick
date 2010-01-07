/**
 * facePlugin.js
 * Script which remove dollars, red cards and injury images from player' face, and colours youth faces
 * @author smates
 */

var FoxtrickHideFaceTransferImages = {
	
    MODULE_NAME : "HideFaceTransferImages",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('playerdetail','players','YouthPlayer','YouthPlayers'), 
	DEFAULT_ENABLED : true,
	CSS: Foxtrick.ResourcePath+"resources/css/HideFaceTransferImages.css",
	
    init : function() {
    },

    run : function( page, doc ) {
	},
	
	change : function( page, doc ) {	
	}
};

//------------------------------------------------------------------------------

var FoxtrickHideFaceInjuryImages = {
	
    MODULE_NAME : "HideFaceInjuryImages",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('playerdetail','players','YouthPlayer','YouthPlayers'), 
	DEFAULT_ENABLED : true,
	CSS: Foxtrick.ResourcePath+"resources/css/HideFaceInjuryImages.css",
	
    init : function() {
    },

    run : function( page, doc ) {
	},
	
	change : function( page, doc ) {	
	}
};

//------------------------------------------------------------------------------

var FoxtrickHideFaceSuspendedImages = {
	
    MODULE_NAME : "HideFaceSuspendedImages",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('playerdetail','players','YouthPlayer','YouthPlayers'), 
	DEFAULT_ENABLED : true,
	CSS: Foxtrick.ResourcePath+"resources/css/HideFaceSuspendedImages.css",
	
    init : function() {
    },

    run : function( page, doc ) {
	},
	
	change : function( page, doc ) {	
	}
};

//-----------------------------------------------------------------------------

var FoxtrickColouredYouthFaces = {
	
    MODULE_NAME : "ColouredYouthFaces",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('YouthPlayer','YouthPlayers'), 
	DEFAULT_ENABLED : true,
	
    init : function() {
    },

    run : function( page, doc ) {
		
		var elems = doc.getElementsByTagName("img");
		for(var i=0; i < elems.length; i++) {
			if( elems[i].src.match( /\/Img\/Avatar/i ) ) {
				elems[i].src = elems[i].src.replace( /y_/, "" );
			}
		}
	},
	
	change : function( page, doc ) {
	
	}
};

var FoxtrickMovePlayerStatement = {
	
    MODULE_NAME : "MovePlayerStatement",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('playerdetail','YouthPlayer'), 
    DEFAULT_ENABLED : false,
	
    init : function() {
    },

    run : function( page, doc ) {

        try {
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
        catch (e) {
            Foxtrick.dump('  PlrStatement >' + e + '\n');
        }
        
	},
	
	change : function( page, doc ) {
	
	}
};
