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
		const STR_S_TABLE_NAME = Foxtrickl10n.getReturnFormatedValue(
			"foxtrick.tweaks.twoweekbalance");
		var cs= FoxtrickPrefs.getReturnFormatedValue("oldCurrencySymbol");//currencysymbol which in the your country
            
		/*var tableLast = doc.getElementsByTagName("table")[2];
		var tableCurr = doc.getElementsByTagName("table")[1];
                var path = "body/table[0]/tbody/tr[1]/td[2]";*/


                var mainBody = doc.getElementById( "mainBody" );
                var tables = mainBody.getElementsByTagName( "table" );
                var tableLast = tables[ 2 ];
                var tableCurr = tables[ 1 ];

       
		var heading = doc.createElement("h2");
		var headingId = "foxtrick_eD_heading";
		heading.setAttribute("class","tblBox");
		heading.setAttribute("id",headingId);
		heading.innerHTML =  STR_S_TABLE_NAME;
		if( !doc.getElementById( headingId ) ) {
			tableCurr.parentNode.parentNode.appendChild(heading);
		}
		
		var newTabDiff = tableCurr.cloneNode(true);
		//var newTabDiff = tableCurr.parentNode.parentNode.appendChild(
		//	tableCurr.cloneNode(true) );
		var newTabDiffId = "foxtrick_eD_newTabDiff";
		newTabDiff.setAttribute("id", newTabDiffId);
		newTabDiff.setAttribute("style", "margin-bottom: 10px");
		newTabDiff.setAttribute("class","indent");
		tableCurr.parentNode.parentNode.appendChild(newTabDiff);
		
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
			+ ReturnFormatedValue(prijmy_ted_vstupne,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[2].cells[1].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(prijmy_ted_sponzori) + '>'
			+ ReturnFormatedValue(prijmy_ted_sponzori,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[3].cells[1].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(prijmy_ted_investice) + '>'
			+ ReturnFormatedValue(prijmy_ted_investice,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[4].cells[1].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(prijmy_ted_m) + '>' + 
			ReturnFormatedValue(prijmy_ted_m,'&nbsp;') + '&nbsp;' +  cs+'</span>';
        newTabDiff.rows[8].cells[1].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(prijmy_all) + '>' + 
			ReturnFormatedValue(prijmy_all,'&nbsp;') + '&nbsp;' +  cs+'</span>'; 

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
			ReturnFormatedValue(vydaje_arena,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[2].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_wages) + '>' + 
			ReturnFormatedValue(vydaje_wages,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[3].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_u) + '>' + 
			ReturnFormatedValue(vydaje_u,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[4].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_m) + '>' + 
			ReturnFormatedValue(vydaje_m,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[5].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_z) + '>' + 
			ReturnFormatedValue(vydaje_z,'&nbsp;') + '&nbsp;' +  cs+'</span>';            
		newTabDiff.rows[6].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_j) + '>' + 
			ReturnFormatedValue(vydaje_j,'&nbsp;') + '&nbsp;' +  cs+'</span>';            
		newTabDiff.rows[8].cells[3].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(-vydaje_all) + '>' + 
			ReturnFormatedValue(vydaje_all,'&nbsp;') + '&nbsp;' +  cs+'</span>';            

		var twoWeekBalance = prijmy_all - vydaje_all;
		newTabDiff.rows[10].cells[1].innerHTML = '<span ' + 
			FoxtrickEconomyDifference.getColorStyle(twoWeekBalance) + '>' + 
			ReturnFormatedValue(twoWeekBalance,'&nbsp;') + '&nbsp;' +  cs+'</span>';            
		
	},
	
	change : function( page, doc ) {
	
	}
};

FoxtrickEconomyDifference.extractAmount = function( cell ) {
	return parseInt(cell.textContent.replace(/\s*/g, ""));
}

FoxtrickEconomyDifference.getColorStyle = function( val ) {
    if (val < 0) {
		return 'style="color: #aa0000;font-weight: bold;"';
    } else if (val > 0) {
        return 'style="color: #377f31;font-weight: bold;"';
    }
    return '';
}

