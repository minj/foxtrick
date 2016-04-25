'use strict';
/**
 * popup.js
 *
 * @author LA-MJ
 */

/* global chrome */

// jscs:disable disallowFunctionDeclarations

var BackgroundPage, isChrome = false, Foxtrick;
if (typeof window.chrome == 'object') {
	BackgroundPage = chrome.extension.getBackgroundPage();
	isChrome = true;
	Foxtrick = BackgroundPage.Foxtrick;
}

function shutDown() {
	window.close();
}
function visitLink() {
	if (isChrome) {
		// jshint -W040
		chrome.tabs.create({ url: this.href });
		// jshint +W040

		window.close();

		return false;
	}

	shutDown();
}

function toggleEnabled() {
	var checked = document.getElementById('foxtrick-toolbar-deactivate').checked;
	Foxtrick.Prefs.setBool('disableTemporary', checked);
	window.close();
}
function toggleHighlight() {
	var checked = document.getElementById('foxtrick-toolbar-highlight').checked;
	Foxtrick.Prefs.setBool('featureHighlight', checked);
	window.close();
}
function toggleTranslationKeys() {
	var checked = document.getElementById('foxtrick-toolbar-translationKeys').checked;
	Foxtrick.Prefs.setBool('translationKeys', checked);
	window.close();
}

function clearCache() {
	Foxtrick.sessionDeleteBranch('');
	Foxtrick.localDeleteBranch('');
	Foxtrick.__promiseCache.clear();
	// Foxtrick.util.api.clearCache();
	window.close();
}

function openPrefs() {
	document.location.href = 'preferences.html?width=700#tab=on_page';
}

function init() {
	var checkbox, label;
	checkbox = document.getElementById('foxtrick-toolbar-deactivate');
	checkbox.checked = Foxtrick.Prefs.getBool('disableTemporary');
	checkbox.addEventListener('click', toggleEnabled);

	checkbox = document.getElementById('foxtrick-toolbar-highlight');
	checkbox.checked = Foxtrick.Prefs.getBool('featureHighlight');
	checkbox.addEventListener('click', toggleHighlight);

	checkbox = document.getElementById('foxtrick-toolbar-translationKeys');
	checkbox.checked = Foxtrick.Prefs.getBool('translationKeys');
	checkbox.addEventListener('click', toggleTranslationKeys);

	document.getElementById('foxtrick-toolbar-deactivate-label').textContent =
		Foxtrick.L10n.getString('toolbar.disableTemporary');
	document.getElementById('foxtrick-toolbar-highlight-label').textContent =
		Foxtrick.L10n.getString('toolbar.featureHighlight');
	document.getElementById('foxtrick-toolbar-translationKeys-label').textContent =
		Foxtrick.L10n.getString('toolbar.translationKeys');

	label = document.getElementById('foxtrick-toolbar-options-label');
	label.textContent = Foxtrick.L10n.getString('toolbar.preferences');
	label.addEventListener('click', openPrefs);

	label = document.getElementById('foxtrick-toolbar-homepage-label');
	label.textContent = Foxtrick.L10n.getString('link.homepage');
	label.addEventListener('click', visitLink);

	label = document.getElementById('foxtrick-toolbar-contribute-label');
	var temp = document.createElement('div');
	Foxtrick.L10n.appendLink('changes.support', temp, label.href);
	var link = temp.getElementsByTagName('a')[0];
	if (link) {
		label.textContent = link.textContent;
	}
	label.addEventListener('click', visitLink);

	label = document.getElementById('foxtrick-toolbar-clearCache-label');
	label.textContent = Foxtrick.L10n.getString('api.clearCache');
	label.title = Foxtrick.L10n.getString('api.clearCache.title');
	label.addEventListener('click', clearCache);
}

if (Foxtrick) {
	init();
}
