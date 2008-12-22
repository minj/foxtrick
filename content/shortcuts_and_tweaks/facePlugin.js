/**
 * facePlugin.js
 * Script which remove dollars, red cards and injury images from player' face, and colours youth faces
 * @author smates
 */

var FoxtrickHideFaceTransferImages = {
	
    MODULE_NAME : "HideFaceTransferImages",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	
    init : function() {
            //Foxtrick.registerPageHandler( 'player',
            //                              FoxtrickHideFaceTransferImages);
            Foxtrick.registerPageHandler( 'players',
                                          FoxtrickHideFaceTransferImages);
    },

    run : function( page, doc ) {
		
		var elems = doc.getElementsByTagName("img");
		for(var i=0; i < elems.length; i++) {
			if( elems[i].src.match(/\/Img\/Avatar\/misc\/t/i) ) {
				elems[i].parentNode.removeChild(elems[i]);
			}
		} 
	}
};

//------------------------------------------------------------------------------

var FoxtrickHideFaceInjuryImages = {
	
    MODULE_NAME : "HideFaceInjuryImages",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	
    init : function() {
            Foxtrick.registerPageHandler( 'players',
                                          FoxtrickHideFaceInjuryImages);
    },

    run : function( page, doc ) {
		
		var elems = doc.getElementsByTagName("img");
		for(var i=0; i < elems.length; i++) {
			if( elems[i].src.match(/\/Img\/Avatar\/misc\/f/i) 
				|| elems[i].src.match(/\/Img\/Avatar\/misc\/injured/i)) {
				elems[i].parentNode.removeChild(elems[i]);
			}
		}
	}
};

var FoxtrickHideFaceSuspendedImages = {
	
    MODULE_NAME : "HideFaceSuspendedImages",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	
    init : function() {
        Foxtrick.registerPageHandler( 'players',
            FoxtrickHideFaceSuspendedImages);
    },

    run : function( page, doc ) {
		
		var elems = doc.getElementsByTagName("img");
		for(var i=0; i < elems.length; i++) {
			if( elems[i].src.match(/\/Img\/Avatar\/misc\/red/i) ) {
				elems[i].parentNode.removeChild(elems[i]);
			}
		} 
	}
};

//-----------------------------------------------------------------------------

var FoxtrickColouredYouthFaces = {
	
    MODULE_NAME : "ColouredYouthFaces",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	
    init : function() {
            Foxtrick.registerPageHandler( 'YouthPlayer',
                                          FoxtrickColouredYouthFaces);
            Foxtrick.registerPageHandler( 'YouthPlayers',
                                          FoxtrickColouredYouthFaces);
    },

    run : function( page, doc ) {
		
		var elems = doc.getElementsByTagName("img");
		for(var i=0; i < elems.length; i++) {
			if( elems[i].src.match( /\/Img\/Avatar/i ) ) {
				elems[i].src = elems[i].src.replace( /y_/, "" );
			}
		}
	}
};
