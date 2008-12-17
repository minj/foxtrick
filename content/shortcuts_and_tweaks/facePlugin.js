//foxtrick_smates.js
//------------------
//Script which remove dollars and injury images from player' face.
//------------------
//Author by smates

var FoxtrickHideFaceTransferImages = {
	
    MODULE_NAME : "HideFaceTransferImages",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    init : function() {
            // if ( FoxtrickPrefs.getBool("hideFaceTransferImages")) {
            Foxtrick.registerPageHandler( 'Player',
                                          FoxtrickHideFaceTransferImages);
            Foxtrick.registerPageHandler( 'Players',
                                          FoxtrickHideFaceTransferImages);
            // }
    },

    run : function( page, doc ) {
		
var elems = document.getElementsByTagName("img");
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
    init : function() {
            // if ( FoxtrickPrefs.getBool("hideFaceInjuryImages")) {
            Foxtrick.registerPageHandler( 'Player',
                                          FoxtrickHideFaceInjuryImages);
            Foxtrick.registerPageHandler( 'Players',
                                          FoxtrickHideFaceTransferImages);
            // }
    },

    run : function( page, doc ) {
		
var elems = document.getElementsByTagName("img");
		var elems = document.getElementsByTagName("img");
		for(var i=0; i < elems.length; i++) {
			if( elems[i].src.match(/\/Img\/Avatar\/misc\/f/i) || elems[i].src.match(/\/Img\/Avatar\/misc\/injured/i)) {
				elems[i].parentNode.removeChild(elems[i]);
        }
      }
       
    
		
	}
};

//-----------------------------------------------------------------------------

var FoxtrickColouredYouthFaces = {
	
    MODULE_NAME : "ColouredYouthFaces",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    init : function() {
            // if ( FoxtrickPrefs.getBool("showColouredYouthFaces")) {
            Foxtrick.registerPageHandler( 'YouthPlayer',
                                          FoxtrickColouredYouthFaces);
            Foxtrick.registerPageHandler( 'YouthPlayers',
                                          FoxtrickColouredYouthFaces);
            // }
    },

    run : function( page, doc ) {
		

       var elems = document.getElementsByTagName("img");
       for(var i=0; i < elems.length; i++) {
			
       if( elems[i].src.match(/\/Img\/Avatar/i)) {elems[i].src = elems[i].src.replace(/y_/, "");}
     
     
      }  

    
		
	}
};
