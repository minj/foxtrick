'use strict';
/**
 * player-stats-training-week.js
 * Changes the match grouping in the player stats page
 * according to the training week instead of the Hattrick week
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

		var matches = doc.getElementById('matches');
		var stats = doc.getElementById('stats');
		if (!matches || !stats)
			return;

		var rows = matches.rows;
		var statsrows = stats.rows;

		Foxtrick.forEach(function(row, i) {
			var statsrow = statsrows[i];
			var league = false, friendly = false;
			var matchDay = row.cells[1].firstChild.nodeValue;
			var weekDay = Foxtrick.util.time.getDateFromText(matchDay).getDay();
			if (row.querySelector('img.matchLeague')) {
				league = true;
			}
			else if (row.querySelector('img.matchFriendly') && !row.querySelector('span[style]'))
				friendly = true;

			if (league && weekDay === 1 || friendly && (weekDay > 1 || weekDay < 5) ||
			    row.querySelector('img[class^="matchCup"], img.matchMasters')) {
				Foxtrick.toggleClass(row, 'odd');
				Foxtrick.toggleClass(row, 'darkereven');
				Foxtrick.toggleClass(statsrow, 'odd');
				Foxtrick.toggleClass(statsrow, 'darkereven');
			}
		}, rows);
	}
};
