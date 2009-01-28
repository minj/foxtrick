/**
 * redirections.js
 * Foxtrick redirections
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickRedirections = {
	
    MODULE_NAME : "Redirections",
	DEFAULT_ENABLED : true,
	
    init : function() {
            Foxtrick.registerAllPagesHandler(FoxtrickRedirections );
   },

    run : function( doc ) { 

	if (doc.location.href.search(/redir_to_.+\=true/i)==-1) return; 
	
	// redirect from manager 
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="playerInfo") {
				var teamid=FoxtrickHelper.findTeamId(alldivs[j]);
				var leagueid=findLeagueLeveUnitId(alldivs[j]);
				var ownteamid=FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));				
				var serv = doc.location.href.match(/(\S+)Club/i)[0]; 
				var target="";
				if (doc.location.href.search(/\/Club\/Manager/i)!=-1) { 
					if (doc.location.href.search(/redir_to_team=true/i)!=-1 ) tar=serv+"/?TeamID="+teamid;
					else if (doc.location.href.search(/redir_to_lastlineup=true/i)!=-1 ) 
								tar=serv+'/Matches/MatchLineup.aspx?MatchID=&TeamID='+teamid+'&useArchive=True';
					else if (doc.location.href.search(/redir_to_transferhistory=true/i)!=-1 ) 
								tar=serv+'/Transfers/transfersTeam.aspx?teamId='+teamid;
					else if (doc.location.href.search(/redir_to_coach=true/i)!=-1 ) { 
							if (teamid!=ownteamid) tar=serv+'/Players/?TeamID='+teamid+'&redir_to_coach=true';
							else tar=serv+'/Training/?redir_to_coach=true';							
						}
					else if (doc.location.href.search(/redir_to_guestbook=true/i)!=-1 ) 
								tar=serv+'/Manager/Guestbook.aspx?teamid='+teamid;
					else if (doc.location.href.search(/redir_to_players=true/i)!=-1 ) 
								tar=serv+'/Players/?TeamID='+teamid;
					else if (doc.location.href.search(/redir_to_matches=true/i)!=-1 ) 
								tar=serv+'/Matches/?TeamID='+teamid;					 						
					else if (doc.location.href.search(/redir_to_league=true/i)!=-1 ) 
								tar=serv.replace(/club/i,'')+'World/Series/Default.aspx?LeagueLevelUnitID='+leagueid;					 						
				}
				doc.location.replace(tar);
				break;
			}
		}
		
	// redirect to coach		
	if (doc.location.href.search(/redir_to_coach=true/i)!=-1 ) { 		
		if (doc.location.href.search(/\/Club\/Players\//i)!=-1 ) {  
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
		if (doc.location.href.search(/\/Club\/NationalTeam\/NationalTeam/i)!=-1 ){ 
			try {
				var ntinfo=doc.getElementById('teamInfo');
				var CoachId = FoxtrickHelper.findPlayerId(ntinfo);
				var serv = doc.location.href.match(/(\S+)Club/i)[0]; 
				var tar = serv+'/Players/Player.aspx?playerId='+CoachId;
				doc.location.replace(tar);
				}
			
			catch (e) {dump("teamlinks->"+e);}
		}
		if (doc.location.href.search(/\/Club\/Training\//i)!=-1) { 
			try {
			// redirect to coach
				var CoachId = FoxtrickHelper.findPlayerId(doc.getElementById("mainBody"));
				var serv = doc.location.href.match(/(\S+)Club/i)[0]; 
				var tar = serv+"/Players/Player.aspx?playerId="+CoachId;
				doc.location.replace(tar);
			}
			catch (e) {dump("ateamshortcuts->"+e);}
		}
	  }
	},
	
	change : function( doc ) {
	},
		
};