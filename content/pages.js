'use strict';
/**
 * pages.js
 * @author FoxTrick developers
 *
 * This is a list of Hattrick pages that modules can run on.
 * Those values are simply taken from the hattrick URL, so when the current
 * url contains e.g. 'Forum/Read' AND we are on hattrick, all the modules
 * registered to listen to 'forumViewThread' will have their run() functions
 * called.
 *
 * You can add new values here, but make sure your NEWLY added pages have names
 * in camelCase (it'd be hard to modify existing non-camelCase names), using the
 * name similar to the URI, and escape the URI correctly.
 * Use '\\' to escape (double backslash for escaping backslash itself).
 * '.' and '?' will be escaped automatically.
 * Consequently it is not possible to use their special meaning in regex.
 */

if (!Foxtrick)
	var Foxtrick = {};

Foxtrick.ht_pages = {
	// following are mainly used for information gathering. keep on top
	'myHattrick'                : '/MyHattrick/$',  // that's the news page
	'myHattrickAll'             : '/MyHattrick/|.(org|fm|ws|name|net|pl|br)/$', // TLD
	'teamPageAny'               : '/Club/|/World/Series/|/Community/Tournaments/',

	'all'                       : '.*',
	'dashboard'                 : '/MyHattrick/Dashboard.aspx',
	'playerDetails'             : '/Club/Players/Player.aspx',
	'forum'                     : '/Forum/',
	'forumViewThread'           : '/Forum/Read.aspx',
	'forumOverview'             : '/Forum/Overview.aspx',
	'forumDefault'              : '/Forum/(Default.aspx|?|$)',
	'forumWritePost'            : '/Forum/Write.aspx',
	'forumModWritePost'         : '/Forum/Functions.aspx',
	'messageWritePost'          : '/MyHattrick/Inbox/(Default.aspx?|?)actionType=newMail|' +
	                              '/MyHattrick/Inbox/(Default.aspx?|?)actionType=readMail',
	'ticket'                    : '/MyHattrick/Inbox/(Default.aspx?|?)' +
	                              'actionType=viewInfoTicket',
	'forumSettings'             : '/MyHattrick/Preferences/ForumSettings.aspx',
	'prefSettings'              : '/MyHattrick/Preferences/ProfileSettings.aspx',
	'bookmarks'                 : '/MyHattrick/Bookmarks/(Default.aspx|?|$)',
	'series'                    : '/World/Series/(Default.aspx|?|$)',
	'youthSeries'               : '/World/Series/YouthSeries.aspx',
	'nextSeries'                : '/World/Series/NextSeason.aspx',
	'country'                   : '/World/Leagues/League.aspx',
	'region'                    : '/World/Regions/Region.aspx',
	'regionOverview'            : '/World/Regions/(Default.aspx|?|$)',
	'challenges'                : '/Club/Challenges/$',
	'challengesPool'            : '/Club/Challenges/default.aspx',
	'youthChallenges'           : '/Club/Challenges/YouthChallenges.aspx',
	'achievements'              : '/Club/Achievements/(Default.aspx|?|$)',
	'history'                   : '/Club/History/(Default.aspx|?|$)',
	'seriesHistory'             : '/World/Series/History.aspx',
	'teamEvents'                : '/Club/TeamEvents/(Default.aspx|?|$)',
	'arena'                     : '/Club/Arena/(Default.aspx|?|$)',
	'fans'                      : '/Club/Fans/(Default.aspx|?|$)',
	'coach'                     : '/Club/Training/ChangeCoach.aspx',
	'transfer'                  : '/Club/Transfers/(Default.aspx|?|$)',
	'transferCompare'           : '/Club/Transfers/TransferCompare.aspx',
	'transfersTeam'             : '/Club/Transfers/TransfersTeam.aspx',
	'transfersPlayer'           : '/Club/Transfers/TransfersPlayer.aspx',
	'transferSearchForm'        : '/World/Transfers/(Default.aspx|?|$)',
	'transferSearchResult'      : '/World/Transfers/TransfersSearchResult.aspx',
	'match'                     : '/Club/Matches/Match.aspx|/Club/Matches/PreMatch.aspx',
	'matches'                   : '/Club/Matches/(Default.aspx|?|$)|' +
	                              '/World/Matches/',
	'matchesArchive'            : '/Club/Matches/Archive.aspx|' +
	                              '/Club/Matches/YouthArchive.aspx',
	'matchStatus'               : '/Club/Matches/status.aspx',
	'matchesLatest'             : '/Club/Matches/LatestMatches.aspx',
	'matchesHistory'            : '/Club/Matches/history.aspx',
	'matchReferees'             : '/Club/Matches/Referees.aspx',
	'matchesLive'               : '/Club/Matches/Live.aspx',
	'matchOrder'                : '/MatchOrder/(Default.aspx|?|$)',
	'matchOrderSimple'          : '/MatchOrder/Simple.aspx',
	'flagCollection'            : '/Club/Flags/(Default.aspx|?|$)',
	'teamPage'                  : '/Club/(Default.aspx|?|$)',
	'oldSeries'                 : '/World/Series/OldSeries.aspx',
	'marathon'                  : '/World/Series/Marathon.aspx',
	'promotion'                 : '/World/Series/Promotion.aspx',
	'fixtures'                  : '/World/Series/Fixtures.aspx',
	'players'                   : '/Club/Players/(Default.aspx|?|$)|' +
	                              '/Club/NationalTeam/NTPlayers.aspx|' +
	                              '/Club/Players/Oldies.aspx|' +
	                              '/Club/Players/KeyPlayers.aspx',
	'ownPlayers'                : '/Club/Players/(Default.aspx$|$)|' +
	                              '/Club/Players/(Default.aspx?|?)teamid=[id]|' +
	                              '/Club/Players/KeyPlayers.aspx($|?teamid=[id])',
	                              // updated in core.js
	'seniorPlayers'             : '/Club/Players/(Default.aspx|?|$)',
	'ntPlayers'                 : '/Club/NationalTeam/NTPlayers.aspx',
	'oldPlayers'                : '/Club/Players/Oldies.aspx',
	'oldCoaches'                : '/Club/Players/Coaches.aspx',
	'youthPlayers'              : '/Club/Players/YouthPlayers.aspx',
	'ownYouthPlayers'           : '/Club/Players/YouthPlayers.aspx($|?YouthTeamId=[id])',
	                              // updated in core.js
	'keyPlayers'                : '/Club/Players/KeyPlayers.aspx',
	'ownKeyPlayers'             : '/Club/Players/KeyPlayers.aspx($|?teamid=[id])',
	                              // updated in core.js
	'playerHistory'             : '/Club/Players/PlayerHistory.aspx',
	'playerEvents'              : '/Club/Players/PlayerHistory.aspx?playerId=\\d+' +
	                              '&actionType=playerevents',
	'trainingEvents'            : '/Club/Players/PlayerHistory.aspx?playerId=\\d+' +
	                              '&actionType=trainingevents',
	'training'                  : '/Club/Training/(Default.aspx|?|$)',
	'trainingStats'             : '/Club/Training/Statistics.aspx',
	'youthTraining'             : '/Club/Training/YouthTraining.aspx',
	'teamEstimation'            : '/Club/Training/TeamEstimation.aspx',
	'playerEstimation'          : '/Club/Training/PlayerEstimation.aspx',
	'managerPage'               : '/Club/Manager/(Default.aspx|?|$)',
	'finances'                  : '/Club/Finances/(Default.aspx|?|$)',
	'youthOverview'             : '/Club/Youth/(Default.aspx|?|$)',
	'youthMatchList'            : '/Club/Matches/?TeamID=\\d+&YouthTeamId=\\d+$',
	'youthPlayerDetails'        : '/Club/Players/YouthPlayer.aspx',
	'youthFixtures'             : '/World/Series/YouthFixtures.aspx',
	'federation'                : '/Community/Federations/Federation.aspx',
	'newsLetter'                : '/Community/Federations/SendMessage.aspx',
	'mailNewsLetter'            : '/MyHattrick/Inbox/(Default.aspx?|?)actionType=newsLetter',
	'national'                  : '/Club/NationalTeam/NationalTeam.aspx',
	'guestbook'                 : '/Club/Manager/Guestbook.aspx',
	'announcements'             : '/Club/Announcements/New.aspx|' +
	                              '/Club/Announcements/Edit.aspx',
	'htPress'                   : '/Community/Press/(Default.aspx|?|$)',
	'cupMatches'                : '/World/Cup/CupMatches.aspx',
	'cupOverview'               : '/World/Cup/(Default.aspx|?|$)',
	'election'                  : '/World/Elections/(Default.aspx|?|$)',
	'denominations'             : '/Help/Rules/AppDenominations.aspx',
	'helpContact'               : '/Help/Contact.aspx',
	'statsBestGames'            : '/World/Stats/StatsBestgames.aspx',
	'statsTransfersBuyers'      : '/World/Stats/StatsTransfersBuyers.aspx',
	'statsTeams'                : '/World/Stats/StatsTeams.aspx',
	'statsPlayers'              : '/World/Stats/StatsPlayers.aspx',
	'statsSquad'                : '/World/Stats/StatsSquad.aspx',
	'statsRegions'              : '/World/Stats/StatsRegions.aspx',
	'statsNationalTeams'        : '/World/Stats/StatsNationalTeams.aspx',
	'statsConfs'                : '/World/Stats/StatsConfs.aspx',
	'statsBookmarks'            : '/World/Stats/StatsBookmarks.aspx',
	'statsArena'                : '/World/Stats/StatsArena.aspx',
	'statsMatchesHeadToHead'    : '/World/Stats/StatsMatchesHeadToHead.aspx',
	'statsSeries'               : '/World/Series/Stats.aspx',
	'statsTopPlayers'           : '/World/Players/TopPlayers.aspx',
	'supporters'                : '/Club/Supporters/(Default.aspx?|?)actionType=mysupporters',
	'supported'                 : '/Club/Supporters/(Default.aspx$|$)',
	'hallOfFame'                : '/Club/HallOfFame/(Default.aspx|?|$)',
	'hofPlayer'                 : '/Club/HallOfFame/Player.aspx',
	'search'                    : '/Search/(Default.aspx|?|$)',
	'playerStats'               : '/Club/Players/PlayerStats.aspx',
	'topScorers'                : '/World/Series/TopScorers.aspx',
	'tournaments'               : '/Community/Tournaments/Tournament.aspx',
	'tournamentsGeneric'        : '/Community/Tournaments/',
	'tournamentsOverview'       : '/Community/Tournaments/(Default.aspx|?|$)',
	'tournamentsGroups'         : '/Community/Tournaments/Groups.aspx',
	'tournamentsFixtures'       : '/Community/Tournaments/Fixtures.aspx',
	'tournamentsPlayerStatuses' : '/Community/Tournaments/PlayerStatuses.aspx',
	'tournamentsCreate'         : '/Community/Tournaments/CreateTournament.aspx',
	'tournamentsHistory'        : '/Community/Tournaments/TournamentHistory.aspx',
	                              // perhaps not identical to 'tournaments'
	'ladders'                   : '/World/Ladders/Ladder.aspx',
	'world'                     : '/World/(Default.aspx|?|$)',
	'reminders'                 : '/MyHattrick/Reminders/(Default.aspx|?|$)',
};

