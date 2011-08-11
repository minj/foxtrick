/**
 * xml-load.js
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
	aboutXML : null,

	init : function() {
		if ( Foxtrick.chromeContext() === "background" ) {
			this.htCurrencyXml = Foxtrick.loadXml(Foxtrick.ResourcePath + "data/htcurrency.xml");
			this.aboutXML = Foxtrick.loadXml(Foxtrick.ResourcePath + "data/foxtrick_about.xml");

			this.worldDetailsXml = Foxtrick.loadXml(Foxtrick.ResourcePath + "data/worlddetails.xml");
			var data = {};
			var name = 'HattrickData';
			Foxtrick.XMLData.getchilds(this.worldDetailsXml.documentElement, data, name);

			for (var i in data.HattrickData.LeagueList.League) {
				this.League[data.HattrickData.LeagueList.League[i].LeagueID] = data.HattrickData.LeagueList.League[i];
				this.countryToLeague[data.HattrickData.LeagueList.League[i].Country.CountryID] = data.HattrickData.LeagueList.League[i].LeagueID;
			}
		}
		// init for chrome content is in loader_chrome
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
