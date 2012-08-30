"use strict";
/**
 * pages.js
 * @author FoxTrick developers
 *
 * This is a list of Hattrick pages that modules can run on.
 * Those values are simply taken from the hattrick URL, so when the current
 * url contains e.g. "Forum/Read" AND we are on hattrick, all the modules
 * registered to listen to "forumViewThread" will have their run() functions
 * called.
 *
 * You can add new values here, but make sure your NEWLY added pages have names
 * in camelCase (it'd be hard to modify existing non-camelCase names), using the
 * name similar to the URI, and escape the URI correctly.
 * Use '\\' to escape (double backslash for escaping backslash itself).
 * '.' and '?' will be escaped automatically.
 */

if (!Foxtrick) var Foxtrick={};

Foxtrick.ht_pages = {
	// following are mainly used for information gathering. keep on top
	'myhattrick'				: '/MyHattrick/$',  // that's the news page
	'myhattrickAll' 			: '/MyHattrick/|org/$|pl/$|ws/$',
	'teamPageAny'   			: '/Club/|/World/Series/Default.aspx',

	'all'   					: '.*',
	'dashboard' 				: '/MyHattrick/Dashboard.aspx',
	'playerdetail'  			: '/Club/Players/Player.aspx',
	'forum' 					: '/Forum/',
	'forumViewThread'   		: '/Forum/Read',
	'forumOverView' 			: '/Forum/Overview',
	'forumDefault'  			: '/Forum/Default',
	'forumWritePost'			: '/Forum/Write',
	'forumModWritePost' 		: '/Forum/Functions',
	'messageWritePost'  		: '/MyHattrick/Inbox/Default.aspx?actionType=newMail|/MyHattrick/Inbox/Default.aspx?actionType=readMail',
	'ticket'					: '/MyHattrick/Inbox/Default.aspx?actionType=viewInfoTicket',
	'forumSettings' 			: '/MyHattrick/Preferences/ForumSettings.aspx',
	'prefSettings'  			: '/MyHattrick/Preferences/ProfileSettings.aspx',
	'bookmarks' 				: '/MyHattrick/Bookmarks',
	'series'					: '/World/Series/Default.aspx',
	'youthSeries'   			: '/World/Series/YouthSeries.aspx',
	'nextSeries'				: '/World/Series/NextSeason.aspx',
	'country'   				: '/World/Leagues/League.aspx',
	'region'						: '/World/Regions/Region.aspx',
	'regionOverview'			: '/World/Regions/?LeagueID=',
	'challenges'				: '/Club/Challenges/$',
	'challengesPool'			: '/Club/Challenges/default\.aspx',
	'youthchallenges'   		: '/Club/Challenges/YouthChallenges',
	'achievements'  			: '/Club/Achievements/',
	'history'   				: '/Club/History/',
	'seriesHistory' 			: '/World/Series/History',
	'teamevents'				: '/Club/TeamEvents/',
	'arena' 					: '/Club/Arena/Default.aspx',
	'staff' 					: '/Club/Staff',
	'fans'  					: '/Club/Fans',
	'coach' 					: '/Club/Training/ChangeCoach.aspx',
	'transfer'  				: '/Club/Transfers/$|/Club/Transfers/Default.aspx',
	'transferCompare'   		: '/Club/Transfers/TransferCompare',
	'transfersTeam' 			: '/Club/Transfers/TransfersTeam.aspx',
	'transfersPlayer'   		: '/Club/Transfers/TransfersPlayer.aspx',
	'transferSearchForm'		: '/World/Transfers/$|/World/Transfers/default.aspx',
	'transferSearchResult'  	: '/World/Transfers/TransfersSearchResult.aspx',
	'match' 					: '/Club/Matches/Match.aspx',
	'matchOld' 					: '/Club/Matches/MatchOld.aspx',
	'matches'   				: '/Club/Matches/?TeamID=|/Club/Matches/$|/Club/Matches/Default|/World/Matches/$',
	'matchesarchiv' 			: '/Club/Matches/Archive.aspx|/Club/Matches/YouthArchive',
	'matchesLatest' 			: '/Club/Matches/LatestMatches.aspx',
	'matcheshistory'			: '/Club/Matches/history.aspx',
	'matchLineup'   			: '/Club/Matches/MatchLineup.aspx',
	'matchesLive'   			: '/Club/Matches/Live.aspx',
	'matchOrder'				: '/MatchOrder/\?|/MatchOrder/Default.aspx\?',
	'matchOrderSimple'  		: '/MatchOrder/Simple.aspx\?',
	'flagCollection'			: '/Club/Flags/',
	'teamPage'  				: '/Club/$|/Club/?TeamID=|/Club/default.aspx',
	'teamPageBrowser'   		: '/Club/default.aspx',
	'teamPageGeneral'   		: '/Club/',
	'oldseries' 				: '/World/Series/OldSeries.aspx',
	'marathon'  				: '/World/Series/Marathon.aspx',
	'promotion' 				: '/World/Series/Promotion.aspx',
	'fixtures'					: '/World/Series/Fixtures.aspx',
	'players'					: '/Club/Players/$|/Club/Players/default.aspx|/Club/Players/\?|/Club/Players/?TeamID=|/Club/NationalTeam/NTPlayers.aspx|/Club/Players/Oldies.aspx|/Club/Players/KeyPlayers.aspx',
	'ownPlayers'				: '/Club/Players/$|/Club/Players/default.aspx|/Club/Players/KeyPlayers.aspx$', // updated in core.js
	'SeniorPlayers'				: '/Club/Players/$|/Club/Players/\?|/Club/Players/?TeamID=|/Club/Players/default.aspx',
	'NTPlayers'					: '/Club/NationalTeam/NTPlayers.aspx',
	'oldplayers'				: '/Club/Players/Oldies.aspx',
	'oldcoaches'				: '/Club/Players/Coaches.aspx',
	'YouthPlayers'  			: 'YouthPlayers.aspx',
	'ownYouthPlayers'			: 'YouthPlayers.aspx$', // updated in core.js
	'keyPlayers'				: '/Club/Players/KeyPlayers.aspx',
	'ownKeyPlayers'				: '/Club/Players/KeyPlayers.aspx$', // updated in core.js
	'PlayerHistory'				: '/Club/Players/PlayerHistory.aspx',
	'playerevents'				: '/Club/Players/PlayerHistory.aspx?playerId=\\d+&actionType=playerevents',
	'trainingevents'			: '/Club/Players/PlayerHistory.aspx?playerId=\\d+&actionType=trainingevents',
	'training'  				: '/Club/Training/$',
	'trainingStats' 			: '/Club/Training/Statistics.aspx',
	'YouthTraining' 			: '/Club/Training/YouthTraining.aspx',
	'managerPage'   			: '/Club/Manager/?userId=|/Club/Manager/?teamId=',
	'finances'  				: '/Club/Finances/$|/Club/Finances/Default.aspx',
	'YouthPlayer'   			: 'YouthPlayer.aspx',
	'youthoverview' 			: '/Club/Youth/Default.aspx',
	'YouthMatchlist'			: '/Club/Matches/?TeamID=\\d+&YouthTeamId=\\d+$',
	'youthplayerdetail' 		: '/Club/Players/YouthPlayer.aspx',
	'youthFixtures' 			: '/World/Series/YouthFixtures.aspx',
	'federation'				: '/Community/Federations/Federation.aspx',
	'newsletter'				: '/Community/Federations/SendMessage.aspx',
	'mailnewsletter'			: '/MyHattrick/Inbox/Default.aspx?actionType=newsLetter',
	'national'  				: '/Club/NationalTeam/NationalTeam.aspx',
	'guestbook' 				: '/Club/Manager/Guestbook.aspx',
	'announcements' 			: '/Club/Announcements/New.aspx|/Club/Announcements/Edit.aspx',
	'htpress'   				: '/Community/Press/Default.aspx',
	'cupmatches'				: '/World/Cup/CupMatches.aspx',
	'cupoverview'   			: '/World/Cup/?CupID=',
	'election'  				: '/World/Elections/Default.aspx|World/Elections/$',
	'denominations' 			: '/Help/Rules/AppDenominations.aspx',
	'help_contact'  			: '/Help/Contact.aspx',
	'statsBestgames'			: '/World/Stats/StatsBestgames.aspx',
	'statsTransfersBuyers'  	: '/World/Stats/StatsTransfersBuyers.aspx',
	'statsTeams'				: '/World/Stats/StatsTeams.aspx',
	'statsPlayers'  			: '/World/Stats/StatsPlayers.aspx',
	'StatsSquad'				: '/World/Stats/StatsSquad.aspx',
	'statsRegions'  			: '/World/Stats/StatsRegions.aspx',
	'statsNationalTeams'		: '/World/Stats/StatsNationalTeams.aspx',
	'statsConfs'				: '/World/Stats/StatsConfs.aspx',
	'statsBookmarks'			: '/World/Stats/StatsBookmarks.aspx',
	'statsArena'				: '/World/Stats/StatsArena.aspx',
	'statsMatchesHeadToHead'	: '/World/Stats/StatsMatchesHeadToHead.aspx',
	'statsSeries'   			: '/World/Series/Stats.aspx',
	'statsTopPlayers'   		: '/World/Players/TopPlayers.aspx',
	'press' 					: '/Community/Press/',
	'hallOfFame'				: '/Club/HallOfFame/',
	'search'					: '/Search/|/Search/Default.aspx',
	'playerStats'				: '/Club/Players/PlayerStats.aspx',
	'Tournaments'				: '/Community/Tournaments/Tournament.aspx',
	'TournamentsFixtures'		: '/Community/Tournaments/Fixtures.aspx',
	'TournamentsPlayerStatuses'	: '/Community/Tournaments/PlayerStatuses.aspx',
	'world'						: '/World/$'
};

Foxtrick.pagesExcluded = {
	"offline"   				: "down.aspx",
	"oath"						: "chpp.hattrick.org/",
	"error"						: "/Errors",
	"logout"					: "Logout.aspx"
};

Foxtrick.isPage = function(page, doc) {
	if (Foxtrick.ht_pages[page])
		return Foxtrick.isPageHref(Foxtrick.ht_pages[page], doc.location.href);
	else
		return false;
};

Foxtrick.isOneOfPages = function(pages, doc) {
	if ( pages instanceof Array ) {
		for (var j = 0; j < pages.length; ++j) {
			if (Foxtrick.isPage(pages[j], doc))
				return true;
		}
	}
	return false;
};

Foxtrick.isExcluded = function(doc) {
	for (var i in Foxtrick.pagesExcluded) {
		var excludeRe = new RegExp(Foxtrick.pagesExcluded[i], "i");
		// page excluded, return
		if (doc.location.href.search(excludeRe) > -1)
			return true;
	}
	return false;
};
