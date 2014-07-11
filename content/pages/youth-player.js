'use strict';
/* youth-player.js
 * Utilities on youth player page
 * @author ryanli
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.YouthPlayer = {
	/**
	 * Test whether it's youth player page
	 * @param  {document}  doc
	 * @return {Boolean}
	 */
	isPage: function(doc) {
		return Foxtrick.Pages.Player.isYouthPlayerPage(doc);
	},

	/**
	 * Return days since the player joined the team
	 * @param  {document} doc
	 * @return {Integer}
	 */
	getJoinedDays: function(doc) {
		var joinedDays = 0;
		try {
			// the date separator could be one of: `/', `.', or `-'.
			// the time separator could be one of: `:', or `.'.
			// the separator following y could be omitted.
			//
			// joinedDays can both precede and follow the date
			var dateRe = /\d+[\.\/-]\d+[\.\/-]\d+[\.\/-]?\s+\d+[:\.]\d+/;
			//               ^d ^sep   ^M ^sep   ^y ^sep       ^h ^sep ^m
			var playerTable = doc.querySelector('.playerInfo table');
			var joinedCell = playerTable.rows[2].cells[1];
			var str = joinedCell.textContent.trim().replace(dateRe, '');
			joinedDays = parseInt(str.match(/\d+/), 10);
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return joinedDays;
	},

	/**
	 * Return days until promotion
	 * @param  {document} doc
	 * @return {Integer}
	 */
	getDaysToPromote: function(doc) {
		var days = NaN;
		try {
			var joinedDays = this.getJoinedDays(doc);
			var age = Foxtrick.Pages.Player.getAge(doc);
			if (!isNaN(joinedDays) && age && !isNaN(age.years) && !isNaN(age.days)) {
				var daysToSeventeen = (17 - 1 - age.years) * 112 + (112 - age.days);
				var daysToOneSeason = 112 - joinedDays;
				days = Math.max(daysToSeventeen, daysToOneSeason);
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return days;
	}
};
