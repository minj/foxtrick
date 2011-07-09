/**
 * loader.js
 * Foxtrick loader
 * @author  convincedd
 */

if (!Foxtrick) var Foxtrick={};
	
try {
	
var runScript_tries = 0;	

function runScript() {
	try {
	// remove listener to run only once
	window.removeEventListener("DOMContentLoaded", runScript, false);
	window.removeEventListener("DOMSubtreeModified", runScript, false);

	if (!inited()) {
		Foxtrick.log("Not even initialized! Let's try again 500 ms later.");
		Foxtrick.util.note.showObstrusiveLoading(document, 'Initialising FoxTrick. Please wait');
		if (runScript_tries++ <50) setTimeout(runScript, 500);
		return;
	}
	Foxtrick.util.note.removeObstrusiveLoading(document);
	
	// disabled?
	if ( (FoxtrickPrefs.getBool("disableOnStage") && Foxtrick.isStage(document) )
		|| FoxtrickPrefs.getBool("disableTemporary") ) {
		return;
	}

	var mid = new Date();
	
	FoxtrickMain.run(document);
	
	var end = new Date();
	var runTime = end.getTime() - mid.getTime();
	Foxtrick.log ("Foxtrick run time: " , runTime , " ms\n");		

	if (content = document.getElementById("content"))
		Foxtrick.startListenToChange(document);
	} catch(e) {console.log('runScript: ',e);}
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

	var css_files = {};
	for (var i in Foxtrick.modules) {
		var module = Foxtrick.modules[i];
		var moduleName = Foxtrick.getModuleName(module);
		if (moduleName) {
			css_files[moduleName]= {};
			css_files[moduleName]['CORE_MODULE'] = module.CORE_MODULE;
			css_files[moduleName]['CSS'] = module.CSS;
			css_files[moduleName]['CSS_SIMPLE'] = module.CSS_SIMPLE;
			css_files[moduleName]['CSS_RTL'] = module.CSS_RTL;
			css_files[moduleName]['CSS_SIMPLE_RTL'] = module.CSS_SIMPLE_RTL;
		}	
	}

	chrome.extension.sendRequest({ req : "init", css_files: css_files },
	function(data) {
		try {
			if(data.error) Foxtrick.log(data.error);
			
			var begin = new Date();
			FoxtrickPrefs.pref = data.pref;
			FoxtrickPrefs.prefDefault = data.prefDefault;

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
				Foxtrick.log('disabled');
				return;
			}
			
			FoxtrickMain.init();
			Foxtrick.addStyleSheetSnippet(document, data.cssText, 'module_css');
			FoxtrickMain.cssLoaded = true;

			var initTime = new Date() - begin.getTime();
			Foxtrick.log("init time: " , initTime , " ms");

			window.addEventListener("DOMContentLoaded", runScript, false);
			window.addEventListener("DOMSubtreeModified", runScript, false); // in case previous didn't fire for some odd reason which seem to happen

		} catch(e) {console.log('loader init: ', e);}
	});
}

function inited() { 
	return (typeof(Foxtrick.XMLData.countryToLeague) == "object"
		&& typeof(Foxtrickl10n.screenshots) == "string"
		&& typeof(FoxtrickPrefs.pref) == "object")
		&& Foxtrick.isHt(document);   // ht document is ready
}


init();

} catch(e) {console.log('loader ', e)}
