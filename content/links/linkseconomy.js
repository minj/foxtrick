/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksEconomy = {
	
    MODULE_NAME : "LinksEconomy",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('economy'), 
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

    init : function() {
			Foxtrick.initOptionsLinks(this,"economylink");
    },

    run : function( page, doc ) {
		var teamdiv = doc.getElementById('teamLinks');
		var owncountryid =FoxtrickHelper.findCountryId(teamdiv);
		
		//addExternalLinksToEconomyDetail
		var Cash=0;
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
	          var CashTable = alldivs[j].getElementsByTagName("table")[0];
				var content=CashTable.rows[0].cells[1].innerHTML;
				var tmp = doc.createElement("span");
				tmp.innerHTML=FoxtrickPrefs.getString("oldCurrencySymbol");
        		var last1=content.indexOf(tmp.innerHTML);
				Cash=Foxtrick.trimnum(content.substring(0,last1));
        		break;
			}
		}
		var CurrCode=FoxtrickPrefs.getString("currencyCode")
		/*if (CurrCode!="EUR" && CurrCode!="CHF"){
			Cash*=FoxtrickPrefs.getString("currencyRate");
			CurrCode="EUR";
		}*/
		var links = Foxtrick.LinkCollection.getLinks("economylink", { "Cash":Cash,"Currency":CurrCode,"owncountryid":owncountryid}, doc, this);  
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
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(links[k].link);
			}
						
			Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
		}
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{ "Cash":Cash,"Currency":CurrCode} );					
    },
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_links_content";
		if( !doc.getElementById ( ownBoxId ) ) {
			this.run( page, doc );
		}
	},
};