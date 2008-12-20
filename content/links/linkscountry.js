/**
 * linksleague.js
 * Foxtrick add links to country pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksCountry = {
	
    MODULE_NAME : "LinksCountry",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,


    init : function() {
            Foxtrick.registerPageHandler( 'country',
                                          FoxtrickLinksCountry );
    },

    run : function( page, doc ) {

		//addExternalLinksToCountryDetail
        var countryid = doc.location.href.replace(/.+leagueID=/i, "").match(/^\d+/)[0];
        
        var links = getLinks("countrylink", { "countryid": countryid }, doc );  
        
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