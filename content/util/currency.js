/**
 * currency.js
 *
 * Utilities for handling currency
 *
 * @author ryanli, LA-MJ
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.currency = {};

/**
 * @typedef {{rate: number, symbol: string}} Currency
 */

/**
 * Continue with correct currency if possible.
 *
 * Returns Promise.<[rate, symbol]>
 *
 * @param  {document}          doc
 * @return {Promise<Currency>}
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

		/** @type {CHPPParams} */
		let teamargs = [['file', 'teamdetails'], ['version', '2.9'], ['teamId', ownTeamId]];
		Foxtrick.util.api.retrieve(doc, teamargs, { cache: 'session' }, (teamXml, errorText) => {
			if (!teamXml || errorText) {
				Foxtrick.log('[ERROR] Currency detection failed:', errorText);

				// can't detect if CHPP is disabled with multiple teams
				Foxtrick.util.currency.displaySelector(doc, { reason: 'chpp' });

				// eslint-disable-next-line prefer-promise-reject-errors
				reject({ reason: 'chpp' });
				return;
			}

			// set the correct currency
			var primaryTeamIdx;
			let teams = teamXml.getElementsByTagName('IsPrimaryClub');
			for (primaryTeamIdx = 0; primaryTeamIdx < teams.length; ++primaryTeamIdx) {
				if (teams[primaryTeamIdx].textContent == 'True')
					break;
			}

			let leagues = teamXml.getElementsByTagName('LeagueID');
			let leagueId = parseInt(leagues[primaryTeamIdx].textContent, 10);

			rate = Foxtrick.util.currency.findRate(leagueId); // safe
			symbol = Foxtrick.util.currency.findSymbol(leagueId); // safe

			code = Foxtrick.util.currency.guessCode({ rate: rate, symbol: symbol }); // safe
			Foxtrick.Prefs.setString('Currency.Code.' + ownTeamId, code);

			fulfill({ rate: rate, symbol: symbol });

		});

	});

};

/**
 * @typedef {'chpp'|'symbol'} CurrencyFailReason
 */

/**
 * Display manual currency selector.
 *
 * info is {reason: string}.
 * reason: 'chpp' is off or 'symbol' was not found
 *
 * @param {document} doc
 * @param {{reason: CurrencyFailReason}} info
 */
Foxtrick.util.currency.displaySelector = function(doc, info) {
	var selectId = 'ft-currency-selector';
	var noteId = 'ft-currency-selector-note';
	if (doc.getElementById(noteId))
		return;

	var defaultCode = this.findCode(); // unsafe
	if (!defaultCode) {
		let teamCodes = Foxtrick.Prefs.getAllKeysOfBranch('Currency.Code');
		let freqMap = new Map();

		for (let teamCode of teamCodes) {
			let code = Foxtrick.Prefs.getString(teamCode);

			let freq = freqMap.get(code) || 0;
			freqMap.set(code, ++freq);
		}

		let entries = Array.from(freqMap.entries());
		let mostFreqEntry = entries.sort((a, b) => a[1] - b[1]).pop();

		if (mostFreqEntry)
			defaultCode = mostFreqEntry[0];
	}

	var ownTeamId = Foxtrick.util.id.getOwnTeamId();

	var currencySelect = doc.createElement('select');
	currencySelect.id = selectId;

	let currencies = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
	currencies.sort((a, b) => a.name.localeCompare(b.name));

	for (let curr of currencies) {
		let item = doc.createElement('option');
		item.value = curr.code;
		item.textContent = curr.name;

		if (defaultCode === item.value)
			item.selected = true;

		currencySelect.appendChild(item);
	}

	var cont = doc.createElement('div');
	let h3 = doc.createElement('h3');
	h3.textContent = Foxtrick.L10n.getString('currency.failed');
	cont.appendChild(h3);

	if (typeof info === 'object' && 'reason' in info) {
		let reason = doc.createElement('p');
		reason.textContent = Foxtrick.L10n.getString('currency.' + info.reason);
		cont.appendChild(reason);
	}

	let span = doc.createElement('span');
	span.textContent = Foxtrick.L10n.getString('currency.select');
	cont.appendChild(span);

	cont.appendChild(currencySelect);

	let button = doc.createElement('button');
	button.type = 'button';
	button.textContent = Foxtrick.L10n.getString('button.save');
	cont.appendChild(button);

	Foxtrick.onClick(button, function() {
		// eslint-disable-next-line no-invalid-this
		let doc = this.ownerDocument;

		let select = /** @type {HTMLSelectElement} */ (doc.getElementById(selectId));
		Foxtrick.Prefs.setString('Currency.Code.' + ownTeamId, select.value);

		let note = doc.getElementById(noteId);
		note.parentNode.removeChild(note);
	});

	let report = doc.createElement('p');
	report.textContent = Foxtrick.L10n.getString('currency.bugReport');
	cont.appendChild(report);

	Foxtrick.util.note.add(doc, cont, noteId, { closable: false });

};

