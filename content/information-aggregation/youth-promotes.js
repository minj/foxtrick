'use strict';
/*
 * youth-promotes.js
 * Shows days to promote a youth player
 * @Author: smates, ryanli
 */

Foxtrick.modules['YouthPromotes'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['youthPlayerDetails'],

	run: function(doc) {
		if (Foxtrick.Pages.YouthPlayer.wasFired(doc))
			return;

		var daysToPromote = Foxtrick.Pages.YouthPlayer.getDaysToPromote(doc);
		if (!isNaN(daysToPromote)) {
			var message = '';
			if (daysToPromote > 0) { // you have to wait to promote
				var htDate = Foxtrick.util.time.getHtDate(doc);
				var date = Foxtrick.util.time.addDaysToDate(htDate, daysToPromote);
				date = Foxtrick.util.time.buildDate(date);
				message = Foxtrick.L10n.getString('YouthPromotes.future', daysToPromote);
				message = message.replace(/%1/, daysToPromote).replace(/%2/, date);
			}
			else { // can be promoted already
				message = Foxtrick.L10n.getString('YouthPromotes.today');
			}

			var birthdayCell;
			var allDivs = doc.getElementsByTagName('div');
			for (var i = 0; i < allDivs.length; i++) {
				if (allDivs[i].className == 'byline') {
					birthdayCell = allDivs[i];
				}
			}
			var promotionCell = Foxtrick.createFeaturedElement(doc, this, 'p');
			promotionCell.appendChild(doc.createTextNode(message));
			birthdayCell.appendChild(promotionCell);
		}
	}
};
