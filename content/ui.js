/**
* ui.js
* UserInterfaces
* @author convincedd, LA-MJ
*/

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

Foxtrick.modules.UI = {
	OUTSIDE_MAINBODY: true,
	CORE_MODULE: true,
	PAGES: ['all'],

	// called on browser load (from background context for sandboxed)
	onLoad: function(document) {}, // jshint ignore:line

	// gecko only
	onTabChange: function(document) {}, // jshint ignore:line

	// called with DomContentLoaded for Firefox
	// called with pageLoad request in background context for sandboxed)
	// all: called when en/disabling
	update: function(sender) {}, // jshint ignore:line
};



// browser specific implementations
if (Foxtrick.platform == 'Firefox') {

	// called after browser loaded , with browser chrome
	// as the argument
	// initializes items in menu bar and status bar
	Foxtrick.modules.UI.onLoad = function(document) {
		// toolbar menu - preferences
		var toolPreferences = document.getElementById('foxtrick-toolbar-preferences');
		toolPreferences.addEventListener('click', function() {
			Foxtrick.Prefs.show();
		});

		// toolbar menu - disable
		var toolDisable = document.getElementById('foxtrick-toolbar-deactivate');
		toolDisable.addEventListener('click', function() {
			Foxtrick.Prefs.disable();
		});

		// toolbar menu - clearCache
		var toolCache = document.getElementById('foxtrick-toolbar-clearCache');
		toolCache.addEventListener('click', function() {
			Foxtrick.clearCaches();
		});

		// toolbar menu - highlight
		var toolHighlight = document.getElementById('foxtrick-toolbar-highlight');
		toolHighlight.addEventListener('click', function() {
			Foxtrick.Prefs.highlight();
		});

		// toolbar menu - translationKeys
		var toolTranslation = document.getElementById('foxtrick-toolbar-translationKeys');
		toolTranslation.addEventListener('click', function() {
			Foxtrick.Prefs.translationKeys(); // sets the pref and calls update()
		});

		Foxtrick.modules.UI._updateSingle(window);
	};
	Foxtrick.modules.UI.onTabChange = function() {
		Foxtrick.modules.UI._updateSingle(window);
	};
	Foxtrick.modules.UI._updateSingle = function(chromeWindow) {
		Foxtrick.modules.UI.updateIcon(chromeWindow);
		Foxtrick.modules.UI.updateMenu(chromeWindow);
	};
	Foxtrick.modules.UI.update = function() {
		var browserEnumerator = Services.wm.getEnumerator('navigator:browser');

		while (browserEnumerator.hasMoreElements()) {
			var browserWin = browserEnumerator.getNext();
			Foxtrick.modules.UI._updateSingle(browserWin);
		}
	};

	Foxtrick.modules.UI.updateMenu = function(chromeWindow) {
		var document = chromeWindow.document;
		// toolbar menu - preferences
		var toolPreferences = document.getElementById('foxtrick-toolbar-preferences');
		if (!toolPreferences) {
			// should not run here
			return;
		}
		toolPreferences.setAttribute('label', Foxtrick.L10n.getString('toolbar.preferences'));

		// toolbar menu - disable
		var toolDisable = document.getElementById('foxtrick-toolbar-deactivate');
		toolDisable.setAttribute('label', Foxtrick.L10n.getString('toolbar.disableTemporary'));
		toolDisable.setAttribute('checked', Foxtrick.Prefs.getBool('disableTemporary'));

		// toolbar menu - clearCache
		var toolCache = document.getElementById('foxtrick-toolbar-clearCache');
		toolCache.setAttribute('label', Foxtrick.L10n.getString('api.clearCache'));

		// toolbar menu - highlight
		var toolHighlight = document.getElementById('foxtrick-toolbar-highlight');
		toolHighlight.setAttribute('label', Foxtrick.L10n.getString('toolbar.featureHighlight'));
		toolHighlight.setAttribute('checked', Foxtrick.Prefs.getBool('featureHighlight'));

		// toolbar menu - translationKeys
		var toolTranslation = document.getElementById('foxtrick-toolbar-translationKeys');
		toolTranslation.setAttribute('label', Foxtrick.L10n.getString('toolbar.translationKeys'));
		toolTranslation.setAttribute('checked', Foxtrick.Prefs.getBool('translationKeys'));
	};
	Foxtrick.modules.UI.updateIcon = function(chromeWindow) {
		var doc = chromeWindow.gBrowser.contentWindow.document;
		var button = chromeWindow.document.getElementById('foxtrick-toolbar-button');

		if (!button || !doc)
			return;

		var statusText;

		if (Foxtrick.Prefs.getBool('disableTemporary')) {
			// Foxtrick is disabled temporarily
			button.setAttribute('status', 'disabled');

			statusText = Foxtrick.L10n.getString('status.disabled');
		}
		else if (/^chrome:\/\/foxtrick/.test(doc.location.href) ||
		         Foxtrick.Prefs.isEnabled(doc)) {
			// Foxtrick is enabled, and active on current page
			button.setAttribute('status', 'active');

			statusText = Foxtrick.L10n.getString('status.active');
		}
		else {
			// Foxtrick is enabled, but not active on current page
			button.setAttribute('status', 'enabled');

			var hostname = doc.location.hostname;
			statusText = Foxtrick.L10n.getString('status.enabled').replace('%s', hostname);
		}

		var args = {
			title: Foxtrick.L10n.getString('toolbar.title'),
			version: Foxtrick.version,
			branch: Foxtrick.branch,
			status: statusText,
		};
		var tooltipText = Foxtrick.format('{title} {version} {branch} ({status})', args);

		button.setAttribute('tooltiptext', tooltipText);
	};
}


