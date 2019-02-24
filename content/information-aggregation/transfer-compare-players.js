/**
 * transfer-compare-players.js
 * Show some math in player transfer compare section.
 * @author bummerland, tasosventouris, LA-MJ
 */

'use strict';

Foxtrick.modules['TransferComparePlayers'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['transfersPlayer'],
	OPTIONS: ['ShowProfit'],

	// CSS: Foxtrick.InternalPath + 'resources/css/transfercompareplayers.css',

	run: function(doc) {
		var module = this;
		var isHistory = Foxtrick.isPage(doc, 'transfersPlayer');

		var MSECS_IN_DAY = Foxtrick.util.time.MSECS_IN_DAY;
		var DAYS_IN_SEASON = Foxtrick.util.time.DAYS_IN_SEASON;

		var AGE_TITLE = Foxtrick.L10n.getString('TransferComparePlayers.transferAge');

		if (isHistory) {
			if (!Foxtrick.Prefs.isModuleOptionEnabled('TransferComparePlayers', 'ShowProfit'))
				return;
			var hTable = doc.querySelector('#mainBody > table');
			if (!hTable)
				return;
			var headerRow = hTable.rows[0];
			if (headerRow.cells.length < 2)
				return;

			var ct = hTable.rows.length;
			var diffTh = Foxtrick.createFeaturedElement(doc, module, 'th');
			diffTh.textContent = Foxtrick.L10n.getString('TransferComparePlayers.difference');
			Foxtrick.addClass(diffTh, 'center');
			headerRow.insertBefore(diffTh, headerRow.cells[4]);

			var ageTh = Foxtrick.createFeaturedElement(doc, module, 'th');
			ageTh.textContent = Foxtrick.L10n.getString('Age.abbr');
			ageTh.title = Foxtrick.L10n.getString('Age');
			headerRow.insertBefore(ageTh, headerRow.cells[1]);

			let [link] = Foxtrick.Pages.All.getBreadCrumbs(doc);
			var playerId = Foxtrick.getUrlParam(link.href, 'playerId');

			var detailsArgs = [
				['file', 'playerdetails'],
				['version', '2.1'],
				['playerId', parseInt(playerId, 10)],
			];
			Foxtrick.util.api.retrieve(doc, detailsArgs, { cache_lifetime: 'session' },
			  function(xml, errorText) {
				if (!xml || errorText) {
					Foxtrick.log(errorText);
					return;
				}

				var age = xml.num('Age');
				var agedays = xml.num('AgeDays');
				var fetchDate = xml.date('FetchedDate');

				var DIFF_TMPL = '{sign}{val} {curr} ({sign}{pctg} %)';
				var SEASON_TMPL = '{sign}{season} {curr} {per}';
				var diff = {
					curr: hTable.rows[1].cells[3].firstChild.textContent.match(/\D+$/)[0].trim(),
					per: Foxtrick.L10n.getString('ExtendedPlayerDetails.perseason'),
				};

				for (var i = 1; i < ct; i++) {
					var transferRow = hTable.rows[i];
					var prevRow = hTable.rows[i + 1];

					var days = age * DAYS_IN_SEASON + agedays;
					var now = Foxtrick.util.time.getHTDate(doc);
					Foxtrick.util.time.setMidnight(now);

					// README: user time only => +-1 day
					var transfer = transferRow.cells[0].textContent;
					var transferDate = Foxtrick.util.time.getDateFromText(transfer);
					var diffDays = (fetchDate.getTime() - transferDate.getTime()) / MSECS_IN_DAY;
					days -= Math.round(diffDays);
					var years = Foxtrick.Math.div(days, DAYS_IN_SEASON);
					days %= DAYS_IN_SEASON;

					transferRow.insertCell(1);
					var ageCell = transferRow.cells[1];
					ageCell.textContent = '';
					Foxtrick.makeFeaturedElement(ageCell, module);
					var ageSpan = doc.createElement('span');
					ageSpan.textContent = years + '.' + days;
					ageSpan.title = AGE_TITLE;
					ageCell.appendChild(ageSpan);

					if (i < ct - 1) {
						var prevDateText = prevRow.cells[0].textContent;
						var prevDate = Foxtrick.util.time.getDateFromText(prevDateText);
						var daysInClub =
							(transferDate.getTime() - prevDate.getTime()) / MSECS_IN_DAY;

						var diffCell = transferRow.insertCell(5);
						Foxtrick.makeFeaturedElement(diffCell, module);

						var priceCell = transferRow.cells[4];
						var prevPriceCell = prevRow.cells[3];
						var price = Foxtrick.trimnum(priceCell.firstChild.textContent);
						var prevPrice = Foxtrick.trimnum(prevPriceCell.firstChild.textContent);

						if (price == prevPrice) {
							Foxtrick.addClass(diffCell, 'ft-player-transfer-history');
						}
						else {
							if (price > prevPrice) {
								Foxtrick.addClass(diffCell, 'ft-player-transfer-history positive');
								diff.sign = '+';
							}
							else {
								Foxtrick.addClass(diffCell, 'ft-player-transfer-history negative');
								diff.sign = '-';
							}
							var val = Math.abs(price - prevPrice);
							diff.val = Foxtrick.formatNumber(val, '\u00a0');
							diff.pctg = Math.round(val / prevPrice * 100);
							var season = Math.round(val / daysInClub * DAYS_IN_SEASON);
							diff.season = Foxtrick.formatNumber(season, '\u00a0');

							var span = doc.createElement('span');
							span.textContent = Foxtrick.format(DIFF_TMPL, diff);
							diffCell.appendChild(span);
							diffCell.appendChild(doc.createElement('br'));
							var seasonSpan = doc.createElement('span');
							seasonSpan.textContent = Foxtrick.format(SEASON_TMPL, diff);
							diffCell.appendChild(seasonSpan);
						}
					}
				}

				var td = doc.createElement('td');
				td.textContent = ' ';
				hTable.rows[i - 1].insertBefore(td, hTable.rows[i - 1].cells[5]);
			});
		}
	},

};
