'use strict';
/**
 * custom-medals.js
 * Replaces medals with old Hattrick medals
 * Intention is to have this module expanded later to allow more medal sets
 * @author larsw84
 */

Foxtrick.modules['CustomMedals'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['teamPage', 'history', 'national'],

	run: function(doc) {
		var officalTrophiesNodes = doc.getElementsByClassName('officalTrophies');
		if (officalTrophiesNodes.length) {
			var images = officalTrophiesNodes[0].getElementsByTagName('img');
			for (var i = 0; i < images.length; i++) {
				var img = images[i];
				var imgClass = img.className;

				// sweden fix
				var s_num = imgClass.match(/trophySeries(\d+)_s/i);
				if (s_num != null) {
					var num = s_num[1] - 1;
					if (num == 0) imgClass = 'trophySeries1';
					else if (num == 1) imgClass = 'trophySeries1_s';
					else imgClass = 'trophySeries' + num;
				}

				var customMedals = 'oldhtmedals';
				var oldString = 'trophy';
				var newString = Foxtrick.ResourcePath + 'resources/img/'
					+ 'custommedals/' + customMedals + '/';
				if (imgClass.search(oldString) != -1) {
					newString = 'background-image: url(' + newString + imgClass +
						'.gif' + '); padding: 0px; height:30px; width:30px;';
					img.setAttribute('style', newString);
				}
			}
		}
	}
};
