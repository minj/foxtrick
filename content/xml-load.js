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

	init: function() {
		var currency = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/htcurrency.json');
		this.htCurrencyJSON = JSON.parse(currency);
		var about = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/foxtrick_about.json');
		this.aboutJSON = JSON.parse(about);
		var worldDetails = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/worlddetails.json');
		this.worldDetailsJSON = JSON.parse(worldDetails);

		var leagueList = this.worldDetailsJSON.HattrickData.LeagueList;
		for (var i = 0; i < leagueList.length; ++i) {
			this.League[leagueList[i].LeagueID] = leagueList[i];
			this.countryToLeague[leagueList[i].Country.CountryID] = leagueList[i].LeagueID;
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
