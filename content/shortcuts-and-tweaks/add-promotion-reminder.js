'use strict';
/**
 * add-promotion-reminder.js
 * Add a reminder in the day that you can promote a Youth Player
 * @author tasosventouris, LA-MJ
 */

Foxtrick.modules['AddPromotionReminder'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['youthPlayerDetails', 'reminders'],
	CSS: Foxtrick.InternalPath + 'resources/css/add-promotion-reminder.css',
	run: function(doc) {
		var sendDate = Foxtrick.getParameterFromUrl(doc.location.href, 'sendDate');
		var isReminders = Foxtrick.isPage(doc, 'reminders');
		var isYouthPlayerDetails = Foxtrick.isPage(doc, 'youthPlayerDetails');

		if (sendDate && isReminders) {
			Foxtrick.getMBElement(doc, 'ddlSendAs').value = '2';
		}
		else if (isYouthPlayerDetails) {
			if (Foxtrick.Pages.YouthPlayer.wasFired(doc))
				return;

			var playerId = Foxtrick.Pages.Player.getId(doc);
			var now = Foxtrick.util.time.getDate(doc);
			var alarm = Foxtrick.Pages.YouthPlayer.getPromotionDate(doc);
			if (alarm > now) {
				var format = 'YYYY-mm-dd+HH%3aMM%3a00';
				var promoTime = Foxtrick.util.time.buildDate(alarm, { format: format });

				var promoText = Foxtrick.L10n.getString('AddPromotionReminder.text');
				promoText = promoText.replace('%s', '[youthplayerid=' + playerId + ']');
				var reminderlink = '/MyHattrick/Reminders/default.aspx?sendDate=' + promoTime +
					'&reminderText=' + encodeURIComponent(promoText);

				var title = Foxtrick.L10n.getString('AddPromotionReminder.button');
				var button = Foxtrick.util.copyButton.add(doc, title);
				if (button) {
					Foxtrick.makeFeaturedElement(button, this);
					button.id = 'ft-promotion-button';
					Foxtrick.onClick(button, function() {
						var newURL = new URL(reminderlink, doc.location.href);
						doc.location.assign(newURL);
					});
				}
			}
		}
	},
};
