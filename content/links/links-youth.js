/**
 * linksyouthoverview.js
 * Foxtrick add links to youth overview pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksYouthOverview = {
	MODULE_NAME : "LinksYouthOverview",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('youthoverview'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "youthlink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		if (boxleft==null) {return;}
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnCountryId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementById('mainWrapper'));
		var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';


		//addExternalLinksToYouthOverview
		var ownBoxBody=null;
		var links = Foxtrick.LinkCollection.getLinks("youthlink", { "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "owncountryid": owncountryid, 'server':server  }, doc,this);
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
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	}
};
Foxtrick.util.module.register(FoxtrickLinksYouthOverview);

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksYouthPlayerDetail = {

	MODULE_NAME : "LinksYouthPlayerDetail",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('youthplayerdetail'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "youthplayerdetaillink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		if (boxleft==null) {return;}
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnCountryId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementById('mainWrapper'));
		var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';

		var alldivs = doc.getElementById('mainWrapper').getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var thisdiv = alldivs[j];
				var nationality = Foxtrick.util.id.findCountryId(thisdiv);
				var playerid = Foxtrick.util.id.findPlayerId(thisdiv);
				var playername=thisdiv.getElementsByTagName("a")[1].innerHTML;;
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
				break;
			}
		}

		//addExternalLinksToYouthdetail
		var ownBoxBody=null;
		var links = Foxtrick.LinkCollection.getLinks("youthplayerdetaillink", { "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "playerid" : playerid, "age" : age, "age_days":age_days, "owncountryid": owncountryid, 'server':server }, doc,this);
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
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	}
};
Foxtrick.util.module.register(FoxtrickLinksYouthPlayerDetail);

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksYouthTraining = {

	MODULE_NAME : "LinksYouthTraining",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('YouthTraining'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "youthtraininglink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		var ownteamid=0;
		var owncountryid=0;
		if (boxleft==null) {return;}
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnCountryId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementById('mainWrapper'));
		var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';

		//addExternalLinksToYouthOverview
		var ownBoxBody=null;
		var links = Foxtrick.LinkCollection.getLinks("youthtraininglink", { "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "owncountryid": owncountryid, 'server':server  }, doc,this);
		if (links.length > 0) {
			ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString("foxtrick.links.boxheader");
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
Foxtrick.util.module.register(FoxtrickLinksYouthTraining);

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksYouthPlayerList = {
	MODULE_NAME : "LinksYouthPlayerList",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('YouthPlayers'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "youthplayerlistlink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		var ownteamid=0;
		var owncountryid=0;
		if (boxleft==null) {return;}
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnCountryId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementById('mainWrapper'));
		var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';


		//addExternalLinksToYouthOverview
		var ownBoxBody=null;
		var links = Foxtrick.LinkCollection.getLinks("youthplayerlistlink", {  "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "owncountryid": owncountryid, 'server':server  }, doc,this);
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
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	}
};
Foxtrick.util.module.register(FoxtrickLinksYouthPlayerList);

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksYouthMatchList = {
	MODULE_NAME : "LinksYouthMatchList",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('YouthMatchlist'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "youthmatchlistlink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		var ownteamid=0;
		var owncountryid=0;
		if (boxleft==null) {return;}
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnCountryId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementById('mainWrapper'));
		var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';


		//addExternalLinksToYouthOverview
		var ownBoxBody=null;
		var links = Foxtrick.LinkCollection.getLinks("youthmatchlistlink", { "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "owncountryid": owncountryid, 'server':server  }, doc,this);
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
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	}
};
Foxtrick.util.module.register(FoxtrickLinksYouthMatchList);

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksYouthLeague = {
	MODULE_NAME : "LinksYouthLeague",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('youthleague'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "youthleaguelink");
	},

	run : function(doc) {
		var boxleft=doc.getElementsByClassName("subMenu")[0];
		var ownteamid=0;
		var owncountryid=0;
		if (boxleft==null) {return;}       
		var teamid=Foxtrick.util.id.findTeamId(boxleft);
		if (teamid=="") {return;}
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnCountryId();
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementById('mainWrapper'));
        var youthleagueid = Foxtrick.util.id.findYouthLeagueId(doc.getElementById('mainWrapper'));

		//addExternalLinksToYouthLeague
		var ownBoxBody=null;
		var links = Foxtrick.LinkCollection.getLinks("youthleaguelink", { "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "owncountryid": owncountryid, 'youthleagueid':youthleagueid }, doc,this);
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
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	}
};
Foxtrick.util.module.register(FoxtrickLinksYouthLeague);
