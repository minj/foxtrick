/*
 * currency-converter.js
 * Denote amount of money in a different currency
 * @author smates
 * @author ryanli
 */

var FoxtrickCurrencyConverter = {
	MODULE_NAME : "CurrencyConverter",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	NICE : 10,  // after anythings that adds currencies

	OPTION_FUNC : function(doc) {
		var currencySelect = doc.createElement("select");
		currencySelect.setAttribute("pref", "module.CurrencyConverter.to");
		var currencies = [];
		var currencyXml = Foxtrick.loadXml(Foxtrick.InternalPath + "data/htcurrency.xml");
		var currencyNodes = currencyXml.getElementsByTagName("currency");
		for (var i = 0; i < currencyNodes.length; ++i) {
			var code = currencyNodes[i].getAttribute("code");
			var desc = currencyNodes[i].getAttribute("name");
			currencies.push({ code: code, desc : desc });
		}
		currencies.sort(function(a, b) { return a.desc.localeCompare(b.desc); });
		const selectedCurrencyTo = FoxtrickPrefs.getString("module.CurrencyConverter.to");
		for (var i in currencies) {
			var item = doc.createElement("option");
			item.value = currencies[i].code;
			item.textContent = currencies[i].desc;
			if (selectedCurrencyTo == item.value)
				item.selected = "selected";
			currencySelect.appendChild(item);
		}
		return currencySelect;
	},

	run : function(doc) {
		// don't run on login and forum pages
		if (Foxtrick.isLoginPage(doc) || doc.location.href.search(/Forum/i) != -1)
			return;

		// old stuffs
		var oldSymbol = Foxtrick.util.currency.getSymbol();
		var oldLength = oldSymbol.length;
		var oldRate = Foxtrick.util.currency.getRate();

		// new stuffs
		var code = FoxtrickPrefs.getString("module.CurrencyConverter.to");
		var symbol = Foxtrick.util.currency.getSymbolByCode(code);
		var rate = Foxtrick.util.currency.getRateByCode(code);

		// don't convert if both symbol and rate are the same
		if ((oldSymbol == symbol) && (oldRate == rate))
			return;

		// only convert in div#page
		var page = doc.getElementById("page");
		// only convert most inner td and p tags
		var nodes = Foxtrick.filter(function(node) {
				var tagName = node.tagName.toLowerCase();
				return Foxtrick.member(tagName, ["td", "p"])
					&& !Foxtrick.any(function(child) { return node.getElementsByTagName(child).length > 0; }, ["td", "p"]);
			}, page.getElementsByTagName("*"));

		// regular expressions for getting out money
		var re = new RegExp("(\\d+(\\d|\\s)+)" + oldSymbol);

		// filter out nodes without currency symbols
		var nodes = Foxtrick.filter(function(node) {
				return node.textContent.search(re) > -1;
			}, nodes);

		var parseLeaf = function(node) {
			if (node.textContent.search(re) > -1) {
				var matched = node.textContent.match(re);
				var oldAmount = matched[1].replace(/\s/g, "");
				var newAmount = oldAmount * oldRate / rate;
				node.textContent = node.textContent.replace(re, matched[0]
					+ " (" + Foxtrick.formatNumber(newAmount, "\u00a0") + symbol + ")");
			}
		};
		var traverse = function(node) {
			if (node.childNodes.length == 0)
				parseLeaf(node);
			else
				Foxtrick.map(traverse, node.childNodes);
		};
		Foxtrick.map(traverse, nodes);
	}
};
Foxtrick.util.module.register(FoxtrickCurrencyConverter);
