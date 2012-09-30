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
		var matches = doc.querySelectorAll('img.matchFriendly,img.matchCup,img.matchMasters');
		//a slight problem with Masters on Thursday as it happens between training updates
		//in different countries while this code fixes it in a 'before training' position

		for (var i = 0, badmatch, badrow; badmatch = matches[i]; ++i) {
			if (badmatch.parentNode.style.backgroundColor)
				continue; //NT friendlies should be skipped
			badrow = badmatch.parentNode.parentNode.parentNode;
			if (Foxtrick.hasClass(badrow, 'odd')) {
				Foxtrick.removeClass(badrow, 'odd');
				Foxtrick.addClass(badrow, 'darkereven');
			}
			else if (Foxtrick.hasClass(badrow, 'darkereven')) {
				Foxtrick.removeClass(badrow, 'darkereven');
				Foxtrick.addClass(badrow, 'odd');
			}
		}


		//NT matches on Monday require a more sophisticated fix for both tables

		var rows = doc.querySelectorAll('#matches > tbody > tr');
		//tbody is a must when thead is used. Otherwise, first row from tbody is lost
		//(querySelector bug?)

		for (var i = 0, row; row = rows[i]; ++i) {
			if (row.querySelector('span[style] > img.matchLeague')) { //this is NT match!
				var matchDay = row.querySelector('td:nth-child(2)').firstChild.nodeValue;
				if (Foxtrick.util.time.getDateFromText(matchDay).getDay() == 1) { //on Monday
					var statsrow = doc.querySelector('#stats > tbody > ' +
					                                 'tr:nth-child(' + (i + 1) + ')');
					//nth-child starts @ 1
					if (Foxtrick.hasClass(row, 'odd')) {
						Foxtrick.removeClass(row, 'odd');
						Foxtrick.addClass(row, 'darkereven');
						Foxtrick.removeClass(statsrow, 'odd');
						Foxtrick.addClass(statsrow, 'darkereven');
					}
					else if (Foxtrick.hasClass(row, 'darkereven')) {
						Foxtrick.removeClass(row, 'darkereven');
						Foxtrick.addClass(row, 'odd');
						Foxtrick.removeClass(statsrow, 'darkereven');
						Foxtrick.addClass(statsrow, 'odd');
					}
				}
			}
		}
	}
};
