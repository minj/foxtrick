/**
 * const.js
 * Foxtrick constants
 * @author FoxTrick developers
 */

if (!Foxtrick) var Foxtrick={};

if (typeof(chrome) === "object") {
	Foxtrick.BuildFor = "Chrome";
	Foxtrick.ResourcePath = chrome.extension.getURL("") + "content/";
}
else {
	Foxtrick.BuildFor = "Gecko";
	Foxtrick.ResourcePath = "chrome://foxtrick/content/";
}

// List of categories
Foxtrick.moduleCategories = {
	MAIN : 'main', // to be added manually to main tab
	SHORTCUTS_AND_TWEAKS : 'shortcuts_and_tweaks',
	PRESENTATION : 'presentation',
	MATCHES : 'matches',
	FORUM : 'forum',
	LINKS : 'links',
	ALERT : 'alert'
};
