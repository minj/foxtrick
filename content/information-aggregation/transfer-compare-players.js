/**
 * transfer-compare-players.js
 * Show some math in player transfer compare section.
 * @author bummerland, tasosventouris, LA-MJ
 */

'use strict';

/* eslint-disable complexity, indent */

Foxtrick.modules['TransferComparePlayers'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails'],
	OPTIONS: ['ShowProfit'],

	// CSS: Foxtrick.InternalPath + 'resources/css/transfercompareplayers.css',

	run: function(doc) {
		var module = this;
		var isHistory = Foxtrick.isPage(doc, 'playerDetails');

		var MSECS_IN_DAY = Foxtrick.util.time.MSECS_IN_DAY;
		var DAYS_IN_SEASON = Foxtrick.util.time.DAYS_IN_SEASON;

		var AGE_TITLE = Foxtrick.L10n.getString('TransferComparePlayers.transferAge');

		if (isHistory) {
			if (!Foxtrick.Prefs.isModuleOptionEnabled('TransferComparePlayers', 'ShowProfit'))
				return;
			var hTable = doc.querySelector('#transferHistory > table');
			if (!hTable)
				return;

			var ct = hTable.rows.length;

			var playerId = Foxtrick.Pages.All.getId(doc);

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

					if (i < ct - 1) {
						var prevDateText = prevRow.cells[0].textContent;
						var prevDate = Foxtrick.util.time.getDateFromText(prevDateText);
						var daysInClub =
							(transferDate.getTime() - prevDate.getTime()) / MSECS_IN_DAY;

						var diffCell = doc.createElement('span');
						Foxtrick.makeFeaturedElement(diffCell, module);

						var priceCell = [...transferRow.cells].pop();
						var prevPriceCell = [...prevRow.cells].pop();
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
							priceCell.appendChild(doc.createElement('br'));
							priceCell.appendChild(diffCell);
						}
					}
				}

			});
		}
	},

};
