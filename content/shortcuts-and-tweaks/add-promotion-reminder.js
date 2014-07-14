'use strict';
/**
 * add-promote-reminder.js
 * Add a reminder in the day that you can promote a Youth Player
 * @author tasosventouris
 */

Foxtrick.modules['AddPromotionReminder'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['youthPlayerDetails', 'reminders'],


	run: function(doc) {
		var sendDate = Foxtrick.getParameterFromUrl(doc.location.href, 'sendDate');
		var isReminders = Foxtrick.isPage(doc, 'reminders');
		var isYouthPlayerDetails = Foxtrick.isPage(doc, 'youthPlayerDetails');

		if (sendDate && isReminders) {
			doc.getElementById('ctl00_ctl00_CPContent_CPMain_ddlSendAs').value = '2';

		}
		else if (isYouthPlayerDetails) {
			var daysToPromote = Foxtrick.Pages.YouthPlayer.getDaysToPromote(doc);
			var playerID = Foxtrick.Pages.Player.getId(doc);
			if (daysToPromote > 0) {
				var link = Foxtrick.createFeaturedElement(doc, this, 'a');
				Foxtrick.addClass(link, 'ft-add-promote-reminder ft-link');

				var button = Foxtrick.createFeaturedElement(doc, this, 'img');
				button.src = '/Img/Icons/transparent.gif';
				button.title = button.alt = Foxtrick.L10n.getString('AddPromotionReminder.button');

				link.appendChild(button);

				var div = doc.getElementsByClassName('byline')[0];
				div.appendChild(doc.createTextNode(' '));
				div.appendChild(link);

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

				if (button) {
					Foxtrick.addClass(button, 'ft-add-promote-reminder reminder');
					Foxtrick.onClick(link, function() {
						doc.location.assign(reminderlink);
					});
				}
			}
		}
	}
};
