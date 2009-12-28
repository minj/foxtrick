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
var portgetsettings = chrome.extension.connect({name: "ftpref-query"});
portgetsettings.onMessage.addListener(function(msg) { 
	if (msg.is_settings) {
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
//		FoxtrickStaffMarker.hty_staff = msg.hty_staff;
		console.log('got pref');
	}
	else if (msg.is_hty_staff) {
		FoxtrickStaffMarker.hty_staff = msg.hty_staff;
		console.log('got hty_staff');
	}
});

portgetsettings.postMessage({reqtype: "get_settings"})
portgetsettings.postMessage({reqtype: "get_hty_staff"})
