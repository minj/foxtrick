/*
 * currency.js
 * Utilities for handling currency
 */

if (!Foxtrick) Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};

Foxtrick.util.currency = {
	getSymbolByCode : function(lookup) {
		var xml = Foxtrick.XMLData.htCurrencyXml;
		var nodes = xml.getElementsByTagName("currency");
		var currencies = {};

		for (var i = 0; i < nodes.length; ++i) {
			var code = nodes[i].attributes.getNamedItem("code").textContent;
			var symbol = nodes[i].attributes.getNamedItem("symbol").textContent;
			currencies[code] = symbol;
		}

		if (currencies[lookup] !== undefined) {
			return currencies[lookup];
		}
		return null;
	},

	getRateByCode : function(lookup) {
		var xml = Foxtrick.XMLData.htCurrencyXml;
		var nodes = xml.getElementsByTagName("currency");
		var currencies = {};

		for (var i = 0; i < nodes.length; ++i) {
			var rate = nodes[i].attributes.getNamedItem("eurorate").textContent;
			var code = nodes[i].attributes.getNamedItem("code").textContent;
			currencies[code] = rate;
		}

		if (currencies[lookup] !== undefined) {
			return currencies[lookup];
		}
		return null;
	},

	getCodeBySymbol : function(lookup) {
		var xml = Foxtrick.XMLData.htCurrencyXml;
		var nodes = xml.getElementsByTagName("currency");
		var currencies = {};

		for (var i = 0; i < nodes.length; ++i) {
			var code = nodes[i].attributes.getNamedItem("code").textContent;
			var symbol = nodes[i].attributes.getNamedItem("symbol").textContent;
			currencies[symbol] = code;
		}

		if (currencies[lookup] !== undefined) {
			return currencies[lookup];
		}
		return null;
	},

	setByCode : function(code) {
		FoxtrickPrefs.setString("htCurrency", code);
	},

	getCode : function() {
		return FoxtrickPrefs.getString("htCurrency");
	},

	getSymbol : function() {
		return this.getSymbolByCode(this.getCode());
	},

	getRate : function() {
		return this.getRateByCode(this.getCode());
	}
};
