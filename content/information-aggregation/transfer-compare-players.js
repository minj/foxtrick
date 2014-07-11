'use strict';
/**
 * transfer-compare-players.js
 * Shows median and average values in transfer compare.
 * Fetch additional player information on request
 * @author bummerland - tasosventouris
 */

Foxtrick.modules['TransferComparePlayers'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['transferCompare'],
	CSS: Foxtrick.InternalPath + 'resources/css/transfercompareplayers.css',

	run: function(doc) {
		var table = doc.querySelectorAll('#mainBody > table')[0];
		if (!table) return;
		if (table.rows[0].cells.length < 5) return;

		var link = Foxtrick.createFeaturedElement(doc, this, 'a');
		Foxtrick.addClass(link, 'ft-transfer-compare-players ft-link');

		var button = Foxtrick.createFeaturedElement(doc, this, 'img');
		button.title = button.alt = Foxtrick.L10n.getString('TransferComparePlayers.button');
		link.appendChild(button);

		var div = doc.getElementsByClassName('speedBrowser')[0].parentNode;
		div.appendChild(doc.createTextNode(' '));
		div.appendChild(link);

		Foxtrick.addClass(button, 'ft-transfer-compare-players ft-img');
		Foxtrick.onClick(link, function() {
			var count = table.rows.length;
			for (var i = 5; i < count; i++) {
				var player = table.rows[i].cells[0].getElementsByTagName("a")[0];
				var playerid = Foxtrick.getParameterFromUrl(player.href, 'playerId');
			}
		});

		var ownplayer = table.rows[1].cells[0].getElementsByTagName("a")[0];

		var count = table.rows.length;
		var priceArray = [];
		var tsiArray = [];
		for (var i = 5; i < count; i++) {
			if (table.rows[i].cells[0].getElementsByTagName("a")[0] == ownplayer) {
				table.rows[i].style.backgroundColor = "yellow";
			}
			if (table.rows[i].cells[3].textContent.search(/\d/) != -1) {
				var thisPrice = Foxtrick.trimnum(table.rows[i].cells[3].textContent);
				priceArray.push(thisPrice);
			};
			if (table.rows[i].cells[2].textContent.search(/\d/) != -1) {
				var thisPrice = Foxtrick.trimnum(table.rows[i].cells[2].textContent);
				tsiArray.push(thisPrice);
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
};
