/**
 * xml_load.js
 * xml loading
 * @author convinced
 */

if (!Foxtrick) var Foxtrick = {};

Foxtrick.XMLData = {
    MODULE_NAME : "XMLData",
	PAGES : new Array('all'),

	League : {},
	countryToLeague : {},
	htCurrencyXml : null,
	htNTidsXml : null,
	htdateformat : null,
	aboutXML : null,

	init : function() {
		if (Foxtrick.BuildFor == "Gecko"
			|| (Foxtrick.BuildFor == "Chrome" && Foxtrick.chromeContext() == "background")) {
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
		}
		else if (Foxtrick.BuildFor == "Chrome" && Foxtrick.chromeContext() == "content") {
			var port = chrome.extension.connect({name : "xml"});
			port.onMessage.addListener(function(msg) {
				var parser = new DOMParser();
				Foxtrick.XMLData.htCurrencyXml = parser.parseFromString(msg.currency, "text/xml");
				Foxtrick.XMLData.htNTidsXml = parser.parseFromString(msg.nt, "text/xml");
				Foxtrick.XMLData.htdateformat = parser.parseFromString(msg.dateFormat, "text/xml");
				Foxtrick.XMLData.aboutXML = parser.parseFromString(msg.about, "text/xml");
				Foxtrick.XMLData.League = msg.league;
				Foxtrick.XMLData.countryToLeague = msg.countryToLeague;
			});
			port.postMessage({req : "get"});
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
