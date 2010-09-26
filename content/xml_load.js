/**
 * xml_load.js
 * xml loading
 * @author convinced
 */

if (!Foxtrick) var Foxtrick = {};

Foxtrick.XMLData = {
    MODULE_NAME : "XMLData",
	DEFAULT_ENABLED : true,
	PAGES : new Array('all'),

	League : {},
	countryToLeague : {},
	htLanguagesXml : {},
	htCurrencyXml : null,
	htNTidsXml : null,
	htversionsXML : null,
	htdateformat : null,
	aboutXML : null,

	locale : {},

	init : function() {
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

		var data = {};
		var name = 'HattrickData';
		Foxtrick.XMLData.getchilds(worlddetailsXML.documentElement, data, name);

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

	getLeagueIdByCountryId : function(id) {
		if (this.countryToLeague[id] !== undefined) {
			return this.countryToLeague[id];
		}
		else {
			return 0;
		}
	},

	getCountryIdByLeagueId : function(id) {
		if (this.League[id] !== undefined) {
			return this.League[id].Country.CountryID;
		}
		else {
			return 0;
		}
	}
}
