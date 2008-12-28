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
	OPTIONS : {}, 	

    init : function() {
            Foxtrick.registerPageHandler( 'youthoverview',
                                          FoxtrickLinksYouthOverview );
			Foxtrick.initOptionsLinks(this,"youthlink");	
	    },

    run : function( page, doc ) {
		//addExternalLinksToYouthOverview
        var links = getLinks("youthlink", { }, doc,this);  
		if (links.length > 0) {
			var ownBoxBody = doc.createElement("div");
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
    },
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_" + header + "_box";
		if( !doc.getElementById ( ownBoxId ) ) {
			this.run( page, doc );
		}
	},
};