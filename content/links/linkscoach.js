/**
 * linksleague.js
 * Foxtrick add links to coach pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksCoach = {
	
    MODULE_NAME : "LinksCoach",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

    init : function() {
            Foxtrick.registerPageHandler( 'coach',
                                          FoxtrickLinksCoach );
			Foxtrick.initOptionsLinks(this,"coachlink");
    },

    run : function( page, doc ) {

		//addExternalLinksToCoachPage
		var links = getLinks("coachlink", {  }, doc, this);  
                  
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
	
	}
 
};