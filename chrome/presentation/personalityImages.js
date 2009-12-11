/**
 * personalityImages.js
 * Script which add character image
 * @author smates/convinced
 */

var FoxtrickPersonalityImages = {
	
    MODULE_NAME : "PersonalityImages",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('playerdetail'), 
	DEFAULT_ENABLED : true,
	
    init : function() {
    },

    run : function( page, doc ) {
		var img = doc.getElementById( 'ft_pimage' );
        if ( img != null ) return;
		try {
			var displaystyles = ["red_1.jpg","orange_2.jpg","yellow_3.jpg","lightgreen_4.jpg","darkgreen_5.jpg","blue_6.jpg"];
			var style="width:8px; height:8px; margin-left:2px;";
			var outerdiv = doc.getElementById('ctl00_CPMain_pnlplayerInfo');
			var linksArray = outerdiv.getElementsByTagName('a');
				for (var j=0; j<linksArray.length; j++) {
					var link = linksArray[j];  // lt=aggressiveness lt=gentleness
					if (link.href.search(/lt\=honesty/i) > -1 
						|| link.href.search(/lt\=gentleness/i) > -1 ) { 
                            var level = link.href.match(/ll\=(\d)/)[1];
                            var img = '<img id = "ft_pimage" style="vertical-align: middle important!; ' + style + 
                                      '" src=" chrome://foxtrick/content/resources/personality/' + 
                            displaystyles[level] +'" border="0" height="12" /></a>';
                            link.innerHTML += img;
					}
					if ( link.href.search(/lt\=aggressiveness/i) > -1 ) { 
                            var level = link.href.match(/ll\=(\d)/)[1];
                            var img = '<img style="vertical-align: middle important!; ' + style + 
                                      '" src=" chrome://foxtrick/content/resources/personality/' + 
                            displaystyles[4-(level)] +'" border="0" height="12" /></a>';
                            link.innerHTML += img;
					}                        
				}				
			
		} catch (e) {Foxtrick.dump('PersonalityImages->'+e+'\n');}
	},	
	
	change : function( page, doc ) {	
	}
};