Foxtrick.pagesExcluded = {
	'offline'                   : '/down.aspx',
	'oath'                      : 'chpp.hattrick.org/',
	'error'                     : '/Errors/',
	'logout'                    : '/Logout.aspx'
};

Foxtrick.isPage = function(doc, page) {
	if (typeof Foxtrick.ht_pages[page] !== 'undefined')
		return Foxtrick.isPageHref(Foxtrick.ht_pages[page], doc.location.href);
	else {
		Foxtrick.log('Requesting unknown page', page);
		return false;
	}
};

Foxtrick.isPageHref = function(page, href) {
	var htpage_regexp = new RegExp(page.replace(/([.?])/g, '\\$1'), 'i');
	return htpage_regexp.test(href.replace(/#.*$/, ''));
};

Foxtrick.isOneOfPages = function(pages, doc) {
	if (pages instanceof Array) {
		for (var j = 0; j < pages.length; ++j) {
			if (Foxtrick.isPage(doc, pages[j]))
				return true;
		}
	}
	return false;
};

Foxtrick.isExcluded = function(doc) {
	var i;
	for (i in Foxtrick.pagesExcluded) {
		var excludeRe = new RegExp(Foxtrick.pagesExcluded[i], 'i');
		// page excluded, return
		if (doc.location.href.search(excludeRe) > -1)
			return true;
	}
	return false;
};
