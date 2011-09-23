/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "LinksEconomy",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('finances'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.links.getOptionsHtml(doc, this, false, "economylink");
	},

	run : function(doc) {
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();

		// only on current finances
		var links = doc.getElementById('mainBody').getElementsByTagName('a');
		if (links[0] && links[0].href.search('season')!=-1) return;

		//addExternalLinksToEconomyDetail
		var Cash=0, newCash=1;
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
			  var CashTable = alldivs[j].getElementsByTagName("table")[0];
				var nums=CashTable.rows[0].cells[1].innerHTML.replace(/&nbsp;/g,'').match(/\d+/g);
				Cash=nums[0];
				newCash=nums[1];
				//Foxtrick.dump(Cash + ' - ' + newCash + '\n');
				break;
			}
		}
		var currencySymbol = Foxtrick.util.currency.getSymbol();
		var links = Foxtrick.util.module.get("Links").getLinks("economylink", { "Cash":Cash,"newCash":newCash,"Currency":currencySymbol,"owncountryid":owncountryid}, doc, this);
		var ownBoxBody=null
		if (links.length > 0) {
			ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}

			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = "ft-links-box";
		}
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME,{ "Cash":Cash,"Currency":currencySymbol,"newCash":newCash});
	}
});
