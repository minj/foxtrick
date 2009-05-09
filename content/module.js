/**
 * module.js
 * @author Mod-PaV
 * Tools allowing modules to register and listen for events,
 * such as particular page loads.
 */
////////////////////////////////////////////////////////////////////////////////
/** Hattrick pages that modules can run on.
 * Those values are simply taken from the hattrick URL, so when the current
 * url contains e.g. "Forum/Read" AND we are on hattrick, all the modules
 * registered to listen to "forumViewThread" will have their run() functions
 * called.
 * You can add new values here, just remember to escape slashes with
 * backslashes (as you can see below).
 */
Foxtrick.ht_pages = { 
    'all'                       : '',
    'playerdetail'              : '\/Club\/Players\/Player\.aspx',
    'myhattrick'                : '\/MyHattrick\/$',                        
    'forum'                     : '\/Forum\/',
    'forumViewThread'           : '\/Forum\/Read',
    'forumWritePost'            : '\/Forum\/Write',
    'messageWritePost'          : '\/MyHattrick\/Inbox/',
    'forumSettings'             : '\/MyHattrick\/Preferences\/ForumSettings.aspx',
	'prefSettings'              : '\/MyHattrick\/Preferences\/ProfileSettings.aspx',
	'bookmarks'                 : '\/MyHattrick\/Bookmarks',
    'league'                    : '\/World\/Series\/Default\.aspx',
    'youthleague'               : '\/World\/Series\/YouthSeries\.aspx',
    'country'                   : '\/World\/Leagues\/League\.aspx',
	'region'                   : '\/World\/Regions\/Region\.aspx',
	'challenges'                : '\/Club\/Challenges\/',
    'economy'                   : '\/Club\/Finances\/',
    'achievements'              : '\/Club\/Achievements\/',
    'history'                   : '\/Club\/History\/',
    'teamevents'                : '\/Club\/TeamEvents/',
    'youthoverview'             : '\/Club\/Youth\/Default\.aspx',
    'arena'                     : '\/Club\/Arena\/Default\.aspx',
    'staff'                     : '\/Club\/Staff',
    'fans'                      : '\/Club\/Fans',
    'coach'                     : '\/Club\/Training\/ChangeCoach\.aspx',
    'transfer'                  : '\/Club\/Transfers',
    'TransferCompare'           : '\/Club\/Transfers\/TransferCompare',
    'transfersTeam'             : '\/Club\/Transfers\/transfersTeam.aspx',
    'TransfersPlayer'           : '\/Club\/Transfers\/TransfersPlayer.aspx',
    'match'                     : '\/Club\/Matches\/Match.aspx',
    'matches'                   : '\/Club\/Matches\/.TeamID=|\/Club\/Matches\/$|\/Club/\Matches\/Default|\/World\/Matches\/$',
    'matchesarchiv'             : '\/Club\/Matches\/Archive.aspx|\/Club\/Matches\/YouthArchive',
    'matchesLatest'             : '\/Club\/Matches\/LatestMatches.aspx',
    'matcheshistory'            : '\/Club\/Matches\/history.aspx',
    'matchLineup'               : '\/Club\/Matches\/MatchLineup.aspx',
    'matchOrders'               : '\/MatchOrders\.aspx',
    'flagCollection'            : '\/Club\/Flags\/',
    'transferListSearchForm'    : '\/World\/Transfers\/',
    'transferListSearchResult'  : '\/World\/Transfers\/TransfersSearchResult.aspx',
    'teamPage'                  : '\/Club\/.TeamID=',
    'teamPageGeneral'           : '\/Club\/|\/World\/Series\/',
    'promotion'                 : '\/World\/Series\/Promotion\.aspx',
    'players'                   : '\/Club\/Players\/.TeamID=|\/Club\/Players\/default\.aspx.TeamID=|\/Club\/NationalTeam\/NTPlayers\.aspx|\/Club\/Players\/Oldies\.aspx|\/Club\/Players\/Coaches\.aspx',
    'YouthPlayers'              : 'YouthPlayers\.aspx',
    'YouthPlayer'               : 'YouthPlayer\.aspx',
    'training'                  : '\/Club\/Training\/',
	'YouthTraining'				: '\/Club\/Training\/YouthTraining\.aspx',
    'managerPage'               : '\/Club\/Manager\/',
    'finances'                  : '\/Club\/Finances/',
    'federation'                : '\/Community\/Federations\/Federation\.aspx',
    'national'                  : '\/Club\/NationalTeam\/NationalTeam\.aspx',
	'guestbook'					: '\/Club\/Manager\/Guestbook\.aspx',
    'announcements'					: '\/Club\/Announcements/\New.aspx',
    
	'all_late'					: '\/',
    
};
////////////////////////////////////////////////////////////////////////////////