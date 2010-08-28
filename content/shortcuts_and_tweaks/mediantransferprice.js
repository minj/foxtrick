/**
 * mediantransferprice.js
 * Foxtrick Add median transfer price
 * @author bummerland
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMedianTransferPrice = {

    MODULE_NAME : "MedianTransferPrice",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('transferCompare'),
	DEFAULT_ENABLED : true,

    run : function( page, doc ) {

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
		var lengte = priceArray.length;
		for (var i in priceArray){
			avg = avg + priceArray[i];
		}
		avg = Math.round(avg / lengte)+"";

		if(lengte % 2 ==1){
			median = Math.round(priceArray[(lengte-1)/2])+"";
		} else {
			median = Math.round((priceArray[(lengte/2)-1]+priceArray[lengte/2])/2)+"";
		}

		if (count>0) {
		    var currency = Foxtrick.trim(table.rows[5].cells[3].textContent.match(/\D+$/)[0]);
		    var row = table.insertRow(table.rows.length);
		    var cell = row.insertCell(0);
		    cell.setAttribute("style", "text-align: left; font-weight: bold");
		    cell.colSpan = 2;
		    cell.innerHTML = Foxtrickl10n.getString( 'transfercompare_medianprice' );;
		    cell = row.insertCell(1);
		    cell.setAttribute("style", "text-align: right; font-weight: bold");
		    cell.colSpan = 2;
		    cell.innerHTML = this.group(median," ") + " " + currency;

		    row = table.insertRow(table.rows.length);
		    cell = row.insertCell(0);
		    cell.setAttribute("style", "text-align: left; font-weight: bold");
		    cell.colSpan = 2;
		    cell.innerHTML = Foxtrickl10n.getString( 'transfercompare_avgprice' );;
		    cell = row.insertCell(1);
		    cell.setAttribute("style", "text-align: right; font-weight: bold");
		    cell.colSpan = 2;
		    cell.innerHTML = this.group(avg," ") + " " + currency;
	    }
	},


	group : function (astring, chr, size ) {
		if ( typeof chr == 'undefined' ) chr = ",";
		if ( typeof size == 'undefined' ) size = 3;
		return astring.split( '' ).reverse().join( '' ).replace( new RegExp( "(.{" + size + "})(?!$)", "g" ), "$1" + chr ).split( '' ).reverse().join( '' );
	}
};

