/**
 * xml_load.js
 * xml loading
 * @author convinced
 */

if (!Foxtrick) var Foxtrick = {};

Foxtrick.XMLData = {
    MODULE_NAME : "XMLData",
    CORE_MODULE : true,
	PAGES : new Array('all'),

	League : {},
	countryToLeague : {},
	htCurrencyXml : null,
	htNTidsXml : null,
	htdateformat : null,
	aboutXML : null,

	init : function() {
		this.htCurrencyXml = Foxtrick.LoadXML(Foxtrick.ResourcePath + "data/htcurrency.xml");
		this.htNTidsXml = Foxtrick.LoadXML(Foxtrick.ResourcePath + "data/htNTidList.xml");
		this.htdateformat = Foxtrick.LoadXML(Foxtrick.ResourcePath + "data/htdateformat.xml");
		this.aboutXML = Foxtrick.LoadXML(Foxtrick.ResourcePath + "data/foxtrick_about.xml");

		var worlddetailsXML = Foxtrick.LoadXML(Foxtrick.ResourcePath + "data/worlddetails.xml");

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
