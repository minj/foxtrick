/*
 * youthPromotes.js
 * Shows days to promote a youth player
 * @Author:  smates, ryanli
 */

var FoxtrickYouthPromotes = {

	MODULE_NAME : "YouthPromotes",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('YouthPlayer'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.5.0.2",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	LATEST_CHANGE: "Now working on all locales",

	init : function() {
	},

	_getDaysToPromote : function(joinedDays, years, days) {
		if (isNaN(joinedDays) || isNaN(years) || isNaN(days)) {
			return NaN;
		}
		var daysToSeventeen = (17 - 1 - years) * 112 + (112 - days);
		var daysToOneSeason = 112 - joinedDays;
		return Math.max(daysToSeventeen, daysToOneSeason);
	},

	run : function( page, doc ) {
		try {
			// we presume the dates are in this format:
			// d/M/y/ h:m
			// y: year, M: month, d: day, h: hour, m: minute
			// it could be in formats like y/M/d or others, but it works all the same
			// the `/' separator could be one of: `/', `.', or `-'.
			// the `:' separator could be one of: `:', or `.'.
			// the separator following y could be omitted.
			//
			// for the likes of `16-01-2010 01.02 (3 days ago)':
			var joinedRe1 = /\d+[\./\-]\d+[\./\-]\d+[\./\-]?\s+\d+[:\.]\d+.+?(\d+)/;
			//               ^d ^sep   ^M ^sep   ^y ^sep       ^h ^sep ^m    ^join
			// for the likes of `3 dage siden (16-01-2010 01.02)':
			var joinedRe2 = /(\d+).+?\d+[\./\-]\d+[\./\-]\d+[\./\-]?\s+\d+[:\.]\d+/;
			//               ^join   ^d ^sep   ^M ^sep   ^y ^sep       ^h ^sep ^m
			var playerInfo = doc.getElementsByClassName('playerInfo')[0];
			var playerTable = playerInfo.getElementsByTagName('table')[0];
			var joinedCell = playerTable.getElementsByTagName('td')[5];
			// if not joinedRe1, then joinedRe2
			var joinedMatch = joinedRe1.exec(joinedCell.innerHTML);
			if (joinedMatch === null) {
				joinedMatch = joinedRe2.exec(joinedCell.innerHTML);
			}
			var joinedDays = joinedMatch[1];

			// birthdays are easy, only one possibility
			var birthdayRe = /(\d+).*?(\d+).*?\d+.*?\d+.*?\d+.*?/;
			var birthdayCell;
			var allDivs = doc.getElementsByTagName("div");
			for(var i = 0; i < allDivs.length; i++) {
				if(allDivs[i].className == "byline") {
					birthdayCell = allDivs[i];
				}
			}
			var birthdayMatch = birthdayRe.exec(birthdayCell.innerHTML);
			var years = birthdayMatch[1];
			var days = birthdayMatch[2];

			var daysToPromote = FoxtrickYouthPromotes._getDaysToPromote(joinedDays, years, days);
			if (!isNaN(daysToPromote)) {
				var message = "";
				if (daysToPromote > 0) { // you have to wait to promote
					message = Foxtrickl10n.getString("foxtrick.youthpromotedays.prom_d") + " " +
						daysToPromote + " " + Foxtrickl10n.getString("foxtrick.youthpromotedays.days");
				}
				else { // can be promoted already
					message = Foxtrickl10n.getString("foxtrick.youthpromotedays.prom_t");
				}
				var promotionCell = doc.createElement("p");
				promotionCell.appendChild(doc.createTextNode(message));
				birthdayCell.appendChild(promotionCell);
			}
		}
		catch (e) {
			Foxtrick.dump("YouthPromotes: " + e + "\n");
		}
	},

	change : function( page, doc ) {
	}
};
