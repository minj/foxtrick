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
	countryToLeague : {},
	htLanguagesXml : {},
	htCurrencyXml : null,
	htNTidsXml: null,
	htversionsXML: null,
	htdateformat: null,
	aboutXML:null,

	matchxmls: new Array(),

	locale : {},

	init : function() {
	try {
		for (var i in Foxtrickl10n.locale) {
			var locale = Foxtrickl10n.locale[i];
			try {
				this.htLanguagesXml[locale] = Foxtrick.LoadXML("chrome://foxtrick/content/locale/" + locale + "/htlang.xml");
			}
			catch (e) {
				Foxtrick.dump("Cannot load HT language for " + locale + ".\n");
				Foxtrick.dumpError(e);
			}
		}

		this.htCurrencyXml = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/htcurrency.xml");
		this.htNTidsXml = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/htNTidList.xml");
		this.htversionsXML = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/htversions.xml");
		this.htdateformat = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/htdateformat.xml");
		this.aboutXML = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/foxtrick_about.xml");	

		var worlddetailsXML = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/worlddetails.xml");	
			
		var data ={};
		var name = 'HattrickData';
		Foxtrick.XMLData.getchilds(worlddetailsXML.documentElement,data,name);
		
		for (var i in data.HattrickData.LeagueList.League) {
			this.League[data.HattrickData.LeagueList.League[i].LeagueID] = data.HattrickData.LeagueList.League[i];
			this.countryToLeague[data.HattrickData.LeagueList.League[i].Country.CountryID] = data.HattrickData.LeagueList.League[i].LeagueID;
		}
					
		var foxtrickstaff=this.aboutXML.getElementsByTagName('head_developer');		
		for (var i=0;i<foxtrickstaff.length;++i)   {
			var ids = foxtrickstaff[i].getAttribute('value').match(/\((\d+)\)/g);
			for (var k=0;k<ids.length;++k)   {
				var id=ids[k].match(/\d+/);			
				FoxtrickStaffMarker.foxtrickersArray[id]='x';
			}
		}
		var foxtrickstaff=this.aboutXML.getElementsByTagName('project_owner');		
		for (var i=0;i<foxtrickstaff.length;++i)   {
			var ids = foxtrickstaff[i].getAttribute('value').match(/\((\d+)\)/g);
			for (var k=0;k<ids.length;++k)   {
				var id=ids[k].match(/\d+/);			
				FoxtrickStaffMarker.foxtrickersArray[id]='x';
			}
		}
		var foxtrickstaff=this.aboutXML.getElementsByTagName('developer');		
		for (var i=0;i<foxtrickstaff.length;++i)   {
			var ids = foxtrickstaff[i].getAttribute('value').match(/\((\d+)\)/g);
			for (var k=0;k<ids.length;++k)   {
				var id=ids[k].match(/\d+/);			
				FoxtrickStaffMarker.foxtrickersArray[id]='x';
			}
		}
		var foxtrickstaff=this.aboutXML.getElementsByTagName('designer');		
		for (var i=0;i<foxtrickstaff.length;++i) {
			var ids = foxtrickstaff[i].getAttribute('value').match(/\((\d+)\)/g);
			if(ids)
			  for (var k=0;k<ids.length;++k) {
				var id=ids[k].match(/\d+/);
				FoxtrickStaffMarker.foxtrickersArray[id]='x';
			}
		}
		var foxtrickstaff=this.aboutXML.getElementsByTagName('translation');		
		for (var i=0;i<foxtrickstaff.length;++i)   {
			var ids = foxtrickstaff[i].getAttribute('value').match(/\((\d+)\)/g);
			if(ids)
			  for (var k=0;k<ids.length;++k)   {
				var id=ids[k].match(/\d+/);			
				FoxtrickStaffMarker.foxtrickersArray[id]='x';
			}
		}
		/*for (var i in FoxtrickStaffMarker.foxtrickersArray) {
			Foxtrick.dump(i+' '+FoxtrickStaffMarker.foxtrickersArray[i]+'\n');
		}*/

		var editor=this.aboutXML.getElementsByTagName('editor');
		for (var i=0;i<editor.length;++i)   {
			var id = editor[i].getAttribute('value');
			var name= editor[i].getAttribute('name');
			FoxtrickStaffMarker.editorsArray[id]=name;
		}

		var chpp=this.aboutXML.getElementsByTagName('chpp');
		for (var i=0;i<chpp.length;++i)   {
			var id = chpp[i].getAttribute('value');
			var name= chpp[i].getAttribute('name');
			FoxtrickStaffMarker.chppholder[id]=name;
		}
		
	} catch(e){Foxtrick.dump('Foxtrick.XMLData.init: '+e+'\n');}
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

	run : function(page,doc) {
	
		try {
			if (FoxtrickStaffMarker.hty_staff==null) {
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
				Foxtrick.dump('matches.js: get new xml\n');
			}
			else Foxtrick.dump('matches.js: xml request failed\n');
		}
	} catch(e){Foxtrick.dump('matches.js run: '+e+'\n');}*/

	},

	change : function(page,doc) {
	},

	getLeagueIdByCountryId : function(id) {
		if (this.countryToLeague[id] !== undefined) {
			return this.countryToLeague[id];
		}
		else {
			return 0;
		}
	},

	// this function returns level string of given level type and numeral value.
	// type could be levels, for normal skills;
	// agreeability, honesty, and aggressiveness, which are all obvious.
	getLevelByTypeAndValue : function(type, val) {
		var lang = FoxtrickPrefs.getString("htLanguage");
		var path = "language/" + type + "/level[@value='" + val + "']";
		var text = Foxtrick.xml_single_evaluate(this.htLanguagesXml[lang], path, "text");
		if (text === null) {
			Foxtrick.dump("Requested level of type " + type + " and value " + val + " don't exist in locale " + lang + ", try en instead.\n");
			text = Foxtrick.xml_single_evaluate(this.htLanguagesXml["en"], path, "text");
			if (text === null) {
				Foxtrick.dump("Requested level of type " + type + " and value " + val + " don't exist, returning raw value.\n");
				text = val;
			}
		}
		return text;
	},

	getSublevelByValue : function(val) {
		var lang = FoxtrickPrefs.getString("htLanguage");
		var path = "language/ratingSubLevels/sublevel[@value='" + val + "']";
		var text = Foxtrick.xml_single_evaluate(this.htLanguagesXml[lang], path, "text");
		if (text === null) {
			Foxtrick.dump("Requested sublevel of value " + val + " doesn't exist in locale " + lang + ", try en instead.\n");
			text = Foxtrick.xml_single_evaluate(this.htLanguagesXml["en"], path, "text");
			if (text === null) {
				Foxtrick.dump("Requested sublevel of value " + val + " doesn't exist, returning raw value.\n");
				text = val;
			}
		}
		return text;
	},

	getFullLevelByValue : function(val) {
		var main = Math.floor(val);
		var sub = val - main;
		if (sub >= 0 && sub < 0.25) {
			sub = "0.0";
		}
		else if (sub >= 0.25 && sub < 0.5) {
			sub = "0.25";
		}
		else if (sub >= 0.5 && sub < 0.75) {
			sub = "0.50";
		}
		else if (sub >= 0.75 && sub < 1) {
			sub = "0.75";
		}
		var mainStr = this.getLevelByTypeAndValue("levels", main);
		var subStr = this.getSublevelByValue(sub);
		return mainStr + " " + subStr;
	}
}
