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
Foxtrick.ht_pages = { 'forum' : "\/Forum\/",
                      'forumViewThread' : '\/Forum\/Read',
                      'forumWritePost' : '\/Forum\/Write',
                      'bookmarks' : '\/MyHattrick\/Bookmarks',
                      'league' : '\/World\/Series\/Default\.aspx',
					  'country' : '\/World\/Leagues\/League\.aspx',
					  'challenges' : '\/Club\/Challenges\/',
					  'economy' : '\/Club\/Finances\/',
					  'youthoverview' : '\/Club\/Youth\/Default\.aspx',
					  'arena' : '\/Club\/Arena\/Default\.aspx',
					  'coach' : '\/Club\/Training\/ChangeCoach\.aspx',
					  'TransferCompare' : '\/Club\/Transfers\/TransferCompare',
                      'match' : '\/Club\/Matches\/Match.aspx',
                      'matchOrders' : '\/MatchOrders\.aspx',
                      'flagCollection' : '\/Club\/Flags\/',
                      'transferListSearchForm' : '\/World\/Transfers\/',
                      'matchLineup' : '\/Club\/Matches\/MatchLineup.aspx',
                      'YouthPlayers' : 'YouthPlayers\.aspx',
                      'YouthPlayer' : 'YouthPlayer\.aspx',
                      'forumSettings' : '\/MyHattrick\/Preferences\/ForumSettings.aspx',
					  'managerPage' : '\/Club\/Manager\/',
					  'teamPage' : '\/Club\/\\?TeamID',
					  'teamPageGeneral' : '\/Club\/',
					  'players' : '\/Club\/Players\/',
					  'playerdetail' : '\/Club\/Players\/Player\.aspx',
					  'finances' : '\/Club\/Finances/',
					  'all' : '\/',
};
////////////////////////////////////////////////////////////////////////////////

