/**
 * transfer-compare-players.js
 * Show some math in player transfer compare section.
 * @author bummerland, tasosventouris, LA-MJ
 */

'use strict';

/* eslint-disable complexity, indent */

Foxtrick.modules.TransferComparePlayers = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails', 'transfersPlayer'],
	OPTIONS: ['ShowProfit'],

	// CSS: Foxtrick.InternalPath + 'resources/css/transfercompareplayers.css',

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		const isDetails = Foxtrick.isPage(doc, 'playerDetails');
		const isHistory = Foxtrick.isPage(doc, 'transfersPlayer');

		const MSECS_IN_DAY = Foxtrick.util.time.MSECS_IN_DAY;
		const DAYS_IN_SEASON = Foxtrick.util.time.DAYS_IN_SEASON;

		const AGE_TITLE = Foxtrick.L10n.getString('TransferComparePlayers.transferAge');

		if (isHistory || isDetails) {
			if (!Foxtrick.Prefs.isModuleOptionEnabled('TransferComparePlayers', 'ShowProfit'))
				return;

			/** @type {HTMLTableElement} */
			var hTable;
			if (isDetails) {
				hTable = doc.querySelector('#transferHistory > table');
				if (!hTable)
					return;
			}
			else if (isHistory) {
				hTable = doc.querySelector('#mainBody > table');
				if (!hTable)
					return;

				let headerRow = hTable.rows[0];
				if (headerRow.cells.length < 2)
					return;

				let srcTeamCell = headerRow.cells[1];
				let tsiCell = headerRow.cells[4];

				let diffTh = Foxtrick.createFeaturedElement(doc, module, 'th');
				diffTh.textContent = Foxtrick.L10n.getString('TransferComparePlayers.difference');
				Foxtrick.addClass(diffTh, 'center');
				headerRow.insertBefore(diffTh, tsiCell);

				let ageTh = Foxtrick.createFeaturedElement(doc, module, 'th');
				ageTh.textContent = Foxtrick.L10n.getString('Age.abbr');
				ageTh.title = Foxtrick.L10n.getString('Age');
				headerRow.insertBefore(ageTh, srcTeamCell);
			}

			var ct = hTable.rows.length;
			var playerId = Foxtrick.Pages.All.getId(doc);

			/** @type {CHPPParams} */
			var detailsArgs = [
				['file', 'playerdetails'],
				['version', '2.1'],
				['playerId', playerId],
			];
			Foxtrick.util.api.retrieve(doc, detailsArgs, { cache: 'session' }, (xml, errorText) => {
				if (!xml || errorText) {
					Foxtrick.log(errorText);
					return;
				}

				var age = xml.num('Age');
				var agedays = xml.num('AgeDays');
				var fetchDate = xml.date('FetchedDate');

				const DIFF_TMPL = '{sign}{val} {curr} ({sign}{pctg} %)';
				const SEASON_TMPL = '{sign}{season} {curr} {per}';

				// TODO test
				var diff = {
					curr: hTable.rows[1].cells[3].firstChild.textContent.match(/\D+$/)[0].trim(),
					per: Foxtrick.L10n.getString('ExtendedPlayerDetails.perseason'),
				};

				for (var i = 1; i < ct; i++) {
					var transferRow = hTable.rows[i];
					var prevRow = hTable.rows[i + 1];

					// README: user time only => +-1 day
					let transfer = transferRow.cells[0].textContent;

					var trDate = Foxtrick.util.time.getDateFromText(transfer);
					if (isHistory) {
						let days = age * DAYS_IN_SEASON + agedays;
						let diffDays = (fetchDate.getTime() - trDate.getTime()) / MSECS_IN_DAY;
						days -= Math.round(diffDays);
						let years = Foxtrick.Math.div(days, DAYS_IN_SEASON);
						days %= DAYS_IN_SEASON;

						let ageCell = transferRow.insertCell(1);
						ageCell.textContent = '';
						Foxtrick.makeFeaturedElement(ageCell, module);
						let ageSpan = doc.createElement('span');
						ageSpan.textContent = years + '.' + days;
						ageSpan.title = AGE_TITLE;
						ageCell.appendChild(ageSpan);
					}

					var diffCell = isHistory ?
						// eslint-disable-next-line no-magic-numbers
						transferRow.insertCell(5) :
						doc.createElement('span');

					Foxtrick.makeFeaturedElement(diffCell, module);

					if (typeof prevRow == 'undefined')
						break;

					let prevDateText = prevRow.cells[0].textContent;
					let prevDate = Foxtrick.util.time.getDateFromText(prevDateText);
					var daysInClub = (trDate.getTime() - prevDate.getTime()) / MSECS_IN_DAY;

					var priceCell = isHistory ? transferRow.cells[4] : [...transferRow.cells].pop();
					var price = Foxtrick.trimnum(priceCell.firstChild.textContent);

					let prevPriceCell = isHistory ? prevRow.cells[3] : [...prevRow.cells].pop();
					var prevPrice = Foxtrick.trimnum(prevPriceCell.firstChild.textContent);

					if (price == prevPrice) {
						Foxtrick.addClass(diffCell, 'ft-player-transfer-history');
						continue;
					}

					if (price > prevPrice) {
						Foxtrick.addClass(diffCell, 'ft-player-transfer-history positive');
						diff.sign = '+';
					}
					else {
						Foxtrick.addClass(diffCell, 'ft-player-transfer-history negative');
						diff.sign = '-';
					}

					let val = Math.abs(price - prevPrice);
					diff.val = Foxtrick.formatNumber(val, '\u00a0');
					diff.pctg = Math.round(val / prevPrice * 100);
					let season = Math.round(val / daysInClub * DAYS_IN_SEASON);
					diff.season = Foxtrick.formatNumber(season, '\u00a0');

					let span = doc.createElement('span');
					span.textContent = Foxtrick.format(DIFF_TMPL, diff);
					diffCell.appendChild(span);
					diffCell.appendChild(doc.createElement('br'));
					let seasonSpan = doc.createElement('span');
					seasonSpan.textContent = Foxtrick.format(SEASON_TMPL, diff);
					diffCell.appendChild(seasonSpan);

					if (isDetails) {
						priceCell.appendChild(doc.createElement('br'));
						priceCell.appendChild(diffCell);
					}
				}
			});
		}
	},

};
