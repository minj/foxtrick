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

		var DAYS_IN_YEAR = 112;

		var daysToPromote = Foxtrick.Pages.YouthPlayer.getDaysToPromote(doc);
		if (!isNaN(daysToPromote)) {

			var birthdayCell = doc.querySelector('#mainBody div.byline');
			var promotionCell = Foxtrick.createFeaturedElement(doc, this, 'p');

			var message = '';
			if (daysToPromote > 0) { // you have to wait to promote
				var htDate = Foxtrick.util.time.getHtDate(doc);
				var date = Foxtrick.util.time.addDaysToDate(htDate, daysToPromote);
				date = Foxtrick.util.time.buildDate(date, { showTime: false });
				message = Foxtrick.L10n.getString('YouthPromotes.future', daysToPromote);
				message = message.replace(/%1/, daysToPromote).replace(/%2/, date);
				promotionCell.textContent = message;

				promotionCell.appendChild(doc.createElement('br'));

				var age = Foxtrick.Pages.Player.getAge(doc);
				var days = age.years * DAYS_IN_YEAR + age.days + daysToPromote;

				var years = Foxtrick.Math.div(days, DAYS_IN_YEAR);
				var yearsL10n = Foxtrick.L10n.getString('datetimestrings.years', years);
				var yearsString = years + ' ' +  yearsL10n;

				days %= DAYS_IN_YEAR;
				var daysL10n = Foxtrick.L10n.getString('datetimestrings.days', days);
				var daysString = days + ' ' + daysL10n;

				var years_days = Foxtrick.L10n.getString('datetimestrings.years_and_days');
				years_days = years_days.replace('%1', yearsString).replace('%2', daysString);
				var old = Foxtrick.L10n.getString('YouthPromotes.age').replace('%1', years_days);

				promotionCell.appendChild(doc.createTextNode(old));

			}
			else { // can be promoted already
				message = Foxtrick.L10n.getString('YouthPromotes.today');
				promotionCell.textContent = message;
			}

			birthdayCell.appendChild(promotionCell);
		}
	}
};
