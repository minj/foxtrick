/**
 * median-transfer-price.js
 * Foxtrick Add median transfer price
 * @author bummerland
 */

Foxtrick.util.module.register({
	MODULE_NAME : "MedianTransferPrice",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : new Array('transferCompare'),

	run : function(doc) {
		var table = doc.getElementsByTagName("table")[0];
		if (!table) return;
		if (table.rows[0].cells.length < 5) return;
		var count = table.rows.length;
		var priceArray = [];
		for (var i = 5; i<count; i++) {
			if(table.rows[i].cells[3].innerHTML.match(/\&nbsp\;/i)){
				var thisPrice = parseInt(table.rows[i].cells[3].lastChild.textContent.replace(/\s/g, ""));
				priceArray.push(thisPrice);
			}
		}

		priceArray.sort(function(a,b){return a-b;});
		var median = 0;
		var avg = 0;
		var len = priceArray.length;
		for (var i in priceArray) {
			avg = avg + priceArray[i];
		}
		avg = Math.round(avg / len);

		if (len % 2 ==1) {
			median = Math.round(priceArray[(len-1)/2]);
		}
		else {
			median = Math.round((priceArray[(len/2)-1]+priceArray[len/2])/2);
		}

		if (count>0) {
			var currency = Foxtrick.trim(table.rows[5].cells[3].textContent.match(/\D+$/)[0]);
			var row = table.insertRow(table.rows.length);
			var cell = row.insertCell(0);
			cell.className = "left bold";
			cell.colSpan = 3;
			cell.textContent = Foxtrickl10n.getString( 'transfercompare_medianprice' );;
			cell = row.insertCell(1);
			cell.className = "right bold";
			cell.textContent = Foxtrick.formatNumber(median) + " " + currency;
			cell = row.insertCell(2);
			cell.colSpan = 2;

			row = table.insertRow(table.rows.length);
			cell = row.insertCell(0);
			cell.className = "left bold";
			cell.colSpan = 3;
			cell.textContent = Foxtrickl10n.getString( 'transfercompare_avgprice' );;
			cell = row.insertCell(1);
			cell.className = "right bold";
			cell.textContent = Foxtrick.formatNumber(avg) + " " + currency;
			cell = row.insertCell(2);
			cell.colSpan = 2;
		}
	}
});
