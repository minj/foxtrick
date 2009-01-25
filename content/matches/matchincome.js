/**
 * matchincome.js
 * Foxtrick add links to played matches pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickMatchIncome = {
	
    MODULE_NAME : "MatchIncome",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'match',
                                          FoxtrickMatchIncome);
	},

    run : function( page, doc ) {

		var youthmatch = FoxtrickHelper.findIsYouthMatch(doc.location.href);
		
		var isarchivedmatch=doc.location.href.search(/useArchive=true/i)!=-1;
		var ownBoxBody=null;
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="sidebarBox" 
			&& alldivs[j].getElementsByTagName('h2')[0].innerHTML.search(Foxtrickl10n.getString('foxtrick.matches.soldseats'))!=-1 ) {
				var table=alldivs[j].getElementsByTagName('table')[0];
				var sum=Foxtrick.trimnum(table.rows[0].cells[1].textContent)*6.5
					+ Foxtrick.trimnum(table.rows[1].cells[1].textContent)*9.5
					+ Foxtrick.trimnum(table.rows[2].cells[1].textContent)*18
					+ Foxtrick.trimnum(table.rows[3].cells[1].textContent)*33;
					
				sum/=FoxtrickPrefs.getString("currencyRate");
									
				var tr2 = doc.createElement('tr');
				var td2a = doc.createElement('td');
				var td2b = doc.createElement('td');
				table.appendChild(tr2);
				tr2.appendChild(td2a);
				tr2.appendChild(td2b);
				td2a.innerHTML=Foxtrickl10n.getString('foxtrick.matches.income');
				td2a.setAttribute('class','ch');
				td2b.innerHTML=Math.floor(sum)+' '+FoxtrickPrefs.getString("oldCurrencySymbol");
			}
        }    
    },
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_" + header + "_content";
		if( !doc.getElementById ( ownBoxId ) ) {
			this.run( page, doc );
		}
	},
};
