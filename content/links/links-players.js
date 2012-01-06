"use strict";
/**
 * links-players.js
 * Foxtrick add links to manager pages
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "LinksPlayers",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('players'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksPlayers", "playerslink");
	},

	run : function(doc) {
		var ownBoxBody = null;
		var mainWrapper = doc.getElementById('mainWrapper');

		var teamid = Foxtrick.util.id.findTeamId(mainWrapper);
		var teamname = Foxtrick.util.id.extractTeamName(mainWrapper);
		var playerids='';
		var players = mainWrapper.getElementsByTagName('a');
		var i=0,player;
		while (player=players[i++]) {
			if (player.href.search(/BrowseIds/i)!=-1) {
				playerids += player.href.replace(/.+BrowseIds=/i,'');
				break;
			}
		}

		var links = Foxtrick.util.module.get("Links").getLinks("playerslink", { "teamid": teamid, "teamname": teamname, "playerids" : playerids }, doc, this);
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
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{ "teamid": teamid, "teamname": teamname, "playerids" : playerids });
	}
});
