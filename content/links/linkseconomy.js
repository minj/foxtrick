/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////

function GetCurrency()
{
  var currency = "";
  var rate = 1.0;
  try {
    var currencyCode = PrefsBranch.getCharPref("htCurrency");
  } catch (e) {
    currencyCode = "EUR";
  }

  try {
    var path = "hattrickcurrencies/currency[@code='" + currencyCode + "']";
    var obj = htCurrenciesXml.evaluate(path,htCurrenciesXml,null,htCurrenciesXml.DOCUMENT_NODE,null).singleNodeValue;
    currency = obj.attributes.getNamedItem("shortname").textContent;
    rate = 1.0/parseFloat(obj.attributes.getNamedItem("eurorate").textContent);
  } catch (e) {
    currency = "&euro;";
    rate = 1.0;
  } 
 return {"currencyCode":currencyCode,"Currency":currency,"eurorate":rate};
 }


var FoxtrickLinksEconomy = {
	
    MODULE_NAME : "LinksEconomy",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

    init : function() {
            Foxtrick.registerPageHandler( 'economy',
                                          FoxtrickLinksEconomy );
			Foxtrick.initOptionsLinks(this,"economylink");
    },

    run : function( page, doc ) {
		var teamdiv = doc.getElementById('teamLinks');
		var owncountryid =FoxtrickHelper.findCountryId(teamdiv);
		
		//addExternalLinksToEconomyDetail
		var Curr=GetCurrency();
		var Cash=0;
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
	          var CashTable = alldivs[j].getElementsByTagName("table")[0];
				var content=CashTable.rows[0].cells[1].innerHTML;
				var tmp = doc.createElement("span");
				tmp.innerHTML=Curr["Currency"];
        		var last1=content.indexOf(tmp.innerHTML);
				Cash=Foxtrick.trimnum(content.substring(0,last1));
        		break;
			}
		}
		if (Curr["currencyCode"]!="EUR" && Curr["currencyCode"]!="CHF"){
			Cash*=Curr["eurorate"];
			Curr["currencyCode"]="EUR";
		}
		var links = getLinks("economylink", { "Cash":Cash,"Currency":Curr["currencyCode"],"owncountryid":owncountryid}, doc, this);  
		var ownBoxBody=null
		if (links.length > 0) {
			ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
			var ownBoxId = "foxtrick_" + header + "_box";
			var ownBoxBodyId = "foxtrick_" + header + "_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );
                                
			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(links[k].link);
			}
						
			Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
		}
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{ "Cash":Cash,"Currency":Curr["currencyCode"]} );					
    },
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_" + header + "_content";
		if( !doc.getElementById ( ownBoxId ) ) {
			this.run( page, doc );
		}
	},
};