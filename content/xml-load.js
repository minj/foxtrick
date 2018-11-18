/**
 * xml-load.js
 * xml loading
 * @author convinced, LA-MJ
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	var Foxtrick = {};
/* eslint-enable */

Foxtrick.XMLData = {
	MODULE_NAME: 'XMLData',
	PAGES: ['all'],

	League: {},
	countryToLeague: {},

	init: function() {
		var module = this;

		var currency = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/htcurrency.json');
		module.htCurrencyJSON = JSON.parse(currency);
		var about = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/foxtrick_about.json');
		module.aboutJSON = JSON.parse(about);
		var world = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/worlddetails.json');
		module.worldDetailsJSON = JSON.parse(world);

		var leagueList = module.worldDetailsJSON.HattrickData.LeagueList;
		Foxtrick.forEach(function(league) {
			module.League[league.LeagueID] = league;
			if (league.Country.CountryID)
				module.countryToLeague[league.Country.CountryID] = league.LeagueID;
		}, leagueList);
	},

	/**
	 * Get League ID from Country ID
	 *
	 * @param  {number} id
	 * @return {number}
	 */
	getLeagueIdByCountryId: function(id) {
		if (this.countryToLeague[id]) {
			return this.countryToLeague[id];
		}
		else {
			return 0;
		}
	},

	/**
	 * Get Country ID from League ID
	 *
	 * @param  {number} id
	 * @return {number}
	 */
	getCountryIdByLeagueId: function(id) {
		var league = this.League[id];
		if (league) {
			return league.Country.CountryID || 0;
		}
		else {
			return 0;
		}
	},

	/**
	 * Get the name of National Team for a certain league
	 *
	 * NOTE: the returned string is trimmed
	 *
	 * @param  {number} id
	 * @return {string}
	 */
	getNTNameByLeagueId: function(id) {
		// jscs:disable disallowQuotedKeysInObjects
		var NT_BY_COUNTRY = {
			// 'Al Maghrib': 'Al Maghrib ', // oh yes, there's a space here!
			'Côte d’Ivoire': 'Côte d\'Ivoire',
			'Kampuchea': 'Prateh Kampuchea',
			'O’zbekiston': 'O\'zbekiston',
			'Panamá': 'Panama',
			'Shqipëria': 'Shqiperia',
			'Sénégal': 'Senegal',
		};
		// jscs:enable disallowQuotedKeysInObjects

		var country = Foxtrick.L10n.getCountryNameNative(id);
		return country in NT_BY_COUNTRY ? NT_BY_COUNTRY[country] : country;
	},
};
