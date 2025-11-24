/**
 * xml-load.js
 * xml loading
 * @author convinced, LA-MJ
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	// @ts-ignore
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

Foxtrick.XMLData = {
	MODULE_NAME: 'XMLData',
	PAGES: ['all'],

	/** @type {Record<number, LeagueDefinition>} */
	League: {},

	/** @type {Record<number, number>} */
	countryToLeague: {},

	/** @type {Partial<AboutJSONSchema>} */
	aboutJSON: {},

	/** @type {Partial<HTCurrencySchema>} */
	htCurrencyJSON: {},

	/** @type {Partial<WorldDetailsSchema>} */
	worldDetailsJSON: {},

	/**
	 * MV3: Converted to async for service worker compatibility
	 *
	 * @param {boolean} _ reInit
	 * @return {Promise<void>}
	 */
	init: async function(_) {
		var module = this;

		try {
			// MV3: Load all JSON files asynchronously using fetch API
			var currency = await Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/htcurrency.json');
			module.htCurrencyJSON = JSON.parse(currency);

			var about = await Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/foxtrick_about.json');
			module.aboutJSON = JSON.parse(about);

			var world = await Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/worlddetails.json');
			module.worldDetailsJSON = JSON.parse(world);

			if (!module.worldDetailsJSON) {
				Foxtrick.log(new Error('loading world failed'));
				return;
			}

			var leagueList = module.worldDetailsJSON.HattrickData.LeagueList;
			Foxtrick.forEach(function(league) {
				let leagueId = parseInt(league.LeagueID, 10);
				module.League[leagueId] = league;
				if (league.Country.CountryID) {
					let countryId = parseInt(league.Country.CountryID, 10);
					module.countryToLeague[countryId] = leagueId;
				}
			}, leagueList);
		}
		catch (e) {
			Foxtrick.log('Error loading XMLData:', e);
		}
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
			return parseInt(league.Country.CountryID, 10) || 0;

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
			'RD Congo': 'DR Congo', // FIXME
			'Ītyōṗṗyā': 'Ethiopia', // FIXME
			'Madagasikara': 'Madagasikara', // FIXME
		};
		/* eslint-enable quote-props */

		let country = Foxtrick.L10n.getCountryNameNative(id);
		return country in NT_BY_COUNTRY ? NT_BY_COUNTRY[country] : country;
	},
};

/**
 * @typedef CupDefinition
 * @prop {string} CupID
 * @prop {string} CupLeagueLevel
 * @prop {string} CupLevel
 * @prop {string} CupLevelIndex
 * @prop {string} CupName
 * @prop {string} MatchRound
 * @prop {string} MatchRoundsLeft
 * @typedef Countrydefinition
 * @prop {string} Available
 * @prop {string} CountryCode
 * @prop {string} CountryID
 * @prop {string} CountryName
 * @prop {string} CurrencyName
 * @prop {string} CurrencyRate
 * @prop {string} DateFormat
 * @prop {string} TimeFormat
 * @typedef LeagueDefinition
 * @prop {string} ActiveTeams
 * @prop {string} ActiveUsers
 * @prop {string} Continent
 * @prop {Countrydefinition} Country
 * @prop {string} CupMatchDate
 * @prop {CupDefinition[]} Cups
 * @prop {string} EconomyDate
 * @prop {string} EnglishName
 * @prop {string} LanguageId
 * @prop {string} LanguageName
 * @prop {string} LeagueID
 * @prop {string} LeagueName
 * @prop {string} MatchRound
 * @prop {string} NationalTeamId
 * @prop {string} NumberOfLevels
 * @prop {string} Season
 * @prop {string} SeasonOffset
 * @prop {string} Sequence1
 * @prop {string} Sequence2
 * @prop {string} Sequence3
 * @prop {string} Sequence5
 * @prop {string} Sequence7
 * @prop {string} SeriesMatchDate
 * @prop {string} ShortName
 * @prop {string} TrainingDate
 * @prop {string} U20TeamId
 * @prop {string} WaitingUsers
 * @prop {string} ZoneName
 * @typedef { { HattrickData: { LeagueList: LeagueDefinition[] } } } WorldDetailsSchema
 */

/**
 * @typedef CurrencyDefinition
 * @prop {string} code
 * @prop {string} eurorate
 * @prop {Record<string, string>} leagues
 * @prop {string} name
 * @prop {string} symbol
 * @typedef { { hattrickcurrencies: CurrencyDefinition[] } } HTCurrencySchema
 */

/**
 * @typedef { { id: string, href: string } } AboutJSONLink
 * @typedef { { id?: string, name: string } } AboutJSONPerson
 * @typedef { { language: string, translators: AboutJSONPerson[] }} AboutJSONTranslation
 * @typedef AboutJSONSchema
 * @prop {AboutJSONLink[]} links
 * @prop {AboutJSONPerson[]} maintainers
 * @prop {AboutJSONPerson[]} developers
 * @prop {AboutJSONPerson[]} designers
 * @prop {AboutJSONPerson[]} donators
 * @prop {AboutJSONTranslation[]} translations
 */
