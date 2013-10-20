'use strict';
/**
 * xml-load.js
 * xml loading
 * @author convinced
 */

if (!Foxtrick) var Foxtrick = {};

Foxtrick.XMLData = {
	MODULE_NAME: 'XMLData',
	PAGES: ['all'],

	League: {},
	countryToLeague: {},
	htCurrencyXml: null,
	aboutXML: null,

	init: function() {
		this.htCurrencyXml = Foxtrick.util.load.xmlSync(Foxtrick.InternalPath +
		                                                'data/htcurrency.xml');
		var currency = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/htcurrency.json');
		this.htCurrencyJSON = JSON.parse(currency);
		this.aboutXML = Foxtrick.util.load.xmlSync(Foxtrick.InternalPath + 'data/foxtrick_about.xml');
		var about = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/foxtrick_about.json');
		this.aboutJSON = JSON.parse(about);

		this.worldDetailsXml = Foxtrick.util.load.xmlSync(Foxtrick.InternalPath +
		                                                  'data/worlddetails.xml');
		var worldDetails = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/worlddetails.json');
		this.worldDetailsJSON = JSON.parse(worldDetails);

		var data = {};
		var name = 'HattrickData';
		Foxtrick.XMLData.getchilds(this.worldDetailsXml.documentElement, data, name);

		//for (var i = 0; i < data.HattrickData.LeagueList.League.length; ++i) {
		//	this.League[data.HattrickData.LeagueList.League[i].LeagueID] =
		//		data.HattrickData.LeagueList.League[i];
		//	this.countryToLeague[data.HattrickData.LeagueList.League[i].Country.CountryID] =
		//		data.HattrickData.LeagueList.League[i].LeagueID;
		//}
		var leagueList = this.worldDetailsJSON.HattrickData.LeagueList;
		for (var i = 0; i < leagueList.length; ++i) {
			this.League[leagueList[i].LeagueID] = leagueList[i];
			this.countryToLeague[leagueList[i].Country.CountryID] = leagueList[i].LeagueID;
		}
	},

	getchilds: function(el, parent, tag) {
		var childs = el.childNodes;
		var only_text = true;
		var text = null;
		var isarray = false;
		if (parent[tag]) {
			// if a tag is not unique, make an array and add nodes to that
			isarray = true;
			if (!parent[tag][0]) {
				var old_val = parent[tag];
				parent[tag] = [];
				parent[tag].push(old_val);
			}
			parent[tag].push({});
		}
		else
			parent[tag] = {}; // assume unique tag and make a assosiative node

		for (var i = 0; i < childs.length; ++i) {
			if (childs[i].nodeType == childs[i].ELEMENT_NODE) {
				only_text = false;
				if (isarray)
					Foxtrick.XMLData.getchilds(childs[i], parent[tag][parent[tag].length - 1],
					                           childs[i].nodeName);
				else Foxtrick.XMLData.getchilds(childs[i], parent[tag], childs[i].nodeName);
			}
			else if (childs[i].nodeType == childs[i].TEXT_NODE) {
				text = childs[i].textContent;
			}
		}
		if (only_text) {
			if (isarray)
				parent[tag][parent[tag].length - 1] = text;
			else parent[tag] = text;
		}
	},

	getLeagueIdByCountryId: function(id) {
		if (this.countryToLeague[id] !== undefined) {
			return this.countryToLeague[id];
		}
		else {
			return 0;
		}
	},

	getCountryIdByLeagueId: function(id) {
		if (this.League[id] !== undefined) {
			return this.League[id].Country.CountryID;
		}
		else {
			return 0;
		}
	}
};
