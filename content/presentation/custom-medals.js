'use strict';
/**
 * custom-medals.js
 * Replaces medals with old Hattrick medals
 * Intention is to have this module expanded later to allow more medal sets
 * @author larsw84, LA-MJ
 */

Foxtrick.modules['CustomMedals'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['teamPage', 'history', 'national'],

	run: function(doc) {
		var officalTrophiesNodes = doc.getElementsByClassName('officalTrophies');
		if (officalTrophiesNodes.length) {
			var classRe = /trophy/;
			var swedenRe = /trophySeries(\d+)_s/i;
			var template = 'background:url("{}/{}.gif") 50% no-repeat;' +
				'padding:0;height:30px;width:30px;';

			var customMedals = 'oldhtmedals';
			var path = Foxtrick.ResourcePath + 'resources/img/custommedals/' + customMedals;
			template = Foxtrick.format(template, [path]);

			var images = officalTrophiesNodes[0].getElementsByTagName('img');
			for (var i = 0; i < images.length; i++) {
				var img = images[i];
				var imgClass = img.className;

				// Sweden fix
				var s_num = imgClass.match(swedenRe);
				if (s_num) {
					var num = parseInt(s_num[1], 10) - 1;
					if (num === 0)
						imgClass = 'trophySeries1';
					else if (num === 1)
						imgClass = 'trophySeries1_s';
					else
						imgClass = 'trophySeries' + num;
				}

				if (classRe.test(imgClass)) {
					var style = Foxtrick.format(template, [imgClass]);
					img.setAttribute('style', style);
				}
			}
		}
	}
};
