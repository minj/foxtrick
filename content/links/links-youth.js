"use strict";
/**
 * linksyouthoverview.js
 * Foxtrick add links to youth overview pages
 * @author convinced
 */

Foxtrick.modules["LinksYouthOverview"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('youthoverview'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksYouthOverview", "youthlink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		if (boxleft==null) {return;}
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementsByClassName("main")[0]);
		var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';


		//addExternalLinksToYouthOverview
		var ownBoxBody=null;
		var links = Foxtrick.util.module.get("Links").getLinks("youthlink", { "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "owncountryid": owncountryid, 'server':server  }, doc,this);
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, "div");
			var header = Foxtrickl10n.getString(
						"links.boxheader" );
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = "ft-links-box";
		}
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	}
};


Foxtrick.modules["LinksYouthPlayerDetail"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('youthplayerdetail'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksYouthPlayerDetail", "youthplayerdetaillink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		if (boxleft==null) {return;}
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}

		var main = doc.getElementsByClassName("main")[0]; 
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(main);
		var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';

		var thisdiv = main.getElementsByTagName("div")[0];
		var nationality = Foxtrick.util.id.findLeagueId(thisdiv);
		var playerid = Foxtrick.util.id.findPlayerId(thisdiv);
		var playername=thisdiv.getElementsByTagName("a")[1].textContent;
		var age = null;
		var age_days;

		// age
		var divs= thisdiv.getElementsByTagName('div');
		for (var j=0; j < divs.length; j++) {
			if ( divs[j].className=="byline" ) {
				age = divs[j].textContent.match(/\d+/)[0];
				age_days = divs[j].textContent.match(/(\d+)/g)[1];
				break;
			}
		}

		//addExternalLinksToYouthdetail
		var ownBoxBody=null;
		var links = Foxtrick.util.module.get("Links").getLinks("youthplayerdetaillink", { "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "playerid" : playerid, "age" : age, "age_days":age_days, "owncountryid": owncountryid, 'server':server }, doc,this);
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, "div");
			var header = Foxtrickl10n.getString(
						"links.boxheader" );
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = "ft-links-box";
		}
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	}
};


Foxtrick.modules["LinksYouthTraining"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('YouthTraining'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksYouthTraining", "youthtraininglink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		var ownteamid=0;
		var owncountryid=0;
		if (boxleft==null) {return;}
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementsByClassName("main")[0]);
		var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';

		//addExternalLinksToYouthOverview
		var ownBoxBody=null;
		var links = Foxtrick.util.module.get("Links").getLinks("youthtraininglink", { "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "owncountryid": owncountryid, 'server':server  }, doc,this);
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, "div");
			var header = Foxtrickl10n.getString("links.boxheader");
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = "ft-links-box";
		}
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	},

};


Foxtrick.modules["LinksYouthPlayerList"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('YouthPlayers'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksYouthPlayerList", "youthplayerlistlink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		var ownteamid=0;
		var owncountryid=0;
		if (boxleft==null) {return;}
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementsByClassName("main")[0]);
		var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';


		//addExternalLinksToYouthOverview
		var ownBoxBody=null;
		var links = Foxtrick.util.module.get("Links").getLinks("youthplayerlistlink", {  "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "owncountryid": owncountryid, 'server':server  }, doc,this);
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, "div");
			var header = Foxtrickl10n.getString(
						"links.boxheader" );
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = "ft-links-box";
		}
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	}
};


Foxtrick.modules["LinksYouthMatchList"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('YouthMatchlist'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksYouthMatchList", "youthmatchlistlink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		var ownteamid=0;
		var owncountryid=0;
		if (boxleft==null) {return;}
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementsByClassName("main")[0]);
		var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';


		//addExternalLinksToYouthOverview
		var ownBoxBody=null;
		var links = Foxtrick.util.module.get("Links").getLinks("youthmatchlistlink", { "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "owncountryid": owncountryid, 'server':server  }, doc,this);
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, "div");
			var header = Foxtrickl10n.getString(
						"links.boxheader" );
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = "ft-links-box";
		}
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	}
};


Foxtrick.modules["LinksYouthLeague"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('youthSeries'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksYouthLeague", "youthleaguelink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		var ownteamid=0;
		var owncountryid=0;
		if (boxleft==null) {return;}
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementsByClassName("main")[0]);
        var youthleagueid = Foxtrick.util.id.findYouthLeagueId(doc.getElementsByClassName("main")[0]);

		//addExternalLinksToYouthLeague
		var ownBoxBody=null;
		var links = Foxtrick.util.module.get("Links").getLinks("youthleaguelink", { "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "owncountryid": owncountryid, 'youthleagueid':youthleagueid }, doc,this);
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, "div");
			var header = Foxtrickl10n.getString(
						"links.boxheader" );
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = "ft-links-box";
		}
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	}
};
