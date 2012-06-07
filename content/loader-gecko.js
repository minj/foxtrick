"use strict";
/*
 * loader-gecko.js
 * FoxTrick loader for Gecko platform
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};
if (!Foxtrick.loader.gecko)
	Foxtrick.loader.gecko = {};

// invoked after the browser chrome is loaded
// variable *document* is predeclared and used here but means the
// browser chrome (XUL document)
Foxtrick.loader.gecko.browserLoad = function(ev) {
	try {
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

		var appcontent = document.getElementById("appcontent");
		if (appcontent) {
			// listen to page loads
			appcontent.addEventListener("DOMContentLoaded", function(ev) {
				// don't run frames
				var wn = ev.target.defaultView;
				if (wn.self != wn.top)
					return;
				
				Foxtrick.modules.UI.update();
				if (Foxtrick.isHt(ev.originalTarget))
					Foxtrick.entry.docLoad(ev.originalTarget);
			}, true);
			appcontent.addEventListener("unload", Foxtrick.loader.gecko.docUnload, true);

			// add listener to tab focus changes
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				.getService(Components.interfaces.nsIWindowMediator);
			var browserEnumerator = wm.getEnumerator("navigator:browser");
			var browserWin = browserEnumerator.getNext();
			var tabbrowser = browserWin.getBrowser();
			tabbrowser.tabContainer.onselect = Foxtrick.loader.gecko.tabFocus;
		}
	} catch(e) {
		Foxtrick.log(e);
	}
};

// invoked when a tab is focused
Foxtrick.loader.gecko.tabFocus = function(ev) {
	try {
		// don't execute if disabled
		if (FoxtrickPrefs.getBool("disableTemporary")) {
			// potenial disable cleanup
			if (Foxtrick.entry.cssLoaded) {
				Foxtrick.unload_module_css();
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
Foxtrick.loader.gecko.docUnload = function(ev) {
	// do nothing
};

// fennec tab load. starts the content instances for fennec (one per tab. persistant)
// this is the content side entry point for fennec
if (Foxtrick.platform == "Mobile") {
	Foxtrick.log('new tab load');
	sandboxed.extension.sendRequest({ req : "tabLoad" },
		function (data) {
			try {
				Foxtrick.entry.contentScriptInit(data);

				addEventListener("DOMContentLoaded", function(ev){
					try {
						Foxtrick.modules.UI.update();
						Foxtrick.entry.docLoad(ev.originalTarget);
					} catch(e) {
						Foxtrick.log(e);
					}
				}, false);
			} catch(e) {
				Foxtrick.log(e);
			}
		}
	);
}

