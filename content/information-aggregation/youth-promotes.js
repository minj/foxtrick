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

		var DAYS_IN_SEASON = Foxtrick.util.time.DAYS_IN_SEASON;
		var MSECS_IN_DAY = Foxtrick.util.time.MSECS_IN_DAY;

		var now = Foxtrick.util.time.getDate(doc);
		var promoDate = Foxtrick.Pages.YouthPlayer.getPromotionDate(doc);
		if (promoDate) {

			var birthdayCell = doc.querySelector('#mainBody div.byline');

			var promotion = doc.createDocumentFragment();
			var promotionCounter = Foxtrick.createFeaturedElement(doc, this, 'p');
			promotion.appendChild(promotionCounter);

			if (promoDate > now) { // you have to wait to promote
				var date = Foxtrick.util.time.buildDate(promoDate);
				var daysToPromote = Math.ceil((promoDate - now) / MSECS_IN_DAY);
				var message = Foxtrick.L10n.getString('YouthPromotes.future', daysToPromote);
				message = message.replace(/%1/, daysToPromote).replace(/%2/, date);
				promotionCounter.textContent = message;

				var age = Foxtrick.Pages.Player.getAge(doc);
				var days = age.years * DAYS_IN_SEASON + age.days + daysToPromote;

				var years = Foxtrick.Math.div(days, DAYS_IN_SEASON);
				var yearsL10n = Foxtrick.L10n.getString('datetimestrings.years', years);
				var yearsString = years + ' ' + yearsL10n;

				days %= DAYS_IN_SEASON;
				var daysL10n = Foxtrick.L10n.getString('datetimestrings.days', days);
				var daysString = days + ' ' + daysL10n;

				var years_days = Foxtrick.L10n.getString('datetimestrings.years_and_days');
				years_days = years_days.replace('%1', yearsString).replace('%2', daysString);
				var old = Foxtrick.L10n.getString('YouthPromotes.age').replace('%1', years_days);

				var promotionAge = Foxtrick.createFeaturedElement(doc, this, 'p');
				promotionAge.textContent = old;
				promotion.appendChild(promotionAge);
			}
			else {
				// can be promoted already
				promotionCounter.textContent = Foxtrick.L10n.getString('YouthPromotes.today');
			}

			birthdayCell.appendChild(promotion);
		}
	},
};
