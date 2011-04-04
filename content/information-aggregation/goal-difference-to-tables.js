/**
 * tables.js
 * adds goal difference to tables
 * @author spambot
 */

var FoxtrickGoalDifferenceToTables = {
	MODULE_NAME : "GoalDifferenceToTables",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : new Array('promotion','oldseries','marathon'),

	CSS : Foxtrick.ResourcePath + "resources/css/goal-diff.css",

	run : function( page, doc ) {
		var tbl_goaldiff = (doc.getElementById("ft_goaldiff")!=null);
		if (tbl_goaldiff) return;

		var goalcell = 2;
		var div = doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlViewPromotion');
		if (!div) {div = doc.getElementById('mainBody'); goalcell = 3;}

		var tbl_promo = div.getElementsByTagName('TABLE')[0];
		tbl_promo.id = 'ft_goaldiff';

		var newTH = doc.createElement('th');
		newTH.className = "right";
		tbl_promo.rows[0].appendChild(newTH);
		newTH.textContent = Foxtrickl10n.getString("foxtrick.seasonstats.goaldiff");

		var tblBodyObj = tbl_promo.tBodies[0];
		for (var i=1; i<tblBodyObj.rows.length; i++) {
			if (tblBodyObj.rows[i].cells[goalcell]) {
				var newCell = tblBodyObj.rows[i].insertCell(-1);
				newCell.className = "right";
				var content = Foxtrick.trim(tblBodyObj.rows[i].cells[goalcell].textContent).split("-");
				if (Foxtrick.trim(content[0]) == '') {
					content[0] = Foxtrick.trim(tblBodyObj.rows[i].cells[goalcell-1].textContent);
					content[1] = Foxtrick.trim(tblBodyObj.rows[i].cells[goalcell+1].textContent);
				}
				var result = Foxtrick.trim(content[0]) - Foxtrick.trim(content[1]);
				newCell.textContent = result;
				if (result > 0)
					Foxtrick.addClass(newCell, "ft-gd-positive");
				else if (result == 0)
					Foxtrick.addClass(newCell, "ft-gd-zero");
				else // result < 0
					Foxtrick.addClass(newCell, "ft-gd-negative")
			}
		}
	},

	change : function( page, doc ) {
		var id = "ft_goaldiff";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	}
};
