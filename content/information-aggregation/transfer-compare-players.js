'use strict';
/**
 * transfer-compare-players.js
 * Shows median and average values in transfer compare.
 * Fetch additional player information on request
 * @author bummerland - tasosventouris
 */

Foxtrick.modules['TransferComparePlayers'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['transferCompare','transfersPlayer'],
	// CSS: Foxtrick.InternalPath + 'resources/css/transfercompareplayers.css',

	run: function(doc) {
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
						argsPlayers.push([['file', 'playerdetails'],['version', '2.1'], ['playerId', parseInt(playerid,10)]]);
					};
				}
				Foxtrick.util.api.batchRetrieve(doc, argsPlayers, { cache_lifetime: 'session' },
					function(xmls, errors) {
						if (xmls)
							for (i = 0; i < xmls.length; ++i) {
								if (xmls[i] && !errors[i]) {
									var age = xmls[i].getElementsByTagName('Age')[0].innerHTML;
									var days = xmls[i].getElementsByTagName('AgeDays')[0].innerHTML;
									table.rows[5 + i].cells[4].textContent = parseInt(age) + "." + days;

									var specialty = xmls[i].getElementsByTagName('Specialty')[0].innerHTML;
									if (specialty != "0") {
										var spec = Foxtrick.L10n.getSpecialityFromNumber(specialty);
										var hidden = doc.createElement('span');
										hidden.className = 'hidden';
										hidden.textContent = spec;
										table.rows[5 + i].cells[0].appendChild(hidden);
										var specImageUrl = Foxtrick.getSpecialtyImagePathFromNumber(specialty);
										Foxtrick.addImage(doc, table.rows[5 + i].cells[0], {
											alt: spec,
											title: spec,
											src: specImageUrl
										});
									}	
								}
								else
									Foxtrick.log('No XML in batchRetrieve', argsPlayers[i], errors[i]);
							}
					});
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
				if (table.rows[i].cells[3].textContent.search(/\d/) != -1) {
					var thisPrice = Foxtrick.trimnum(table.rows[i].cells[3].textContent);
					priceArray.push(thisPrice);
				}
				if (table.rows[i].cells[2].textContent.search(/\d/) != -1) {
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
		} else if (isHistory) {
			var table = doc.querySelectorAll('#mainBody > table')[0];
			if (!table)
				return;
			if (table.rows[0].cells.length < 2)
				return;

			var count = table.rows.length;
			var th = doc.createElement('th');
			th.textContent = Foxtrick.L10n.getString('TransferComparePlayers.difference');
			table.rows[0].insertBefore(th,table.rows[0].cells[4]);

			for (var i = 1; i < count-1; i++) {
				var next = Foxtrick.trimnum(table.rows[i].cells[3].textContent);
				var last = Foxtrick.trimnum(table.rows[i+1].cells[3].textContent);
				var percentage = doc.createElement('span');

				if (next > last) {
					var dif = (next-last)/last;
					Foxtrick.addClass(percentage, 'ft-player-transfer-history positive');
					percentage.textContent = "(+" + Math.round(dif*100) + "%)";
				} else if (next < last) {
					var dif = (last-next)/next;
					Foxtrick.addClass(percentage, 'ft-player-transfer-history negative');
					percentage.textContent = "(-" + Math.round(dif*100) + "%)";
				} else {
					Foxtrick.addClass(percentage, 'ft-player-transfer-history');
					percentage.textContent = "(0%)";
				}


				table.rows[i].insertCell(4);
				table.rows[i].cells[4].appendChild(percentage);

			};

			var td = doc.createElement('td');
			td.textContent = " ";
			table.rows[i].insertBefore(td, table.rows[i].cells[4]);
			}

		}

	};
