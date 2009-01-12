/**
 * linksteam.js
 * Foxtrick add links to team pages
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickLinksTeam = {
	
    MODULE_NAME : "LinksTeam",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 
	
    init : function() {
            Foxtrick.registerPageHandler( 'teamPageGeneral',
                                          FoxtrickLinksTeam );
			Foxtrick.initOptionsLinks(this,"teamlink");
    },

    run : function( page, doc ) {
		var boxleft=doc.getElementById('ctl00_pnlSubMenu');
		var ownteamid=0;
		if (boxleft==null) {return;}
		var teamid=FoxtrickHelper.findTeamId(boxleft); 
		if (teamid=="") {return;}
		var teamdiv = doc.getElementById('teamLinks');
		var ownleagueid = FoxtrickHelper.findLeagueLeveUnitId(teamdiv);
				if (ownleagueid!=null) {
					ownteamid = FoxtrickHelper.findTeamId(teamdiv);
				}		
		
		if (doc.location.href.search(/\/Club\/Players\//i)!=-1  
		&& doc.location.href.search(/redir=true/i)!=-1 ) {  dump("redirect to coach\n");
			// redirect to coach
			try {
				var alldivs = doc.getElementsByTagName('div');
				for (var j = 0; j < alldivs.length; j++) {
					if (alldivs[j].className=="sidebarBox") { 
						var CoachId = FoxtrickHelper.findPlayerId(alldivs[j]);
						var serv = doc.location.href.match(/(\S+)Club/i)[0]; 
						var tar = serv+"/Players/Player.aspx?playerId="+CoachId;
						doc.location.replace(tar);
						break;					
					}
				}
			}
			catch (e) {dump("teamlinks->"+e);}
		}
		if (doc.location.href.search(/\/Club\/NationalTeam\/NationalTeam/i)!=-1  
		&& doc.location.href.search(/redir=true/i)!=-1 ) {  dump("redirect to coach\n");
			// redirect to coach
			try {
				var ntinfo=doc.getElementById('teamInfo');
				var CoachId = FoxtrickHelper.findPlayerId(ntinfo);
				var serv = doc.location.href.match(/(\S+)Club/i)[0]; 
				var tar = serv+'/Players/Player.aspx?playerId='+CoachId;
				doc.location.replace(tar);
				}
			
			catch (e) {dump("teamlinks->"+e);}
		}
		if (doc.location.href.search(/\/Club\/Training\//i)!=-1  
		&& doc.location.href.search(/redir=true/i)!=-1 ) {   dump("redirect to own coach\n");
			try {
			// redirect to coach
				var CoachId = FoxtrickHelper.findPlayerId(doc.getElementById("mainBody"));
				var serv = doc.location.href.match(/(\S+)Club/i)[0]; 
				var tar = serv+"/Players/Player.aspx?playerId="+CoachId;
				doc.location.replace(tar);
			}
			catch (e) {dump("teamlinks->"+e);}
		}		
		this.AddLinksLeft(page,doc);
		this.AddLinksRight(page,doc);
	},

	
    AddLinksLeft : function( page, doc ) {
			try {
				var teamdiv = doc.getElementById('teamLinks');
				var ownteamid=0;
				var ownleagueid = FoxtrickHelper.findLeagueLeveUnitId(teamdiv);
				if (ownleagueid!=null) {
					ownteamid = FoxtrickHelper.findTeamId(teamdiv);
				}		
				var boxleft=doc.getElementById('ctl00_pnlSubMenu');
				if (boxleft==null) {return;}
				var teamid=FoxtrickHelper.findTeamId(boxleft); 
				// last lineup
				var bl_header=boxleft.getElementsByTagName('li');
				var li = doc.createElement("li");
				var lastmatchlink = doc.createElement("a");
				lastmatchlink.setAttribute('href', '/Club/Matches/MatchLineup.aspx?MatchID=&TeamID='+teamid+'&useArchive=True');
				lastmatchlink.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'LastLineup' )));
				var ownlastmatchlinkId = "foxtrick_content_lastmatch";
				lastmatchlink.setAttribute( "id", ownlastmatchlinkId );
				li.appendChild(lastmatchlink);
                    
				bl_header[0].parentNode.appendChild(li);
						 
				// coach make link
						var li2 = doc.createElement("li");
						var coachlink = doc.createElement("a");
						if (teamid<3000||teamid>=5000) { // normal teams
							if (teamid!=ownteamid) {
								coachlink.setAttribute('href', '/Club/Players/?TeamID='+teamid+'&redir=true');}
							else { coachlink.setAttribute('href', '/Club/Training/?redir=true');}
						}
						else {   // nt teams
							if (doc.location.href.search(/\/Club\/NationalTeam\/NationalTeam/i)!=-1) {
								var ntinfo=doc.getElementById('teamInfo');
								var CoachId = FoxtrickHelper.findPlayerId(ntinfo);
								coachlink.setAttribute('href','/Club/Players/Player.aspx?playerId='+CoachId);
							}
							else {coachlink.setAttribute('href', '/Club/NationalTeam/NationalTeam.aspx?teamId='+teamid+'&redir=true');}
						}
						coachlink.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Coach' )));
						var owncoachlinkId = "foxtrick_content_coach";
						coachlink.setAttribute( "id", owncoachlinkId );
						li2.appendChild(coachlink);
						bl_header[0].parentNode.appendChild(li2);														
			}
			catch (e) {dump("teamlinks->add_leftlinks->"+e);}
	},		

	
    AddLinksRight : function( page, doc ) {
		try {
		if (!this.isTeamPage(doc)) {return;}
		var alldivs = doc.getElementsByTagName('div');
			for (var j = 0; j < alldivs.length; j++) {
				if (alldivs[j].className=="main mainRegular") {
					var teaminfo = this.gatherLinks( alldivs[j], doc ); 
		
					var links = getLinks("teamlink", teaminfo, doc, this );				
					if (links.length > 0) {
						var ownBoxBody = doc.createElement("div");
						var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
						var ownBoxId = "foxtrick_" + header + "_box";
						var ownBoxBodyId = "foxtrick_" + header + "_content";
						ownBoxBody.setAttribute( "id", ownBoxBodyId );
               		                 
						for (var k = 0; k < links.length; k++) {
							links[k].link.className ="inner";
							ownBoxBody.appendChild(doc.createTextNode(" "));
							ownBoxBody.appendChild(links[k].link);
						}
						Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", ""); 
	
						FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,teaminfo);	
					}
				}
			}
		}
		catch (e) {dump("teamlinks->add_leftright->"+e);}
	},
	
	change : function( page, doc ) { // dump('change : LinksTeam\n');
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_" + header + "_content";
		var owncoachlinkId = "foxtrick_content_coach";
		var ownlastmatchlinkId = "foxtrick_content_lastmatch";
		if( !doc.getElementById ( ownBoxId )
		   && this.isTeamPage(doc)) {
		 	dump('run again : LinksTeamRight\n');	
			this.AddLinksRight(page,doc);
		}
		if (!doc.getElementById ( owncoachlinkId )
			&& !doc.getElementById ( ownlastmatchlinkId ) ) { dump('run again : LinksTeamLeft\n');
			this.AddLinksLeft(page,doc);
		}	
	},
	
	isTeamPage : function(doc) {
        var site=doc.location.href;
        var remain=site.substr(site.search(/Club\//i)+5);
    return (remain=="" || remain.search(/TeamID=/i)==1);
	},
	
	gatherLinks : function( thisdiv, doc ) {
		var countryid = FoxtrickHelper.findCountryId(thisdiv);
  		var teamid = FoxtrickHelper.findTeamId(thisdiv);
		var teamname = FoxtrickHelper.extractTeamName(thisdiv);
		var leaguename = FoxtrickHelper.extractLeagueName(thisdiv);
		var levelnum = FoxtrickHelper.getLevelNum(leaguename, countryid);
      
		if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
			leaguename="I";
		} 
       
		return { "teamid": teamid, "teamname": teamname, "countryid" : countryid, "levelnum" : levelnum  };
	},
};
	