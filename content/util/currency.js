'use strict';
/*
 * currency.js
 * Utilities for handling currency
 */

if (!Foxtrick) var Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};

Foxtrick.util.currency = {
	/**
	 * continue with correct currency
	 * @param	{document}	doc
	 * @param	{Function}	callback
	 */
	establish: function(doc, callback) {
		var ownTeamId = Foxtrick.util.id.getOwnTeamId();
		var rate = FoxtrickPrefs.get('Currency.Rate.' + ownTeamId);
		if (!rate) {
			if (!Foxtrick.util.layout.hasMultipleTeams(doc)) {
				FoxtrickPrefs.set('Currency.Rate.' + ownTeamId, this.findRate().toString());
				FoxtrickPrefs.set('Currency.Symbol.' + ownTeamId, this.findSymbol());
				callback();
				return;
			}

			var teamargs = [['file', 'teamdetails'], ['version', '2.9'], ['TeamId', ownTeamId]];
			Foxtrick.util.api.retrieve(doc, teamargs, { cache_lifetime: 'session'},
			  function(teamXml, errorText) {
				if (teamXml) {
					// set the correct currency
					var teams = teamXml.getElementsByTagName('IsPrimaryClub');
					var primaryTeamIdx = 0;
					for (; primaryTeamIdx < teams.length; ++primaryTeamIdx) {
						if (teams[primaryTeamIdx].textContent == 'True')
							break;
					}
					var leagueId = teamXml.getElementsByTagName('LeagueID')[primaryTeamIdx].textContent;
					FoxtrickPrefs.set('Currency.Rate.' + ownTeamId,
									  Foxtrick.util.currency.findRate(leagueId).toString());
					FoxtrickPrefs.set('Currency.Symbol.' + ownTeamId,
									  Foxtrick.util.currency.findSymbol(leagueId));
					callback();
				}
			});
		}
		else
			callback();
	},
	getSymbolByCode: function(lookup) {
		var xml = Foxtrick.XMLData.htCurrencyXml;
		var nodes = xml.getElementsByTagName('currency');
		var currencies = {};

		for (var i = 0; i < nodes.length; ++i) {
			var code = nodes[i].attributes.getNamedItem('code').textContent;
			var symbol = nodes[i].attributes.getNamedItem('symbol').textContent;
			currencies[code] = symbol;
		}

		if (currencies[lookup] !== undefined) {
			return currencies[lookup];
		}
		return null;
	},

	getRateByCode: function(lookup) {
		var xml = Foxtrick.XMLData.htCurrencyXml;
		var nodes = xml.getElementsByTagName('currency');
		var currencies = {};

		for (var i = 0; i < nodes.length; ++i) {
			var rate = nodes[i].attributes.getNamedItem('eurorate').textContent;
			var code = nodes[i].attributes.getNamedItem('code').textContent;
			currencies[code] = rate;
		}

		if (currencies[lookup] !== undefined) {
			return currencies[lookup];
		}
		return null;
	},
	/**
	 * get saved currency symbol
	 * use with Foxtrick.util.currency.establish!
	 * @param	{document}	doc
	 */
	getSymbol: function(doc) {
		return FoxtrickPrefs.get('Currency.Symbol.' + Foxtrick.Pages.All.getOwnTeamId(doc));
	},
	/**
	 * find currency symbol by leagueid
	 * @param	{Integer}	id	leagueid
	 * @returns	{String}		Symbol
	 */
	findSymbol: function(id) {
		var leagueId = id || Foxtrick.util.id.getOwnLeagueId();
		var name = Foxtrick.util.id.getLeagueDataFromId(leagueId).Country.CurrencyName;
		return name.replace(/000 /, '');
	},
	/**
	 * get saved ratio to euro (1 curr = x euro)
	 * use with Foxtrick.util.currency.establish!
	 * @param	{document}	doc
	 * @returns	{Number}	rate
	 */
	getRate: function(doc) {
		return new Number(FoxtrickPrefs.get('Currency.Rate.' + Foxtrick.Pages.All.getOwnTeamId(doc)));
	},
	/**
	 * find currency rate by leagueid
	 * 1 curr = x euro
	 * @param	{Integer}	id	leagueid
	 * @returns	{Number}		rate
	 */
	findRate: function(id) {
		var leagueId = id || Foxtrick.util.id.getOwnLeagueId();
		var name = Foxtrick.util.id.getLeagueDataFromId(leagueId).Country.CurrencyName;
		var rate = Foxtrick.util.id.getLeagueDataFromId(leagueId).Country.CurrencyRate
			.replace(',', '.');
		var mag = (name.indexOf('000 ') > -1) ? 0.001 : 1;
		return Number(rate) * mag / 10;
	}
};
