/**
 * seniorshortcuts.js
 * Foxtrick add coach and lastlineup links to team pages
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickSeniorTeamShortCuts = {
	
    MODULE_NAME : "SeniorTeamShortCuts",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	RADIO_OPTIONS : new Array("OnlyOtherPages", "AllPages"), 
	
    init : function() {
            Foxtrick.registerPageHandler( 'teamPageGeneral',
                                          FoxtrickSeniorTeamShortCuts );
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
			catch (e) {dump("ateamshortcuts->"+e);}
		}
		if (teamid!=ownteamid || FoxtrickPrefs.getInt("module." + this.MODULE_NAME + ".value") == 1) { 
 			this.AddLinksLeft(page,doc);	
		}
	},
	
	change : function( page, doc ) {
/*		var owncoachlinkId = "foxtrick_content_coach";
		var ownlastmatchlinkId = "foxtrick_content_lastmatch";
		if (!doc.getElementById ( owncoachlinkId )
			&& !doc.getElementById ( ownlastmatchlinkId ) ) { //dump('run again : LinksTeamLeft\n');
			this.AddLinksLeft(page,doc);
		}	*/
	},
	
    AddLinksLeft : function( page, doc ) {
			if (!this.isTeamPage(doc)) {return;}

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
				
				var pos1=-1; var pos2=-1;
				var bl_header=boxleft.getElementsByTagName('li');
				var bllink=boxleft.getElementsByTagName('a');
				for (var j = 0; j < bllink.length; j++) {
					if (pos1==-1 && bllink[j].href.search(/\/Club\/Players\/\?TeamID/i)>0) pos1=j;
					if (pos2==-1 && bllink[j].href.search(/\/Club\/Matches\/\?TeamID/i)>0) pos2=j;
				}
				
				// last lineup
					var li = doc.createElement("li");
					var lastmatchlink = doc.createElement("a");
					lastmatchlink.setAttribute('href', '/Club/Matches/MatchLineup.aspx?MatchID=&TeamID='+teamid+'&useArchive=True');
					lastmatchlink.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'LastLineup' )));
					var ownlastmatchlinkId = "foxtrick_content_lastmatch";
					lastmatchlink.setAttribute( "id", ownlastmatchlinkId );
					li.appendChild(lastmatchlink);
                    
					if (pos2) bl_header[pos2].parentNode.insertBefore(li,bl_header[pos2].nextSibling);
					else bl_header[0].parentNode.appendChild(li);
						 
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
						if (pos1) bl_header[pos1].parentNode.insertBefore(li2,bl_header[pos1].nextSibling);
						else bl_header[0].parentNode.appendChild(li2);
						
				
			}
			catch (e) {dump("ateamshortcuts->add_leftlinks->"+e);}
	},		
	
	
	isTeamPage : function(doc) {
        var site=doc.location.href;
        var remain=site.substr(site.search(/Club\//i)+5);
    return (remain=="" || remain.search(/TeamID=/i)==1);
	},
};	