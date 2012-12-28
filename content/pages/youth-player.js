'use strict';
/* youth-player.js
 * Utilities on youth player page
 * @author ryanli
 */

Foxtrick.Pages.YouthPlayer = {
	isYouthPlayerPage: function(doc) {
		return Foxtrick.isPage(doc, 'youthPlayerDetails');
	},

	getJoinedDays: function(doc) {
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
			var joinedMatch = joinedRe1.exec(joinedCell.textContent);
			if (joinedMatch === null) {
				joinedMatch = joinedRe2.exec(joinedCell.textContent);
			}
			var joinedDays = parseInt(joinedMatch[1], 10);
			return joinedDays;
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	getDaysToPromote: function(doc) {
		try {
			var joinedDays = this.getJoinedDays(doc);
			var age = Foxtrick.Pages.Player.getAge(doc);
			if (isNaN(joinedDays) || isNaN(age.years) || isNaN(age.days)) {
				return NaN;
			}
			var daysToSeventeen = (17 - 1 - age.years) * 112 + (112 - age.days);
			var daysToOneSeason = 112 - joinedDays;
			return Math.max(daysToSeventeen, daysToOneSeason);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
};
