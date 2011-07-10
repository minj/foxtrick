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
	console.log('runscript')
	
	if (!inited()) {
		Foxtrick.log("Not even initialized! Let's try again "+runScript_tries+" ms later.");
		if (runScript_tries++ <100) setTimeout(runScript, runScript_tries);
		return;
	}

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

	chrome.extension.sendRequest({ req : "init" },
	function (data) {
		try {
			if (data.error) Foxtrick.log(data.error);
			
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
				Foxtrick.log(' Foxtrick disabled');
				return;
			}
			
			FoxtrickMain.init();
			Foxtrick.addStyleSheetSnippet(document, data.cssText, 'module_css');
			FoxtrickMain.cssLoaded = true;

			var initTime = new Date() - begin.getTime();
			Foxtrick.log("init time: " , initTime , " ms");

			if (Foxtrick.isHt(document)) {console.log('from init'); runScript();}
			else {console.log('from listener');window.addEventListener("DOMContentLoaded", runScript, false);}
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
