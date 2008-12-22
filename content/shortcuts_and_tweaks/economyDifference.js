/**
 * economyDifference.js
 * Script which shows two-week-balance on Finance page
 * @author smates
 */

var FoxtrickEconomyDifference = {
	
    MODULE_NAME : "TwoWeekBalance",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	
    init : function() {
            Foxtrick.registerPageHandler( 'finances',
                                          FoxtrickEconomyDifference);
    },

    run : function( page, doc ) {
		// localize this
		const STR_S_TABLE_NAME = Foxtrickl10n.getString(
			"foxtrick.tweaks.twoweekbalance");
		
		var tableLast = doc.getElementsByTagName("table")[2];
		var tableCurr = doc.getElementsByTagName("table")[1];
    	var path = "body/table[0]/tbody/tr[1]/td[2]";
       
		var heading = doc.createElement("h2");
		heading.setAttribute("class","tblBox");
		heading.innerHTML =  STR_S_TABLE_NAME;
    	tableCurr.parentNode.parentNode.appendChild(heading);
     
		var newTabDiff = tableCurr.parentNode.parentNode.appendChild(
			tableCurr.cloneNode(true) );
		newTabDiff.setAttribute("style", "margin-bottom: 10px");
		newTabDiff.setAttribute("class","indent");
		var newRowsDiff = newTabDiff.tBodies[0].rows;
		
		var prijmy_ted_vstupne = FoxtrickEconomyDifference.extractAmount(
			tableCurr.rows[1].cells[1]) + FoxtrickEconomyDifference.
			extractAmount(tableLast.rows[1].cells[1]);
		var prijmy_ted_sponzori = FoxtrickEconomyDifference.extractAmount(
			tableCurr.rows[2].cells[1]) + FoxtrickEconomyDifference.
			extractAmount(tableLast.rows[2].cells[1]);
		var prijmy_ted_investice = FoxtrickEconomyDifference.extractAmount(
			tableCurr.rows[3].cells[1]) + FoxtrickEconomyDifference.
			extractAmount(tableLast.rows[3].cells[1]);
		var prijmy_ted_m = FoxtrickEconomyDifference.extractAmount(
			tableCurr.rows[4].cells[1]) + FoxtrickEconomyDifference.
			extractAmount(tableLast.rows[4].cells[1]);
    	var prijmy_all = prijmy_ted_m+prijmy_ted_investice + 
			prijmy_ted_sponzori+prijmy_ted_vstupne;    
		
		newTabDiff.rows[1].cells[1].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(prijmy_ted_vstupne) + '>'
			+ String(prijmy_ted_vstupne).group(' ', 3) + '</span>';
		newTabDiff.rows[2].cells[1].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(prijmy_ted_sponzori) + '>'
			+ String(prijmy_ted_sponzori).group(' ', 3) + '</span>';
		newTabDiff.rows[3].cells[1].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(prijmy_ted_investice) + '>'
			+ String(prijmy_ted_investice).group(' ', 3) + '</span>';
		newTabDiff.rows[4].cells[1].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(prijmy_ted_m) + '>' + 
			String(prijmy_ted_m).group(' ', 3) + '</span>';
        newTabDiff.rows[8].cells[1].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(prijmy_all) + '>' + 
			String(prijmy_all).group(' ', 3) + '</span>'; 

		var vydaje_arena = FoxtrickEconomyDifference.extractAmount(tableCurr.
			rows[1].cells[3])+FoxtrickEconomyDifference.extractAmount(
			tableLast.rows[1].cells[3]);
		var vydaje_wages = FoxtrickEconomyDifference.extractAmount(tableCurr.
			rows[2].cells[3])+FoxtrickEconomyDifference.extractAmount(
			tableLast.rows[2].cells[3]);
		var vydaje_u = FoxtrickEconomyDifference.extractAmount(tableCurr.
			rows[3].cells[3])+FoxtrickEconomyDifference.extractAmount(
			tableLast.rows[3].cells[3]);
		var vydaje_m = FoxtrickEconomyDifference.extractAmount(tableCurr.
			rows[4].cells[3])+FoxtrickEconomyDifference.extractAmount(
			tableLast.rows[4].cells[3]);
		var vydaje_z = FoxtrickEconomyDifference.extractAmount(tableCurr.
			rows[5].cells[3])+FoxtrickEconomyDifference.extractAmount(
			tableLast.rows[5].cells[3]);
		var vydaje_j = FoxtrickEconomyDifference.extractAmount(tableCurr.
			rows[6].cells[3])+FoxtrickEconomyDifference.extractAmount(
			tableLast.rows[6].cells[3]);
		var vydaje_all = vydaje_arena+vydaje_wages+vydaje_u+vydaje_m+vydaje_z+vydaje_j;

		newTabDiff.rows[1].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_arena) + '>' + 
			String(vydaje_arena).group(' ', 3) + '</span>';
		newTabDiff.rows[2].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_wages) + '>' + 
			String(vydaje_wages).group(' ', 3) + '</span>';
		newTabDiff.rows[3].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_u) + '>' + 
			String(vydaje_u).group(' ', 3) + '</span>';
		newTabDiff.rows[4].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_m) + '>' + 
			String(vydaje_m).group(' ', 3) + '</span>';
		newTabDiff.rows[5].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_z) + '>' + 
			String(vydaje_z).group(' ', 3) + '</span>';            
		newTabDiff.rows[6].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_j) + '>' + 
			String(vydaje_j).group(' ', 3) + '</span>';            
		newTabDiff.rows[8].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_all) + '>' + 
			String(vydaje_all).group(' ', 3) + '</span>';            

		var twoWeekBalance = prijmy_all - vydaje_all;
		newTabDiff.rows[10].cells[1].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(twoWeekBalance) + '>' + 
			String(twoWeekBalance).group(' ', 3) + '</span>';            
		
	}
};

FoxtrickEconomyDifference.extractAmount = function( cell ) {
	return parseInt(cell.textContent.replace(/\s*/g, ""));
}

FoxtrickEconomyDifference.getColorStyle = function( val ) {
    if (val < 0) {
		return 'style="color: #ff0000;font-weight: bold;"';
    } else if (val > 0) {
        return 'style="color: #339900;font-weight: bold;"';
    }
    return '';
}

String.prototype.group = function( chr, size ) {
		if ( typeof chr == 'undefined' ) chr = ",";
		if ( typeof size == 'undefined' ) size = 3;
		return this.split( '' ).reverse().join( '' ).replace( new RegExp( "(.{" + size + "})(?!$)", "g" ), "$1" + chr ).split( '' ).reverse().join( '' );
}