"use strict";
/**
 * highlight-cup-wins.js
 * Highlight winners of cup matches and cupsets (optional)
 * @author convincedd, ryanli
 */

Foxtrick.modules["HighlightCupwins"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('cupMatches'),
	OPTIONS : new Array("HighlightCupsets"),

	run : function(doc) {
		var rtl = Foxtrick.util.layout.isRtl(doc);
		var highlightCupsets = FoxtrickPrefs.isModuleOptionEnabled("HighlightCupwins", "HighlightCupsets");
		// matches of Hattrick Masters aren't arranged by cup ranks
		var isMasters = (doc.location.search.search(/\bCupId=183\b/i) !== -1);
		var highlightHomeWin = !isMasters && highlightCupsets;

		var mainBody=doc.getElementById('mainBody');
		var table= mainBody.getElementsByTagName('table')[0];
		if (!table)
			return;

		// add a column to show the № of matches
		var header = table.getElementsByTagName("tr")[0];
		var numHeader = Foxtrick.createFeaturedElement(doc, this, "th");
		numHeader.appendChild(doc.createTextNode("#"));
		header.insertBefore(numHeader, header.firstChild);

		for (var i = 1; i < table.rows.length; ++i) {
			var numCell = Foxtrick.insertFeaturedCell(table.rows[i], this, 0);
			numCell.appendChild(doc.createTextNode(String(i)));

			var goals = table.rows[i].cells[4].textContent.match(/\d+/g);
			if (!goals) {
				// perhaps some results aren't shown
				continue;
			}
			var goalsHome=parseInt(goals[0]);
			var goalsAway=parseInt(goals[1]);

			// win, draw, lose from the aspect of home team
			var win = (goalsHome > goalsAway);
			var draw = (goalsHome === goalsAway); // 0 - 0 if match isn't played yet
			var lose = (goalsHome < goalsAway);
			var matchlink = table.rows[i].cells[3].getElementsByTagName('a')[0];
			var teams = matchlink.textContent.match(/(.+)\u00a0-\u00a0(.+)/);
			try {
				var homeTeam = !rtl ? teams[1] : teams[2];
				var awayTeam = !rtl ? teams[2] : teams[1];
				Foxtrick.addClass(matchlink, 'nowrap');
				if (win) {
					if (highlightHomeWin) {
						var strong = doc.createElement('strong');
						strong.textContent = table.rows[i].cells[4].textContent;
						table.rows[i].cells[4].replaceChild(strong, table.rows[i].cells[4].firstChild);
					}
					var strong = doc.createElement('strong');
					strong.textContent = homeTeam;
					if (!rtl) {
						matchlink.replaceChild(strong, matchlink.firstChild);
						matchlink.appendChild(doc.createTextNode(' - ' + awayTeam));
					}
					else {
						matchlink.replaceChild(doc.createTextNode(awayTeam + ' - '), matchlink.firstChild);
						matchlink.appendChild(strong);
					}
				}
				else if (lose) {
					var strong = doc.createElement('strong');
					strong.textContent = awayTeam;
					if (!rtl) {
						matchlink.replaceChild(doc.createTextNode(homeTeam + ' - '), matchlink.firstChild);
						matchlink.appendChild(strong);
					}
					else{
						matchlink.replaceChild(strong, matchlink.firstChild);
						matchlink.appendChild(doc.createTextNode(' - ' + homeTeam));
					}
				}
				var strongs = table.rows[i].getElementsByTagName('strong');
				for (var j=0; j<strongs.length; ++j)
					Foxtrick.makeFeaturedElement(strongs[j], this);
			}
			catch (e) {
				// cannot parse teams
				Foxtrick.log("Cannot parse teams: " + matchlink.textContent + "");
			}
		}
 	}
};
