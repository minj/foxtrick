/**
 * const.js
 * Foxtrick constants
 * @author kolmis
 */

if (!Foxtrick) var Foxtrick={};

if (chrome) {
	Foxtrick.BuildFor = "Chrome";
	Foxtrick.ResourcePath = chrome.extension.getURL("") + "content/";
}
else {
	Foxtrick.BuildFor = "Gecko";
	Foxtrick.ResourcePath = "chrome://foxtrick/content/";
}

// List of categories
Foxtrick.moduleCategories = {
    MAIN : 'main',  // to be added manually to main tab

	SHORTCUTS_AND_TWEAKS : 'shortcuts_and_tweaks',
    PRESENTATION : 'presentation',
	MATCHES : 'matches',
    FORUM : 'forum',
    LINKS : 'links',
    ALERT : 'alert',

	// following are only used for html preferences
    CHANGES : 'changes',
    HELP : 'help',
    ABOUT : 'about'
};


// List of latestChangeCategories
Foxtrick.latestChangeCategories = {
    NEW : 'new',  // will appear in 'set new modules' list.
	FIX : 'fix'   // only appears in the 'show new modules' list (same if value not set at all)
};
