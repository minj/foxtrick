'use strict';
/*
 * currency.js
 *
 * Utilities for handling currency
 *
 * @author ryanli, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.currency = {};

/**
 * Continue with correct currency if possible.
 *
 * Returns Promise.<[rate, symbol]>
 *
 * @param  {document}	doc
 * @return {Promise}
 */
Foxtrick.util.currency.detect = function(doc) {

	return new Promise(function(fulfill, reject) {

		var ownTeamId = Foxtrick.util.id.getOwnTeamId();
		var rate, symbol;

		var code = Foxtrick.util.currency.getCode();
		if (code && Foxtrick.util.currency.isValidCode(code)) {
			rate = Foxtrick.util.currency.getRateByCode(code);
			symbol = Foxtrick.util.currency.getSymbolByCode(code);

			fulfill({ rate: rate, symbol: symbol });

			return;
		}

		if (!Foxtrick.util.layout.hasMultipleTeams(doc)) {
			code = Foxtrick.util.currency.findCode(); // safe
			Foxtrick.Prefs.setString('Currency.Code.' + ownTeamId, code);

			rate = Foxtrick.util.currency.getRateByCode(code);
			symbol = Foxtrick.util.currency.getSymbolByCode(code);

			fulfill({ rate: rate, symbol: symbol });

			return;
		}

		var teamargs = [['file', 'teamdetails'], ['version', '2.9'], ['teamId', ownTeamId]];
		Foxtrick.util.api.retrieve(doc, teamargs, { cache_lifetime: 'session' },
		  function(teamXml, errorText) {
			if (!teamXml || errorText) {
				Foxtrick.log('[ERROR] Currency detection failed:', errorText);

				// can't detect if CHPP is disabled with multiple teams
				Foxtrick.util.currency.displaySelector(doc, { reason: 'chpp' });

				reject({ reason: 'chpp' });
				return;
			}

			// set the correct currency
			var teams = teamXml.getElementsByTagName('IsPrimaryClub');
			for (var primaryTeamIdx = 0; primaryTeamIdx < teams.length; ++primaryTeamIdx) {
				if (teams[primaryTeamIdx].textContent == 'True')
					break;
			}

			var leagues = teamXml.getElementsByTagName('LeagueID');
			var leagueId = leagues[primaryTeamIdx].textContent;

			rate = Foxtrick.util.currency.findRate(leagueId); // safe
			symbol = Foxtrick.util.currency.findSymbol(leagueId); // safe

			code = Foxtrick.util.currency.guessCode({ rate: rate, symbol: symbol }); // safe
			Foxtrick.Prefs.setString('Currency.Code.' + ownTeamId, code);

			fulfill({ rate: rate, symbol: symbol });

		});

	});

};

/**
 * Display manual currency selector.
 *
 * info is {reason: string}.
 * reason: 'chpp' is off or 'symbol' was not found
 *
 * @param  {document} doc
 * @param  {object} info { reason: string }
 */
Foxtrick.util.currency.displaySelector = function(doc, info) {
	var selectId = 'ft-currency-selector';
	var noteId = 'ft-currency-selector-note';
	if (doc.getElementById(noteId))
		return;

	var defaultCode = this.findCode(); // unsafe

	if (!defaultCode) {
		var teamCodes = Foxtrick.Prefs.getAllKeysOfBranch('Currency.Code');
		var freqMap = new Map();

		for (var teamCode of teamCodes) {
			var code = Foxtrick.Prefs.getString(teamCode);

			var freq = freqMap.get(code) || 0;
			freqMap.set(code, ++freq);
		}

		var entries = Array.from(freqMap.entries());
		var mostFreqEntry = entries.sort(function(a, b) {
			return a[1] - b[1];
		}).pop();

		if (mostFreqEntry)
			defaultCode = mostFreqEntry[0];
	}

	var ownTeamId = Foxtrick.util.id.getOwnTeamId();

	var currencySelect = doc.createElement('select');
	currencySelect.id = selectId;

	var currencies = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
	currencies.sort(function(a, b) { return a.name.localeCompare(b.name); });

	for (var curr of currencies) {
		var item = doc.createElement('option');
		item.value = curr.code;
		item.textContent = curr.name;

		if (defaultCode === item.value)
			item.selected = true;

		currencySelect.appendChild(item);
	}

	var cont = doc.createElement('div');
	var h3 = doc.createElement('h3');
	h3.textContent = Foxtrick.L10n.getString('currency.failed');
	cont.appendChild(h3);

	if (typeof info === 'object' && 'reason' in info) {
		var reason = doc.createElement('p');
		reason.textContent = Foxtrick.L10n.getString('currency.' + info.reason);
		cont.appendChild(reason);
	}

	var span = doc.createElement('span');
	span.textContent = Foxtrick.L10n.getString('currency.select');
	cont.appendChild(span);

	cont.appendChild(currencySelect);

	var button = doc.createElement('button');
	button.type = 'button';
	button.textContent = Foxtrick.L10n.getString('button.save');
	cont.appendChild(button);

	Foxtrick.onClick(button, function(ev) {
		var doc = ev.target.ownerDocument;

		var select = doc.getElementById(selectId);
		Foxtrick.Prefs.setString('Currency.Code.' + ownTeamId, select.value);

		var note = doc.getElementById(noteId);
		note.parentNode.removeChild(note);
	});

	var report = doc.createElement('p');
	report.textContent = Foxtrick.L10n.getString('currency.bugReport');
	cont.appendChild(report);

	Foxtrick.util.note.add(doc, cont, noteId, { closable: false });

};

