'use strict';
/**
 * transfer-compare-players.js
 * Shows median and average values in transfer compare.
 * Fetch additional player information on request
 * @author bummerland - tasosventouris
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

		if (isCompare) {
			var table = doc.querySelectorAll('#mainBody > table')[0];
			if (!table)
				return;
			if (table.rows[0].cells.length < 5)
				return;

			var link = Foxtrick.createFeaturedElement(doc, this, 'a');
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
				for (var i = 5; i < count; i++) {
					var player = table.rows[i].cells[0].getElementsByTagName('a')[0];
					if (player) {
						var playerid = Foxtrick.getParameterFromUrl(player.href, 'playerId');
						var args = [
							['file', 'playerdetails'],
							['version', '2.1'],
							['playerId', parseInt(playerid, 10)]
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
						var days = xmls[i].num('Age') * 112 + xmls[i].num('AgeDays');
						var fetchDate = xmls[i].date('FetchedDate');
						var transfer = table.rows[5 + i].cells[1].textContent;
						var transferDate = Foxtrick.util.time.getDateFromText(transfer);

						var diffDays = (fetchDate.getTime() - transferDate.getTime()) /
							(24 * 60 * 60 * 1000);
						days -= Math.round(diffDays);
						var years = Foxtrick.Math.div(days, 112);
						days %= 112;

						var ageCell = table.rows[5 + i].cells[4];
						ageCell.textContent = '';
						Foxtrick.makeFeaturedElement(ageCell, module);
						var ageSpan = doc.createElement('span');
						ageSpan.textContent = years + '.' + days;
						ageSpan.title =
							Foxtrick.L10n.getString('TransferComparePlayers.transferAge');
						ageCell.appendChild(ageSpan);

						var specialty = xmls[i].num('Specialty');
						if (specialty) {
							var spec =
								Foxtrick.L10n.getSpecialityFromNumber(specialty);
							var hidden = doc.createElement('span');
							hidden.className = 'hidden';
							hidden.textContent = spec;
							table.rows[5 + i].cells[0].appendChild(hidden);
							var specImageUrl =
								Foxtrick.getSpecialtyImagePathFromNumber(specialty);
							Foxtrick.addImage(doc, table.rows[5 + i].cells[0], {
								alt: spec,
								title: spec,
								src: specImageUrl
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
				var thisPlayer = table.rows[i].cells[0].getElementsByTagName('a')[0];
				var thisPlayerId = Foxtrick.getParameterFromUrl(thisPlayer.href, 'playerId');
				if (thisPlayerId === ownPlayerId) {
					Foxtrick.addClass(table.rows[i], 'ft-tableHighlight');
				}
				if (/\d/.test(table.rows[i].cells[3].textContent)) {
					var thisPrice = Foxtrick.trimnum(table.rows[i].cells[3].textContent);
					priceArray.push(thisPrice);
				}
				if (/\d/.test(table.rows[i].cells[2].textContent)) {
					var thisTsi = Foxtrick.trimnum(table.rows[i].cells[2].textContent);
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
				medianprice = Math.round((priceArray[(len / 2) - 1] + priceArray[len / 2]) / 2);
				mediantsi = Math.round((tsiArray[(len / 2) - 1] + tsiArray[len / 2]) / 2);
			}

			if (count > 0) {
				var currency = table.rows[5].cells[3].textContent.match(/\D+$/)[0].trim();
				var row = Foxtrick.insertFeaturedRow(table, this, table.rows.length);
				var cell = row.insertCell(0);
				cell.className = 'left bold';
				cell.colSpan = 2;
				cell.textContent = Foxtrick.L10n.getString('TransferComparePlayers.median');
				cell = row.insertCell(1);
				cell.className = 'right bold nowrap';
				cell.colSpan = 1;
				cell.textContent = Foxtrick.formatNumber(mediantsi, '\u00a0');
				cell = row.insertCell(2);
				cell.className = 'right bold nowrap';
				cell.textContent = Foxtrick.formatNumber(medianprice, '\u00a0') + ' ' + currency;
				cell = row.insertCell(3);
				cell.colSpan = 2;

				row = Foxtrick.insertFeaturedRow(table, this, table.rows.length);
				cell = row.insertCell(0);
				cell.className = 'left bold';
				cell.colSpan = 2;
				cell.textContent = Foxtrick.L10n.getString('TransferComparePlayers.average');
				cell = row.insertCell(1);
				cell.className = 'right bold nowrap';
				cell.colSpan = 1;
				cell.textContent = Foxtrick.formatNumber(avgtsi, '\u00a0');
				cell = row.insertCell(2);
				cell.className = 'right bold nowrap';
				cell.textContent = Foxtrick.formatNumber(avgprice, '\u00a0') + ' ' + currency;
				cell = row.insertCell(3);
				cell.colSpan = 2;
			}
		}
		else if (isHistory) {
			if (!Foxtrick.Prefs.isModuleOptionEnabled('TransferComparePlayers', 'ShowProfit'))
				return;
			var hTable = doc.querySelectorAll('#mainBody > table')[0];
			if (!hTable)
				return;
			if (hTable.rows[0].cells.length < 2)
				return;

			var ct = hTable.rows.length;
			var th = Foxtrick.createFeaturedElement(doc, this, 'th');
			th.textContent = Foxtrick.L10n.getString('TransferComparePlayers.difference');
			hTable.rows[0].insertBefore(th, hTable.rows[0].cells[4]);

			for (var i = 1; i < ct - 1; i++) {
				var next = Foxtrick.trimnum(hTable.rows[i].cells[3].textContent);
				var last = Foxtrick.trimnum(hTable.rows[i + 1].cells[3].textContent);
				var percentage = Foxtrick.createFeaturedElement(doc, this, 'span');

				var dif;
				if (next > last) {
					dif = (next - last) / last;
					Foxtrick.addClass(percentage, 'ft-player-transfer-history positive');
					percentage.textContent = '(+' + Math.round(dif * 100) + ' %)';
				}
				else if (next < last) {
					dif = (last - next) / last;
					Foxtrick.addClass(percentage, 'ft-player-transfer-history negative');
					percentage.textContent = '(-' + Math.round(dif * 100) + ' %)';
				}
				else {
					Foxtrick.addClass(percentage, 'ft-player-transfer-history');
					percentage.textContent = '(0 %)';
				}

				hTable.rows[i].insertCell(4);
				hTable.rows[i].cells[4].appendChild(percentage);

			}

			var td = doc.createElement('td');
			td.textContent = ' ';
			hTable.rows[i].insertBefore(td, hTable.rows[i].cells[4]);
		}

	}

};
