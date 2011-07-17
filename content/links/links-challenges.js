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
	LINK_TYPES : [ "challengeslink", "youthchallengeslink" ],
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, true, this.LINK_TYPES);
	},

	run : function(doc) {
		var teamid = FoxtrickHelper.findTeamId(doc.getElementsByClassName("subMenu")[0] );
		var youthteamid = FoxtrickHelper.findYouthTeamId(doc.getElementById('mainWrapper'));
		var ownteamid = FoxtrickHelper.getOwnCountryId();

		//addExternalLinksToChallengesDetail
		var links;
		if (Foxtrick.isPage("challenges", doc))
			links = Foxtrick.LinkCollection.getLinks("challengeslink", {'teamid':teamid, 'ownteamid':ownteamid}, doc, this);
		else
			links = Foxtrick.LinkCollection.getLinks("youthchallengeslink", {'teamid':teamid, 'youthteamid':youthteamid,'ownteamid':ownteamid}, doc, this);
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
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME,{});
	}
};
