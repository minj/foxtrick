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
        var ft_match = doc.getElementById ('ft_matchincome');
        if (ft_match != null) return;
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
					+ Foxtrick.trimnum(table.rows[3].cells[1].textContent)*32.5;
					
				sum/=FoxtrickPrefs.getString("currencyRate");
									
				var tr2 = doc.createElement('tr');
				var td2a = doc.createElement('td');
				var td2b = doc.createElement('td');
				table.appendChild(tr2);
				tr2.appendChild(td2a);
				tr2.appendChild(td2b);
				td2a.innerHTML=Foxtrickl10n.getString('foxtrick.matches.income');
				td2a.setAttribute('class','ch');
                td2a.id = 'ft_matchincome';
				td2b.innerHTML=Foxtrick.ReturnFormatedValue (Math.floor(sum), '&nbsp;')+'&nbsp;'+FoxtrickPrefs.getString("oldCurrencySymbol");
			}
        }    
    },
	
	change : function( page, doc ) {
	},
};
