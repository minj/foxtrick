"use strict";
/**
 * links-match.js
 * Foxtrick add links to played matches pages
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "LinksMatch",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('match'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksMatch",
			["playedmatchlink", "playedyouthmatchlink", "nextmatchlink", "matchlink"]);
	},

	run : function(doc) {
		// get ids
		var youthmatch = Foxtrick.util.id.findIsYouthMatch(doc.location.href);
		var teamid,teamid2;

		var alldivs = doc.getElementsByTagName('div');
		var matchid = Foxtrick.util.id.getMatchIdFromUrl(doc.location.href);
		var isarchivedmatch = (doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlPreMatch")==null);
		//Foxtrick.dump('isarchivedmatch:'+isarchivedmatch+'\n');
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementById('mainWrapper'));
		var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';
		var ownyouthteamid = Foxtrick.util.id.getOwnYouthTeamId();

		if (isarchivedmatch) {
			var sidediv = doc.getElementById("sidebar");
			teamid = Foxtrick.util.id.findTeamId(sidediv);
			teamid2 = Foxtrick.util.id.findSecondTeamId(sidediv,teamid);
		}
		else {
			var sidediv = doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlTeamInfo");
			if (!sidediv) sidediv = doc.getElementById("sidebar");
			teamid = Foxtrick.util.id.findTeamId(sidediv);
			teamid2 = Foxtrick.util.id.findSecondTeamId(sidediv,teamid);
		}
		var links,links2;
		var add_links=false;
		//addExternalLinksToPlayedMatch
		if (isarchivedmatch) {
			if (youthmatch) {links = Foxtrick.util.module.get("Links").getLinks("playedyouthmatchlink", { "ownyouthteamid":ownyouthteamid, "matchid": matchid, "teamid" : teamid,"teamid2":teamid2, 'server':server}, doc, this); }
			else {links = Foxtrick.util.module.get("Links").getLinks("playedmatchlink", { "matchid": matchid, "teamid" : teamid,"teamid2":teamid2  }, doc, this); }
			if (links.length>0) add_links = true;
		}
		//addExternalLinksToCommingMatch
		if (!isarchivedmatch && !youthmatch) {
			links = Foxtrick.util.module.get("Links").getLinks("nextmatchlink", { "matchid": matchid, "teamid" : teamid ,"teamid2":teamid2  }, doc,this);
			links2 = Foxtrick.util.module.get("Links").getLinks("matchlink", { "matchid": matchid, "teamid" : teamid,"teamid2":teamid2  }, doc,this);
			if (links.length+links2.length>0) add_links = true;
 		}
 		// add links box
		var ownBoxBody=null;
		if (add_links) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, "div");
			var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}
			if (links2) {
				for (var k = 0; k < links2.length; k++) {
					links2[k].link.className ="inner";
					ownBoxBody.appendChild(links2[k].link);
				}
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = "ft-links-box";
		}

		// add custom links
		if (isarchivedmatch) {
			var prefset=this.MODULE_NAME+".played";
			if (youthmatch) {prefset=this.MODULE_NAME+".youth.played";}
			Foxtrick.util.links.add(doc,ownBoxBody,prefset,{ "matchid": matchid, "teamid" : teamid,"teamid2":teamid2  });
		}
		if (!isarchivedmatch && !youthmatch) {
			Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME+".coming" ,{ "matchid": matchid, "teamid" : teamid,"teamid2":teamid2  });
		}
	}
});
