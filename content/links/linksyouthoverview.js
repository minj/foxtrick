/**
 * linksyouthoverview.js
 * Foxtrick add links to youth overview pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksYouthOverview = {
	
    MODULE_NAME : "LinksYouthOverview",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,


    init : function() {
            Foxtrick.registerPageHandler( 'youthoverview',
                                          FoxtrickLinksYouthOverview );
    },

    run : function( page, doc ) {

		if (Foxtrick.SidebarExist (doc,Foxtrickl10n.getString("foxtrick.links.boxheader" ))) {return;}

		//addExternalLinksToYouthOverview
        var links = getLinks("youthlink", { }, doc );  
		if (links.length > 0) {
			var ownBoxBody = doc.createElement("div");
                                
			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(links[k].link);
			}
		}
		Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
			"foxtrick.links.boxheader" ), ownBoxBody, "first");		
    }	
 
};