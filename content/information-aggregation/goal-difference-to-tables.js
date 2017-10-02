'use strict';
/**
 * tables.js
 * adds goal difference to tables
 * @author spambot
 */

Foxtrick.modules['GoalDifferenceToTables'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['oldSeries', 'marathon'],

	CSS: Foxtrick.InternalPath + 'resources/css/goal-diff.css',

	run: function(doc) {
		var tbl_goaldiff = (doc.getElementById('tbl_promo') != null);
		if (tbl_goaldiff)
			return;

		var goalcell = 2;
		var div = Foxtrick.getMBElement(doc, 'pnlViewPromotion');
		if (!div) {
			div = doc.getElementById('mainBody');
			goalcell = 3;
		}

		var tbl_promo = div.getElementsByTagName('TABLE')[0];
		tbl_promo.id = 'tbl_promo';

		var newTH = Foxtrick.createFeaturedElement(doc, this, 'th');
		Foxtrick.addClass(newTH, 'right');
		tbl_promo.rows[0].appendChild(newTH);
		newTH.textContent = Foxtrick.L10n.getString('seasonstats.goaldiff');

		var tblBodyObj = tbl_promo.tBodies[0];
		for (var i = 1; i < tblBodyObj.rows.length; i++) {
			if (tblBodyObj.rows[i].cells[goalcell]) {
				var newCell = Foxtrick.insertFeaturedCell(tblBodyObj.rows[i], this, -1);
				Foxtrick.addClass(newCell, 'right');
				var content = tblBodyObj.rows[i].cells[goalcell].textContent.trim().split('-');
				if (content[0].trim() === '') {
					content[0] = tblBodyObj.rows[i].cells[goalcell - 1].textContent.trim();
					content[1] = tblBodyObj.rows[i].cells[goalcell + 1].textContent.trim();
				}
				var result = content[0].trim() - content[1].trim();
				newCell.textContent = result;
				if (result > 0)
					Foxtrick.addClass(newCell, 'ft-gd-positive');
				else if (result == 0)
					Foxtrick.addClass(newCell, 'ft-gd-zero');
				else // result < 0
					Foxtrick.addClass(newCell, 'ft-gd-negative');
			}
		}
	},

	change: function(doc) {
		var id = 'tbl_promo';
		if (!doc.getElementById(id))
			this.run(doc);
	}
};
