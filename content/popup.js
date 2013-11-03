// custom function to bypass opera's stupidity
function shutDown() {
	if (isOpera) {
		window.setTimeout(window.close, 100); // go to async mode for click event to complete
	}
	else window.close();
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
	label.addEventListener('click', visitHomePage);

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
	if (isOpera) {
		BackgroundPage.Foxtrick.modules.UI.button.popup.width = 600;
		BackgroundPage.Foxtrick.modules.UI.button.popup.height = 800;
		document.location.href = 'options.html?width=600';
	}
	else document.location.href = 'preferences.html?width=600';
}
function visitHomePage()
{
	if (isChrome) {
		chrome.tabs.create({ 'url': 'http://code.google.com/p/foxtrick/' });
		window.close();
		return false;
	}
	shutDown();
}
var BackgroundPage, isOpera = false, isChrome = false;
if (typeof window.opera == 'object') {
		BackgroundPage = opera.extension.bgProcess;
		isOpera = true;
}
else if (typeof window.chrome == 'object') {
		BackgroundPage = chrome.extension.getBackgroundPage();
		isChrome = true;
}
if (BackgroundPage)
	init();
