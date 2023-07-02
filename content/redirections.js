/**
 * redirections.js
 * Foxtrick redirections
 *
 * @author convinced, ryan, CatzHoek, LA-MJ
 */

'use strict';

/* eslint-disable complexity, max-statements-per-line */

Foxtrick.modules['Redirections'] = {
	OUTSIDE_MAINBODY: true,
	CORE_MODULE: true,
	PAGES: ['all'],
	NICE: -40, // after Core, before anything else

	run: function(doc) {
		var location = doc.location.href;

		// set challenge team
		if (/make_challenge/i.test(location)) {
			var challengeId = 'ctl00_ctl00_CPContent_CPSidebar_ucVisitorActions_lnkChallenge';
			var boot = doc.getElementById(challengeId);
			if (boot)
				boot.click();

			return;
		}

		var redirectRe = /redir_to_(\w+)=true/i;

		if (!redirectRe.test(location))
			return;

		var subMenu = doc.querySelector('.subMenu');
		var teamId = Foxtrick.util.id.findTeamId(subMenu);
		var youthTeamId = Foxtrick.util.id.findYouthTeamId(subMenu);
		var ownTeamId = Foxtrick.util.id.getOwnTeamId();
		var seriesId = Foxtrick.util.id.findLeagueLeveUnitId(subMenu);
		Foxtrick.log('Redirections - teamId:', teamId, 'youthTeamId', youthTeamId,
		             'ownTeamId:', ownTeamId, 'seriesId:', seriesId);

		var isManagerPage = Foxtrick.isPage(doc, 'managerPage');
		var isTeamPage = Foxtrick.isPage(doc, 'teamPage');

		var mainBody = doc.getElementById('mainBody');
		var userId, userName; /* eslint-disable-line no-unused-vars */
		var url = '';

		var redirect = location.match(redirectRe)[1];
		redirect = redirect.toLowerCase();

		if (isManagerPage) {
			userId = Foxtrick.Pages.All.getId(doc);
			var userNode = mainBody.querySelector('h1 .speedBrowser').nextSibling;
			userName = userNode.textContent.trim(); // lgtm[js/useless-assignment-to-local]

			switch (redirect) {
				case 'analysis': url = '/Club/TacticsRoom/?TeamID=' + teamId; break;
				case 'challenge': url = '/Club/?teamId=' + teamId + '&make_challenge'; break;
				case 'flags': url = '/Club/Flags/?teamId=' + teamId; break;
				case 'guestbook': url = '/Club/Manager/Guestbook.aspx?teamId=' + teamId; break;
				case 'mail': url = '/MyHattrick/Inbox/?actionType=newMail&userId=' + userId; break;
				case 'matches': url = '/Club/Matches/?TeamID=' + teamId; break;
				case 'players': url = '/Club/Players/?TeamID=' + teamId; break;
				case 'series': url = '/World/Series/?LeagueLevelUnitID=' + seriesId; break;
				case 'team': url = '/Club/?TeamID=' + teamId; break;
				case 'teamhistory': url = '/Club/History/?teamId=' + teamId; break;
				case 'tournaments': url = '/Community/Tournaments/?teamId=' + teamId; break;

				case 'achievements':
					url = '/Club/Achievements/?userID=' + userId + '&teamId=' + teamId;
					break;

				case 'addnextmatch':
					url = '/Club/Matches/?TeamID=' + teamId + '&redir_to_addnextmatch=true';
					break;

				case 'lastlineup':
					url = '/Club/Matches/?teamId=' + teamId + '&redir_to_lastlineup=true';
					break;

				case 'nextmatch':
					url = '/Club/Matches/?TeamID=' + teamId + '&redir_to_nextmatch=true';
					break;

				case 'transferhistory':
					url = '/Club/Transfers/transfersTeam.aspx?teamId=' + teamId;
					break;

				case 'youthmatches':
					url = '/Club/Matches/?TeamID=' + teamId + '&youthTeamId=' + youthTeamId;
					break;

				case 'coach':
					if (teamId === ownTeamId)
						url = '/Club/Training/?redir_to_coach=true';
					else
						url = '/Club/Players/?TeamID=' + teamId + '&redir_to_coach=true';
					break;

				case 'custom':
					url = Foxtrick.getUrlParam(location, 'redir_to');
					url = url.replace(/%5BteamId%5D|\[teamId\]/i, teamId);
					url = url.replace(/%5BuserId%5D|\[userId\]/i, userId);
					break;

				default:
					Foxtrick.log(new Error('Unknown redirect: ' + redirect));
					break;
			}
		}
		else {

			if (isTeamPage) {
				var userLink = mainBody.querySelector('a[href*="userId"]');
				if (userLink) {
					userId = Foxtrick.util.id.getUserIdFromUrl(userLink.href);
					userName = userLink.title.trim(); // lgtm[js/useless-assignment-to-local]
				}
			}

			switch (redirect) {
				case 'coach':
					var coachId;
					if (/\/Club\/Players/i.test(location)) {

						if (teamId === ownTeamId) {
							// redirect to own coach
							url = `/Club/Specialists/?teamId=${teamId}`;
						}
						else {
							// redirect to other coaches
							var sidebarBox = doc.querySelector('#sidebar .sidebarBox');
							url = Foxtrick.util.id.findTrainerUrl(sidebarBox);
						}

					}

					break;

				case 'mail':
					if (userId)
						url = '/MyHattrick/Inbox/?actionType=newMail&userId=' + userId;
					break;

				case 'lastlineup':
					{
						let match = mainBody.querySelector('img.matchOrder');
						let link = match?.closest('a').href;
						if (link == null)
							break;

						let parse = new URL(link.replace(/\/Match\.aspx\b/, '/Match.Classic.aspx'));
						parse.searchParams.set('teamId', String(teamId));
						// eslint-disable-next-line no-restricted-properties
						url = parse.pathname + parse.search + '#tab2';
					}
					break;

				case 'youthmatches':
					url = '/Club/Matches/?TeamID=' + teamId + '&youthTeamId=' + youthTeamId;
					break;

				case 'nextmatch': // fall-through
				case 'addnextmatch':
					var table = Foxtrick.Pages.Matches.getTable(doc);
					var upcoming = table.querySelector('.matchHTLive');
					if (!upcoming)
						break;

					var upcomingUrl = upcoming.parentNode.href;
					var matchId = Foxtrick.util.id.getMatchIdFromUrl(upcomingUrl);
					var sourceSystem = Foxtrick.getUrlParam(upcomingUrl, 'SourceSystem');

					if (redirect === 'nextmatch') {
						url = '/Club/Matches/Match.aspx?matchID=' + matchId +
							'&SourceSystem=' + sourceSystem;
					}
					else if (redirect === 'addnextmatch') {
						url = '/Club/Matches/Live.aspx?actionType=addMatch&matchID=' + matchId +
							'&SourceSystem=' + sourceSystem;
					}

					break;

				default:
					Foxtrick.log(new Error('Unknown redirect: ' + redirect));
					break;
			}
		}

		Foxtrick.log('redirect', redirect, 'from:', location, 'to:', url);
		if (url) {
			// README: url must be relative!
			//
			// Firefox displays completely weird behavior here.
			// Relative URL works when executed directly in the debugger.
			// Running live, however, resolves URLs against XULDocument
			doc.location.replace(doc.location.origin + url);
		}
	},
};
