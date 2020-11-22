/**
 * add-promotion-reminder.js
 * Add a reminder in the day that you can promote a Youth Player
 * @author tasosventouris, LA-MJ
 */

'use strict';

Foxtrick.modules.AddPromotionReminder = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['youthPlayerDetails', 'reminders'],
	CSS: Foxtrick.InternalPath + 'resources/css/add-promotion-reminder.css',

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		let sendDate = Foxtrick.getUrlParam(doc.location.href, 'sendDate');
		let isReminders = Foxtrick.isPage(doc, 'reminders');
		let isYouthPlayerDetails = Foxtrick.isPage(doc, 'youthPlayerDetails');

		if (sendDate && isReminders) {
			let input = /** @type {HTMLInputElement} */ (Foxtrick.getMBElement(doc, 'ddlSendAs'));
			input.value = '2';
		}
		else if (isYouthPlayerDetails) {
			if (Foxtrick.Pages.YouthPlayer.wasFired(doc))
				return;

			let playerId = Foxtrick.Pages.Player.getId(doc);
			let now = Foxtrick.util.time.getDate(doc);
			if (!now) {
				Foxtrick.log('User time missing');
				return;
			}

			let alarm = Foxtrick.Pages.YouthPlayer.getPromotionDate(doc);
			if (alarm <= now)
				return;

			let format = 'YYYY-mm-dd+HH%3aMM%3a00';
			let promoTime = Foxtrick.util.time.buildDate(alarm, { format });

			let promoText = Foxtrick.L10n.getString('AddPromotionReminder.text');
			promoText = promoText.replace('%s', '[youthplayerid=' + playerId + ']');
			let reminderlink = '/MyHattrick/Reminders/default.aspx?sendDate=' + promoTime +
				'&reminderText=' + encodeURIComponent(promoText);

			let title = Foxtrick.L10n.getString('AddPromotionReminder.button');
			let button = Foxtrick.util.copyButton.add(doc, title);
			if (!button)
				return;

			Foxtrick.makeFeaturedElement(button, module);
			button.id = 'ft-promotion-button';
			Foxtrick.onClick(button, function() {
				var newURL = new URL(reminderlink, doc.location.origin);
				doc.location.assign(newURL.href);
			});
		}
	},
};
