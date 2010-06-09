/**
 * loader.js
 * Foxtrick loader
 * @author  convincedd
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



var setStyle = function(){
 try{ 
	// Set style at loading page
	document.getElementsByTagName('body')[0].style.display = 'none';
	console.log('hide body');
 } catch(e){Foxtrick.dump('setStyle: '+e)}
};


is_reload=false;

function runScript() { 
  try{
	if (!has_settings) {
		is_reload=true;
		console.log('is_reload');
		return;
	}

	console.log('run script');
	
	// check if it's in exclude list
			for (var i in Foxtrick.pagesExcluded) {
				var excludeRe = new RegExp(Foxtrick.pagesExcluded[i], "i");
				// page excluded, return
				if (document.location.href.search(excludeRe) > -1) {
					return;
				}
			}

	var begin = new Date();
	Foxtrick.Loader.Load();	
	FoxtrickMain.init();
	Foxtrick.reload_module_css(document);
		var mid = new Date();
	FoxtrickMain.run(document);
		var end = new Date();
	
	
	var time = ( mid.getSeconds() - begin.getSeconds() ) * 1000
                 + mid.getMilliseconds() - begin.getMilliseconds();
	var log = "init time: " + time + " ms\n" ;		
	var time = ( end.getSeconds() - mid.getSeconds() ) * 1000
                 + end.getMilliseconds() - mid.getMilliseconds();
	log += "Foxtrick run time: " + time + " ms\n" ;		
	
	var time = ( end.getSeconds() - Foxtrick.StartTime.getSeconds() ) * 1000
                 + end.getMilliseconds() - Foxtrick.StartTime.getMilliseconds();
	log += "Foxtrick total time: " + time + " ms\n" ;		
	
	console.log( log );			
  } catch(e){console.log('runScript '+e)}
  	document.getElementsByTagName('body')[0].style.display='block';
}

// get settings
var portgetsettings = chrome.extension.connect({name: "ftpref-query"});
portgetsettings.onMessage.addListener(function(msg) {  
	if (msg.set=='settings') {console.log('msg.is_settings '+msg.set);
		FoxtrickPrefs.pref = msg.pref; 
		FoxtrickPrefs.pref_default = msg.pref_default; 
		Foxtrickl10n.properties = msg.properties; 
		Foxtrickl10n.properties_default = msg.properties_default;
		
		parser = new DOMParser();
		Foxtrickl10n.screenshots = msg.screenshots; 
		Foxtrick.XMLData.htLanguagesXml = parser.parseFromString(msg.htlang,"text/xml");
		Foxtrick.XMLData.htCurrencyXml = parser.parseFromString(msg.htcurrency,"text/xml");
		Foxtrick.XMLData.htNTidsXml = parser.parseFromString(msg.htNTidList,"text/xml");
		Foxtrick.XMLData.htversionsXML = parser.parseFromString(msg.htversions,"text/xml");
		Foxtrick.XMLData.htdateformat = parser.parseFromString(msg.htdateformat,"text/xml");
		Foxtrick.XMLData.aboutXML = parser.parseFromString(msg.about,"text/xml");
		Foxtrick.XMLData.League = msg.League; 
		Foxtrick.XMLData.countryid_to_leagueid = msg.countryid_to_leagueid;

		var foxtrickstaff=Foxtrick.XMLData.aboutXML.getElementsByTagName('head_developer');		
		for (var i=0;i<foxtrickstaff.length;++i)   {
			var ids = foxtrickstaff[i].getAttribute('value').match(/\((\d+)\)/g);
			for (var k=0;k<ids.length;++k)   {
				var id=ids[k].match(/\d+/);			
				FoxtrickStaffMarker.foxtrickersArray[id]='x';
			}
		}
		var foxtrickstaff=Foxtrick.XMLData.aboutXML.getElementsByTagName('project_owner');		
		for (var i=0;i<foxtrickstaff.length;++i)   {
			var ids = foxtrickstaff[i].getAttribute('value').match(/\((\d+)\)/g);
			for (var k=0;k<ids.length;++k)   {
				var id=ids[k].match(/\d+/);			
				FoxtrickStaffMarker.foxtrickersArray[id]='x';
			}
		}
		var foxtrickstaff=Foxtrick.XMLData.aboutXML.getElementsByTagName('developer');		
		for (var i=0;i<foxtrickstaff.length;++i)   {
			var ids = foxtrickstaff[i].getAttribute('value').match(/\((\d+)\)/g);
			for (var k=0;k<ids.length;++k)   {
				var id=ids[k].match(/\d+/);			
				FoxtrickStaffMarker.foxtrickersArray[id]='x';
			}
		}
		var foxtrickstaff=Foxtrick.XMLData.aboutXML.getElementsByTagName('designer');		
		for (var i=0;i<foxtrickstaff.length;++i) {
			var ids = foxtrickstaff[i].getAttribute('value').match(/\((\d+)\)/g);
			if(ids)
			  for (var k=0;k<ids.length;++k) {
				var id=ids[k].match(/\d+/);
				FoxtrickStaffMarker.foxtrickersArray[id]='x';
			}
		}
		var foxtrickstaff=Foxtrick.XMLData.aboutXML.getElementsByTagName('translation');		
		for (var i=0;i<foxtrickstaff.length;++i)   {
			var ids = foxtrickstaff[i].getAttribute('value').match(/\((\d+)\)/g);
			if(ids)
			  for (var k=0;k<ids.length;++k)   {
				var id=ids[k].match(/\d+/);			
				FoxtrickStaffMarker.foxtrickersArray[id]='x';
			}
		}
//		FoxtrickStaffMarker.hty_staff = msg.hty_staff;
		console.log('got pref '+msg.set);
		has_settings=true;
		if (is_reload) runScript();
	}
	else if (msg.set=='hty_staff') {// alert('msg.is_hty_staff : '+msg.set)
		FoxtrickStaffMarker.hty_staff = msg.hty_staff;
		console.log('got hty_staff ' +msg.set);
	}
});

function get_settings() {
	console.log('do get_settings');
	portgetsettings.postMessage({reqtype: "get_settings"});
	portgetsettings.postMessage({reqtype: "get_hty_staff"});
}
	
// action
if (typeof(did_action)=='undefined'){
	//window.setTimeout(setStyle, 1);
	has_settings=false;
	get_settings();
	window.addEventListener("DOMContentLoaded", runScript, false);
	var did_action=true;
}

	