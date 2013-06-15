'use strict';
/**
 * redirections.js
 * Foxtrick redirections
 * @author convinced
 */

Foxtrick.modules['Redirections'] = {
	CORE_MODULE: true,
	PAGES: ['all'],
	NICE: -40,  // after Core, before anything else

	run: function(doc) {
		if (doc.location.href.search(/challenge|redir_to_.+\=true/i) == -1)
			return;

		var serv = 'http://' + doc.location.hostname;
		var teamid = Foxtrick.util.id.findTeamId(doc.getElementsByClassName('subMenu')[0]);
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var leagueid = Foxtrick.util.id
			.findLeagueLeveUnitId(doc.getElementsByClassName('subMenu')[0]);
		Foxtrick.log('Redirections - teamid: ', teamid, ' ownteamid: ', ownteamid,
		             ' leagueid: ', leagueid);

		var tar = '';
		// redirect from manager
		if (doc.location.href.search(/\/Club\/Manager/i) != -1) {
			var userid = doc.getElementById('ctl00_ctl00_CPContent_divStartMain')
				.getElementsByTagName('a')[1].href.replace(/.+userid=/i, '');

			var target = '_self';
			if (doc.location.href.search(/redir_to_team=true/i) != -1)
						tar = serv + '/Club/?TeamID=' + teamid;
			else if (doc.location.href.search(/redir_to_mail=true/i) != -1) {
				var username = Foxtrick.trim(doc.getElementsByTagName('h1')[1]
				                             .getElementsByClassName('speedBrowser')[0]
				                             .nextSibling.textContent);
				tar = serv + '/MyHattrick/Inbox/?actionType=newMail&alias=' + username;
			}
			else if (doc.location.href.search(/redir_to_lastlineup=true/i) != -1)
				tar = serv + '/Club/Matches/MatchLineup.aspx?MatchID=&TeamID=' + teamid +
					'&useArchive=True';
			else if (doc.location.href.search(/redir_to_nextmatch=true/i) != -1)
				tar = serv + '/Club/Matches/?TeamID=' + teamid + '&redir_to_nextmatch=true';
			else if (doc.location.href.search(/redir_to_addnextmatch=true/i) != -1)
				tar = serv + '/Club/Matches/?TeamID=' + teamid +
					'&redir_to_addnextmatch=true';
			else if (doc.location.href.search(/redir_to_transferhistory=true/i) != -1)
				tar = serv + '/Club/Transfers/transfersTeam.aspx?teamId=' + teamid;
			else if (doc.location.href.search(/redir_to_teamhistory=true/i) != -1)
				tar = serv + '/Club/History/?teamId=' + teamid;
			else if (doc.location.href.search(/redir_to_coach=true/i) != -1) {
				if (teamid === ownteamid)
					tar = serv + '/Club/Training/?redir_to_coach=true';
				else
					tar = serv + '/Club/Players/?TeamID=' + teamid + '&redir_to_coach=true';
			}
			else if (doc.location.href.search(/redir_to_challenge=true/i) != -1)
				tar = serv + '/Club/Challenges/?TeamID=' + teamid + '&challenge=true';
			else if (doc.location.href.search(/redir_to_mail=true/i) != -1)
				tar = serv + '/Club/?TeamID=' + teamid + '&SendMessage=true';
			else if (doc.location.href.search(/redir_to_guestbook=true/i) != -1)
				tar = serv + '/Club/Manager/Guestbook.aspx?teamid=' + teamid;
			else if (doc.location.href.search(/redir_to_achievements=true/i) != -1) {
				tar = serv + '/Club/Achievements/?userID=' + userid + '&teamid=' + teamid;}
			else if (doc.location.href.search(/redir_to_players=true/i) != -1)
				tar = serv + '/Club/Players/?TeamID=' + teamid;
			else if (doc.location.href.search(/redir_to_matches=true/i) != -1)
				tar = serv + '/Club/Matches/?TeamID=' + teamid;
			else if (doc.location.href.search(/redir_to_league=true/i) != -1)
				tar = serv + '/World/Series/?LeagueLevelUnitID=' + leagueid;
			else if (doc.location.href.search(/redir_to_tournaments=true/i) != -1)
				tar = serv + '/Community/Tournaments/?teamId=' + teamid;
			else if (doc.location.href.search(/redir_to_custom=true\&/i) != -1) {
				tar = doc.location.href.replace(/.+redir_to_custom=true\&/, '');
				tar = tar.replace(/%5Bteamid%5D|\[teamid\]/i, teamid);
				tar = tar.replace(/%5Buserid%5D|\[userid\]/i, userid);
			}
			else if (doc.location.href.search(/redir_to_youthmatches=true/i) != -1) {
				var YouthTeamId = Foxtrick.util.id
					.findYouthTeamId(doc.getElementsByClassName('subMenu')[0]);
				tar = serv + '/Club/Matches/?TeamID=' + teamid + '&YouthTeamId=' + YouthTeamId;
			}
		}
		else {
			// set challenge team
			if (doc.location.href.search(/challenge=true/i) != -1) {
				var teamid_input =
					doc.getElementById('ctl00_ctl00_CPContent_CPSidebar_tbNewChallangeTeamId');
				teamid_input.value = Foxtrick.util.id.getTeamIdFromUrl(doc.location.href);
			}
			//redirect to mail
			else if (doc.location.href.search(/redir_to_mail=true/i) != -1) {
				var username = '';
				var mainBodylinks = doc.getElementById('mainBody').getElementsByTagName('a');
				for (var i = 0; i < mainBodylinks.length; ++i) {
					if (mainBodylinks[i].href.search(/\/Club\/Manager\/\?userId=/i) != -1) {
						username = mainBodylinks[i].title;
						break;
					}
				}
				if (username !== '') {
					tar = serv + '/MyHattrick/Inbox/?actionType=newMail&alias=' +
						username;
				}
			}
			//redirect to youthmatches
			else if (doc.location.href.search(/redir_to_youthmatches=true/i) != -1) {
				var YouthTeamId = Foxtrick.util.id
					.findYouthTeamId(doc.getElementsByClassName('subMenu')[0]);
				tar = serv + '/Club/Matches/?TeamID=' + teamid + '&YouthTeamId=' + YouthTeamId;
			}
			// redirect to coach
			else if (doc.location.href.search(/redir_to_coach=true/i) != -1) {
				if (doc.location.href.search(/\/Club\/Players/i) != -1) {
					// redirect to own coach
					if (teamid === ownteamid)
						tar = serv + '/Club/Training/?redir_to_coach=true';
					else {
						// redirect to other coaches
						var sidebarBox = doc.getElementById('sidebar')
							.getElementsByClassName('sidebarBox')[0];
						var coachId = Foxtrick.util.id.findPlayerId(sidebarBox);
						tar = serv + '/Club/Players/Player.aspx?playerId=' + coachId;
					}
				}
				else if (doc.location.href.search(/\/Club\/NationalTeam\/NationalTeam/i) != -1) {
						var ntinfo = doc.getElementById('teamInfo');
						var coachId = Foxtrick.util.id.findPlayerId(ntinfo);
						tar = serv + '/Club/Players/Player.aspx?playerId=' + coachId;
				}
				else if (doc.location.href.search(/\/Club\/Training/i) != -1) {
					// redirect to own coach
					var coachId = Foxtrick.util.id.findPlayerId(doc.getElementById('mainBody'));
					tar = serv + '/Club/Players/Player.aspx?playerId=' + coachId;
				}
			}
			// redir to next match
			else if (doc.location.href.search(/\/Club\/Matches\/\?TeamID=/i) != -1
				&& (doc.location.href.search(/redir_to_nextmatch=true/i) != -1
					|| doc.location.href.search(/redir_to_addnextmatch=true/i) != -1)) {
				var table = doc.getElementById('ctl00_ctl00_CPContent_divStartMain').getElementsByTagName('table')[0];
				var headercount = 0;

				var upcoming = table.getElementsByClassName('matchHTLive');
				if(upcoming.length){
					var matchId = Foxtrick.util.id.getMatchIdFromUrl(upcoming[0].parentNode.href);
					var sourceSystem = Foxtrick.getParameterFromUrl(upcoming[0].parentNode.href, 'SourceSystem');

					if (doc.location.href.search(/redir_to_nextmatch=true/i) != -1)
							tar = serv + '/Club/Matches/Match.aspx?matchID=' + matchId + 
								'&SourceSystem=' + sourceSystem;
						else if (doc.location.href.search(/redir_to_addnextmatch=true/i) != -1)
							tar = serv + '/Club/Matches/Live.aspx?actionType=addMatch&matchID=' +
								matchId + '&SourceSystem=' + sourceSystem;
				}
			}
		}

		Foxtrick.log('direct to: ', tar);
		if (tar)
			doc.location.replace(tar);
	}
};
