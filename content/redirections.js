/**
 * redirections.js
 * Foxtrick redirections
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickRedirections = {
	MODULE_NAME : "Redirections",
	CORE_MODULE : true,
	PAGES : ["all"],

	run : function(doc) {
		if (doc.location.href.search(/mailto|challenge|redir_to_.+\=true/i)==-1) return;

		var serv = 'http://'+doc.location.hostname;

		// redirect from manager
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="playerInfo") {
				var teamid=FoxtrickHelper.findTeamId(alldivs[j]);
				var leagueid=FoxtrickHelper.findLeagueLeveUnitId(alldivs[j]);
				var ownteamid = FoxtrickHelper.getOwnTeamId();
				var userid = doc.getElementById('mainWrapper').getElementsByTagName('a')[1].href.replace(/.+userid=/i,'');;


				var target="_self";
				var tar='';
				if (doc.location.href.search(/\/Club\/Manager/i)!=-1) {
					if (doc.location.href.search(/redir_to_team=true/i)!=-1 )
								tar=serv+"/Club/?TeamID="+teamid;
					else if (doc.location.href.search(/redir_to_team_at_alltid=true/i)!=-1 )
								{tar="http://alltid.org/team/"+teamid; target='_blank';}
					else if (doc.location.href.search(/redir_to_lastlineup=true/i)!=-1 )
								tar=serv+'/Club/Matches/MatchLineup.aspx?MatchID=&TeamID='+teamid+'&useArchive=True';
					else if (doc.location.href.search(/redir_to_nextmatch=true/i)!=-1 )
								tar=serv+'/Club/Matches/?TeamID='+teamid+'&redir_to_nextmatch=true';
					else if (doc.location.href.search(/redir_to_addnextmatch=true/i)!=-1 )
								tar=serv+'/Club/Matches/?TeamID='+teamid+'&redir_to_addnextmatch=true';
					else if (doc.location.href.search(/redir_to_transferhistory=true/i)!=-1 )
								tar=serv+'/Club/Transfers/transfersTeam.aspx?teamId='+teamid;
					else if (doc.location.href.search(/redir_to_teamhistory=true/i)!=-1 )
								tar=serv+'/Club/History/?teamId='+teamid;
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
							tar = doc.location.href.replace(/.+redir_to_custom=true\&/,''); //Foxtrick.dump(tar+'\n');
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
			var teamid_input = doc.getElementById('ctl00_ctl00_CPContent_CPSidebar_tbNewChallangeTeamId');
			teamid_input.value = FoxtrickHelper.getTeamIdFromUrl(doc.location.href);
		}
		//mailto
		if (doc.location.href.search(/mailto=/i)!=-1 ) {
			var teamid_input = doc.getElementById('ctl00_ctl00_CPContent_CPMain_tbTo');
			var username = doc.location.href.replace(/.+mailto=/i,'');
			if (username.search(/&/)!=-1) username=username.replace(/&.+/,'');
			teamid_input.value = username;
		}
		//redirect to mail
		if (doc.location.href.search(/redir_to_mail=true/i)!=-1 ) {
			var username='';
			var mainBodylinks = doc.getElementById('mainBody').getElementsByTagName("a");
			for (var i=0;i<mainBodylinks.length;++i) {
				if (mainBodylinks[i].href.search(/\/Club\/Manager\/\?userId=/i)!=-1) {
					username = mainBodylinks[i].title;
					break;
				}
			}
			if (username!=='') {
				var tar = serv+"/MyHattrick/Inbox/Default.aspx?actionType=newMail&mailto="+username;
				doc.location.replace(tar);
			}
		}
		//redirect to youthmatches
		if (doc.location.href.search(/redir_to_youthmatches=true/i)!=-1 ) {
			var YouthTeamId = FoxtrickHelper.findYouthTeamId(doc.getElementsByClassName("subMenu")[0]);
			var TeamId = FoxtrickHelper.findTeamId(doc.getElementsByClassName("subMenu")[0]);
			var tar = serv+"/Club/Matches/?TeamID="+TeamId+"&YouthTeamId="+YouthTeamId; //Foxtrick.dump(tar+'\n');
			doc.location.replace(tar);
		}
		// redirect to coach
		if (doc.location.href.search(/redir_to_coach=true/i)!=-1 ) {
			if (doc.location.href.search(/\/Club\/Players/i)!=-1 ) {
				// redirect to coach
				try {
					var sidebarBox = doc.getElementById("sidebar").getElementsByClassName("sidebarBox")[0];
					var coachId = FoxtrickHelper.findPlayerId(sidebarBox);
					var location = serv+"/Club/Players/Player.aspx?playerId=" + coachId;
					doc.location.replace(location);
				}
				catch (e) {
					Foxtrick.log(e);
				}
			}
			if (doc.location.href.search(/\/Club\/NationalTeam\/NationalTeam/i)!=-1 ){
				try {
					var ntinfo=doc.getElementById('teamInfo');
					var CoachId = FoxtrickHelper.findPlayerId(ntinfo);
					var tar = serv+'/Club/Players/Player.aspx?playerId='+CoachId;
					doc.location.replace(tar);
					}

				catch (e) {
					Foxtrick.log(e);
				}
			}
			if (doc.location.href.search(/\/Club\/Training/i)!=-1) {
				try {
				// redirect to coach
					var CoachId = FoxtrickHelper.findPlayerId(doc.getElementById("mainBody"));
					var tar = serv+"/Club/Players/Player.aspx?playerId="+CoachId;
					doc.location.replace(tar);
				}
				catch (e) {
					Foxtrick.log(e);
				}
			}
		}
		// redir to next match
		if (doc.location.href.search(/\/Club\/Matches\/\?TeamID=/i)!=-1
			&& (doc.location.href.search(/redir_to_nextmatch=true/i)!=-1
				|| doc.location.href.search(/redir_to_addnextmatch=true/i)!=-1 )) {
			try {
				var table = doc.getElementById('mainWrapper').getElementsByTagName('table')[0];
				var headercount=0;
				for (var i=0;i<table.rows.length;++i) {
					if (table.rows[i].getElementsByTagName('h2')[0]) {
						headercount++;
						if (headercount==1) continue;

						var matchid = table.rows[i+1].innerHTML.match(/matchid=(\d+)/i)[1];

		 				if (doc.location.href.search(/redir_to_nextmatch=true/i)!=-1 )
									tar=serv+'/Club/Matches/Match.aspx?matchID='+matchid;
						else if (doc.location.href.search(/redir_to_addnextmatch=true/i)!=-1 )
									tar=serv+'/Club/Matches/Live.aspx?actionType=addMatch&matchID='+matchid;
						doc.location.replace(tar);
						break;
					}
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		}
	}
};
Foxtrick.util.module.register(FoxtrickRedirections);
