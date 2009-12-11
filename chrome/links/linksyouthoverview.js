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
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 	

    init : function() {
			Foxtrick.initOptionsLinks(this,"youthlink");	
	    },

    run : function( page, doc ) {
		var boxleft=doc.getElementById('ctl00_pnlSubMenu');
		var ownteamid=0;
		var owncountryid=0;
		if (boxleft==null) {return;}
		var teamid=FoxtrickHelper.findTeamId(boxleft); 
		if (teamid=="") {return;}
		var teamdiv = doc.getElementById('teamLinks');
		var ownleagueid = FoxtrickHelper.findLeagueLeveUnitId(teamdiv);
				if (ownleagueid!=null) {
					ownteamid = FoxtrickHelper.findTeamId(teamdiv);
					owncountryid = FoxtrickHelper.findCountryId(teamdiv);					
				}		
		var youthteamid=FoxtrickHelper.findYouthTeamId(doc.getElementById('mainWrapper'));
	
	
		//addExternalLinksToYouthOverview
        var ownBoxBody=null;
		var links = Foxtrick.LinkCollection.getLinks("youthlink", { "ownteamid":ownteamid,"teamid":teamid,"youthteamid":youthteamid, "owncountryid": owncountryid }, doc,this);  
		if (links.length > 0) {
			ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
			var ownBoxId = "foxtrick_links_box";
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );
                                
			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(links[k].link);
			}
			Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
		}
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME ,{});			
    },
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_links_content";
		if( !doc.getElementById ( ownBoxId ) ) {
			this.run( page, doc );
		}
	},
};



////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksYouthPlayerDetail = {
	
    MODULE_NAME : "LinksYouthPlayerDetail",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('YouthPlayers'), 
	DEFAULT_ENABLED : false,
	OPTIONS : {}, 	

    init : function() {
			Foxtrick.initOptionsLinks(this,"youthplayerdetaillink");	
	    },

    run : function( page, doc ) {
		var boxleft=doc.getElementById('ctl00_pnlSubMenu');
		var ownteamid=0;
		var owncountryid=0;
		if (boxleft==null) {return;}
		var teamid=FoxtrickHelper.findTeamId(boxleft); 
		if (teamid=="") {return;}
		var teamdiv = doc.getElementById('teamLinks');
		var ownleagueid = FoxtrickHelper.findLeagueLeveUnitId(teamdiv);
				if (ownleagueid!=null) {
					ownteamid = FoxtrickHelper.findTeamId(teamdiv);
					owncountryid = FoxtrickHelper.findCountryId(teamdiv);					
				}		
		
	
	
		//addExternalLinksToYouthOverview
        var ownBoxBody=null;
		var links = Foxtrick.LinkCollection.getLinks("youthplayerdetaillink", { "owncountryid": owncountryid }, doc,this);  
		if (links.length > 0) {
			ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
			var ownBoxId = "foxtrick_links_box";
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );
                                
			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(links[k].link);
			}
			Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
		}
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME ,{});			
    },
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_links_content";
		if( !doc.getElementById ( ownBoxId ) ) {
			this.run( page, doc );
		}
	},
};



////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksYouthTraining = {
	
    MODULE_NAME : "LinksYouthTraining",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('YouthTraining'), 
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 	

    init : function() {
			Foxtrick.initOptionsLinks(this,"youthtraininglink");	
	    },

    run : function( page, doc ) {
		var boxleft=doc.getElementById('ctl00_pnlSubMenu');
		var ownteamid=0;
		var owncountryid=0;
		if (boxleft==null) {return;}
		var teamid=FoxtrickHelper.findTeamId(boxleft); 
		if (teamid=="") {return;}
		var teamdiv = doc.getElementById('teamLinks');
		var ownleagueid = FoxtrickHelper.findLeagueLeveUnitId(teamdiv);
				if (ownleagueid!=null) {
					ownteamid = FoxtrickHelper.findTeamId(teamdiv);
					owncountryid = FoxtrickHelper.findCountryId(teamdiv);					
				}		
		
	
	
		//addExternalLinksToYouthOverview
        var ownBoxBody=null;
		var links = Foxtrick.LinkCollection.getLinks("youthtraininglink", { "owncountryid": owncountryid }, doc,this);  
		if (links.length > 0) {
			ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
			var ownBoxId = "foxtrick_links_box";
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );
                                
			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(links[k].link);
			}
			Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
		}
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME ,{});			
    },
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_links_content";
		if( !doc.getElementById ( ownBoxId ) ) {
			this.run( page, doc );
		}
	},
};