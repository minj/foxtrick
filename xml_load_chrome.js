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
	playersxml:null,
	
	matchxmls: new Array(),
	
	init : function() {
	},
	
	run : function(page,doc) { 
	
		// XML get players xml		
		if (doc.location.href.search(/\/Club\/Players\/\?TeamID=/i)!=-1 
			|| doc.location.href.search(/\/Club\/Players\/$/)!=-1
			|| doc.location.href.search(/\/Club\/Players\/Oldies.aspx/)!=-1
			|| doc.location.href.search(/\/Club\/Players\/Coaches.aspx/)!=-1
			|| doc.location.href.search(/\/Club\/Players\/\?TeamID=/i)!=-1 
			|| doc.location.href.search(/\/Club\/NationalTeam\/NTPlayers.aspx/i)!=-1) {

			var file = 'file=players'; //default normal team
			var team = '';  // =default own team
			var selection = '';  //default current players
			
			// determine xml file
			var teamid = doc.location.href.match(/teamid=(\d+)/i)[1];
			var Oldies = doc.location.href.search(/\/Club\/Players\/Oldies.aspx/i)!=-1;
			var Coaches = doc.location.href.search(/\/Club\/Players\/Coaches.aspx/i)!=-1;
			var NTplayers = doc.location.href.search(/\/Club\/NationalTeam\/NTPlayers.aspx/i)!=-1;			
			if (teamid) team = '&teamId='+teamid;
			if (Oldies) selection='&actionType=viewOldies';
			if (Coaches) selection='&actionType=viewOldCoaches';
			if (NTplayers) file = 'file=nationalplayers&ShowAll=true&actiontype=supporterstats';
			Foxtrick.dump('xmlget http://'+doc.location.hostname+'/Community/CHPP/Players/chppxml.axd?'+file+team+selection+'\n'); 
			
			this.playersxml = null;
			try {	
				var req = new XMLHttpRequest();
				req.open('GET', 'http://'+doc.location.hostname+'/Community/CHPP/Players/chppxml.axd?'+file+team+selection, false); 
				req.send(null);
				if (req.status == 200) {
					this.playersxml = req.responseXML;
					Foxtrick.dump('get '+file+team+selection+'\n');//+req.responseText+'\n');
				}
				else Foxtrick.dump(' get '+file+team+selection+' request failed\n');
			} catch(e) {Foxtrick.dump('get'+file+team+selection+' request failed'+e+'\n');}
		}		
	},

	change : function(page,doc) {
	},
	
	getchilds : function(el,parent,tag) {
		var childs = el.childNodes;
		var only_text=true;
		var text=null;
		var isarray=false;
		if (parent[tag]) {
			// if a tag is not unique, make an array and add nodes to that
			isarray=true; 
			if (!parent[tag][0]) {
				var old_val = parent[tag];
				parent[tag] = new Array();
				parent[tag].push(old_val);
			}
			parent[tag].push({});
		}
		else {parent[tag] = {};} // assume unique tag and make a assosiative node
		
		for (var i=0;i<childs.length;++i) {
			if (childs[i].nodeType==childs[i].ELEMENT_NODE ) {
				only_text=false;
				if (isarray) Foxtrick.XMLData.getchilds(childs[i], parent[tag][parent[tag].length-1], childs[i].nodeName);
				else Foxtrick.XMLData.getchilds(childs[i], parent[tag], childs[i].nodeName);				
			}
			else if (childs[i].nodeType==childs[i].TEXT_NODE ) {
				text = childs[i].textContent;
			}
		}
		if (only_text) { 
			if (isarray) parent[tag][parent[tag].length-1] = text;
			else parent[tag] = text;
		}
	},
}

		
// get settings
var portgetsettings = chrome.extension.connect({name: "ftpref-query"});
portgetsettings.onMessage.addListener(function(msg) { 
try{ 
	if (msg.set=='settings') {console.log('msg.is_settings '+msg.set);
		FoxtrickPrefs.pref = msg.pref; 
		FoxtrickPrefs.pref_default = msg.pref_default; 
		Foxtrickl10n.properties = msg.properties; 
		Foxtrickl10n.properties_default = msg.properties_default;
		
		Foxtrickl10n.screenshots = msg.screenshots; 
		Foxtrick.XMLData.htLanguagesXml = document.createElement('xml');
		Foxtrick.XMLData.htLanguagesXml.innerHTML = msg.htlang;
		Foxtrick.XMLData.htCurrencyXml = document.createElement('xml');
		Foxtrick.XMLData.htCurrencyXml.innerHTML = msg.htcurrency;
		Foxtrick.XMLData.htNTidsXml = document.createElement('xml');
		Foxtrick.XMLData.htNTidsXml.innerHTML = msg.htNTidList;
		Foxtrick.XMLData.htversionsXML = document.createElement('xml');
		Foxtrick.XMLData.htversionsXML.innerHTML = msg.htversions;
		Foxtrick.XMLData.htdateformat = document.createElement('xml');
		Foxtrick.XMLData.htdateformat.innerHTML = msg.htdateformat;
		Foxtrick.XMLData.aboutXML = document.createElement('xml');
		Foxtrick.XMLData.aboutXML.innerHTML = msg.about;
		Foxtrick.XMLData.League = msg.League; 
		Foxtrick.XMLData.countryid_to_leagueid = msg.countryid_to_leagueid;
		FoxtrickStaffMarker.foxtrickersArray = msg.foxtrickersArray;
		FoxtrickStaffMarker.editorsArray = msg.editorsArray;
		FoxtrickStaffMarker.chppholder = msg.chppholder;
		
		console.log('got pref '+msg.set);
	}
	else if (msg.set=='hty_staff') {// alert('msg.is_hty_staff : '+msg.set)
		FoxtrickStaffMarker.hty_staff = msg.hty_staff;
		console.log('got hty_staff ' +msg.set);
	}
} catch(e){console.log('portgetsettings '+ msg.set+' '+e)}
});

if (typeof(xml_got_settings)=='undefined') {
	portgetsettings.postMessage({reqtype: "get_settings"}); console.log('do get_settings');
	portgetsettings.postMessage({reqtype: "get_hty_staff"});
	var xml_got_settings=true;
}

