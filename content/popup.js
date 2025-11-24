'use strict';
/**
 * popup.js
 *
 * @author LA-MJ
 */

/* global chrome */

// jscs:disable disallowFunctionDeclarations

var Foxtrick = {
	strings: {}
};

function shutDown() {
	window.close();
}

function visitLink(e) {
	e.preventDefault();
	chrome.tabs.create({ url: this.href });
	window.close();
	return false;
}

function toggleEnabled() {
	var checked = document.getElementById('foxtrick-toolbar-deactivate').checked;
	chrome.runtime.sendMessage({ req: 'setValue', key: 'disableTemporary', value: checked, type: 'boolean' });
	window.close();
}

function toggleHighlight() {
	var checked = document.getElementById('foxtrick-toolbar-highlight').checked;
	chrome.runtime.sendMessage({ req: 'setValue', key: 'featureHighlight', value: checked, type: 'boolean' });
	window.close();
}

function toggleTranslationKeys() {
	var checked = document.getElementById('foxtrick-toolbar-translationKeys').checked;
	chrome.runtime.sendMessage({ req: 'setValue', key: 'translationKeys', value: checked, type: 'boolean' });
	window.close();
}

function clearCache() {
	chrome.runtime.sendMessage({ req: 'cacheClear' });
	window.close();
}

function openPrefs() {
	chrome.tabs.create({ url: 'content/preferences.html?width=700#tab=on_page' });
	window.close();
}

function init() {
	chrome.runtime.sendMessage({ req: 'getPopupData' }, function(response) {
		if (!response) {
			console.error('Failed to get popup data');
			return;
		}

		var prefs = response.prefs;
		var strings = response.strings;
		Foxtrick.strings = strings;

		var checkbox, label;
		checkbox = document.getElementById('foxtrick-toolbar-deactivate');
		checkbox.checked = prefs.disableTemporary;
		checkbox.addEventListener('click', toggleEnabled);

		checkbox = document.getElementById('foxtrick-toolbar-highlight');
		checkbox.checked = prefs.featureHighlight;
		checkbox.addEventListener('click', toggleHighlight);

		checkbox = document.getElementById('foxtrick-toolbar-translationKeys');
		checkbox.checked = prefs.translationKeys;
		checkbox.addEventListener('click', toggleTranslationKeys);

		document.getElementById('foxtrick-toolbar-deactivate-label').textContent =
			strings['toolbar.disableTemporary'];
		document.getElementById('foxtrick-toolbar-highlight-label').textContent =
			strings['toolbar.featureHighlight'];
		document.getElementById('foxtrick-toolbar-translationKeys-label').textContent =
			strings['toolbar.translationKeys'];

		label = document.getElementById('foxtrick-toolbar-options-label');
		label.textContent = strings['toolbar.preferences'];
		label.addEventListener('click', openPrefs);

		label = document.getElementById('foxtrick-toolbar-homepage-label');
		label.textContent = strings['link.homepage'];
		label.addEventListener('click', visitLink);

		label = document.getElementById('foxtrick-toolbar-contribute-label');
		// Simple text replacement for now, avoiding complex appendLink logic
		label.textContent = strings['changes.support'].replace(/<[^>]*>/g, ''); 
		label.addEventListener('click', visitLink);

		label = document.getElementById('foxtrick-toolbar-clearCache-label');
		label.textContent = strings['api.clearCache'];
		label.title = strings['api.clearCache.title'];
		label.addEventListener('click', clearCache);
	});
}

document.addEventListener('DOMContentLoaded', init);
