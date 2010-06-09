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
	},
	
	run : function(page,doc) {
	},

	change : function(page,doc) {
	},
}

		
// get settings
/*var portgetsettings = chrome.extension.connect({name: "ftpref-query"});
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
//		FoxtrickStaffMarker.hty_staff = msg.hty_staff;
		console.log('got pref '+msg.set);
	}
	else if (msg.set=='hty_staff') {// alert('msg.is_hty_staff : '+msg.set)
		FoxtrickStaffMarker.hty_staff = msg.hty_staff;
		console.log('got hty_staff ' +msg.set);
	}
});

if (typeof(xml_got_settings)=='undefined') {
	portgetsettings.postMessage({reqtype: "get_settings"}); console.log('do get_settings');
	portgetsettings.postMessage({reqtype: "get_hty_staff"});
	var xml_got_settings=true;
}*/