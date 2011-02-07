/*
 * youth-promotes.js
 * Shows days to promote a youth player
 * @Author: smates, ryanli
 */

var FoxtrickYouthPromotes = {
	MODULE_NAME : "YouthPromotes",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('YouthPlayer'),

	run : function( page, doc ) {
		var daysToPromote = Foxtrick.Pages.YouthPlayer.getDaysToPromote(doc);
		if (!isNaN(daysToPromote)) {
			var message = "";
			if (daysToPromote > 0) { // you have to wait to promote
				date = Foxtrick.util.time.addDaysToDate(new Date(), daysToPromote);
				date = Foxtrick.util.time.buildDate(date);
				message = Foxtrickl10n.getString("YouthPromotes.future")
					.replace(/%1/, daysToPromote)
					.replace(/%2/, date)
			}
			else { // can be promoted already
				message = Foxtrickl10n.getString("YouthPromotes.today");
			}

			var birthdayCell;
			var allDivs = doc.getElementsByTagName("div");
			for (var i = 0; i < allDivs.length; i++) {
				if (allDivs[i].className == "byline") {
					birthdayCell = allDivs[i];
				}
			}
			var promotionCell = doc.createElement("p");
			promotionCell.appendChild(doc.createTextNode(message));
			birthdayCell.appendChild(promotionCell);
		}
	}
};
