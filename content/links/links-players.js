/**
 * links-players.js
 * Foxtrick add links to manager pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksPlayers = {
	MODULE_NAME : "LinksPlayers",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('players'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "playerslink");
	},

	run : function( page, doc ) {
		//addExternalLinksToManagerPage
		var ownBoxBody = null;
		var mainWrapper = doc.getElementById('mainWrapper');

		var teamid = FoxtrickHelper.findTeamId(mainWrapper);
		var teamname = FoxtrickHelper.extractTeamName(mainWrapper);
		var playerids='';
		var players = mainWrapper.getElementsByTagName('a');
		var i=0,player;
		while (player=players[i++]) {
			if (player.href.search(/BrowseIds/i)!=-1) {
				playerids += player.href.replace(/.+BrowseIds=/i,'');
				break;
			}
		}

		var links = Foxtrick.LinkCollection.getLinks("playerslink", { "teamid": teamid, "teamname": teamname, "playerids" : playerids }, doc, this);
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
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME ,{ "teamid": teamid, "teamname": teamname, "playerids" : playerids });
	}
};
