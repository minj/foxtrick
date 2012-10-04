'use strict';
/**
 * Changes ratings to the 0-20 range
 * @author convincedd
 */

Foxtrick.modules['RatingsDisplay'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['statsSeries', 'match'],

	RADIO_OPTIONS: ['DenominationsRange', 'HatStats', 'HTSums'],
	NICE: -1,	// before Ratings

	run: function(doc) {

		var do_matchreport = function() {
			var isprematch =
				(doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlPreMatch') != null);
			if (isprematch)
				return;

			var table = Foxtrick.Pages.Match.getRatingsTable(doc);
			if (table == null) return;
			if (Foxtrick.Pages.Match.isWalkOver(table)) return;

			var mean_home = 0, mean_away = 0;
			for (var row = 1; row < table.rows.length; ++row) {
				if (table.rows[row].cells[3]) {
					if (table.rows[row].cells[1].getElementsByTagName('a').length != 0 &&
					    table.rows[row].cells[1].textContent !=
					    table.rows[row].cells[1].getElementsByTagName('a')[0].textContent) {
						Foxtrick.addClass(table.rows[row].cells[3], 'ft-dummy');
						var val = Number(table.rows[row].cells[3].textContent.replace(',', '.'));
						if (FoxtrickPrefs.getInt('module.RatingsDisplay.value') == 0) {
							table.rows[row].cells[3].textContent = (val / 4 + 0.75).toFixed(2);
						}
						else {
							if (row == table.rows.length - 1) { // total average
								table.rows[row].cells[3].textContent = mean_home;
							}
							else if (row >= table.rows.length - 4) { // averages
								mean_home += val * 3;
								table.rows[row].cells[3].textContent = val * 3;
							}
						}
					}
				}
				if (table.rows[row].cells[4]) {
					if (table.rows[row].cells[2].getElementsByTagName('a').length != 0 &&
					    table.rows[row].cells[2].textContent !=
					    table.rows[row].cells[2].getElementsByTagName('a')[0].textContent) {
						Foxtrick.addClass(table.rows[row].cells[4] , 'ft-dummy');
						var val = Number(table.rows[row].cells[4].textContent.replace(',', '.'));
						if (FoxtrickPrefs.getInt('module.RatingsDisplay.value') == 0)
							table.rows[row].cells[4].textContent = (val / 4 + 0.75).toFixed(2);
						else if (FoxtrickPrefs.getInt('module.RatingsDisplay.value') == 1)
						{
							if (row == table.rows.length - 1) { // total average
								table.rows[row].cells[4].textContent = mean_away;
							}
							else if (row >= table.rows.length - 4) { // averages
								mean_away += val * 3;
								table.rows[row].cells[4].textContent = val * 3;
							}
						}
						else {
							// unchanged
						}
					}
				}
			}
		};

		//series stats
		//e.g.: http://stage.hattrick.org/World/Series/Stats.aspx?LeagueLevelUnitID=25&TeamID=11598
		var do_seriesstats = function() {
			var averages_max = ['', '', 0, 0, 0, 0]; //#, rowstring, total, def, mid, att
			var averages_avg = ['', '', 0, 0, 0, 0]; //#, rowstring, total, def, mid, att
			var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];
			for (var row = 1; row < table.rows.length; ++row) {
				var mean_avg = 0, mean_max = 0;
				for (var cells = table.rows[row].cells.length - 1; cells > 1; --cells) {
					Foxtrick.addClass(table.rows[row].cells[cells], 'ft-dummy');
					var val_max = Number(table.rows[row].cells[cells].getElementsByTagName('a')[0]
					                     .textContent.replace(',', '.'));
					var val_avg = Number(table.rows[row].cells[cells].getElementsByTagName('span')[1]
					                     .textContent.replace(',', '.'));
					averages_max[cells] += val_max / 8;
					averages_avg[cells] += val_avg / 8;
					//denominations display style
					if (FoxtrickPrefs.getInt('module.RatingsDisplay.value') == 0) {
						table.rows[row].cells[cells].getElementsByTagName('a')[0].textContent =
							(val_max / 4 + 0.75).toFixed(2);
						table.rows[row].cells[cells].getElementsByTagName('span')[1].textContent =
							(val_avg / 4 + 0.75).toFixed(2);
					}
					//htstats style = module.RatingsDisplay.value == 1
					else if (FoxtrickPrefs.getInt('module.RatingsDisplay.value') == 1)
					{
						//the total average cell, multiply by 9 (3 x def, 3x mid, 3x forward)
						if (cells == 2) {
							table.rows[row].cells[cells].getElementsByTagName('a')[0]
								.textContent = val_max * 9;
							table.rows[row].cells[cells].getElementsByTagName('span')[1]
								.textContent = val_avg * 9;
						}
						//individual cells for def, mid, fw ... each entry has a weight of 3
						//-> multiply by 3
						else
						{
							table.rows[row].cells[cells].getElementsByTagName('a')[0]
								.textContent = val_max * 3;
							table.rows[row].cells[cells].getElementsByTagName('span')[1]
								.textContent = val_avg * 3;
						}
					} else {
						// just leave it as it is
					}
				}
			}

			// add averages
			var tbody = table.appendChild(doc.createElement('tbody'));
			tbody.className = 'strong';
			var sep = tbody.insertRow(-1).insertCell(-1);
			sep.textContent = '\u00a0';
			sep.setAttribute('style', 'visibility:hidden;');
			var row = tbody.insertRow(-1);
			var cell = row.insertCell(-1);
			cell.setAttribute('style', 'visibility:hidden;');
			var cell = row.insertCell(-1).textContent = Foxtrickl10n.getString('rating.average');
			for (var cells = 2; cells < 6; ++cells) {
				var cell = row.insertCell(-1);
				var spanavg = cell.appendChild(doc.createElement('span'));
				spanavg.className = 'avgStat hidden';
				var spanmax = cell.appendChild(doc.createElement('span'));
				spanmax.className = 'maxStat';
				if (FoxtrickPrefs.getInt('module.RatingsDisplay.value') == 0) {
					spanavg.textContent = (averages_avg[cells] / 4 + 0.75).toFixed(2);
					spanmax.textContent = (averages_max[cells] / 4 + 0.75).toFixed(2);
				}
				//htstats style = module.RatingsDisplay.value == 1
				else if (FoxtrickPrefs.getInt('module.RatingsDisplay.value') == 1)
				{
					//the total average cell, multiply by 9 (3 x def, 3x mid, 3x forward)
					if (cells == 2) {
						spanavg.textContent = (averages_avg[cells] * 9).toFixed(1);
						spanmax.textContent = (averages_max[cells] * 9).toFixed(1);
					}
					//individual cells for def, mid, fw ... each entry has a weight of 3
					//-> multiply by 3
					else
					{
						spanavg.textContent = (averages_avg[cells] * 3).toFixed(1);
						spanmax.textContent = (averages_max[cells] * 3).toFixed(1);
					}
				}
				// plain HT sums
				else {
					spanavg.textContent = averages_avg[cells].toFixed(2);
					spanmax.textContent = averages_max[cells].toFixed(2);
				}
			}

			//stars
			var averages_max = ['', '', 0, 0, 0, 0]; //#, rowstring, total, def, mid, att
			var averages_avg = ['', '', 0, 0, 0, 0]; //#, rowstring, total, def, mid, att
			var table = doc.getElementById('mainBody').getElementsByTagName('table')[1];
			for (var row = 1; row < table.rows.length; ++row) {
				var mean_avg = 0, mean_max = 0;
				for (var cells = table.rows[row].cells.length - 1; cells > 1; --cells) {
					var val_max = Number(table.rows[row].cells[cells].getElementsByTagName('a')[0]
					                     .textContent.replace(',', '.'));
					var val_avg = Number(table.rows[row].cells[cells].getElementsByTagName('span')[1]
					                     .textContent.replace(',', '.'));
					averages_max[cells] += val_max / 8;
					averages_avg[cells] += val_avg / 8;
				}
			}
			var tbody = table.appendChild(doc.createElement('tbody'));
			tbody.className = 'strong';
			var sep = tbody.insertRow(-1).insertCell(-1);
			sep.textContent = '\u00a0';
			sep.setAttribute('style', 'visibility:hidden;');
			var row = tbody.insertRow(-1);
			var cell = row.insertCell(-1);
			cell.setAttribute('style', 'visibility:hidden;');
			var cell = row.insertCell(-1).textContent = Foxtrickl10n.getString('rating.average');
			for (var cells = 2; cells < 6; ++cells) {
				var cell = row.insertCell(-1);
				var spanavg = cell.appendChild(doc.createElement('span'));
				spanavg.className = 'avgStat hidden';
				var spanmax = cell.appendChild(doc.createElement('span'));
				spanmax.className = 'maxStat';
				spanavg.textContent = averages_avg[cells].toFixed(2);
				spanmax.textContent = averages_max[cells].toFixed(2);
			}
		};

		if (Foxtrick.isPage('match', doc))
			do_matchreport();
		else if (Foxtrick.isPage('statsSeries', doc))
			do_seriesstats();
	}
};