if (Foxtrick.platform == 'Chrome') {

	Foxtrick.modules.UI.onLoad = function() {
		// MV3: Use chrome.action instead of chrome.pageAction
		chrome.action.onClicked.addListener(function(tab) {
			Foxtrick.Prefs.disable(tab); // in case pop-up is disabled
		});
	};

	Foxtrick.modules.UI.update = function(tab) {
		try {
			Foxtrick.modules.UI.updateIcon(tab);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	};

	Foxtrick.modules.UI.updateIcon = function(tab) {
		if (!tab || !tab.id)
			return;

		// MV3: chrome.action doesn't require show() - it's always visible
		// chrome.action.show(tab.id); // Not needed in MV3

		var iconUrl = '', statusText = '';
		if (Foxtrick.Prefs.getBool('disableTemporary')) {
			iconUrl = '../skin/disabled-24.png';
			statusText = Foxtrick.L10n.getString('status.disabled');
		}
		else {
			iconUrl = '../skin/icon-24.png';
			statusText = Foxtrick.L10n.getString('status.active');
		}
		var tooltipText = Foxtrick.L10n.getString('toolbar.title') + ' ' +
			Foxtrick.version + ' ' + Foxtrick.branch + ' (' + statusText + ')';

		if (chrome.action.setIcon)
			chrome.action.setIcon({ tabId: tab.id, path: iconUrl });
		if (chrome.action.setTitle)
			chrome.action.setTitle({ tabId: tab.id, title: tooltipText });
	};
}


else if (Foxtrick.platform == 'Safari') {

	Foxtrick.modules.UI.onLoad = function() {
		// Open Options page upon settings checkbox click.
		safari.extension.settings.openFoxtrickOptions = false;
		safari.extension.settings.addEventListener('change', function(e) {
			if (e.key == 'openFoxtrickOptions')
				Foxtrick.SB.tabs.create({ url: Foxtrick.InternalPath + 'preferences.html' });
		}, false);
	};
}


// else if (Foxtrick.platform == 'Android') {
// }
