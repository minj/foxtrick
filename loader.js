/**
 * loader.js
 * Foxtrick loader
 * @author kolmis
 */

if (!Foxtrick) var Foxtrick={};

Foxtrick.StatsHash = {};

Foxtrick.Loader = function(){
		
	var pub = {};
	
	pub.Load = function(){	
		// create stats Hash for Foxtrick.LinkCollection
		for (var key in Foxtrick.LinkCollection.stats) {
			var stat = Foxtrick.LinkCollection.stats[key];
			for (var prop in stat) {
				if (prop.match(/link/)) {
					if (typeof(Foxtrick.StatsHash[prop]) == 'undefined') {
						Foxtrick.StatsHash[prop] = {};
					}
					Foxtrick.StatsHash[prop][key] = stat;
				}
			}
		}

	};
	return pub;	
}();


function runBlocks() {
	Foxtrick.Loader.Load();
	FoxtrickPrefs.init();
	Foxtrickl10n.init();
	FoxtrickMain.init();
	Foxtrick.reload_module_css(document);
	FoxtrickMain.run(document);
}



// get htlang
var port3 = chrome.extension.connect({name: "ftpref-query"});
port3.onMessage.addListener(function(msg) {   
    Foxtrick.Matches.htLanguagesXml = msg.htlang;});
port3.postMessage({reqtype: "htlang"});

// get ht contries
var port4 = chrome.extension.connect({name: "ftpref-query"});
port4.onMessage.addListener(function(msg) {   
    FoxtrickCrossTable.htCountriesXml = msg.htcountries; });
port4.postMessage({reqtype: "htcountries"});
		
window.addEventListener("DOMContentLoaded", runBlocks, false);

