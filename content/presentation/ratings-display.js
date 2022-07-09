/**
 * Changes ratings to the 0-20 range
 * @author convincedd
 */

'use strict';

Foxtrick.modules.RatingsDisplay = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['statsSeries', 'match'],

	RADIO_OPTIONS: ['DenominationsRange', 'HatStats', 'HTSums'],
	NICE: 1, // after ratings modules: ratings, att-vs-def, htms-prediction

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		// denominations display style
		const DISPLAY_DENOM = Foxtrick.Prefs.getInt('module.RatingsDisplay.value') === 0;

		// hatstats style = module.RatingsDisplay.value == 1
		const DISPLAY_HS = Foxtrick.Prefs.getInt('module.RatingsDisplay.value') === 1;
		const SUBSECTOR_CT = 3;

		var doMatchReport = function() {
			if (Foxtrick.Pages.Match.isPrematch(doc))
				return;

			let table = Foxtrick.Pages.Match.getRatingsTable(doc);
			if (!table || Foxtrick.Pages.Match.isWalkOver(table))
				return;

			/** @type {HTMLTableElement} */
			let averageTable = doc.querySelector('.miscRatings');
			let rows = Foxtrick.concat(table.rows, averageTable ? averageTable.rows : []);

			const AVERAGE_ROWS = ['mid', 'def', 'att', 'total'];

			Foxtrick.forEach(function(row, i, rows) {

				/**
				 * @param {HTMLTableCellElement} textTd
				 * @param {HTMLTableCellElement} valueTd
				 */
				var convertHTSums = function(textTd, valueTd) {
					// skip labels, headers, FT ratings etc
					if (!valueTd)
						return;

					// skip tactics level
					let link = textTd.querySelector('a');
					if (!link || textTd.textContent.trim() == link.textContent.trim())
						return;

					Foxtrick.addClass(valueTd, 'ft-dummy');

					let val = parseInt(valueTd.textContent, 10);

					if (DISPLAY_DENOM) {
						let float = Foxtrick.Math.hsToFloat(val, true).toFixed(2);
						val = parseFloat(float);
					}
					else if (DISPLAY_HS) {
						if (i === 1 || averageTable && i >= rows.length - AVERAGE_ROWS.length) {
							// midfield and averages
							val *= SUBSECTOR_CT;
						}
					}
					valueTd.textContent = String(val);
				};

				let [_, homeText, awayText, homeValue, awayValue] = row.cells;
				convertHTSums(homeText, homeValue);
				convertHTSums(awayText, awayValue);
			}, rows);
		};

		// series stats
		// e.g.: /World/Series/Stats.aspx?LeagueLevelUnitID=25&TeamID=11598
		var doSeriesStats = function() {
			if (doc.querySelector('[role="alert"]'))
				return;

			let mainBody = doc.getElementById('mainBody');

			var addRatingsAvgs = function() {
				let ratingsTable = mainBody.querySelector('table');
				if (!ratingsTable)
					return;

				let averagesMax = [0, 0, 0, 0]; // total, def, mid, att
				let averagesAvg = [0, 0, 0, 0]; // total, def, mid, att

				const MID_VS_ATT_DEF = 3;
				const SECTION_COUNT = 3;
				const ATT_DEF_FACTOR = SECTION_COUNT * MID_VS_ATT_DEF;
				const MID_FACTOR = ATT_DEF_FACTOR / MID_VS_ATT_DEF;

				let failure = false;
				Foxtrick.forEach(function(row, _, rows) {
					Foxtrick.forEach(function(cell, j) {
						Foxtrick.addClass(cell, 'ft-dummy');

						let elMax = cell.querySelector('a');
						let elAvg = cell.querySelectorAll('span')[1];
						let valMax = elMax ? parseInt(elMax.textContent, 10) : 0;
						let valAvg = elAvg ? parseInt(elAvg.textContent, 10) : 0;

						averagesMax[j] += valMax / rows.length;
						averagesAvg[j] += valAvg / rows.length;

						if (!elMax || !elAvg) {
							failure = true;
							return;
						}

						if (DISPLAY_DENOM) {
							elMax.textContent = Foxtrick.Math.hsToFloat(valMax, true).toFixed(2);
							elAvg.textContent = Foxtrick.Math.hsToFloat(valAvg, true).toFixed(2);
						}
						else if (DISPLAY_HS) {
							if (j === 0) {
								// the total average cell,
								// multiply by 9 (3 x def, 3x mid, 3x forward)
								elMax.textContent = String(valMax * ATT_DEF_FACTOR);
								elAvg.textContent = String(valAvg * ATT_DEF_FACTOR);
							}
							else {
								// individual cells for def, mid, fw ...
								// each entry has a weight of 3
								// -> multiply by 3
								elMax.textContent = String(valMax * MID_FACTOR);
								elAvg.textContent = String(valAvg * MID_FACTOR);
							}
						}
					}, Foxtrick.toArray(row.cells).slice(2)); // skip first two columns
				}, Foxtrick.toArray(ratingsTable.rows).slice(1)); // skip header

				if (failure) {
					Foxtrick.log('failed to parse ratings display avgs');
					return;
				}

				// add averages
				let tbody = ratingsTable.appendChild(doc.createElement('tbody'));
				Foxtrick.makeFeaturedElement(tbody, module);
				Foxtrick.addClass(tbody, 'strong');

				let sep = tbody.insertRow(-1).insertCell(-1);
				sep.textContent = '\u00a0';
				sep.setAttribute('style', 'visibility:hidden;');

				let row = tbody.insertRow(-1);
				row.insertCell(-1).setAttribute('style', 'visibility:hidden;');
				row.insertCell(-1).textContent = Foxtrick.L10n.getString('rating.average');

				for (let cells = 0; cells < averagesMax.length; ++cells) {
					let cell = row.insertCell(-1);

					let spanAvg = cell.appendChild(doc.createElement('span'));
					spanAvg.className = 'avgStat hidden';

					let spanMax = cell.appendChild(doc.createElement('span'));
					spanMax.className = 'maxStat';

					let avgText, maxText;
					if (DISPLAY_DENOM) {
						avgText = Foxtrick.Math.hsToFloat(averagesAvg[cells], true).toFixed(2);
						maxText = Foxtrick.Math.hsToFloat(averagesMax[cells], true).toFixed(2);
					}
					else if (DISPLAY_HS) {
						// the total average cell, multiply by 9 (3 x def, 3x mid, 3x forward)
						if (cells === 0) {
							avgText = (averagesAvg[cells] * ATT_DEF_FACTOR).toFixed(1);
							maxText = (averagesMax[cells] * ATT_DEF_FACTOR).toFixed(1);
						}
						else {
							// individual cells for def, mid, fw ... each entry has a weight of 3
							// -> multiply by 3
							avgText = (averagesAvg[cells] * MID_FACTOR).toFixed(1);
							maxText = (averagesMax[cells] * MID_FACTOR).toFixed(1);
						}
					}
					else {
						// plain HT sums
						avgText = averagesAvg[cells].toFixed(2);
						maxText = averagesMax[cells].toFixed(2);
					}
					spanAvg.textContent = avgText;
					spanMax.textContent = maxText;
				}
			};

			var addStarAvgs = function() {
				let averagesMax = [0, 0, 0, 0]; // total, def, mid, att
				let averagesAvg = [0, 0, 0, 0]; // total, def, mid, att
				let starsTable = mainBody.querySelectorAll('table')[1];
				if (!starsTable)
					return;

				Foxtrick.forEach(function(row, _, rows) {
					Foxtrick.forEach(function(cell, j) {
						let elMax = cell.querySelector('a');
						let elAvg = cell.querySelectorAll('span')[1];
						let valMax = elMax ? parseFloat(elMax.textContent.replace(',', '.')) : 0;
						let valAvg = elAvg ? parseFloat(elAvg.textContent.replace(',', '.')) : 0;
						averagesMax[j] += valMax / rows.length;
						averagesAvg[j] += valAvg / rows.length;
					}, Foxtrick.toArray(row.cells).slice(2)); // skip first two columns
				}, Foxtrick.toArray(starsTable.rows).slice(1)); // skip header

				let tbody = starsTable.appendChild(doc.createElement('tbody'));
				Foxtrick.makeFeaturedElement(tbody, module);
				Foxtrick.addClass(tbody, 'strong');

				let sep = tbody.insertRow(-1).insertCell(-1);
				sep.textContent = '\u00a0';
				sep.setAttribute('style', 'visibility:hidden;');

				let row = tbody.insertRow(-1);
				row.insertCell(-1).setAttribute('style', 'visibility:hidden;');
				row.insertCell(-1).textContent = Foxtrick.L10n.getString('rating.average');

				for (let cells = 0; cells < averagesMax.length; ++cells) {
					let cell = row.insertCell(-1);
					let spanAvg = cell.appendChild(doc.createElement('span'));
					spanAvg.className = 'avgStat hidden';
					let spanMax = cell.appendChild(doc.createElement('span'));
					spanMax.className = 'maxStat';
					spanAvg.textContent = averagesAvg[cells].toFixed(2);
					spanMax.textContent = averagesMax[cells].toFixed(2);
				}
			};

			addRatingsAvgs();
			addStarAvgs();
		};

		if (Foxtrick.isPage(doc, 'match'))
			doMatchReport();
		else if (Foxtrick.isPage(doc, 'statsSeries'))
			doSeriesStats();
	},
};
