'use strict';
/*
 * loader-firefox.js
 * Foxtrick loader for Firefox/Seamonkey
 *
 * @author convincedd, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line
if (!Foxtrick.loader)
	Foxtrick.loader = {};

Foxtrick.loader.firefox = {};

// invoked after the browser chrome is loaded
// variable *document* is predeclared and used here
// but refers to the browser chrome (XUL document)
Foxtrick.loader.firefox.browserLoad = function() {
	var LOADER = this; // jscs:ignore safeContextKeyword
	try {
		var appcontent = document.getElementById('appcontent');
		if (!appcontent)
			return;

		Foxtrick.entry.init();
		Foxtrick.Prefs.setBool('featureHighlight', false);
		Foxtrick.Prefs.setBool('translationKeys', false);

		// calls module.onLoad() after the browser window is loaded
		for (var m in Foxtrick.modules) {
			var module = Foxtrick.modules[m];
			if (typeof module.onLoad === 'function') {
				try {
					module.onLoad(document);
				}
				catch (e) {
					Foxtrick.log('Error caught in module', module.MODULE_NAME, ':', e);
				}
			}
		}

		// listen to page loads
		appcontent.addEventListener('DOMContentLoaded', LOADER.DOMContentLoaded);
		// listen to page unloads
		appcontent.addEventListener('unload', LOADER.docUnload);

		// add listener to tab focus changes
		var browserEnumerator = Services.wm.getEnumerator('navigator:browser');
		var browserWin = browserEnumerator.getNext();
		var tabBrowser = browserWin.getBrowser();
		tabBrowser.tabContainer.addEventListener('select', LOADER.tabFocus);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

Foxtrick.loader.firefox.browserUnLoad = function() {
	var LOADER = this; // jscs:ignore safeContextKeyword
	var appcontent = document.getElementById('appcontent');
	if (!appcontent)
		return;

	// remove listeners
	appcontent.removeEventListener('DOMContentLoaded', LOADER.DOMContentLoaded);
	appcontent.removeEventListener('unload', LOADER.docUnload);

	var browserEnumerator = Services.wm.getEnumerator('navigator:browser');
	var browserWin = browserEnumerator.getNext();
	var tabBrowser = browserWin.getBrowser();
	tabBrowser.tabContainer.removeEventListener('select', LOADER.tabFocus);

	Foxtrick.util.css.unload_module_css();

	// refresh ht pages
	Foxtrick.reloadAll();
};

// invoked when DOMContentLoaded
Foxtrick.loader.firefox.DOMContentLoaded = function(ev) {
	// don't run on frames
	var wn = ev.target.defaultView;
	if (wn.self !== wn.top)
		return;

	Foxtrick.modules.UI.update(ev.originalTarget);
	if (Foxtrick.isHt(ev.originalTarget))
		Foxtrick.entry.docLoad(ev.originalTarget);
};

// invoked when a tab is focused
Foxtrick.loader.firefox.tabFocus = function(ev) {
	try {
		// don't execute if disabled
		if (Foxtrick.Prefs.getBool('disableTemporary')) {
			// potential disable cleanup
			if (Foxtrick.entry.cssLoaded) {
				Foxtrick.util.css.unload_module_css();
				Foxtrick.entry.cssLoaded = false;
			}
			return;
		}

		var browserEnumerator = Services.wm.getEnumerator('navigator:browser');
		var browserWin = browserEnumerator.getNext();
		var tabBrowser = browserWin.getBrowser();
		var currentBrowser = tabBrowser.getBrowserAtIndex(ev.target.selectedIndex);
		var doc = currentBrowser.contentDocument;

		Foxtrick.log('tab focus:', ev.target.selectedIndex);

		// calls module.onTabChange() after the tab focus is changed.
		// also on not-ht pages for eg context-menu
		for (var m in Foxtrick.modules) {
			var module = Foxtrick.modules[m];
			if (typeof module.onTabChange === 'function') {
				try {
					module.onTabChange(doc);
				}
				catch (e) {
					Foxtrick.log('Error caught in module', module.MODULE_NAME, ':', e);
				}
			}
		}

		if (!Foxtrick.isHt(doc))
			return;

		Foxtrick.entry.checkCSS(doc);

		Foxtrick.log.flush(doc);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

// invoked when an HTML document is unloaded
Foxtrick.loader.firefox.docUnload = function() {
	// do nothing
};
