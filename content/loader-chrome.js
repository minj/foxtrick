/**
 * loader_chrome.js
 * Foxtrick loader
 * @author  convincedd
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};
Foxtrick.loader.chrome = {};


// invoked when an allowed HTML document is load started
Foxtrick.loader.chrome.docLoadStart = function() {
	try {
		if ( !Foxtrick.isHtUrl(document.location.href) )  return;
		
		// check if it's in exclude list
		for (var i in Foxtrick.pagesExcluded) {
			var excludeRe = new RegExp(Foxtrick.pagesExcluded[i], "i");
			// page excluded, return
			if (document.location.href.search(excludeRe) > -1) {
				return;
			}
		}

		// request resources from background script
		// calls/adds Foxtrick.loader.chrome.docLoadEnd 
		chrome.extension.sendRequest({ req : "init" },
		function (data) {
			try {
				if (data.error) Foxtrick.log(data.error);
				
				var begin = new Date();
				FoxtrickPrefs._prefs_chrome_user = data._prefs_chrome_user;
				FoxtrickPrefs._prefs_chrome_default = data._prefs_chrome_default;
				
				var parser = new DOMParser();
				for (var i in data.htLang) {
					Foxtrickl10n.htLanguagesXml[i] = parser.parseFromString(data.htLang[i], "text/xml");
				}
				
				Foxtrickl10n.properties_default = data.properties_default;
				Foxtrickl10n.properties = data.properties;
				Foxtrickl10n.screenshots_default = data.screenshots_default;
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

				if (Foxtrick.isHt(document)) {
					Foxtrick.log('Ht domument ready. Run now.'); 
					Foxtrick.entry.docLoad();
				}
				else {
					Foxtrick.log('Wait for DOMContentLoaded');
					window.addEventListener("DOMContentLoaded", Foxtrick.entry.docLoad, false);
				}
			} catch(e) {Foxtrick.log('loader init: ', e);}
		});
	} catch(e) {Foxtrick.log(e);}
};


Foxtrick.loader.chrome.docLoadStart();
