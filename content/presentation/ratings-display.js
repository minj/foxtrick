'use strict';
/**
 * Changes ratings to the 0-20 range
 * @author convincedd
 */

Foxtrick.modules['RatingsDisplay'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['statsSeries', 'match'],

	RADIO_OPTIONS: ['DenominationsRange', 'HatStats', 'HTSums'],
	NICE: 1, // after ratings modules: ratings, att-vs-def, htms-prediction

	run: function(doc) {
		var module = this;
		// denominations display style
		var denom = Foxtrick.Prefs.getInt('module.RatingsDisplay.value') === 0;
		// hatstats style = module.RatingsDisplay.value == 1
		var hatstats = Foxtrick.Prefs.getInt('module.RatingsDisplay.value') === 1;


		var do_matchreport = function() {
			if (Foxtrick.Pages.Match.isPrematch(doc))
				return;

			var table = Foxtrick.Pages.Match.getRatingsTable(doc);
			if (!table || Foxtrick.Pages.Match.isWalkOver(table))
				return;

			var averageTable = doc.querySelector('.miscRatings');
			var rows = Foxtrick.concat(table.rows, averageTable.rows);

			Foxtrick.forEach(function(row, i, rows) {
				var convertHTSums = function(textTd, valueTd) {
					if (valueTd) {
						// skip labels, headers, FT ratings etc
						if (textTd.getElementsByTagName('a').length &&
						    textTd.textContent.trim() !=
						    textTd.getElementsByTagName('a')[0].textContent.trim()) {
							// skip tactics level

							Foxtrick.addClass(valueTd, 'ft-dummy');
							var val = parseInt(valueTd.textContent, 10);
							if (denom)
								val = Foxtrick.Math.hsToFloat(val, true).toFixed(2);
							else if (hatstats) {
								if (i === 1 || i >= rows.length - 4)
									// midfield and averages
									val = val * 3;
							}
							valueTd.textContent = val;
						}
					}
				};
				var cell1 = row.cells[1]; // home text
				var cell2 = row.cells[2]; // away text
				var cell3 = row.cells[3]; // home value
				var cell4 = row.cells[4]; // away value
				convertHTSums(cell1, cell3);
				convertHTSums(cell2, cell4);
			}, rows);
		};

		// series stats
		// e.g.: /World/Series/Stats.aspx?LeagueLevelUnitID=25&TeamID=11598
		var do_seriesstats = function() {
			var mainBody = doc.getElementById('mainBody');

			var addRatingsAvgs = function() {
				var ratingsTable = mainBody.getElementsByTagName('table')[0];
				if (!ratingsTable)
					return;

				var averagesMax = [0, 0, 0, 0]; // total, def, mid, att
				var averagesAvg = [0, 0, 0, 0]; // total, def, mid, att

				Foxtrick.forEach(function(row) {
					Foxtrick.forEach(function(cell, j) {
						Foxtrick.addClass(cell, 'ft-dummy');
						var elMax = cell.getElementsByTagName('a')[0];
						var elAvg = cell.getElementsByTagName('span')[1];
						var valMax = parseInt(elMax.textContent, 10);
						var valAvg = parseInt(elAvg.textContent, 10);
						averagesMax[j] += valMax / 8;
						averagesAvg[j] += valAvg / 8;
						if (denom) {
							elMax.textContent = Foxtrick.Math.hsToFloat(valMax, true).toFixed(2);
							elAvg.textContent = Foxtrick.Math.hsToFloat(valAvg, true).toFixed(2);
						}
						else if (hatstats) {
							if (j === 0) {
								// the total average cell,
								// multiply by 9 (3 x def, 3x mid, 3x forward)
								elMax.textContent = valMax * 9;
								elAvg.textContent = valAvg * 9;
							}
							else {
								// individual cells for def, mid, fw ...
								// each entry has a weight of 3
								// -> multiply by 3
								elMax.textContent = valMax * 3;
								elAvg.textContent = valAvg * 3;
							}
						}
					}, Foxtrick.toArray(row.cells).slice(2)); // skip first two columns
				}, Foxtrick.toArray(ratingsTable.rows).slice(1)); // skip header

				// add averages
				var tbody = ratingsTable.appendChild(doc.createElement('tbody'));
				Foxtrick.makeFeaturedElement(tbody, module);
				Foxtrick.addClass(tbody, 'strong');
				var sep = tbody.insertRow(-1).insertCell(-1);
				sep.textContent = '\u00a0';
				sep.setAttribute('style', 'visibility:hidden;');
				var row = tbody.insertRow(-1);
				row.insertCell(-1).setAttribute('style', 'visibility:hidden;');
				row.insertCell(-1).textContent = Foxtrick.L10n.getString('rating.average');
				for (var cells = 0; cells < 4; ++cells) {
					var cell = row.insertCell(-1);
					var spanAvg = cell.appendChild(doc.createElement('span'));
					spanAvg.className = 'avgStat hidden';
					var spanMax = cell.appendChild(doc.createElement('span'));
					spanMax.className = 'maxStat';
					var avgText, maxText;
					if (denom) {
						avgText = Foxtrick.Math.hsToFloat(averagesAvg[cells], true).toFixed(2);
						maxText = Foxtrick.Math.hsToFloat(averagesMax[cells], true).toFixed(2);
					}
					else if (hatstats) {
						// the total average cell, multiply by 9 (3 x def, 3x mid, 3x forward)
						if (cells === 0) {
							avgText = (averagesAvg[cells] * 9).toFixed(1);
							maxText = (averagesMax[cells] * 9).toFixed(1);
						}
						// individual cells for def, mid, fw ... each entry has a weight of 3
						// -> multiply by 3
						else {
							avgText = (averagesAvg[cells] * 3).toFixed(1);
							maxText = (averagesMax[cells] * 3).toFixed(1);
						}
					}
					// plain HT sums
					else {
						avgText = averagesAvg[cells].toFixed(2);
						maxText = averagesMax[cells].toFixed(2);
					}
					spanAvg.textContent = avgText;
					spanMax.textContent = maxText;
				}
			};

			var addStarAvgs = function() {
				var averagesMax = [0, 0, 0, 0]; // total, def, mid, att
				var averagesAvg = [0, 0, 0, 0]; // total, def, mid, att
				var starsTable = mainBody.getElementsByTagName('table')[1];
				if (!starsTable)
					return;
				Foxtrick.forEach(function(row) {
					Foxtrick.forEach(function(cell, j) {
						var elMax = cell.getElementsByTagName('a')[0];
						var elAvg = cell.getElementsByTagName('span')[1];
						var valMax = parseFloat(elMax.textContent.replace(',', '.'));
						var valAvg = parseFloat(elAvg.textContent.replace(',', '.'));
						averagesMax[j] += valMax / 8;
						averagesAvg[j] += valAvg / 8;
					}, Foxtrick.toArray(row.cells).slice(2)); // skip first two columns
				}, Foxtrick.toArray(starsTable.rows).slice(1)); // skip header

				var tbody = starsTable.appendChild(doc.createElement('tbody'));
				Foxtrick.makeFeaturedElement(tbody, module);
				Foxtrick.addClass(tbody, 'strong');
				var sep = tbody.insertRow(-1).insertCell(-1);
				sep.textContent = '\u00a0';
				sep.setAttribute('style', 'visibility:hidden;');
				var row = tbody.insertRow(-1);
				row.insertCell(-1).setAttribute('style', 'visibility:hidden;');
				row.insertCell(-1).textContent = Foxtrick.L10n.getString('rating.average');
				for (var cells = 0; cells < 4; ++cells) {
					var cell = row.insertCell(-1);
					var spanAvg = cell.appendChild(doc.createElement('span'));
					spanAvg.className = 'avgStat hidden';
					var spanMax = cell.appendChild(doc.createElement('span'));
					spanMax.className = 'maxStat';
					spanAvg.textContent = averagesAvg[cells].toFixed(2);
					spanMax.textContent = averagesMax[cells].toFixed(2);
				}
			};

			addRatingsAvgs();
			addStarAvgs();
		};

		if (Foxtrick.isPage(doc, 'match'))
			do_matchreport();
		else if (Foxtrick.isPage(doc, 'statsSeries'))
			do_seriesstats();
	}
};
