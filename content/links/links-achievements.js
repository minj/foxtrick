/**
 * links-achievements.js
 * Foxtrick add links to manager pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksAchievements = {

	MODULE_NAME : "LinksAchievements",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('achievements'),

	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "achievementslink");
	},

	run : function(doc) {

		//addExternalLinksToManagerPage
		var owncountryid = Foxtrick.util.id.getOwnCountryId();

		var ownBoxBody = null;
		var mainBody = doc.getElementById('mainWrapper');

		var teamid = Foxtrick.util.id.findTeamId(mainBody);
		var teamname = Foxtrick.util.id.extractTeamName(mainBody);
		var userid = Foxtrick.util.id.findUserId(mainBody);

		var links = Foxtrick.LinkCollection.getLinks("achievementslink", { "teamid": teamid, "teamname": teamname, "userid" : userid,"owncountryid":owncountryid }, doc, this);
		if (links.length > 0){
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
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{ "teamid": teamid, "teamname": teamname, "userid" : userid });
	}
};
Foxtrick.util.module.register(FoxtrickLinksAchievements);
