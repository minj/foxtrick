/**
 * highlight-cup-wins.js
 * Highlight winners of cup matches and cupsets (optional)
 * @author convincedd, ryanli
 */

var FoxtrickHighlightCupwins = {

	MODULE_NAME : "HighlightCupwins",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('cupmatches'),
	OPTIONS : new Array("HighlightCupsets"),

	run : function( page, doc ) {
		var highlightCupsets = Foxtrick.isModuleFeatureEnabled(this, "HighlightCupsets");
		// matches of Hattrick Masters aren't arranged by cup ranks
		var isMasters = (doc.location.search.search(/\bCupId=183\b/i) !== -1);
		var highlightHomeWin = !isMasters && highlightCupsets;

		var mainBody=doc.getElementById('mainBody');
		var table= mainBody.getElementsByTagName('table')[0];

		// add a column to show the № of matches
		var header = table.getElementsByTagName("tr")[0];
		var numHeader = doc.createElement("th");
		numHeader.appendChild(doc.createTextNode("#"));
		header.insertBefore(numHeader, header.firstChild);

		for (var i = 1; i < table.rows.length; ++i) {
			var numCell = table.rows[i].insertCell(0);
			numCell.appendChild(doc.createTextNode(String(i)));

			var goals = table.rows[i].cells[4].innerHTML.match(/\d+/g);
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
			const teams = matchlink.textContent.split(/\s+\-\s+/);
			const homeTeam = teams[0];
			const awayTeam = teams[1];
			if (win) {
				if (highlightHomeWin) {
					table.rows[i].cells[4].innerHTML = '<strong>'+table.rows[i].cells[4].innerHTML+'</strong>';
				}
				matchlink.innerHTML = '<strong>' + homeTeam + '</strong>&nbsp;-&nbsp;' + awayTeam;
			}
			else if (lose) {
				matchlink.innerHTML = homeTeam + '&nbsp;-&nbsp;<strong>' + awayTeam + '</strong>';
			}
		}
 	}
};
