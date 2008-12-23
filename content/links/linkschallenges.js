/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksChallenges = {
	
    MODULE_NAME : "LinksChallenges",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

	init : function() {
            Foxtrick.registerPageHandler( 'challenges',
                                          FoxtrickLinksChallenges );
			Foxtrick.initOptionsLinks(this,"challengeslink");
    },

    run : function( page, doc ) {

		//addExternalLinksToChallengesDetail
        var links = getLinks("challengeslink", {  }, doc, this);  

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