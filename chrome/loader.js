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
	var begin = new Date();
	FoxtrickMain.init();
	var end = new Date();
	var time = ( end.getSeconds() - begin.getSeconds() ) * 1000
                 + end.getMilliseconds() - begin.getMilliseconds();
	Foxtrick.dump( "init time: " + time + " ms\n" );		
	var begin = new Date();
	Foxtrick.reload_module_css(document);
	var end = new Date();
	var time = ( end.getSeconds() - begin.getSeconds() ) * 1000
                 + end.getMilliseconds() - begin.getMilliseconds();
	Foxtrick.dump( "module css time: " + time + " ms\n" );		
	var begin = new Date();
	FoxtrickMain.run(document);

	var end = new Date();
	var time = ( end.getSeconds() - begin.getSeconds() ) * 1000
                 + end.getMilliseconds() - begin.getMilliseconds();
	Foxtrick.dump( "Foxtrick run time: " + time + " ms\n" );		
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

