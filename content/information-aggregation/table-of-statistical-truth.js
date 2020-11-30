'use strict';

/**
 * table-of-statistical-truth.js
 * add htms predicted table to old series
 * @author spambot, ryanli
 */

Foxtrick.modules.TableOfStatisticalTruth = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['oldSeries', 'seriesHistoryNew'],
	CSS: Foxtrick.InternalPath + 'resources/css/table-of-statistical-truth.css',

	/** @param {document} doc */
	run: function(doc) {
		var module = this;

		/** @type {HTMLSelectElement} */
		var seasonSelect = doc.querySelector('#mainBody select');
		if (!seasonSelect)
			return;

		var season = seasonSelect.value;
		var [_, seriesLink] = Foxtrick.Pages.All.getBreadCrumbs(doc);
		var serie = Foxtrick.util.id.getLeagueLeveUnitIdFromUrl(seriesLink.href);
		var lang = Foxtrick.Prefs.getString('htLanguage');

		/** @type {HTMLTableElement} */
		var leagueTable = doc.querySelector('#mainBody table');
		var insertBefore = leagueTable.nextSibling;

		var tableHeader = Foxtrick.createFeaturedElement(doc, module, 'h2');
		tableHeader.textContent = Foxtrick.L10n.getString('truthTable.table');
		tableHeader.className = 'ft-expander-unexpanded';
		tableHeader.id = 'ft-truth-table-h2';
		insertBefore.parentNode.insertBefore(tableHeader, insertBefore);
		var div = Foxtrick.createFeaturedElement(doc, module, 'div');
		div.className = 'ft-truth-table-div';
		insertBefore.parentNode.insertBefore(div, insertBefore);

		/** @type {HTMLElement} */
		var table;

		/** @param {XMLDocument} xml */
		var buildTable = function(xml) {
			if (!xml) {
				// TODO: feedback
				return;
			}
			else if (xml.getElementsByTagName('available')[0].textContent == 'false') {

				let link = doc.createElement('a');
				link.href = 'http://www.fantamondi.it/HTMS/index.php?page=truthtable&lang=' +
					lang + '&serie=' + serie + '&season=' + season;
				link.id = 'createTableLink';
				link.target = '_blank';
				link.textContent = Foxtrick.L10n.getString('truthTable.notAvailableYet');
				insertBefore.parentNode.insertBefore(link, insertBefore);

				table = link;
				return;
			}

			var teams = xml.getElementsByTagName('team');

			table = doc.createElement('table');
			table.id = 'ft-truth-table';
			div.appendChild(table);

			/* eslint-disable quote-props */
			/** @type {Record<string, string>} */
			var colTypes = {
				'predicted_position': 'center',
				'name': 'left',
				'real_position': 'center',
				'real_points': 'right',
				'predicted_points': 'right',
				'difference': 'right',
			};
			/* eslint-enable quote-props */

			var headRow = doc.createElement('tr');
			table.appendChild(headRow);
			for (let i in colTypes) {
				let th = doc.createElement('th');
				th.className = colTypes[i];
				th.textContent = Foxtrick.L10n.getString(`truthTable.${i}`);
				headRow.appendChild(th);
			}

			for (let team of teams) {
				let row = doc.createElement('tr');
				table.appendChild(row);

				for (let i in colTypes) {
					let cell = doc.createElement('td');
					cell.className = colTypes[i];

					if (i == 'name') {
						let a = doc.createElement('a');
						a.href = '/Club/?TeamID=' + team.querySelector('id').textContent;
						a.textContent = team.querySelector(i).textContent;
						cell.appendChild(a);
					}
					else if (i == 'difference') {
						let pts = Number(team.querySelector('real_points').textContent);
						let pred = Number(team.querySelector('predicted_points').textContent);
						let trimmed = parseFloat((pts - pred).toFixed(2));

						if (trimmed > 0)
							Foxtrick.addClass(cell, 'ft-gd-positive');
						else if (trimmed < 0)
							Foxtrick.addClass(cell, 'ft-gd-negative');

						cell.textContent = String(trimmed);
					}
					else {
						let text = team.querySelector(i).textContent;
						if (i == 'predicted_points')
							text = Number(text).toFixed(2);

						cell.textContent = text;
					}
					row.appendChild(cell);
				}
			}

			insertBefore.parentNode.insertBefore(table, insertBefore);

			var br = doc.createElement('br');
			insertBefore.parentNode.insertBefore(br, insertBefore);

			var link = doc.createElement('a');
			link.href = 'http://www.fantamondi.it/HTMS/index.php?page=truthtable&lang=' +
				lang + '&serie=' + serie + '&season=' + season;
			link.target = '_blank';
			link.textContent = Foxtrick.L10n.getString('truthTable.tableAtHTMS');
			insertBefore.parentNode.insertBefore(link, insertBefore);

			Foxtrick.modules.TableSort.run(doc);
		};

		var addTable = async function() {
			var url = 'http://www.fantamondi.it/HTMS/dorequest.php?action=truthtable&serie=' +
				serie + '&season=' + season;

			try {
				let p = /** @type {Promise<string>} */ (Foxtrick.load(url));
				buildTable(Foxtrick.parseXML(await p));
			}
			catch (e) {
				// @ts-ignore
				Foxtrick.catch(module)(e);
			}
		};

		var toggleTable = function() {
			Foxtrick.toggleClass(tableHeader, 'ft-expander-unexpanded');
			Foxtrick.toggleClass(tableHeader, 'ft-expander-expanded');
			if (table)
				Foxtrick.toggleClass(table, 'hidden');
			else
				addTable();
		};

		Foxtrick.onClick(tableHeader, toggleTable);
	},
};
