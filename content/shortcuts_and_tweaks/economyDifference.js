/**
 * economyDifference.js
 * Script which shows two-week-balance on Finance page
 * @author smates
 */

var FoxtrickEconomyDifference = {
	
    MODULE_NAME : "TwoWeekBalance",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	RADIO_OPTIONS : new Array("plus", "minus"),
    
    init : function() {
            Foxtrick.registerPageHandler( 'finances', this);
    },

    run : function( page, doc ) {
		// localize this
        
        var DIFF_OPTION = FoxtrickPrefs.getInt("module." + this.MODULE_NAME + ".value");
        if (DIFF_OPTION == null) DIFF_OPTION = 0;
		const STR_S_TABLE_NAME = Foxtrickl10n.getString(
			"foxtrick.tweaks.twoweekbalance") + '&nbsp;(' + this.RADIO_OPTIONS[DIFF_OPTION] + ')';
		var cs= FoxtrickPrefs.getString("oldCurrencySymbol");//currencysymbol which in the your country
            
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
		
        if (DIFF_OPTION == 0) {
            var econ_ted_crowd = this.extractAmount(
                tableCurr.rows[1].cells[1]) + this.
                extractAmount(tableLast.rows[1].cells[1]);
            var econ_ted_sponsors = this.extractAmount(
                tableCurr.rows[2].cells[1]) + this.
                extractAmount(tableLast.rows[2].cells[1]);
            var econ_ted_financial  = this.extractAmount(
                tableCurr.rows[3].cells[1]) + this.
                extractAmount(tableLast.rows[3].cells[1]);
            var econ_ted_temporary = this.extractAmount(
                tableCurr.rows[4].cells[1]) + this.
                extractAmount(tableLast.rows[4].cells[1]);
            var econ_all = econ_ted_temporary+econ_ted_financial  + 
                econ_ted_sponsors+econ_ted_crowd;    
        } else {
            var econ_ted_crowd = this.extractAmount(
                tableCurr.rows[1].cells[1]) - this.
                extractAmount(tableLast.rows[1].cells[1]);
            var econ_ted_sponsors = this.extractAmount(
                tableCurr.rows[2].cells[1]) - this.
                extractAmount(tableLast.rows[2].cells[1]);
            var econ_ted_financial  = this.extractAmount(
                tableCurr.rows[3].cells[1]) - this.
                extractAmount(tableLast.rows[3].cells[1]);
            var econ_ted_temporary = this.extractAmount(
                tableCurr.rows[4].cells[1]) - this.
                extractAmount(tableLast.rows[4].cells[1]);
            var econ_all = econ_ted_temporary+econ_ted_financial  + 
                econ_ted_sponsors+econ_ted_crowd;    
        }
		newTabDiff.rows[1].cells[1].innerHTML = '<span ' + 
			this.getColorStyle(econ_ted_crowd) + '>'+ 
			ReturnFormatedValue(econ_ted_crowd,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[2].cells[1].innerHTML = '<span ' + 
			this.getColorStyle(econ_ted_sponsors) + '>' +
			ReturnFormatedValue(econ_ted_sponsors,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[3].cells[1].innerHTML = '<span ' + 
			this.getColorStyle(econ_ted_financial ) + '>' + 
            ReturnFormatedValue(econ_ted_financial ,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[4].cells[1].innerHTML = '<span ' + 
			this.getColorStyle(econ_ted_temporary) + '>' + 
			ReturnFormatedValue(econ_ted_temporary,'&nbsp;') + '&nbsp;' +  cs+'</span>';
        newTabDiff.rows[8].cells[1].innerHTML = '<span ' + 
			this.getColorStyle(econ_all) + '>' + 
			ReturnFormatedValue(econ_all,'&nbsp;') + '&nbsp;' +  cs+'</span>'; 

        if (DIFF_OPTION == 0) {
            var diff_arena = this.extractAmount(tableCurr.
                rows[1].cells[3])+this.extractAmount(
                tableLast.rows[1].cells[3]);
            var diff_wages = this.extractAmount(tableCurr.
                rows[2].cells[3])+this.extractAmount(
                tableLast.rows[2].cells[3]);
            var diff_u = this.extractAmount(tableCurr.
                rows[3].cells[3])+this.extractAmount(
                tableLast.rows[3].cells[3]);
            var diff_m = this.extractAmount(tableCurr.
                rows[4].cells[3])+this.extractAmount(
                tableLast.rows[4].cells[3]);
            var diff_z = this.extractAmount(tableCurr.
                rows[5].cells[3])+this.extractAmount(
                tableLast.rows[5].cells[3]);
            var diff_j = this.extractAmount(tableCurr.
                rows[6].cells[3])+this.extractAmount(
                tableLast.rows[6].cells[3]);
            var diff_all = diff_arena+diff_wages+diff_u+diff_m+diff_z+diff_j;
        } else {
            var diff_arena = this.extractAmount(tableCurr.
                rows[1].cells[3])-this.extractAmount(
                tableLast.rows[1].cells[3]);
            var diff_wages = this.extractAmount(tableCurr.
                rows[2].cells[3])-this.extractAmount(
                tableLast.rows[2].cells[3]);
            var diff_u = this.extractAmount(tableCurr.
                rows[3].cells[3])-this.extractAmount(
                tableLast.rows[3].cells[3]);
            var diff_m = this.extractAmount(tableCurr.
                rows[4].cells[3])-this.extractAmount(
                tableLast.rows[4].cells[3]);
            var diff_z = this.extractAmount(tableCurr.
                rows[5].cells[3])-this.extractAmount(
                tableLast.rows[5].cells[3]);
            var diff_j = this.extractAmount(tableCurr.
                rows[6].cells[3])-this.extractAmount(
                tableLast.rows[6].cells[3]);
            var diff_all = diff_arena+diff_wages+diff_u+diff_m+diff_z+diff_j;
        }

		newTabDiff.rows[1].cells[3].innerHTML = '<span ' + 
			this.getColorStyle(-diff_arena) + '>' + 
			ReturnFormatedValue(diff_arena,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[2].cells[3].innerHTML = '<span ' + 
			this.getColorStyle(-diff_wages) + '>' + 
			ReturnFormatedValue(diff_wages,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[3].cells[3].innerHTML = '<span ' + 
			this.getColorStyle(-diff_u) + '>' + 
			ReturnFormatedValue(diff_u,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[4].cells[3].innerHTML = '<span ' + 
			this.getColorStyle(-diff_m) + '>' + 
			ReturnFormatedValue(diff_m,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[5].cells[3].innerHTML = '<span ' + 
			this.getColorStyle(-diff_z) + '>' + 
			ReturnFormatedValue(diff_z,'&nbsp;') + '&nbsp;' +  cs+'</span>';            
		newTabDiff.rows[6].cells[3].innerHTML = '<span ' + 
			this.getColorStyle(-diff_j) + '>' + 
			ReturnFormatedValue(diff_j,'&nbsp;') + '&nbsp;' +  cs+'</span>';            
		newTabDiff.rows[8].cells[3].innerHTML = '<span ' + 
			this.getColorStyle(-diff_all) + '>' + 
			ReturnFormatedValue(diff_all,'&nbsp;') + '&nbsp;' +  cs+'</span>';            

		var twoWeekBalance = econ_all - diff_all;

		newTabDiff.rows[10].cells[1].innerHTML = '<span ' + 
			this.getColorStyle(twoWeekBalance) + '>' + 
			ReturnFormatedValue(twoWeekBalance,'&nbsp;') + '&nbsp;' +  cs+'</span>';            
	},
	
	change : function( page, doc ) {
	
	},
    
    extractAmount : function( cell ) {
        return parseInt(cell.textContent.replace(/\s*/g, ""));
    },
    
    getColorStyle : function( val ) {
        if (val < 0) {
            return 'style="color: #aa0000;font-weight: bold;"';
        } else if (val > 0) {
            return 'style="color: #377f31;font-weight: bold;"';
        }
        return '';
    }        
};