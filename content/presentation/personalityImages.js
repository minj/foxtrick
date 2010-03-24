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
	LATEST_CHANGE : "Show aggressiveness value as HT denomination",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

    init : function() {
    },

    run : function( page, doc ) {
		try {
			var displaystyles = ["red_1.jpg","orange_2.jpg","yellow_3.jpg","lightgreen_4.jpg","darkgreen_5.jpg","blue_6.jpg"];
			var outerdiv = doc.getElementById('ctl00_CPMain_pnlplayerInfo');
			var linksArray = outerdiv.getElementsByTagName('a');
				for (var j=0; j<linksArray.length; j++) {
					var link = linksArray[j];
					if (link.href.search(/lt\=honesty/i) > -1
						|| link.href.search(/lt\=gentleness/i) > -1
						|| link.href.search(/lt\=aggressiveness/i) > -1 ) {
                            var level = link.href.match(/ll\=(\d)/)[1];
                            var img = doc.createElement("img");
                            img.className = "ft-personality-img";
                            img.src = Foxtrick.ResourcePath + "resources/personality/" + displaystyles[level];
                            link.appendChild(img);
					}
				}
		}
		catch (e) {Foxtrick.dump('PersonalityImages->'+e+'\n');}
	},

	change : function( page, doc ) {
	}
};
