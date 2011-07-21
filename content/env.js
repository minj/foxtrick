/**
 * env.js
 * FoxTrick environment
 * @author FoxTrick developers
 */

if (!Foxtrick)
	var Foxtrick={};

if (typeof(chrome) === "object") {
	Foxtrick.BuildFor = "Chrome";
	Foxtrick.ResourcePath = chrome.extension.getURL("content/");
}
else {
	Foxtrick.BuildFor = "Gecko";
	Foxtrick.ResourcePath = "chrome://foxtrick/content/";
}

// to tell which context the chrome script is running at
// either background page, or content script
Foxtrick.chromeContext = function() {
	if (Foxtrick.BuildFor != "Chrome")
		return null;
	try {
		if (chrome.bookmarks) {
			return "background";
		}
		else {
			return "content";
		}
	}
	catch (e) {
		return "content";
	}
}

// List of categories
Foxtrick.moduleCategories = {
	INFORMATION_AGGREGATION : 'information_aggregation',
	SHORTCUTS_AND_TWEAKS : 'shortcuts_and_tweaks',
	PRESENTATION : 'presentation',
	MATCHES : 'matches',
	FORUM : 'forum',
	LINKS : 'links',
	ALERT : 'alert'
};
