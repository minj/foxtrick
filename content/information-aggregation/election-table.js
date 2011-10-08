"use strict";
/**
 * election-table.js
 * some more infos on election page
 * @author spambot
 */

Foxtrick.util.module.register({
	MODULE_NAME : "ElectionTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : new Array('election'),

	run : function(doc) {
		var tbl_election = (doc.getElementById("ft_election")!=null);
		if (tbl_election) return;

		var sum = 0;
		var div = doc.getElementById('mainBody');

		tbl_election = div.getElementsByTagName('TABLE')[0];
		if (!tbl_election) return;
		tbl_election.id = 'ft_election';

		var tblBodyObj = tbl_election.tBodies[0];
		if (!tblBodyObj) return;


		for (var i=0; i<tblBodyObj.rows.length; i++) {
			if (tblBodyObj.rows[i].cells[2]) {
				sum += parseInt(Foxtrick.trim(tblBodyObj.rows[i].cells[2].textContent));
			}
		}

		for (var i=0; i<tblBodyObj.rows.length; i++) {
			if (tblBodyObj.rows[i].cells[2]) {
				var content = parseInt(Foxtrick.trim(tblBodyObj.rows[i].cells[2].textContent));
				var result = '(' + Math.floor(content/sum*1000)/10 + '%) ';
				tblBodyObj.rows[i].cells[3].textContent += result;
			}
		}
		var cnt = doc.createElement("strong");
		cnt.textContent = "Σ " + Foxtrick.formatNumber(sum, " ");
		cnt.style.paddingTop = "10px";
		div.appendChild(cnt);
	},

	change : function(doc) {
		var id = "ft_election";
		if (!doc.getElementById(id))
			this.run(doc);
	}
});
