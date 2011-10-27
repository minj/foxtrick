"use strict";
/**
 * election-table.js
 * some more infos on election page
 * @author spambot, ryanli
 */

Foxtrick.util.module.register({
	MODULE_NAME : "ElectionTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["election"],

	run : function(doc) {
		var sum = 0;
		var table = doc.getElementsByClassName("previousCandidates")[0];

		// count up the sum first
		for (var i = 0; i < table.rows.length; ++i) {
			if (table.rows[i].cells[2]) {
				sum += parseInt(Foxtrick.trim(table.rows[i].cells[2].textContent));
			}
		}

		// add percentage for each candidate
		for (var i = 0; i < table.rows.length; i++) {
			if (table.rows[i].cells[2]) {
				var content = parseInt(Foxtrick.trim(table.rows[i].cells[2].textContent));
				var result = '(' + Math.floor(content/sum*1000)/10 + '%)';
				table.rows[i].cells[3].textContent += result;
				// keep consistent padding with the cell on the left
				table.rows[i].cells[3].style.padding = "0px";
			}
		}

		// finally, a sum is displayed
		var cnt = doc.createElement("strong");
		cnt.textContent = "Σ " + Foxtrick.formatNumber(sum, " ");
		cnt.style.paddingTop = "10px";
		table.parentNode.insertBefore(cnt, table.nextSibling);
	}
});
