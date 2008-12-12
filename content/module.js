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
                      'forumWritePost' : '\/Forum\/Write'
                    };
////////////////////////////////////////////////////////////////////////////////

