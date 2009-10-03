/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksChallenges = {
	
    MODULE_NAME : "LinksChallenges",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('challenges'), 
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

	init : function() {
			Foxtrick.initOptionsLinks(this,"challengeslink");
    },

    run : function( page, doc ) {

			var alldivs = doc.getElementsByTagName('div');
			for (var j = 0; j < alldivs.length; j++) {
				if (alldivs[j].className=="main mainRegular") {
					var teaminfo = this.gatherLinks( alldivs[j], doc ); 
        }
      }
		//addExternalLinksToChallengesDetail
        var links = Foxtrick.LinkCollection.getLinks("challengeslink", teaminfo, doc, this);  
		var ownBoxBody=null;

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
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{} );            
    },
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_links_content";
		if( !doc.getElementById ( ownBoxId ) ) {
			this.run( page, doc );
		}
	},
	
		gatherLinks : function( thisdiv, doc ) {
	try{
  		var teamid = FoxtrickHelper.findTeamId(thisdiv);
		return { "teamid": teamid};
	} catch(e){ dump ('LinksTeam->gatherLinks: '+e+'\n');}
  }
};