/**
 * loader.js
 * Foxtrick loader
 * @author  convincedd
 */

if (!Foxtrick) var Foxtrick={};
	
try {

function runScript() {
  try {
	Foxtrick.log('runscript');
	
	// disabled?
	if ( (FoxtrickPrefs.getBool("disableOnStage") && Foxtrick.isStage(document) )
		|| FoxtrickPrefs.getBool("disableTemporary") ) {
		return;
	}

	var mid = new Date();
	
	Foxtrick.entry.run(document);
	
	var end = new Date();
	var runTime = end.getTime() - mid.getTime();
	Foxtrick.log ("Foxtrick run time: " , runTime , " ms\n");

	if (content = document.getElementById("content"))
		Foxtrick.startListenToChange(document);
	} catch(e) {Foxtrick.log('runScript: ',e);}
}

	
function init() {
	// check if it's in exclude list
	for (var i in Foxtrick.pagesExcluded) {
		var excludeRe = new RegExp(Foxtrick.pagesExcluded[i], "i");
		// page excluded, return
		if (document.location.href.search(excludeRe) > -1) {
			return;
		}
	}

	chrome.extension.sendRequest({ req : "init" },
	function (data) {
		try {
			if (data.error) Foxtrick.log(data.error);
			
			var begin = new Date();
			FoxtrickPrefs._user_prefs_chrome = data._user_prefs_chrome;
			FoxtrickPrefs._default_prefs_chrome = data._default_prefs_chrome;

			var parser = new DOMParser();
			for (var i in data.htLang) {
				Foxtrickl10n.htLanguagesXml[i] = parser.parseFromString(data.htLang[i], "text/xml");
			}
			
			Foxtrickl10n.properties_default = data.propsDefault;
			Foxtrickl10n.properties = data.props;
			Foxtrickl10n.screenshots = data.screenshots;

			Foxtrick.XMLData.htCurrencyXml = parser.parseFromString(data.currency, "text/xml");
			Foxtrick.XMLData.htdateformat = parser.parseFromString(data.dateFormat, "text/xml");
			Foxtrick.XMLData.aboutXML = parser.parseFromString(data.about, "text/xml");
			Foxtrick.XMLData.worldDetailsXml = parser.parseFromString(data.worldDetails, "text/xml");
			Foxtrick.XMLData.League = data.league;
			Foxtrick.XMLData.countryToLeague = data.countryToLeague;

			if ( (FoxtrickPrefs.getBool("disableOnStage")
					&& Foxtrick.isStage(document))
				|| FoxtrickPrefs.getBool("disableTemporary")) {
				// not on Hattrick or disabled
				Foxtrick.log(' Foxtrick disabled');
				return;
			}
			
			Foxtrick.entry.init();
			Foxtrick.util.inject.addStyleSheetSnippet(document, data.cssText, 'module_css');
			Foxtrick.entry.cssLoaded = true;

			var initTime = new Date() - begin.getTime();
			Foxtrick.log("init time: " , initTime , " ms");

			if (Foxtrick.isHt(document)) {Foxtrick.log('from init'); runScript();}
			else {Foxtrick.log('from listener');window.addEventListener("DOMContentLoaded", runScript, false);}
		} catch(e) {Foxtrick.log('loader init: ', e);}
	});
}


init();

} catch(e) {Foxtrick.log('loader ', e)}
