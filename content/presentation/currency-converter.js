/*
 * currency-converter.js
 * Denote amount of money in a different currency
 * @author smates
 * @author ryanli
 */

Foxtrick.util.module.register({
	MODULE_NAME : "CurrencyConverter",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	NICE : 10,  // after anythings that adds currencies

	OPTION_FUNC : function(doc) {
		var currencySelect = doc.createElement("select");
		currencySelect.setAttribute("pref", "module.CurrencyConverter.to");
		var currencies = [];
		var currencyXml = Foxtrick.loadXmlSync(Foxtrick.InternalPath + "data/htcurrency.xml");
		var currencyNodes = currencyXml.getElementsByTagName("currency");
		for (var i = 0; i < currencyNodes.length; ++i) {
			var code = currencyNodes[i].getAttribute("code");
			var desc = currencyNodes[i].getAttribute("name");
			currencies.push({ code: code, desc : desc });
		}
		currencies.sort(function(a, b) { return a.desc.localeCompare(b.desc); });
		var selectedCurrencyTo = FoxtrickPrefs.getString("module.CurrencyConverter.to");
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
		var re = new RegExp("(-?\\d+(?:\\d|\\s)+)"
			+ oldSymbol.replace(new RegExp("\\$", "g"), "\\$")
			, "g");

		// filter out nodes without currency symbols
		var nodes = Foxtrick.filter(function(node) {
				return node.textContent.search(re) > -1;
			}, nodes);

		var parseLeaf = function(node) {
			var formatMoney = function(amt) {
				return "(" + Foxtrick.formatNumber(newAmount, "\u00a0") + "\u00a0" + symbol + ")";
			};
			var matched;
			// pairs of insert position and money denoted in new currency
			var pairs = [];
			// whether the money is the sole content of the node
			var sole = false;
			// we may have numerous entries within one node, so we loop to
			// find out all of them
			while ((matched = re.exec(node.textContent)) != null) {
				var oldAmount = matched[1].replace(/\s/g, "");
				var newAmount = Math.floor(oldAmount * oldRate / rate);
				var begin = re.lastIndex - matched[0].length;
				var end = re.lastIndex;
				sole = Foxtrick.trim(node.textContent.substr(0, begin)) == ""
					&& Foxtrick.trim(node.textContent.substr(end)) == ""
					&& node.parentNode.childNodes.length == 1;

				pairs.push([end, formatMoney(newAmount)]);
			}
			// now we insert the money denoted in new currency
			if (sole) {
				node.parentNode.appendChild(doc.createElement("br"));
				node.parentNode.appendChild(doc.createTextNode(pairs[0][1]));
			}
			else {
				while (pairs.length) {
					// reduce the array from the end - otherwise the indices
					// in upcoming pairs will be wrong
					var pair = pairs.pop();
					var pos = pair[0];
					var ins = pair[1];
					node.textContent = node.textContent.substr(0, pos) + " "
						+ ins + node.textContent.substr(pos);
				}
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
});
