/*
 * currency.js
 * Utilities for handling currency
 */

if (!Foxtrick) Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};

Foxtrick.util.currency = {
	getShortNameByCode : function(lookup) {
		var xml = Foxtrick.XMLData.htCurrencyXml;
		var nodes = xml.getElementsByTagName("currency");
		var currencies = {};

		for (var i = 0; i < nodes.length; ++i) {
			var code = nodes[i].attributes.getNamedItem("code").textContent;
			var shortName = nodes[i].attributes.getNamedItem("shortname").textContent;
			currencies[code] = shortName;
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

	getCodeByShortName : function(lookup) {
		var xml = Foxtrick.XMLData.htCurrencyXml;
		var nodes = xml.getElementsByTagName("currency");
		var currencies = {};

		for (var i = 0; i < nodes.length; ++i) {
			var code = nodes[i].attributes.getNamedItem("code").textContent;
			var shortName = nodes[i].attributes.getNamedItem("shortname").textContent;
			currencies[shortName] = code;
		}

		if (currencies[lookup] !== undefined) {
			return currencies[lookup];
		}
		return null;
	}
};
