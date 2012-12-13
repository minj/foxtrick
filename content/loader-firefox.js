"use strict";
/*
 * loader-firefox.js
 * FoxTrick loader for Firefox/Seamonkey 
 */


if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};
if (!Foxtrick.loader.firefox)
	Foxtrick.loader.firefox = {};

// invoked after the browser chrome is loaded
// variable *document* is predeclared and used here but means the
// browser chrome (XUL document)
Foxtrick.loader.firefox.browserLoad = function() {
	try {
		var appcontent = document.getElementById("appcontent");
		if (appcontent) {
			Foxtrick.entry.init();
			FoxtrickPrefs.setBool("featureHighlight", false);
			FoxtrickPrefs.setBool("translationKeys", false);

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

			// listen to page loads
			appcontent.addEventListener("DOMContentLoaded", Foxtrick.loader.firefox.DOMContentLoaded, true);
			// listen to page unloads
			appcontent.addEventListener("unload", Foxtrick.loader.firefox.docUnload, true);

			// add listener to tab focus changes
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				.getService(Components.interfaces.nsIWindowMediator);
			var browserEnumerator = wm.getEnumerator("navigator:browser");
			var browserWin = browserEnumerator.getNext();
			var tabbrowser = browserWin.getBrowser();
			tabbrowser.tabContainer.addEventListener("select", Foxtrick.loader.firefox.tabFocus, true);
		}
	} catch(e) {
		Foxtrick.log(e);
	}
};

Foxtrick.loader.firefox.browserUnLoad = function() {
	var appcontent = document.getElementById("appcontent");
	if (appcontent) {
		// remove listeners
		appcontent.removeEventListener("DOMContentLoaded", Foxtrick.loader.firefox.DOMContentLoaded, true);
		appcontent.removeEventListener("unload", Foxtrick.loader.firefox.docUnload, true);
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator = wm.getEnumerator("navigator:browser");
		var browserWin = browserEnumerator.getNext();
		var tabbrowser = browserWin.getBrowser();
		tabbrowser.tabContainer.removeEventListener("select", Foxtrick.loader.firefox.tabFocus, true);
		
		Foxtrick.util.css.unload_module_css();
		
		// refresh ht pages
		Foxtrick.reloadAll();
	}
};

// invoked when DOMContentLoaded
Foxtrick.loader.firefox.DOMContentLoaded = function(ev) {
	// don't run frames
	var wn = ev.target.defaultView;
	if (wn.self != wn.top)
		return;
	
	Foxtrick.modules.UI.update(ev.originalTarget);
	if (Foxtrick.isHt(ev.originalTarget))
		Foxtrick.entry.docLoad(ev.originalTarget);
};

// invoked when a tab is focused
Foxtrick.loader.firefox.tabFocus = function(ev) {
	try {
		// don't execute if disabled
		if (FoxtrickPrefs.getBool("disableTemporary")) {
			// potenial disable cleanup
			if (Foxtrick.entry.cssLoaded) {
				Foxtrick.util.css.unload_module_css();
				Foxtrick.entry.cssLoaded = false;
			}
			return;
		}

		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator = wm.getEnumerator("navigator:browser");
		var browserWin = browserEnumerator.getNext();
		var tabbrowser = browserWin.getBrowser();
		var currentBrowser = tabbrowser.getBrowserAtIndex(ev.target.selectedIndex);
		var doc = currentBrowser.contentDocument;
		
		Foxtrick.log('tab focus: '+ ev.target.selectedIndex);
		// calls module.onTabChange() after the tab focus is changed. also on not-ht pages for eg context-menu
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

		if (!Foxtrick.isHt(doc))
			return;
			
		Foxtrick.entry.run(doc, true); // recheck css

		Foxtrick.log.flush(doc);
	} catch(e) {
		Foxtrick.log(e);
	}
};


// invoked when an HTML document is unloaded
Foxtrick.loader.firefox.docUnload = function(ev) {
	// do nothing
};
