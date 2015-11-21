'use strict';
/**
 * transfer-compare-players.js
 * Shows median and average values in transfer compare.
 * Fetch additional player information on request
 * @author bummerland, tasosventouris, LA-MJ
 */

Foxtrick.modules['TransferComparePlayers'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['transferCompare', 'transfersPlayer'],
	OPTIONS: ['ShowProfit'],
	// CSS: Foxtrick.InternalPath + 'resources/css/transfercompareplayers.css',

	run: function(doc) {
		var module = this;
		var isCompare = Foxtrick.isPage(doc, 'transferCompare');
		var isHistory = Foxtrick.isPage(doc, 'transfersPlayer');

		var MSECS_IN_DAY = Foxtrick.util.time.MSECS_IN_DAY;
		var DAYS_IN_SEASON = Foxtrick.util.time.DAYS_IN_SEASON;

		var AGE_TITLE = Foxtrick.L10n.getString('TransferComparePlayers.transferAge');

		if (isCompare) {
			var table = doc.querySelectorAll('#mainBody > table')[0];
			if (!table)
				return;
			if (table.rows[0].cells.length < 5)
				return;

			var link = Foxtrick.createFeaturedElement(doc, module, 'a');
			Foxtrick.addClass(link, 'ft-transfer-compare-players ft-link');

			var title = Foxtrick.L10n.getString('TransferComparePlayers.fetch');
			Foxtrick.addImage(doc, link, {
				alt: title,
				title: title,
				height: 16,
				width: 16,
				src: Foxtrick.InternalPath + 'resources/img/Aiga_downarrow_yellow.png',
			}, null, function(button) {
				Foxtrick.addClass(button, 'ft-transfer-compare-players');
			});

			var div = doc.getElementsByClassName('speedBrowser')[0].parentNode;
			div.appendChild(doc.createTextNode(' '));
			div.appendChild(link);

			Foxtrick.onClick(link, function() {
				var count = table.rows.length;
				var argsPlayers = [];
				for (var i = 0; i < count; i++) {
					var player = table.rows[i].cells[0].getElementsByTagName('a')[0];
					if (player) {
						var playerid = Foxtrick.getParameterFromUrl(player.href, 'playerId');
						var args = [
							['file', 'playerdetails'],
							['version', '2.1'],
							['playerId', parseInt(playerid, 10)],
						];
						argsPlayers.push(args);
					}
				}
				var loading = Foxtrick.util.note.createLoading(doc);
				table.parentNode.insertBefore(loading, table);
				Foxtrick.util.api.batchRetrieve(doc, argsPlayers, { cache_lifetime: 'session' },
				  function(xmls, errors) {
					if (!xmls)
						return;
					for (i = 0; i < xmls.length; ++i) {
						if (!xmls[i] || errors[i]) {
							Foxtrick.log('No XML in batchRetrieve', argsPlayers[i], errors[i]);
							continue;
						}
						// original player is in row 1, others start 4 rows down
						var rowIdx = i ? i + 4 : 1;
						var days = xmls[i].num('Age') * DAYS_IN_SEASON + xmls[i].num('AgeDays');
						var fetchDate = xmls[i].date('FetchedDate');
						var now = Foxtrick.util.time.getHTDate(doc);
						Foxtrick.util.time.setMidnight(now);

						// README: user time only => +-1 day
						var transfer = table.rows[rowIdx].cells[1].textContent;
						var refDate = i ? Foxtrick.util.time.getDateFromText(transfer) : now;
						// original player has no transferDate so now is used as reference

						var diffDays = (fetchDate.getTime() - refDate.getTime()) / MSECS_IN_DAY;

						days -= Math.round(diffDays);
						var years = Foxtrick.Math.div(days, DAYS_IN_SEASON);
						days %= DAYS_IN_SEASON;

						var ageCell = table.rows[rowIdx].cells[4];
						ageCell.textContent = '';
						Foxtrick.makeFeaturedElement(ageCell, module);
						var ageSpan = doc.createElement('span');
						ageSpan.textContent = years + '.' + days;
						ageSpan.title = AGE_TITLE;
						ageCell.appendChild(ageSpan);

						var specialty = xmls[i].num('Specialty');
						if (specialty) {
							var spec = Foxtrick.L10n.getSpecialityFromNumber(specialty);
							var hidden = doc.createElement('span');
							hidden.className = 'hidden';
							hidden.textContent = spec;
							table.rows[rowIdx].cells[0].appendChild(hidden);
							var specImageUrl = Foxtrick.getSpecialtyImagePathFromNumber(specialty);
							Foxtrick.addImage(doc, table.rows[rowIdx].cells[0], {
								alt: spec,
								title: spec,
								src: specImageUrl,
							});
						}
					}
					loading.parentNode.removeChild(loading);
				});
				this.parentNode.removeChild(this);
			});

			var ownPlayer = table.rows[1].cells[0].getElementsByTagName('a')[0];
			var ownPlayerId = Foxtrick.getParameterFromUrl(ownPlayer.href, 'playerId');

			var count = table.rows.length;
			var priceArray = [];
			var tsiArray = [];
			for (var i = 5; i < count; i++) {
				var row = table.rows[i];
				var thisPlayer = row.cells[0].getElementsByTagName('a')[0];
				var thisPlayerId = Foxtrick.getParameterFromUrl(thisPlayer.href, 'playerId');
				if (thisPlayerId === ownPlayerId) {
					Foxtrick.addClass(row, 'ft-tableHighlight');
				}
				if (/\d/.test(row.cells[3].textContent)) {
					var thisPrice = Foxtrick.trimnum(row.cells[3].textContent);
					priceArray.push(thisPrice);
				}
				if (/\d/.test(row.cells[2].textContent)) {
					var thisTsi = Foxtrick.trimnum(row.cells[2].textContent);
					tsiArray.push(thisTsi);
				}
			}

			priceArray.sort(function(a, b) { return a - b; });
			tsiArray.sort(function(a, b) { return a - b; });

			var medianprice = 0;
			var avgprice = 0;
			var mediantsi = 0;
			var avgtsi = 0;

			var len = priceArray.length;
			for (var i = 0; i < priceArray.length; ++i) {
				avgprice = avgprice + priceArray[i];
				avgtsi = avgtsi + tsiArray[i];
			}
			avgprice = Math.round(avgprice / len);
			avgtsi = Math.round(avgtsi / len);

			if (len % 2 == 1) {
				medianprice = Math.round(priceArray[(len - 1) / 2]);
				mediantsi = Math.round(tsiArray[(len - 1) / 2]);
			}
			else {
				medianprice = Math.round((priceArray[len / 2 - 1] + priceArray[len / 2]) / 2);
				mediantsi = Math.round((tsiArray[len / 2 - 1] + tsiArray[len / 2]) / 2);
			}

			if (count > 0) {
				var currencyCell = table.rows[5].cells[3];
				var currency = currencyCell.firstChild.textContent.match(/\D+$/)[0].trim();
				var sumRow = Foxtrick.insertFeaturedRow(table, module, table.rows.length);
				var cell = sumRow.insertCell(-1);
				cell.className = 'left bold';
				cell.colSpan = 2;
				cell.textContent = Foxtrick.L10n.getString('TransferComparePlayers.median');
				cell = sumRow.insertCell(-1);
				cell.className = 'right bold nowrap';
				cell.colSpan = 1;
				cell.textContent = Foxtrick.formatNumber(mediantsi, '\u00a0');
				cell = sumRow.insertCell(-1);
				cell.className = 'right bold nowrap';
				cell.textContent = Foxtrick.formatNumber(medianprice, '\u00a0') + ' ' + currency;
				cell = sumRow.insertCell(-1);
				cell.colSpan = 2;

				sumRow = Foxtrick.insertFeaturedRow(table, module, table.rows.length);
				cell = sumRow.insertCell(-1);
				cell.className = 'left bold';
				cell.colSpan = 2;
				cell.textContent = Foxtrick.L10n.getString('TransferComparePlayers.average');
				cell = sumRow.insertCell(-1);
				cell.className = 'right bold nowrap';
				cell.colSpan = 1;
				cell.textContent = Foxtrick.formatNumber(avgtsi, '\u00a0');
				cell = sumRow.insertCell(-1);
				cell.className = 'right bold nowrap';
				cell.textContent = Foxtrick.formatNumber(avgprice, '\u00a0') + ' ' + currency;
				cell = sumRow.insertCell(-1);
				cell.colSpan = 2;
			}
		}
		else if (isHistory) {
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

			var links = Foxtrick.Pages.All.getBreadCrumbs(doc);
			var playerId = Foxtrick.getParameterFromUrl(links, 'playerId');

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
