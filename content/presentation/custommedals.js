/**
 * custommedals.js
 * Replaces medals with old Hattrick medals
 * Intention is to have this module expanded later to allow more medal sets
 * @author larsw84
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickCustomMedals = {

    MODULE_NAME : "CustomMedals",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('teamPage','national'), 
	DEFAULT_ENABLED : false,
		
	init : function() {
    },
    
    run : function( page, doc ) {
		var sidebar = doc.getElementById('sidebar');
		if( sidebar ) {
			var images = sidebar.getElementsByTagName('img');
			for(var i = 0; i < images.length; i++) {
                var img = images[i];
				var imgClass = img.className;
				var customMedals = "oldhtmedals";
				var oldString = "trophy";
				var newString = "chrome://foxtrick/content/resources/img/"
					+ "custommedals/" + customMedals + "/";
				if(imgClass.search(oldString) != -1) {
					newString = 'background-image: url(' + newString + imgClass + 
						".gif" + '); padding: 0px;';
					img.setAttribute('style',newString);
				}
			}
		}
	},
	
	change : function( page, doc ) {
	
	}
};