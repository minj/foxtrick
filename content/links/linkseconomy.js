/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksEconomy = {

    MODULE_NAME : "LinksEconomy",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('finances'),
	DEFAULT_ENABLED : true,
	OPTIONS : {},

    init : function() {
			Foxtrick.initOptionsLinks(this,"economylink");
    },

    run : function( page, doc ) {
		var owncountryid = FoxtrickHelper.getOwnCountryId();

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
		var CurrCode=FoxtrickPrefs.getString("currencyCode")
		/*if (CurrCode!="EUR" && CurrCode!="CHF"){
			Cash*=FoxtrickPrefs.getString("currencyRate");
			CurrCode="EUR";
		}*/
		var links = Foxtrick.LinkCollection.getLinks("economylink", { "Cash":Cash,"newCash":newCash,"Currency":CurrCode,"owncountryid":owncountryid}, doc, this);
		var ownBoxBody=null
		if (links.length > 0) {
			ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
			var ownBoxId = "foxtrick_links_box";
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}

			Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
		}
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{ "Cash":Cash,"Currency":CurrCode,"newCash":newCash} );
    },

};
