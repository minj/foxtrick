'use strict';
/**
 * add-promote-reminder.js
 * Add a reminder in the day that you can promote a Youth Player
 * @author tasosventouris
 */

Foxtrick.modules['AddPromoteReminder'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['youthPlayerDetails','reminders'],

	CSS: Foxtrick.InternalPath + 'resources/css/add-promote-reminder.css',

	run: function(doc) {
		var sendDate = Foxtrick.getParameterFromUrl(doc.location.href, 'sendDate')
		var isReminders = Foxtrick.isPage(doc,"reminders");
		var isYouthPlayerDetails = Foxtrick.isPage(doc,"youthPlayerDetails");
		
		if (sendDate && isReminders) {	
			doc.getElementById("ctl00_ctl00_CPContent_CPMain_ddlSendAs").value = "2";	

		} else if (isYouthPlayerDetails) {
			var daysToPromote = Foxtrick.Pages.YouthPlayer.getDaysToPromote(doc);
			var playerID = Foxtrick.Pages.Player.getId(doc);
			if (daysToPromote > 0) {
				var link = doc.createElement('a');
				link.className = 'ft-add-promote-reminder';
				link.title = Foxtrick.L10n.getString('AddPromoteReminder.button');

				var button = Foxtrick.createFeaturedElement(doc, this, 'img');
				button.src = '/Img/Icons/transparent.gif';

				link.appendChild(button);

				var div = doc.getElementsByClassName("byline")[0];
				div.appendChild(link)


				var today = new Date();
				today.setDate(today.getDate() + parseInt(daysToPromote)); 
				var d = today.getDate();
				var m = today.getMonth() + 1;
				var y = today.getFullYear();
				var promoteday = y + '-'+ m + '-'+ d + '+00%3a00%3a00';

				var promotetext = Foxtrick.L10n.getString('AddPromoteReminder.text');
				var promotetext = promotetext.replace('%s', '[youthplayerid=' + playerID + ']')
				var reminderlink = '/MyHattrick/Reminders/default.aspx?sendDate=' + promoteday + '&reminderText=' + encodeURIComponent(promotetext);
		
				if (button) {
					Foxtrick.addClass(button, 'ft-add-promote-reminder');
					Foxtrick.onClick(button, function() {
						doc.location.assign(reminderlink);})
				}
			}
		}
	}
};
