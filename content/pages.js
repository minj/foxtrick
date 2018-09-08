'use strict';
/**
 * pages.js
 *
 * This is a list of Hattrick pages that modules can run on.
 * These values are simply taken from the Hattrick URLs.
 *
 * E.g. when the current URL contains 'Forum/Read' AND we are on HT,
 * all the modules containing a reference to 'forumViewThread'
 * will have their run() functions called.
 *
 * You can add new values here but make sure to follow camelCase standard.
 * Use a name similar to the URI and escape the URI correctly:
 * 1) '.' and '?' will be escaped automatically when creating RegExp,
 *    consequently it is not possible to use their special meaning;
 * 2) Use '\\' to escape other characters;
 * 3) '\\\\' for backslash itself.
 *
 * @author Foxtrick developers
 */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line

// jscs:disable disallowSpaceAfterObjectKeys, disallowQuotedKeysInObjects
// jscs:disable disallowMultipleSpaces
Foxtrick.htPages = {
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
	'forumSettings'             : '/Forum/ForumUserPreferences.aspx|' +
	                              '/MyHattrick/Preferences/ForumSettings.aspx',
	'prefSettings'              : '/MyHattrick/Preferences/ProfileSettings.aspx',
	'bookmarks'                 : '/MyHattrick/Bookmarks/(Default.aspx|?|$)',
	'series'                    : '/World/Series/(Default.aspx|?|$)',
	'youthSeries'               : '/World/Series/YouthSeries.aspx',
	'nextSeries'                : '/World/Series/NextSeason.aspx',
	'country'                   : '/World/Leagues/League.aspx',
	'region'                    : '/World/Regions/Region.aspx',
	'regionOverview'            : '/World/Regions/(Default.aspx|?|$)',
	'challenges'                : '/Club/Challenges/(Default.aspx|?|$)',
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
	'matches'                   : '/Club/Matches/(Default.aspx|?|$)',
	'matchesCup'                : '/Club/Cup/(Default.aspx|?|$)',
	'worldMatches'              : '/World/Matches/',
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
	'allPlayers'                : '/Club/Players/(Default.aspx|?|$)|' +
	                              '/Club/Players/KeyPlayers.aspx|' +
	                              '/Club/NationalTeam/NTPlayers.aspx|' +
	                              '/Club/Players/Oldies.aspx|' +
	                              '/Club/Players/Coaches.aspx',
	                              // all senior player pages
	'players'                   : '/Club/Players/(Default.aspx|?|$)|' +
	                              '/Club/Players/KeyPlayers.aspx',
	                              // has last match link and ratings
	                              // KeyPlayers have basically the same structure as regular page
	'ownPlayers'                : 'FakePage',
	                              // has visible skills
	                              // KeyPlayers have basically the same structure as regular page
	                              // updated in core.js so you cannot rely on it in PAGES
	                              // use 'players' and 'ntPlayers' instead
	'ownPlayersTemplate'        : '/Club/Players/(Default.aspx$|$)|' +
	                              '/Club/Players/(Default.aspx?|?)teamid=[id]|' +
	                              '/Club/Players/KeyPlayers.aspx($|?teamid=[id])|' +
	                              '/Club/NationalTeam/NTPlayers.aspx?teamId=[ntid]',
	                              // README: don't use this! The correct value is 'ownPlayers'
	'keyPlayers'                : '/Club/Players/KeyPlayers.aspx',
	'oldPlayers'                : '/Club/Players/Oldies.aspx',
	'oldCoaches'                : '/Club/Players/Coaches.aspx',
	'ntPlayers'                 : '/Club/NationalTeam/NTPlayers.aspx',
	'youthPlayers'              : '/Club/Players/YouthPlayers.aspx',
	'ownYouthPlayers'           : 'FakePage',
	                              // updated in core.js so you cannot rely on it in PAGES
	                              // use 'youthPlayers' instead
	'ownYouthPlayersTemplate'   : '/Club/Players/YouthPlayers.aspx($|?YouthTeamId=[id])',
	                              // README: don't use this! The correct value is 'ownYouthPlayers'
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
	'ntNewsLetter'              : '/Club/NationalTeam/NTNotice.aspx',
	'national'                  : '/Club/NationalTeam/NationalTeam.aspx',
	'guestbook'                 : '/Club/Manager/Guestbook.aspx',
	'announcementsView'         : '/Club/Announcements/(Default.aspx?|?)',
	'announcementsWrite'        : '/Club/Announcements/(New|Edit).aspx',
	'htPress'                   : '/Community/Press/(Default.aspx|?|$)',
	'cupMatches'                : '/World/Cup/CupMatches.aspx',
	'cupOverview'               : '/World/Cup/(Default.aspx|?|$)',
	'election'                  : '/World/Elections/(Default.aspx|?|$)',
	'worldCup'                  : '/World/WorldCup/',
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
	'statsTopYouthPlayers'      : '/World/Players/TopYouthPlayers.aspx',
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
	'logout'                    : '/Logout.aspx',
};
// jscs:enable disallowSpaceAfterObjectKeys, disallowQuotedKeysInObjects
// jscs:enable disallowMultipleSpaces

/**
 * Test whether document belongs to certain page type(s)
 * page may be Array.<string>
 *
 * @param  {document}     doc
 * @param  {string|array} page
 * @return {Boolean}
 */
Foxtrick.isPage = function(doc, page) {
	if (Array.isArray(page)) {
		return Foxtrick.any(function(p) {
			return Foxtrick.isPage(doc, p);
		}, page);
	}

	if (typeof Foxtrick.htPages[page] !== 'undefined') {
		return Foxtrick.isPageHref(doc.location.href, Foxtrick.htPages[page]);
	}
	else {
		Foxtrick.error('Requesting unknown page: ' + page);
		return false;
	}
};

/**
 * Form a regular expression from page spec
 * @param  {string} reStr page spec
 * @return {RegExp}
 */
Foxtrick.makePageRe = function(reStr) {
	return new RegExp(reStr.replace(/([.?])/g, '\\$1'), 'i');
};

/**
 * Test whether URL belongs to a certain page type
 * @param  {string}  href
 * @param  {string}  reStr
 * @return {Boolean}
 */
Foxtrick.isPageHref = function(href, reStr) {
	var pageRe = this.makePageRe(reStr);
	return pageRe.test(href.replace(/#.*$/, ''));
};

/**
 * Test whether Foxtrick should not run on this document
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.isExcluded = function(doc) {
	for (var i in this.pagesExcluded) {
		var pageRe = this.pagesExcluded[i];
		if (this.isPageHref(doc.location.href, pageRe)) {
			// page excluded, return
			return true;
		}
	}
	return false;
};
