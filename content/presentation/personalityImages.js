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
			var outerdiv = doc.getElementById('ctl00_CPMain_pnlplayerInfo');
			var linksArray = outerdiv.getElementsByTagName('a');
			for (var j=0; j<linksArray.length; j++) {
				var link = linksArray[j];
				if (link.href.search(/lt\=honesty/i) > -1
					|| link.href.search(/lt\=gentleness/i) > -1) {
					var level = link.href.match(/ll\=(\d)/)[1];
					var img = doc.createElement("img");
					img.className = "ft-personality-img";
					img.src = Foxtrick.ResourcePath + "resources/personality/red2blue/" + level + ".jpg";
					link.appendChild(img);
				}
				else if (link.href.search(/lt\=aggressiveness/i) > -1) {
					var level = link.href.match(/ll\=(\d)/)[1];
					var img = doc.createElement("img");
					img.className = "ft-personality-img";
					img.src = Foxtrick.ResourcePath + "resources/personality/blue2red/" + level + ".jpg";
					link.appendChild(img);
				}
			}
		}
		catch (e) {Foxtrick.dump('PersonalityImages->'+e+'\n');}
	},

	change : function( page, doc ) {
	}
};
