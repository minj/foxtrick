/**
 * linksleague.js
 * Foxtrick add links to country pages
 * @author convinced
 */

 //---------------------------------------------------------------------------    
function findCountryId(element) {
  var links = element.getElementsByTagName('a');
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/League\.aspx/i) ) {
      return links[i].href.replace(/.+leagueid=/i, "").match(/^\d+/)[0];
    }
  }
  
  return null;
}

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksCountry = {
	
    MODULE_NAME : "LinksCountry",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

    init : function() {
            Foxtrick.registerPageHandler( 'country',
                                          FoxtrickLinksCountry );
			Foxtrick.initOptionsLinks(this,"countrylink");
    },

    run : function( page, doc ) {

		//addExternalLinksToCountryDetail
        var countryid;
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
					var thisdiv = alldivs[j];
					countryid = findCountryId(thisdiv);
					}
			}
			
        var links = getLinks("countrylink", { "countryid": countryid }, doc, this);  
        
		if (links.length > 0) {
			var ownBoxBody = doc.createElement("div");
                               
			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(links[k].link);
			}
						
			Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
				"foxtrick.links.boxheader" ), ownBoxBody, "first");
		}
		
            
    }	
 
};