/**
 * Delete saved currency code
 */
Foxtrick.util.currency.reset = function() {
	Foxtrick.log('RESETING CURRENCY');
	let ownTeamId = Foxtrick.util.id.getOwnTeamId();
	Foxtrick.Prefs.deleteValue('Currency.Code.' + ownTeamId);
};

/**
 * Get currency symbol from currency code
 *
 * @param  {string} lookup
 * @return {string}
 */
Foxtrick.util.currency.getSymbolByCode = function(lookup) {
	let ret = null;

	let category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
	let cur = Foxtrick.nth(function(item) {
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
	let ret = null;

	let category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
	let curr = Foxtrick.nth(function(item) {
		return item.code == lookup;
	}, category);

	if (curr)
		ret = parseFloat(curr.eurorate);

	return ret;
};

/**
 * Guess currency code from {rate, symbol}
 *
 * @param  {Currency} curr {rate: number, symbol: string}
 * @return {string}
 */
Foxtrick.util.currency.guessCode = function(curr) {
	let category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
	let currency = Foxtrick.nth(function(item) {
		return item.symbol === curr.symbol && parseFloat(item.eurorate) === curr.rate;
	}, category);

	return currency ? currency.code : null;
};

/**
 * Test whether a currency code is known in HT
 *
 * @param  {string}  code
 * @return {boolean}
 */
Foxtrick.util.currency.isValidCode = function(code) {
	let category = Foxtrick.XMLData.htCurrencyJSON.hattrickcurrencies;
	return category.some(c => c.code == code);
};

/**
 * Find currency code by LeagueId.
 *
 * Assumes own league by default.
 *
 * Potentially unsafe: returns null
 *
 * @param  {number} [id]
 * @return {string}
 */
Foxtrick.util.currency.findCode = function(id) {
	let leagueId = id || Foxtrick.util.id.getOwnLeagueId();
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
	let leagueId = id || Foxtrick.util.id.getOwnLeagueId();
	if (!leagueId) {
		Foxtrick.log('WARNING: no league found: using EUR as currency.');
		return '€';
	}

	let league = Foxtrick.XMLData.League[leagueId];
	if (!league) {
		Foxtrick.log(new Error(`League ${leagueId} missing!`));
		return null;
	}

	let country = league.Country;
	if (country.Available === 'False')
		return null;

	let name = country.CurrencyName;

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
	let leagueId = id || Foxtrick.util.id.getOwnLeagueId();
	if (!leagueId) {
		Foxtrick.log('WARNING: no league found: using EUR as currency.');
		return 1.0;
	}

	let league = Foxtrick.XMLData.League[leagueId];
	if (!league) {
		Foxtrick.log(new Error(`League ${leagueId} missing!`));
		return null;
	}

	let country = league.Country;
	if (country.Available === 'False')
		return null;

	let name = country.CurrencyName;
	let rate = country.CurrencyRate.replace(',', '.');

	// eslint-disable-next-line no-magic-numbers
	let mag = ~name.indexOf('000 ') ? 0.001 : 1;

	return parseFloat(rate) * mag / 10;
};

/**
 * Get saved currency code
 *
 * @return {string}
 */
Foxtrick.util.currency.getCode = function() {
	let id = Foxtrick.util.id.getOwnTeamId();
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
