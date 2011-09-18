/**
 * match-income.js
 * Foxtrick add links to played matches pages
 * @author convinced, ryanli
 */

Foxtrick.util.module.register({
	MODULE_NAME : "MatchIncome",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['match'],

	run : function(doc) {
		var sidebar = doc.getElementById('sidebar');
		var sidebarBoxes = sidebar.getElementsByClassName('sidebarBox');
		var isSoldSeats = function(n) {
			// returns whether a sidebarBox is sold seats box
			var tables = n.getElementsByTagName('table');
			if (tables.length != 1)
				return false;
			if (tables[0].rows.length != 4)
				return false;
			if (tables[0].rows[0].cells.length <2)
				return false;
			if (tables[0].rows[0].cells[0].textContent.search(/\d/)!=-1)
				return false;
			if (tables[0].rows[0].cells[1].textContent.search(/\d/)==-1)
				return false;
			return true;
		};
		var soldSeatBox = Foxtrick.filter(isSoldSeats, sidebarBoxes)[0];
		if (!soldSeatBox) // cannot find sold seat boxes
			return;

		var table = soldSeatBox.getElementsByTagName('table')[0];
		var tbody = table.getElementsByTagName('tbody')[0];
		var sum = Foxtrick.trimnum(table.rows[0].cells[1].textContent)*6.5
			+ Foxtrick.trimnum(table.rows[1].cells[1].textContent)*9.5
			+ Foxtrick.trimnum(table.rows[2].cells[1].textContent)*18
			+ Foxtrick.trimnum(table.rows[3].cells[1].textContent)*32.5;

		// convert to local currency
		sum /= Foxtrick.util.currency.getRate();

		var tr2 = doc.createElement('tr');
		var td2a = doc.createElement('td');
		var td2b = doc.createElement('td');
		tbody.appendChild(tr2);
		tr2.appendChild(td2a);
		tr2.appendChild(td2b);
		td2a.className = "ch";
		td2a.textContent = Foxtrickl10n.getString('foxtrick.matches.income');
		td2b.className = "nowrap";
		td2b.textContent = Foxtrick.formatNumber(Math.floor(sum), ' ')+' '+Foxtrick.util.currency.getSymbol();
	}
});
