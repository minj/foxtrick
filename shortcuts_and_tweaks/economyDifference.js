/**
 * economyDifference.js
 * Script which shows two-week-balance on Finance page
 * @author smates
 */

var FoxtrickEconomyDifference = {
	
    MODULE_NAME : "TwoWeekBalance",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('finances'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.6.2",	
	LATEST_CHANGE:"Clicking on header toggles options. Option to exclude temporary income added",
	RADIO_OPTIONS : new Array("plus", "minus","plus_exclude_temp", "minus_exclude_temp"),
    
    init : function() {
    },

    run : function( page, doc ) {
			
			
		var head = doc.getElementsByTagName("head")[0];
        var style = doc.createElement("style");
        style.setAttribute("type", "text/css");
		var zaw = "#divfoxtrick_eD_heading .tblBox {background: url('chrome-extension://bpfbbngccefbbndginomofgpagkjckik/resources/img/down.gif') 413px 0 no-repeat;padding-right:20px;}";
		if (Foxtrick.isStandardLayout(doc) )
			zaw="#divfoxtrick_eD_heading .tblBox {background: url('chrome-extension://bpfbbngccefbbndginomofgpagkjckik/resources/img/link-down.png') #999999 505px 4px no-repeat;padding-right:20px;}";			
		style.appendChild(doc.createTextNode(zaw));
        head.appendChild(style);
				
			
			
		// localize this
        
        var DIFF_OPTION = FoxtrickPrefs.getInt("module." + this.MODULE_NAME + ".value");
		var exclude_temp=false;
		var exclude_temp_desc="";
		if (DIFF_OPTION>1) {
			DIFF_OPTION-=2;
			exclude_temp=true;
			exclude_temp_desc=' '+Foxtrickl10n.getString("foxtrick.TwoWeekBalance.exclude_temp.desc");
		}
        var DIFF_OPTION_STR = new Array(Foxtrickl10n.getString("foxtrick.TwoWeekBalance.plus.desc"),Foxtrickl10n.getString("foxtrick.TwoWeekBalance.minus.desc"));
		if (DIFF_OPTION == null) DIFF_OPTION = 0;
		
		const STR_S_TABLE_NAME = Foxtrickl10n.getString(
			"foxtrick.tweaks.twoweekbalance") + '&nbsp;(' + DIFF_OPTION_STR[DIFF_OPTION] + exclude_temp_desc+')';
		var cs= FoxtrickPrefs.getString("oldCurrencySymbol");//currencysymbol which in the your country
            
		/*var tableLast = doc.getElementsByTagName("table")[2];
		var tableCurr = doc.getElementsByTagName("table")[1];
                var path = "body/table[0]/tbody/tr[1]/td[2]";*/


        var mainBody = doc.getElementById( "mainBody" );
        var tables = mainBody.getElementsByTagName( "table" );
        var tableLast = tables[ 2 ];
        var tableCurr = tables[ 1 ];

       
		var mainbox = doc.getElementById('mainBoxTwoWeekBalance');
		if (mainbox==null) {
			mainbox=doc.createElement("div");
			mainbox.setAttribute("class","mainBox");
			mainbox.setAttribute("id","mainBoxTwoWeekBalance");
			tableCurr.parentNode.parentNode.appendChild(mainbox);
			var heading = doc.createElement("h2");
			var headingId = "foxtrick_eD_heading";
			heading.setAttribute("class","tblBox");
			
			heading.setAttribute("id",headingId);
			heading.innerHTML =  STR_S_TABLE_NAME;
						
			// add headerclick
			heading.setAttribute('title',Foxtrickl10n.getString("foxtrick.TwoWeekBalanceToogle"));
			var div = doc.createElement("div");
            div.appendChild(heading);
            div.setAttribute("style","cursor:pointer;");
            div.setAttribute("id", "div"+headingId);
            div.addEventListener( "click", this.HeaderClick, false );
            mainbox.appendChild(div);
		}
		else { // update header
			var heading=doc.getElementById('foxtrick_eD_heading');
			heading.innerHTML =  STR_S_TABLE_NAME;			
		}
		
		// get or copy table
		var newTabDiff = doc.getElementById('foxtrick_eD_newTabDiff');
		if (newTabDiff==null) {
			newTabDiff=tableCurr.cloneNode(true);
			//var newTabDiff = tableCurr.parentNode.parentNode.appendChild(
			//	tableCurr.cloneNode(true) );
			var newTabDiffId = "foxtrick_eD_newTabDiff";
			newTabDiff.setAttribute("id", newTabDiffId);
			newTabDiff.setAttribute("style", "margin-bottom: 10px");
			newTabDiff.setAttribute("class","indent");
			mainbox.appendChild(newTabDiff);
		}
		
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
			if (exclude_temp) econ_ted_temporary=0;
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
            if (exclude_temp) econ_ted_temporary=0;
            var econ_all = econ_ted_temporary+econ_ted_financial  + 
                econ_ted_sponsors+econ_ted_crowd;    
        }
		newTabDiff.rows[1].cells[1].innerHTML = '<span " ' + 
			this.getColorStyle(econ_ted_crowd) + '>'+ 
			Foxtrick.ReturnFormatedValue(econ_ted_crowd,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[2].cells[1].innerHTML = '<span " ' + 
			this.getColorStyle(econ_ted_sponsors) + '>' +
			Foxtrick.ReturnFormatedValue(econ_ted_sponsors,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[3].cells[1].innerHTML = '<span " ' + 
			this.getColorStyle(econ_ted_financial ) + '>' + 
            Foxtrick.ReturnFormatedValue(econ_ted_financial ,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[4].cells[1].innerHTML = '<span " ' + 
			this.getColorStyle(econ_ted_temporary) + '>' + 
			Foxtrick.ReturnFormatedValue(econ_ted_temporary,'&nbsp;') + '&nbsp;' +  cs+'</span>';
        newTabDiff.rows[8].cells[1].innerHTML = '<span " ' + 
			this.getColorStyle(econ_all) + '>' + 
			Foxtrick.ReturnFormatedValue(econ_all,'&nbsp;') + '&nbsp;' +  cs+'</span>'; 

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
			if (exclude_temp) diff_m=0;            
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
			if (exclude_temp) diff_m=0;            
            var diff_z = this.extractAmount(tableCurr.
                rows[5].cells[3])-this.extractAmount(
                tableLast.rows[5].cells[3]);
            var diff_j = this.extractAmount(tableCurr.
                rows[6].cells[3])-this.extractAmount(
                tableLast.rows[6].cells[3]);
            var diff_all = diff_arena+diff_wages+diff_u+diff_m+diff_z+diff_j;
        }

		newTabDiff.rows[1].cells[3].innerHTML = '<span " ' + 
			this.getColorStyle(-diff_arena) + '>' + 
			Foxtrick.ReturnFormatedValue(diff_arena,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[2].cells[3].innerHTML = '<span " ' + 
			this.getColorStyle(-diff_wages) + '>' + 
			Foxtrick.ReturnFormatedValue(diff_wages,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[3].cells[3].innerHTML = '<span " ' + 
			this.getColorStyle(-diff_u) + '>' + 
			Foxtrick.ReturnFormatedValue(diff_u,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[4].cells[3].innerHTML = '<span " ' + 
			this.getColorStyle(-diff_m) + '>' + 
			Foxtrick.ReturnFormatedValue(diff_m,'&nbsp;') + '&nbsp;' +  cs+'</span>';
		newTabDiff.rows[5].cells[3].innerHTML = '<span " ' + 
			this.getColorStyle(-diff_z) + '>' + 
			Foxtrick.ReturnFormatedValue(diff_z,'&nbsp;') + '&nbsp;' +  cs+'</span>';            
		newTabDiff.rows[6].cells[3].innerHTML = '<span " ' + 
			this.getColorStyle(-diff_j) + '>' + 
			Foxtrick.ReturnFormatedValue(diff_j,'&nbsp;') + '&nbsp;' +  cs+'</span>';            
		newTabDiff.rows[8].cells[3].innerHTML = '<span " ' + 
			this.getColorStyle(-diff_all) + '>' + 
			Foxtrick.ReturnFormatedValue(diff_all,'&nbsp;') + '&nbsp;' +  cs+'</span>';            

		var twoWeekBalance = econ_all - diff_all;

		newTabDiff.rows[10].cells[1].innerHTML = '<span " ' + 
			this.getColorStyle(twoWeekBalance) + '>' + 
			Foxtrick.ReturnFormatedValue(twoWeekBalance,'&nbsp;') + '&nbsp;' +  cs+'</span>';            						
			
	},
	
	change : function( page, doc ) {
	
	},
    
    extractAmount : function( cell ) {
        return parseInt(cell.textContent.replace(/\s*/g, ""));
    },
    
    getColorStyle : function( val ) {
        if (val < 0) {
            return 'style="direction:ltr !important; color: #aa0000;font-weight: bold;"';
        } else if (val > 0) {
            return 'style="direction:ltr !important; color: #377f31;font-weight: bold;"';
        }
        return 'style="direction:ltr !important;"';
    } ,  

	HeaderClick : function(evt) {
		try { 
			var doc = evt.target.ownerDocument;
			FoxtrickPrefs.setInt("module." + FoxtrickEconomyDifference.MODULE_NAME + ".value", FoxtrickPrefs.getInt("module." + FoxtrickEconomyDifference.MODULE_NAME + ".value")+1);
			if (FoxtrickPrefs.getInt("module." + FoxtrickEconomyDifference.MODULE_NAME + ".value")==FoxtrickEconomyDifference.RADIO_OPTIONS.length) 
				FoxtrickPrefs.setInt("module." + FoxtrickEconomyDifference.MODULE_NAME + ".value",0);
			
			//doc.location.reload();
			FoxtrickEconomyDifference.run("",doc);
		} 
		catch (e) {Foxtrick.dump("SelectBox->HeaderClick: "+e+'\n');}
	},
	
};
