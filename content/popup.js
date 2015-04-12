'use strict';
function shutDown() {
	window.close();
}
function init()
{
	var checkbox, label;
	checkbox = document.getElementById('foxtrick-toolbar-deactivate');
	checkbox.checked = BackgroundPage.Foxtrick.Prefs.getBool('disableTemporary');
	checkbox.addEventListener('click', toggleEnabled);

	checkbox = document.getElementById('foxtrick-toolbar-highlight');
	checkbox.checked = BackgroundPage.Foxtrick.Prefs.getBool('featureHighlight');
	checkbox.addEventListener('click', toggleHighlight);

	checkbox = document.getElementById('foxtrick-toolbar-translationKeys');
	checkbox.checked = BackgroundPage.Foxtrick.Prefs.getBool('translationKeys');
	checkbox.addEventListener('click', toggleTranslationKeys);

	document.getElementById('foxtrick-toolbar-deactivate-label').textContent =
		BackgroundPage.Foxtrick.L10n.getString('toolbar.disableTemporary');
	document.getElementById('foxtrick-toolbar-highlight-label').textContent =
		BackgroundPage.Foxtrick.L10n.getString('toolbar.featureHighlight');
	document.getElementById('foxtrick-toolbar-translationKeys-label').textContent =
		BackgroundPage.Foxtrick.L10n.getString('toolbar.translationKeys');

	label = document.getElementById('foxtrick-toolbar-options-label');
	label.textContent = BackgroundPage.Foxtrick.L10n.getString('toolbar.preferences');
	label.addEventListener('click', openPrefs);

	label = document.getElementById('foxtrick-toolbar-homepage-label');
	label.textContent = BackgroundPage.Foxtrick.L10n.getString('link.homepage');
	label.addEventListener('click', visitLink);

	label = document.getElementById('foxtrick-toolbar-contribute-label');
	var temp = document.createElement('div');
	BackgroundPage.Foxtrick.L10n.appendLink('changes.support', temp, label.href);
	var link = temp.getElementsByTagName('a')[0];
	if (link) {
		label.textContent = link.textContent;
	}
	label.addEventListener('click', visitLink);

	label = document.getElementById('foxtrick-toolbar-clearCache-label');
	label.textContent = BackgroundPage.Foxtrick.L10n.getString('api.clearCache');
	label.title = BackgroundPage.Foxtrick.L10n.getString('api.clearCache.title');
	label.addEventListener('click', clearCache);
}

function toggleEnabled()
{
	var checked = document.getElementById('foxtrick-toolbar-deactivate').checked;
	BackgroundPage.Foxtrick.Prefs.setBool('disableTemporary', checked);
	window.close();
}

function toggleHighlight()
{
	var checked = document.getElementById('foxtrick-toolbar-highlight').checked;
	BackgroundPage.Foxtrick.Prefs.setBool('featureHighlight', checked);
	window.close();
}

function toggleTranslationKeys()
{
	var checked = document.getElementById('foxtrick-toolbar-translationKeys').checked;
	BackgroundPage.Foxtrick.Prefs.setBool('translationKeys', checked);
	window.close();
}

function clearCache()
{
	BackgroundPage.Foxtrick.sessionDeleteBranch('');
	BackgroundPage.Foxtrick.localDeleteBranch('');
	//BackgroundPage.Foxtrick.util.api.clearCache();
	window.close();
}
function openPrefs()
{
	document.location.href = 'preferences.html?width=600';
}
function visitLink()
{
	if (isChrome) {
		chrome.tabs.create({ 'url': this.href });
		window.close();
		return false;
	}
	shutDown();
}
var BackgroundPage, isChrome = false;
if (typeof window.chrome == 'object') {
	BackgroundPage = chrome.extension.getBackgroundPage();
	isChrome = true;
}
if (BackgroundPage)
	init();
