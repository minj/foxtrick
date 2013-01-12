'use strict';
/**
 * player-stats-training-week.js
 * Changes the match grouping in the player stats page according to the training week instead of the Hattrick week
 * @author LA-MJ
 */

Foxtrick.modules['PlayerStatsTrainingWeek'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['playerStats'],

	run: function(doc) {

		// basically what we need is to inverse the row class for friendlies, cup games, hm games
		// this 'shifts them' to the previous week
		// also league games in a few countries happen on monday and need to be shifted
		// so do Monday nt games
		// BUT nt friendlies (on Friday) should not be shifted!

		// a slight problem with Masters on Thursday as it happens between training updates
		// in different countries while this code fixes it in a 'before training' position
		// doesn't really matter as those games have no training anyway

		var rows = doc.getElementById('matches').rows;
		var statsrows = doc.getElementById('stats').rows;

		for (var i = 0, row; row = rows[i]; ++i) {
			var statsrow = statsrows[i];
			var leagueMonday = false, regularFriendly = false;
			if (row.querySelector('img.matchLeague')) {
				var matchDay = row.cells[1].firstChild.nodeValue;
				if (Foxtrick.util.time.getDateFromText(matchDay).getDay() == 1)
					leagueMonday = true;
			}
			else if (row.querySelector('img.matchFriendly') && !row.querySelector('span[style]'))
				regularFriendly = true;
			if (leagueMonday || regularFriendly || row.querySelector('img.matchCup, img.matchMasters')) {
				Foxtrick.toggleClass(row, 'odd');
				Foxtrick.toggleClass(row, 'darkereven');
				Foxtrick.toggleClass(statsrow, 'odd');
				Foxtrick.toggleClass(statsrow, 'darkereven');
			}
		}
	}
};
