'use strict';
/**
* ui.js
* UserInterfaces
* @author convincedd
*/

Foxtrick.modules.UI = {
	OUTSIDE_MAINBODY: true,
	CORE_MODULE: true,
	PAGES: ['all'],

	// called on browser load (from background context for sandboxed)
	onLoad: function(document) {},

	// gecko only
	onTabChange: function(document) {},

	// called with DomContentLoaded for Firefox
	// called with pageLoad request in background context for sandboxed)
	// all: called when en/disabling
	update: function(sender) {},
};



// browser specific implementations
if (Foxtrick.platform == 'Firefox') {

	// called after browser loaded , with browser chrome
	// as the argument
	// initializes items in menu bar and status bar
	Foxtrick.modules.UI.onLoad = function(document) {
		// toolbar menu - preferences
		var toolbarPreferences = document.getElementById('foxtrick-toolbar-preferences');
		toolbarPreferences.addEventListener('click', function() {
			Foxtrick.Prefs.show();
		}, false);
		// toolbar menu - disable
		var toolbarDisable = document.getElementById('foxtrick-toolbar-deactivate');
		toolbarDisable.addEventListener('click', function(ev) {
			Foxtrick.Prefs.disable();
		}, false);
		// toolbar menu - clearCache
		var clearCache = document.getElementById('foxtrick-toolbar-clearCache');
		clearCache.addEventListener('click', function() {
			Foxtrick.sessionDeleteBranch('');
			Foxtrick.localDeleteBranch('');
			//Foxtrick.util.api.clearCache();
		}, false);
		// toolbar menu - highlight
		var toolbarHighlight = document.getElementById('foxtrick-toolbar-highlight');
		toolbarHighlight.addEventListener('click', function(ev) {
			Foxtrick.Prefs.highlight();
		}, false);
		// toolbar menu - translationKeys
		var toolbarTranslationKeys = document.getElementById('foxtrick-toolbar-translationKeys');
		toolbarTranslationKeys.addEventListener('click', function(ev) {
			Foxtrick.Prefs.translationKeys(); // sets the pref and calls update()
		}, false);
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
		var toolbarPreferences = document.getElementById('foxtrick-toolbar-preferences');
		if (!toolbarPreferences)
			// wrong place somehow
			return;
		toolbarPreferences.setAttribute('label', Foxtrick.L10n.getString('toolbar.preferences'));
		// toolbar menu - disable
		var toolbarDisable = document.getElementById('foxtrick-toolbar-deactivate');
		toolbarDisable.setAttribute('label',
		                            Foxtrick.L10n.getString('toolbar.disableTemporary'));
		toolbarDisable.setAttribute('checked', Foxtrick.Prefs.getBool('disableTemporary'));
		// toolbar menu - clearCache
		var clearCache = document.getElementById('foxtrick-toolbar-clearCache');
		clearCache.setAttribute('label', Foxtrick.L10n.getString('api.clearCache'));
		// toolbar menu - highlight
		var toolbarHighlight = document.getElementById('foxtrick-toolbar-highlight');
		toolbarHighlight.setAttribute('label',
		                              Foxtrick.L10n.getString('toolbar.featureHighlight'));
		toolbarHighlight.setAttribute('checked', Foxtrick.Prefs.getBool('featureHighlight'));
		// toolbar menu - translationKeys
		var toolbarTranslationKeys = document.getElementById('foxtrick-toolbar-translationKeys');
		toolbarTranslationKeys.setAttribute('label',
		                                    Foxtrick.L10n.getString('toolbar.translationKeys'));
		toolbarTranslationKeys.setAttribute('checked', Foxtrick.Prefs.getBool('translationKeys'));
	};
	Foxtrick.modules.UI.updateIcon = function(chromeWindow) {
		var doc = chromeWindow.gBrowser.contentWindow.document;
		var button = chromeWindow.document.getElementById('foxtrick-toolbar-button');

		if (!button || !doc)
			return;

		var statusText;

		if (Foxtrick.Prefs.getBool('disableTemporary')) {
			// FoxTrick is disabled temporarily
			button.setAttribute('status', 'disabled');
			statusText = Foxtrick.L10n.getString('status.disabled');
		}
		else if ((Foxtrick.isHt(doc) || /^chrome:\/\/foxtrick/.test(doc.location.href)) &&
		         !(Foxtrick.Prefs.getBool('disableOnStage') && Foxtrick.isStage(doc))) {
			// FoxTrick is enabled, and active on current page
			button.setAttribute('status', 'active');
			statusText = Foxtrick.L10n.getString('status.active');
		}
		else {
			// FoxTrick is enabled, but not active on current page
			button.setAttribute('status', 'enabled');
			var hostname = '';
			try {
				// it's called twice in ff3.6 and works with one of the calls, thus display is fine
				// the other raises an error. dunno why and found no proper checks
				hostname = doc.location.hostname;
			}
			catch (e) {}
			statusText = Foxtrick.L10n.getString('status.enabled').replace('%s', hostname);
		}
		var tooltipText = Foxtrick.L10n.getString('toolbar.title') + ' ' + Foxtrick.version() +
			' ' + Foxtrick.branch() + ' (' + statusText + ')';
		button.setAttribute('tooltiptext', tooltipText);
	};
}


if (Foxtrick.platform == 'Chrome') {

	Foxtrick.modules.UI.onLoad = function() {
		chrome.pageAction.onClicked.addListener(function(tab) {
			Foxtrick.Prefs.disable(tab);
		});
	};

	Foxtrick.modules.UI.update = function(tab) {
		Foxtrick.modules.UI.updateIcon(tab);
	};

	Foxtrick.modules.UI.updateIcon = function(tab) {
		if (!tab || !tab.id)
			return;
		chrome.pageAction.show(tab.id);
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
			Foxtrick.version() + ' ' + Foxtrick.branch() + ' (' + statusText + ')';
		chrome.pageAction.setIcon({ tabId: tab.id, path: iconUrl });
		chrome.pageAction.setTitle({ tabId: tab.id, title: tooltipText });
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
