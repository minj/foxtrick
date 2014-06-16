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
		var code = this.getCode();
		var rate, symbol;
		if (!code || !this.isValidCode(code)) {
			if (!Foxtrick.util.layout.hasMultipleTeams(doc)) {
				Foxtrick.Prefs.setString('Currency.Code.' + ownTeamId, code);
				rate = this.getRateByCode(code);
				symbol = this.getSymbolByCode(code);
				callback(rate, symbol);
				return;
			}

			var teamargs = [['file', 'teamdetails'], ['version', '2.9'], ['teamId', ownTeamId]];
			Foxtrick.util.api.retrieve(doc, teamargs, { cache_lifetime: 'session' },
			  function(teamXml, errorText) {
				if (!teamXml || errorText) {
					Foxtrick.log('[ERROR] Currency detection failed:', errorText);
					return;
				}
				// set the correct currency
				var teams = teamXml.getElementsByTagName('IsPrimaryClub');
				var primaryTeamIdx = 0;
				for (; primaryTeamIdx < teams.length; ++primaryTeamIdx) {
					if (teams[primaryTeamIdx].textContent == 'True')
						break;
				}
				var leagues = teamXml.getElementsByTagName('LeagueID');
				var leagueId = leagues[primaryTeamIdx].textContent;
				rate = Foxtrick.util.currency.findRate(leagueId);
				symbol = Foxtrick.util.currency.findSymbol(leagueId);
				code = Foxtrick.util.currency.codeFromCurrency({ rate: rate, symbol: symbol });
				Foxtrick.Prefs.setString('Currency.Code.' + ownTeamId, code);
				callback(rate, symbol);
			});
		}
		else {
			rate = this.getRateByCode(code);
			symbol = this.getSymbolByCode(code);
			callback(rate, symbol);
		}
	},
	getSymbolByCode: function(lookup) {
		var category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
		return Foxtrick.nth(function(item) {
			return item.code == lookup;
		}, category).symbol;
	},

	isValidCode: function(code) {
		var category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
		return Foxtrick.any(function(item) {
			return item.code == code;
		}, category);
	},

	getRateByCode: function(lookup) {
		var category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
		return parseFloat(Foxtrick.nth(function(item) {
			return item.code == lookup;
		}, category).eurorate);
	},
	/**
	 * get saved currency code
	 * @return	{String}		Code
	 */
	getCode: function() {
		var id = Foxtrick.util.id.getOwnTeamId();
		return Foxtrick.Prefs.getString('Currency.Code.' + id);
	},
	/**
	 * find currency code by leagueid
	 * @param	{Integer}	id	leagueid
	 * @return	{String}		code
	 */
	findCode: function(id) {
		var leagueId = id || Foxtrick.util.id.getOwnLeagueId();
		return this.codeFromCurrency({
			rate: this.findRate(leagueId),
			symbol: this.findSymbol(leagueId)
		});
	},
	/**
	 * get currency code from { rate, symbol }
	 * @param  {{ rate: Number, symbol: String }} curr currency
	 * @return {String}                                currency code
	 */
	codeFromCurrency: function(curr) {
		var category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
		var currency = Foxtrick.nth(function(item) {
			return item.symbol === curr.symbol && parseFloat(item.eurorate) === curr.rate;
		}, category);
		return currency ? currency.code : null;
	},
	/**
	 * get saved currency symbol
	 * use with Foxtrick.util.currency.establish!
	 * @return	{String}		symbol
	 */
	getSymbol: function() {
		return this.getSymbolByCode(this.getCode());
	},
	/**
	 * find currency symbol by leagueid
	 * @param	{Integer}	id	leagueid
	 * @return	{String}		Symbol
	 */
	findSymbol: function(id) {
		var leagueId = id || Foxtrick.util.id.getOwnLeagueId();
		var name = Foxtrick.util.id.getLeagueDataFromId(leagueId).Country.CurrencyName;
		return name.replace(/000 /, '');
	},
	/**
	 * get saved ratio to euro (1 curr = x euro)
	 * use with Foxtrick.util.currency.establish!
	 * @return	{Number}	rate
	 */
	getRate: function() {
		return this.getRateByCode(this.getCode());
	},
	/**
	 * find currency rate by leagueid
	 * 1 curr = x euro
	 * @param	{Integer}	id	leagueid
	 * @return	{Number}		rate
	 */
	findRate: function(id) {
		var leagueId = id || Foxtrick.util.id.getOwnLeagueId();
		var name = Foxtrick.XMLData.League[leagueId].Country.CurrencyName;
		var rate = Foxtrick.XMLData.League[leagueId].Country.CurrencyRate.replace(',', '.');
		var mag = (name.indexOf('000 ') > -1) ? 0.001 : 1;
		return parseFloat(rate) * mag / 10;
	}
};
