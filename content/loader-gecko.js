/*
 * loader-gecko.js
 * FoxTrick loader for Gecko platform
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};
Foxtrick.loader.gecko = {};

// invoked after the browser chrome is loaded
Foxtrick.loader.gecko.browserLoad = function(document) {
	// calls module.onLoad() after the browser window is loaded
	for (var i in Foxtrick.modules) {
		var module = Foxtrick.modules[i];
		if (typeof(module.onLoad) === "function") {
			try {
				module.onLoad(document);
			}
			catch (e) {
				Foxtrick.log("Error caught in module ", module.MODULE_NAME, ":", e);
			}
		}
	}

	var appcontent = document.getElementById("appcontent");
	if (appcontent) {
		// listen to page loads
		appcontent.addEventListener("DOMContentLoaded", Foxtrick.loader.gecko.docLoad, true);
		appcontent.addEventListener("unload", Foxtrick.loader.gecko.docUnload, true);

		// add listener to tab focus changes
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator = wm.getEnumerator("navigator:browser");
		var browserWin = browserEnumerator.getNext();
		var tabbrowser = browserWin.getBrowser();
		tabbrowser.tabContainer.onselect = Foxtrick.loader.gecko.tabFocus;
	}
};

// invoked when a tab is focused
Foxtrick.loader.gecko.tabFocus = function(ev) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		.getService(Components.interfaces.nsIWindowMediator);
	var browserEnumerator = wm.getEnumerator("navigator:browser");
	var browserWin = browserEnumerator.getNext();
	var tabbrowser = browserWin.getBrowser();
	var currentBrowser = tabbrowser.getBrowserAtIndex(ev.target.selectedIndex);
	var doc = currentBrowser.contentDocument;

	Foxtrick.entry.run(doc, true); // recheck css

	// calls module.onTabChange() after the tab focus is changed
	for (var i in Foxtrick.modules) {
		var module = Foxtrick.modules[i];
		if (typeof(module.onTabChange) === "function") {
			try {
				module.onTabChange(doc);
			}
			catch (e) {
				Foxtrick.log("Error caught in module ", module.MODULE_NAME, ": ", e);
			}
		}
	}
};

// invoked when an HTML document is loaded
Foxtrick.loader.gecko.docLoad = function(ev) {
	var doc = ev.originalTarget;
	if (doc.nodeName != "#document")
		return;

	if (Foxtrick.isHt(doc)) {
		// check if it's in exclude list
		for (var i in Foxtrick.pagesExcluded) {
			var excludeRe = new RegExp(Foxtrick.pagesExcluded[i], "i");
			// page excluded, return
			if (doc.location.href.search(excludeRe) > -1) {
				return;
			}
		}

		var begin = (new Date()).getTime();
		Foxtrick.entry.run(doc);
		var diff = (new Date()).getTime() - begin;
		Foxtrick.dump("run time: " + diff + " ms | " + doc.location.pathname+doc.location.search + '\n');
		// listen to page content changes
		var content = doc.getElementById("content");
		if (!content) {
			Foxtrick.log("Cannot find #content at ", doc.location);
			return;
		}
		Foxtrick.startListenToChange(doc);
	}
};

// invoked when an HTML document is unloaded
Foxtrick.loader.gecko.docUnload = function(ev) {
	// do nothing
};
