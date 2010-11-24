/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksChallenges = {
    MODULE_NAME : "LinksChallenges",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('challenges','youthchallenges'),
	OPTIONS : {},

	init : function() {
		var linktypes = new Array("challengeslink","youthchallengeslink");
		Foxtrick.initOptionsLinksArray(this,linktypes);
    },

    run : function( page, doc ) {
		var teamid = FoxtrickHelper.findTeamId(doc.getElementById('ctl00_pnlSubMenu') );
		var youthteamid = FoxtrickHelper.findYouthTeamId(doc.getElementById('mainWrapper'));
		var ownteamid = FoxtrickHelper.getOwnCountryId();

		//addExternalLinksToChallengesDetail
        var links;
		if (page=='challenges') links = Foxtrick.LinkCollection.getLinks("challengeslink", {'teamid':teamid, 'ownteamid':ownteamid}, doc, this);
		else links = Foxtrick.LinkCollection.getLinks("youthchallengeslink", {'teamid':teamid, 'youthteamid':youthteamid,'ownteamid':ownteamid}, doc, this);
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
				ownBoxBody.appendChild(links[k].link);
			}

			Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
		}
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{} );
    }
};
