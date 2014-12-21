'use strict';
/**
 * add-promotion-reminder.js
 * Add a reminder in the day that you can promote a Youth Player
 * @author tasosventouris
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

			var daysToPromote = Foxtrick.Pages.YouthPlayer.getDaysToPromote(doc);
			var playerID = Foxtrick.Pages.Player.getId(doc);
			if (daysToPromote > 0) {
				var today = Foxtrick.util.time.getHtDate(doc);
				var alarm = Foxtrick.util.time.addDaysToDate(today, daysToPromote);
				var d = alarm.getDate();
				var m = alarm.getMonth() + 1;
				var y = alarm.getFullYear();
				var promoteday = y + '-' + m + '-' + d + '+00%3a00%3a00';

				var promotetext = Foxtrick.L10n.getString('AddPromotionReminder.text');
				promotetext = promotetext.replace('%s', '[youthplayerid=' + playerID + ']');
				var reminderlink = '/MyHattrick/Reminders/default.aspx?sendDate=' + promoteday +
					'&reminderText=' + encodeURIComponent(promotetext);

				var title = Foxtrick.L10n.getString('AddPromotionReminder.button');
				var button = Foxtrick.util.copyButton.add(doc, title);
				if (button) {
					Foxtrick.makeFeaturedElement(button, this);
					button.id = 'ft-promotion-button';
					Foxtrick.onClick(button, function() {
						doc.location.assign(reminderlink);
					});
				}
			}
		}
	}
};
