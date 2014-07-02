'use strict';
/*
 * currency.js
 * Utilities for handling currency
 */

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.currency = {
	/**
	 * continue with correct currency
	 * @param	{document}	doc
	 * @param	{Function}	callback
	 */
	establish: function(doc, callback) {
		var safeCallback = function() {
			try {
				callback.apply(this, arguments);
			}
			catch (e) {
				Foxtrick.log('Error in callback for currency.establish', e);
			}
		};

		var ownTeamId = Foxtrick.util.id.getOwnTeamId();
		var code = this.getCode();
		var rate, symbol;
		if (!code || !this.isValidCode(code)) {
			if (!Foxtrick.util.layout.hasMultipleTeams(doc)) {
				code = this.findCode();
				Foxtrick.Prefs.setString('Currency.Code.' + ownTeamId, code);
				rate = this.getRateByCode(code);
				symbol = this.getSymbolByCode(code);
				safeCallback(rate, symbol);
				return;
			}

			var teamargs = [['file', 'teamdetails'], ['version', '2.9'], ['teamId', ownTeamId]];
			Foxtrick.util.api.retrieve(doc, teamargs, { cache_lifetime: 'session' },
			  function(teamXml, errorText) {
				if (!teamXml || errorText) {
					Foxtrick.log('[ERROR] Currency detection failed:', errorText);
					// can't detect if CHPP is disabled with multiple teams
					Foxtrick.util.currency.displaySelector(doc);
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
				safeCallback(rate, symbol);
			});
		}
		else {
			rate = this.getRateByCode(code);
			symbol = this.getSymbolByCode(code);
			safeCallback(rate, symbol);
		}
	},

	displaySelector: function(doc) {
		var selectId = 'ft-currency-selector';
		var noteId = 'ft-currency-selector-note';
		if (doc.getElementById(noteId))
			return;

		var defaultCode = this.findCode();
		var ownTeamId = Foxtrick.util.id.getOwnTeamId();

		var currencySelect = doc.createElement('select');
		currencySelect.id = selectId;
		var currencies = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
		currencies.sort(function(a, b) { return a.name.localeCompare(b.name); });
		for (var i = 0; i < currencies.length; ++i) {
			var item = doc.createElement('option');
			item.value = currencies[i].code;
			item.textContent = currencies[i].name;
			if (defaultCode === item.value)
				item.selected = 'selected';
			currencySelect.appendChild(item);
		}

		var cont = doc.createElement('div');
		var h3 = doc.createElement('h3');
		h3.textContent = Foxtrick.L10n.getString('currency.failed');
		cont.appendChild(h3);
		var p = doc.createElement('p');
		p.textContent = Foxtrick.L10n.getString('currency.chpp');
		cont.appendChild(p);
		var span = doc.createElement('span');
		span.textContent = Foxtrick.L10n.getString('currency.select');
		cont.appendChild(span);
		cont.appendChild(currencySelect);
		var button = doc.createElement('button');
		button.textContent = Foxtrick.L10n.getString('button.save');
		Foxtrick.onClick(button, function(ev) {
			ev.preventDefault();
			var doc = ev.target.ownerDocument;
			var select = doc.getElementById(selectId);
			Foxtrick.Prefs.setString('Currency.Code.' + ownTeamId, select.value);
			var note = doc.getElementById(noteId);
			note.parentNode.removeChild(note);
		});
		cont.appendChild(button);

		Foxtrick.util.note.add(doc, cont, noteId, { closable: false });

	},
	reset: function() {
		Foxtrick.log('RESETING CURRENCY');
		var ownTeamId = Foxtrick.util.id.getOwnTeamId();
		Foxtrick.Prefs.deleteValue('Currency.Code.' + ownTeamId);
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
