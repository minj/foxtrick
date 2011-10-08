"use strict";
/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "LinksChallenges",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('challenges','youthchallenges'),
	LINK_TYPES : [ "challengeslink", "youthchallengeslink" ],
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.links.getOptionsHtml(doc, this, true, this.LINK_TYPES);
	},

	run : function(doc) {
		var teamid = Foxtrick.util.id.findTeamId(doc.getElementsByClassName("subMenu")[0] );
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementById('mainWrapper'));
		var ownteamid = Foxtrick.util.id.getOwnLeagueId();

		//addExternalLinksToChallengesDetail
		var links;
		if (Foxtrick.isPage("challenges", doc))
			links = Foxtrick.util.module.get("Links").getLinks("challengeslink", {'teamid':teamid, 'ownteamid':ownteamid}, doc, this);
		else
			links = Foxtrick.util.module.get("Links").getLinks("youthchallengeslink", {'teamid':teamid, 'youthteamid':youthteamid,'ownteamid':ownteamid}, doc, this);
		var ownBoxBody=null;

		if (links.length > 0) {
			ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}

			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = "ft-links-box";
		}
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME,{});
	}
});
