/**
 * loader.js
 * Foxtrick loader
 * @author  convincedd
 */

if (!Foxtrick) var Foxtrick={};

function runScript() {
	if (!inited()) {
		Foxtrick.dump("Not even initialized!\n");
		return;
	}

	// check if it's in exclude list
	for (var i in Foxtrick.pagesExcluded) {
		var excludeRe = new RegExp(Foxtrick.pagesExcluded[i], "i");
		// page excluded, return
		if (document.location.href.search(excludeRe) > -1) {
			return;
		}
	}

	var begin = new Date();

	FoxtrickMain.init();
	Foxtrick.reload_module_css(document);
	var mid = new Date();

	FoxtrickMain.run(document);
	var end = new Date();

	var initTime = mid.getTime() - begin.getTime();
	var log = "init time: " + initTime + " ms\n";

	var runTime = end.getTime() - mid.getTime();
	log += "Foxtrick run time: " + runTime + " ms\n" ;		
	
	var totalTime = initTime + runTime;
	log += "Foxtrick total time: " + totalTime + " ms\n" ;		
	
	Foxtrick.dump(log);
}

function init() {
	FoxtrickPrefs.init();
	Foxtrickl10n.init();
	Foxtrick.XMLData.init();
}

function inited() {
	return (typeof(Foxtrick.XMLData.countryToLeague) == "object"
		&& typeof(Foxtrickl10n.screenshots) == "string"
		&& typeof(FoxtrickPrefs.pref) == "object");
}

init();

window.addEventListener("DOMContentLoaded", runScript, false);
