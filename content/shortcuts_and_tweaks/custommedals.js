/**
 * custommedals.js
 * Replaces medals with old Hattrick medals
 * Intention is to have this module expanded later to allow more medal sets
 * @author larsw84
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickCustomMedals = {

    MODULE_NAME : "CustomMedals",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
		
	init : function() {
        Foxtrick.registerPageHandler( 'teamPageGeneral',
                                        FoxtrickCustomMedals );
    },
    
    run : function( page, doc ) {
		var sidebar = doc.getElementById('sidebar');
		if( sidebar ) {
			var images = sidebar.getElementsByTagName('img');
			for(var i = 0; i < images.length; i++) {
				var img = images[i];
				var imgSrc = img.src;
				var customMedals = "oldhtmedals";
				var oldString = "Trophy";
				var newString = "chrome://foxtrick/content/resources/img/"
					+ "custommedals/" + customMedals + "/";
				if(imgSrc.search(oldString) != -1) {
					var startPos = imgSrc.lastIndexOf("=") + 1;
					imgSrc = imgSrc.substr(startPos);
					imgSrc = imgSrc.replace("png","gif");
					img.src = newString + imgSrc;
				}
			}
		}
	},
	
	change : function( page, doc ) {
	
	}
};