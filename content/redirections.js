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

	if (doc.location.href.search(/mailto|challenge|redir_to_.+\=true/i)==-1) return; 
	
	var serv = 'http://'+doc.location.hostname;//href.match(/(\S+)Club/i)[0]; 
		
		// redirect from manager 
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="playerInfo") {
				var teamid=FoxtrickHelper.findTeamId(alldivs[j]);
				var leagueid=FoxtrickHelper.findLeagueLeveUnitId(alldivs[j]);
				var ownteamid=FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));	
				var userid = doc.getElementById('mainWrapper').getElementsByTagName('a')[1].href.replace(/.+userid=/i,'');;
				
				
				var target="_self"; dump(serv+'\n');
				var tar='';
				if (doc.location.href.search(/\/Club\/Manager/i)!=-1) {  dump('in\n');
					if (doc.location.href.search(/redir_to_team=true/i)!=-1 ) 
								tar=serv+"/Club/?TeamID="+teamid;
					else if (doc.location.href.search(/redir_to_team_at_alltid=true/i)!=-1 ) 
								{tar="http://alltid.org/team/"+teamid; target='_blank'; dump('tar:'+tar+'\n');}
					else if (doc.location.href.search(/redir_to_lastlineup=true/i)!=-1 ) 
								tar=serv+'/Club/Matches/MatchLineup.aspx?MatchID=&TeamID='+teamid+'&useArchive=True';
					else if (doc.location.href.search(/redir_to_transferhistory=true/i)!=-1 ) 
								tar=serv+'/Club/Transfers/transfersTeam.aspx?teamId='+teamid;
					else if (doc.location.href.search(/redir_to_coach=true/i)!=-1 ) { 
						if (teamid!=ownteamid) tar=serv+'/Club/Players/?TeamID='+teamid+'&redir_to_coach=true';
						else tar=serv+'/Club/Training/?redir_to_coach=true';							
					}					
					else if (doc.location.href.search(/redir_to_challenge=true/i)!=-1 ) 
								tar=serv+'/Club/Challenges/?TeamID='+teamid+'&challenge=true';
					else if (doc.location.href.search(/redir_to_sendmessage=true/i)!=-1 ) 
								tar=serv+'/Club/?TeamID='+teamid+'&SendMessage=true';
					else if (doc.location.href.search(/redir_to_guestbook=true/i)!=-1 ) 
								tar=serv+'/Club/Manager/Guestbook.aspx?teamid='+teamid;
					else if (doc.location.href.search(/redir_to_achievements=true/i)!=-1 ) { 
								tar=serv+'/Club/Achievements/?userID='+userid+'&teamid='+teamid;}
					else if (doc.location.href.search(/redir_to_players=true/i)!=-1 ) 
								tar=serv+'/Club/Players/?TeamID='+teamid;
					else if (doc.location.href.search(/redir_to_matches=true/i)!=-1 ) 
								tar=serv+'/Club/Matches/?TeamID='+teamid;					 						
					else if (doc.location.href.search(/redir_to_league=true/i)!=-1 ) 
								tar=serv+'/World/Series/Default.aspx?LeagueLevelUnitID='+leagueid;	
					else if (doc.location.href.search(/redir_to_custom=true\&/i)!=-1 ) { 
							tar = doc.location.href.replace(/.+redir_to_custom=true\&/,''); dump(tar+'\n');
							tar = tar.replace(/%5Bteamid%5D|\[teamid\]/i, teamid);
							tar = tar.replace(/%5Buserid%5D|\[userid\]/i, userid);	
							//if (tar.charAt(0)=='/') tar=serv+tar;
					}																	
				}
				doc.location.replace(tar);
				break;
			}
		}
	//challenge
	if (doc.location.href.search(/challenge=true/i)!=-1 ) { 
		var teamid_input = doc.getElementById('ctl00_CPSidebar_tbNewChallangeTeamId');
		teamid_input.value = FoxtrickHelper.getTeamIdFromUrl(doc.location.href);
	}
	//mailto
	if (doc.location.href.search(/mailto=/i)!=-1 ) { 
		var teamid_input = doc.getElementById('ctl00_CPMain_tbTo');
		var username = doc.location.href.replace(/.+mailto=/i,'');
		if (username.search(/&/)!=-1) username=username.replace(/&.+/,'');
		teamid_input.value = username;
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
						var tar = serv+"/Club/Players/Player.aspx?playerId="+CoachId;
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
				var tar = serv+'/Club/Players/Player.aspx?playerId='+CoachId;
				doc.location.replace(tar);
				}
			
			catch (e) {dump("teamlinks->"+e);}
		}
		if (doc.location.href.search(/\/Club\/Training\//i)!=-1) { 
			try {
			// redirect to coach
				var CoachId = FoxtrickHelper.findPlayerId(doc.getElementById("mainBody"));
				var tar = serv+"/Club/Players/Player.aspx?playerId="+CoachId;
				doc.location.replace(tar);
			}
			catch (e) {dump("ateamshortcuts->"+e);}
		}
	  }
	},
	
	change : function( doc ) {
	},
		
};