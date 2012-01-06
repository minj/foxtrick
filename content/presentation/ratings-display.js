"use strict";
/**
 * Changes ratings to the 0-20 range
 * @author convincedd
 */

Foxtrick.util.module.register({
	MODULE_NAME : "RatingsDisplay",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["statsSeries", "match"],

	RADIO_OPTIONS : ["DenominationsRange", "HatStats" ],
	
	run : function(doc) {
	
		var do_matchreport = function() {
			var isprematch = (doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlPreMatch")!=null);
			if (isprematch) return;

			var table = Foxtrick.Pages.Match.getRatingsTable(doc);
			if (table == null) return;
			if (Foxtrick.Pages.Match.isWalkOver(table)) return;

			var mean_home=0, mean_away=0;
			for (var row = 1; row < table.rows.length; ++row) {
				if (table.rows[row].cells[3]) {
					if (table.rows[row].cells[1].getElementsByTagName('a').length !=0
					&& table.rows[row].cells[1].textContent != table.rows[row].cells[1].getElementsByTagName('a')[0].textContent) {
						Foxtrick.addClass(table.rows[row].cells[3],'ft-dummy');
						var val = Number(table.rows[row].cells[3].textContent.replace(',','.'));
						if (FoxtrickPrefs.getInt("module.RatingsDisplay.value") == 0) {
							table.rows[row].cells[3].textContent = (val/4+0.75).toFixed(2);
						}
						else {
							if (row == table.rows.length-1)  {// total average
								table.rows[row].cells[3].textContent = mean_home;
							}
							else if (row >= table.rows.length-4)  {// averages
								mean_home += val*3;
								table.rows[row].cells[3].textContent = val * 3;
							}
						}
					}
				}
				if (table.rows[row].cells[4]) {
					if (table.rows[row].cells[2].getElementsByTagName('a').length !=0
					&& table.rows[row].cells[2].textContent != table.rows[row].cells[2].getElementsByTagName('a')[0].textContent) {
						Foxtrick.addClass(table.rows[row].cells[4],'ft-dummy');
						var val = Number(table.rows[row].cells[4].textContent.replace(',','.'));
						if (FoxtrickPrefs.getInt("module.RatingsDisplay.value") == 0) 
							table.rows[row].cells[4].textContent = (val/4+0.75).toFixed(2);
						else {
							if (row == table.rows.length-1)  {// total average
								table.rows[row].cells[4].textContent = mean_away;
							}
							else if (row >= table.rows.length-4) { // averages
								mean_away += val*3;
								table.rows[row].cells[4].textContent = val * 3;
							}
						}
					}
				}
			}
		};
		
		//series stats
		//e.g.: http://stage.hattrick.org/World/Series/Stats.aspx?LeagueLevelUnitID=25&TeamID=11598
		var do_seriesstats = function() {
			var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];
			for (var row = 1; row < table.rows.length; ++row) {
				var mean_avg = 0, mean_max = 0;
				for (var cells = table.rows[row].cells.length-1; cells >1 ; --cells) {
					Foxtrick.addClass(table.rows[row].cells[cells],'ft-dummy');
					var val_max = Number(table.rows[row].cells[cells].getElementsByTagName('a')[0].textContent.replace(',','.'));
					var val_avg = Number(table.rows[row].cells[cells].getElementsByTagName('span')[1].textContent.replace(',','.'));
					//denominations display style
					if (FoxtrickPrefs.getInt("module.RatingsDisplay.value") == 0) {
						table.rows[row].cells[cells].getElementsByTagName('a')[0].textContent = (val_max/4+0.75).toFixed(2);
						table.rows[row].cells[cells].getElementsByTagName('span')[1].textContent = (val_avg/4+0.75).toFixed(2);
					}
					//htstats style = module.RatingsDisplay.value == 1
					else if (FoxtrickPrefs.getInt("module.RatingsDisplay.value") == 1)
					{	
						//the total average cell, multiply by 9 (3 x def, 3x mid, 3x forward)
						if(cells == 2){
							table.rows[row].cells[cells].getElementsByTagName('a')[0].textContent = val_max * 9;
							table.rows[row].cells[cells].getElementsByTagName('span')[1].textContent = val_avg * 9;
						}
						//individual cells for def, mid, fw ... each entry has a weight of 3 -> multiply by 3
						else
						{
							table.rows[row].cells[cells].getElementsByTagName('a')[0].textContent = val_max * 3;
							table.rows[row].cells[cells].getElementsByTagName('span')[1].textContent = val_avg * 3;
						}
					} else {
						//unsupported representation style, just leave it as it is
					}
				}
			}
		};
		
		if (Foxtrick.isPage("match", doc))
			do_matchreport();
		else if (Foxtrick.isPage("statsSeries", doc))
			do_seriesstats();
	}
});
