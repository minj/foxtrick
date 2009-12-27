/**
 *
 * 
 * xml_load.js
 * xml loading
 * @author convinced
 */
  
if (!Foxtrick) var Foxtrick={};

Foxtrick.XMLData = {

    MODULE_NAME : "XMLData",
	DEFAULT_ENABLED : true,
	PAGES : new Array('all'), 

	League : {},
	countryid_to_leagueid : {},
	htLanguagesXml : null,
	htCurrencyXml : null,
	htNTidsXml: null,
	htversionsXML: null,
	htdateformat: null,
	aboutXML:null,
	
	matchxmls: new Array(),
	
	init : function() {
	try{
	} catch(e){Foxtrick.dump('Foxtrick.XMLData.init: '+e+'\n');}
	},
	
	run : function(page,doc) {
	
		/*try {
			if (FoxtrickStaffMarker.hty_staff==null){
				FoxtrickStaffMarker.hty_staff = new Array();
				var req = new XMLHttpRequest();
				req.open('GET', 'http://www.hattrick-youthclub.org/_admin/foxtrick/team.xml', false); 
				req.send(null);
				if (req.status == 200) {
					//Foxtrick.dump(req.responseText+'\n');
					var frag = doc.createElement('dummy');
					frag.innerHTML = req.responseText;
					var htyusers = frag.getElementsByTagName('user');
					for (var i=0;i<htyusers.length;++i) {
						FoxtrickStaffMarker.hty_staff.push(htyusers[i].getElementsByTagName('alias')[0].innerHTML);
						//Foxtrick.dump(FoxtrickStaffMarker.hty_staff[i]+' ')
					}
					Foxtrick.dump('hty_staff loaded\n')
				}
				else {Foxtrick.dump('no connection to hty\n'); }				
			}
		}catch(e) {Foxtrick.dump('hty.xml: '+e+'\n'); }

	
	/*try{
		var matchid = FoxtrickHelper.getMatchIdFromUrl(doc.location.href); 
		var isarchivedmatch = (doc.getElementById("ctl00_CPMain_lblMatchInfo")==null);
		var isprematch = (doc.getElementById("ctl00_CPMain_pnlPreMatch")!=null);
		if (isprematch) return;
		
		if (isarchivedmatch && typeof(this.matchxmls[matchid]) == 'undefined') {
			var req = new XMLHttpRequest();
			req.open('GET', 'http://'+doc.location.hostname+'/Community/CHPP/Matches/chppxml.axd?file=matchdetails&matchID='+matchid+'&matchEvents=true', false); 
			req.send(null);
			if (req.status == 200) {
				this.matchxmls[matchid] = req.responseXML;
				dump('matches.js: get new xml\n');
			}
			else Foxtrick.dump('matches.js: xml request failed\n');
		}
	} catch(e){Foxtrick.dump('matches.js run: '+e+'\n');}*/

	},

	change : function(page,doc) {
	},
}

		
// get settings
var portgetsettings = chrome.extension.connect({name: "ftpref-query"});
portgetsettings.onMessage.addListener(function(msg) { 
	if (msg.changed) {
		FoxtrickPrefs.pref = msg.pref; 
		FoxtrickPrefs.pref_default = msg.pref_default; 
		Foxtrickl10n.properties = msg.properties; 
		Foxtrickl10n.properties_default = msg.properties_default;
		
		Foxtrickl10n.screenshots = msg.screenshots; 
		Foxtrick.XMLData.htLanguagesXml = msg.htlang;
		Foxtrick.XMLData.htCurrencyXml = msg.htcurrency;
		Foxtrick.XMLData.htNTidsXml = msg.htNTidList;
		Foxtrick.XMLData.htversionsXML = msg.htversions;
		Foxtrick.XMLData.htdateformat = msg.htdateformat;
		Foxtrick.XMLData.aboutXML = msg.about;
		Foxtrick.XMLData.League = msg.League; 
		Foxtrick.XMLData.countryid_to_leagueid = msg.countryid_to_leagueid;
		console.log('got pref');
	}
});

portgetsettings.postMessage({reqtype: "get_settings"})
