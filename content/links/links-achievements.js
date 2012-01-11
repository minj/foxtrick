"use strict";
/**
 * links-achievements.js
 * Foxtrick add links to manager pages
 * @author convinced
 */

Foxtrick.modules["LinksAchievements"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('achievements'),

	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksAchievements", "achievementslink");
	},

	run : function(doc) {

		//addExternalLinksToManagerPage
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();

		var ownBoxBody = null;
		var mainBody = doc.getElementById('mainWrapper');

		var teamid = Foxtrick.util.id.findTeamId(mainBody);
		var teamname = Foxtrick.util.id.extractTeamName(mainBody);
		var userid = Foxtrick.util.id.findUserId(mainBody);

		var links = Foxtrick.util.module.get("Links").getLinks("achievementslink", { "teamid": teamid, "teamname": teamname, "userid" : userid,"owncountryid":owncountryid }, doc, this);
		if (links.length > 0){
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, "div");
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
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{ "teamid": teamid, "teamname": teamname, "userid" : userid });
	}
};
