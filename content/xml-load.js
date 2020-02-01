/**
 * xml-load.js
 * xml loading
 * @author convinced, LA-MJ
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	// @ts-ignore
	var Foxtrick = {};
/* eslint-enable */

Foxtrick.XMLData = {
	MODULE_NAME: 'XMLData',
	PAGES: ['all'],

	/** @type {Record<number, LeagueDefinition>} */
	League: {},

	/** @type {Record<number, number>} */
	countryToLeague: {},

	/**
	 * @param {boolean} _ reInit
	 */
	init: function(_) {
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
				module.countryToLeague[league.Country.CountryID] = parseInt(league.LeagueID, 10);
		}, leagueList);
	},

	/**
	 * Get League ID from Country ID
	 *
	 * @param  {number} id
	 * @return {number}
	 */
	getLeagueIdByCountryId: function(id) {
		if (this.countryToLeague[id])
			return this.countryToLeague[id];

		return 0;
	},

	/**
	 * Get Country ID from League ID
	 *
	 * @param  {number} id
	 * @return {number}
	 */
	getCountryIdByLeagueId: function(id) {
		var league = this.League[id];
		if (league)
			return league.Country.CountryID || 0;

		return 0;
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
		/* eslint-disable quote-props */
		var NT_BY_COUNTRY = {
			// 'Al Maghrib': 'Al Maghrib ', // oh yes, there's a space here!
			'Côte d’Ivoire': 'Côte d\'Ivoire',
			'Kampuchea': 'Prateh Kampuchea',
			'O’zbekiston': 'O\'zbekiston',
			'Panamá': 'Panama',
			'Shqipëria': 'Shqiperia',
			'Sénégal': 'Senegal',
		};
		/* eslint-enable quote-props */

		let country = Foxtrick.L10n.getCountryNameNative(id);
		return country in NT_BY_COUNTRY ? NT_BY_COUNTRY[country] : country;
	},
};

/**
 * @typedef {object} LeagueDefinition
 */
