/**
 * matchincome.js
 * Foxtrick add links to played matches pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickMatchIncome = {
    MODULE_NAME : "MatchIncome",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match'),

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
				var tbody = table.getElementsByTagName('tbody')[0];
				var sum=Foxtrick.trimnum(table.rows[0].cells[1].textContent)*6.5
					+ Foxtrick.trimnum(table.rows[1].cells[1].textContent)*9.5
					+ Foxtrick.trimnum(table.rows[2].cells[1].textContent)*18
					+ Foxtrick.trimnum(table.rows[3].cells[1].textContent)*32.5;

				sum/=parseFloat(Foxtrick.util.currency.getRate());

				var tr2 = doc.createElement('tr');
				var td2a = doc.createElement('td');
				var td2b = doc.createElement('td');
				tbody.appendChild(tr2);
				tr2.appendChild(td2a);
				tr2.appendChild(td2b);
                td2a.id = 'ft_matchincome';
                td2a.className = "ch";
                td2a.textContent = Foxtrickl10n.getString('foxtrick.matches.income');
                td2b.className = "nowrap";
				td2b.textContent = Foxtrick.formatNumber(Math.floor(sum), ' ')+' '+Foxtrick.util.currency.getSymbol();
			}
        }
    }
};
