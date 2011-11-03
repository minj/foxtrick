"use strict";
/**
 * Changes ratings to the 0-20 range
 * @author convincedd
 */

Foxtrick.util.module.register({
	MODULE_NAME : "RatingsRange",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["statsSeries","match"],

	OPTIONS : [
	],
	
	run : function(doc) {
	
		var do_matchreport = function() {
			var isprematch = (doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlPreMatch")!=null);
			if (isprematch) return;

			var table = Foxtrick.Pages.Match.getRatingsTable(doc);
			if (table == null) return;
			if (Foxtrick.Pages.Match.isWalkOver(table)) return;

			for (var row = 1; row < table.rows.length; ++row) {
				if (table.rows[row].cells[3]) {
					if (table.rows[row].cells[1].getElementsByTagName('a').length !=0
						&& table.rows[row].cells[1].textContent != table.rows[row].cells[1].getElementsByTagName('a')[0].textContent)
						table.rows[row].cells[3].textContent = (Number(table.rows[row].cells[3].textContent.replace(',','.'))/4+0.75).toFixed(2);
				}
				if (table.rows[row].cells[4]) {
					if (table.rows[row].cells[2].getElementsByTagName('a').length !=0
						&& table.rows[row].cells[2].textContent != table.rows[row].cells[2].getElementsByTagName('a')[0].textContent)
						table.rows[row].cells[4].textContent = (Number(table.rows[row].cells[4].textContent.replace(',','.'))/4+0.75).toFixed(2);
				}
			}
		};
		
		var do_seriesstats = function() {
			var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];
			for (var row = 1; row < table.rows.length; ++row) {
				for (var cells = 2; cells < table.rows[row].cells.length; ++cells) {
					table.rows[row].cells[cells].getElementsByTagName('a')[0].textContent = (Number(table.rows[row].cells[cells].getElementsByTagName('a')[0].textContent.replace(',','.'))/4+0.75).toFixed(2);
					table.rows[row].cells[cells].getElementsByTagName('span')[1].textContent = (Number(table.rows[row].cells[cells].getElementsByTagName('span')[1].textContent.replace(',','.'))/4+0.75).toFixed(2);
				}
			}
		};
		
		if (Foxtrick.isPage("match", doc))
			do_matchreport();
		else if (Foxtrick.isPage("statsSeries", doc))
			do_seriesstats();
	}
});
