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

	getSymbol : function() {
		var leagueId = FoxtrickHelper.getOwnCountryId();
		return FoxtrickHelper.getLeagueDataFromId(leagueId).Country.CurrencyName;
	},

	getRate : function() {
		var leagueId = FoxtrickHelper.getOwnCountryId();
		return parseFloat(FoxtrickHelper.getLeagueDataFromId(leagueId).Country.CurrencyRate.replace(",", ".")) / 10;
	}
};