/**
 * Delete saved currency code
 */
Foxtrick.util.currency.reset = function() {
	Foxtrick.log('RESETING CURRENCY');
	var ownTeamId = Foxtrick.util.id.getOwnTeamId();
	Foxtrick.Prefs.deleteValue('Currency.Code.' + ownTeamId);
};

/**
 * Get currency symbol from currency code
 *
 * @param  {string} lookup
 * @return {string}
 */
Foxtrick.util.currency.getSymbolByCode = function(lookup) {
	var ret = null;

	var category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
	var cur = Foxtrick.nth(function(item) {
		return item.code == lookup;
	}, category);

	if (cur)
		ret = cur.symbol;

	return ret;
};

/**
 * Get currency rate from currency code
 *
 * @param  {string} lookup
 * @return {number}
 */
Foxtrick.util.currency.getRateByCode = function(lookup) {
	var ret = null;

	var category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
	var curr = Foxtrick.nth(function(item) {
		return item.code == lookup;
	}, category);

	if (curr)
		ret = parseFloat(curr.eurorate);

	return ret;
};

/**
 * Guess currency code from {rate, symbol}
 *
 * @param  {object} curr {rate: number, symbol: string}
 * @return {string}
 */
Foxtrick.util.currency.guessCode = function(curr) {
	var category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
	var currency = Foxtrick.nth(function(item) {
		return item.symbol === curr.symbol && parseFloat(item.eurorate) === curr.rate;
	}, category);

	return currency ? currency.code : null;
};

/**
 * Test whether a currency code is known in HT
 *
 * @param  {string}  code
 * @return {Boolean}
 */
Foxtrick.util.currency.isValidCode = function(code) {
	var category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
	return Foxtrick.any(function(item) {
		return item.code == code;
	}, category);
};

/**
 * Find currency code by LeagueId.
 *
 * Assumes own league by default.
 *
 * Potentially unsafe: returns null
 *
 * @param  {number} id
 * @return {string}
 */
Foxtrick.util.currency.findCode = function(id) {
	var leagueId = id || Foxtrick.util.id.getOwnLeagueId();
	if (!leagueId) {
		Foxtrick.log('WARNING: no league found: using EUR as currency.');
		return 'EUR';
	}

	return this.guessCode({
		rate: this.findRate(leagueId), // unsafe
		symbol: this.findSymbol(leagueId), // unsafe
	});
};

/**
 * Find currency symbol by LeagueId.
 *
 * Assumes own league by default.
 *
 * Potentially unsafe: returns null
 *
 * @param  {number} id
 * @return {string}
 */
Foxtrick.util.currency.findSymbol = function(id) {
	var leagueId = id || Foxtrick.util.id.getOwnLeagueId();
	if (!leagueId) {
		Foxtrick.log('WARNING: no league found: using EUR as currency.');
		return '€';
	}

	var country = Foxtrick.XMLData.League[leagueId].Country;

	if (country.Available === 'False')
		return null;

	var name = country.CurrencyName;

	return name.replace(/000 /, '');
};

/**
 * Find currency rate by LeagueId;
 *
 * e.g. 1 curr = x Euro.
 * Assumes own league by default.
 *
 * Potentially unsafe: returns null
 *
 * @param  {number}	id
 * @return {number}
 */
Foxtrick.util.currency.findRate = function(id) {
	var leagueId = id || Foxtrick.util.id.getOwnLeagueId();
	if (!leagueId) {
		Foxtrick.log('WARNING: no league found: using EUR as currency.');
		return 1.0;
	}

	var country = Foxtrick.XMLData.League[leagueId].Country;

	if (country.Available === 'False')
		return null;

	var name = country.CurrencyName;
	var rate = country.CurrencyRate.replace(',', '.');

	// jshint -W016
	var mag = ~name.indexOf('000 ') ? 0.001 : 1;
	// jshint +W016

	return parseFloat(rate) * mag / 10;
};

/**
 * Get saved currency code
 *
 * @return {string}
 */
Foxtrick.util.currency.getCode = function() {
	var id = Foxtrick.util.id.getOwnTeamId();
	return Foxtrick.Prefs.getString('Currency.Code.' + id);
};

/**
 * Get saved currency symbol.
 *
 * Must be used after Foxtrick.util.currency.detect!
 *
 * @return {string} symbol
 */
Foxtrick.util.currency.getSymbol = function() {
	return this.getSymbolByCode(this.getCode());
};

/**
 * Get saved ratio to Euro (i.e. 1 curr = x Euro).
 *
 * Must be used after Foxtrick.util.currency.detect!
 *
 * @return {number} rate
 */
Foxtrick.util.currency.getRate = function() {
	return this.getRateByCode(this.getCode());
};
