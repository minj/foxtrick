'use strict';
/*
 * currency-converter.js
 * Denote amount of money in a different currency
 * @author smates
 * @author ryanli
 */

Foxtrick.modules['CurrencyConverter'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	NICE: 10,  // after anythings that adds currencies

	OPTION_FUNC: function(doc) {
		var currencySelect = doc.createElement('select');
		currencySelect.setAttribute('pref', 'module.CurrencyConverter.to');
		var currencies = [];
		var currency = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/htcurrency.json');
		var currencyJSON = JSON.parse(currency);
		var currencyNodes = currencyJSON.hattrickcurrencies;
		for (var i = 0; i < currencyNodes.length; ++i) {
			var code = currencyNodes[i].code;
			var desc = currencyNodes[i].name;
			currencies.push({ code: code, desc: desc });
		}
		currencies.sort(function(a, b) { return a.desc.localeCompare(b.desc); });
		var selectedCurrencyTo = Foxtrick.Prefs.getString('module.CurrencyConverter.to');
		for (var i = 0; i < currencies.length; ++i) {
			var item = doc.createElement('option');
			item.value = currencies[i].code;
			item.textContent = currencies[i].desc;
			if (selectedCurrencyTo == item.value)
				item.selected = 'selected';
			currencySelect.appendChild(item);
		}
		return currencySelect;
	},

	run: function(doc) {
		// don't run on forum pages
		if (doc.location.href.search(/Forum/i) != -1)
			return;
		Foxtrick.util.currency.establish(doc, function(rate, symbol) {

			// old stuffs
			var oldSymbol = symbol;
			var oldLength = oldSymbol.length;
			var oldRate = rate;

			// new stuffs
			var code = Foxtrick.Prefs.getString('module.CurrencyConverter.to');
			var symbol = Foxtrick.util.currency.getSymbolByCode(code);
			var rate = Foxtrick.util.currency.getRateByCode(code);

			// don't convert if both symbol and rate are the same
			if ((oldSymbol == symbol) && (oldRate == rate))
				return;

			// only convert in div#page
			var page = doc.getElementById('page');
			// only convert most inner td and p tags
			var nodes = Foxtrick.filter(function(node) {
					var tagName = node.tagName.toLowerCase();
					return Foxtrick.has(['td', 'p'], tagName) &&
						!Foxtrick.any(function(child) {
							return node.getElementsByTagName(child).length > 0;
						}, ['td', 'p']);
				}, page.getElementsByTagName('*'));

			// regular expressions for getting out money
			var re = new RegExp('(-?[\\d][\\d\\.\\s]+)'
				+ oldSymbol.replace(/\$/g, '\\$')
				, 'g');

			// filter out nodes without currency symbols
			var nodes = Foxtrick.filter(function(node) {
					return node.textContent.search(re) > -1;
				}, nodes);

			var parseLeaf = function(node) {
				var formatMoney = function(amt) {
					return '(' + Foxtrick.formatNumber(newAmount, '\u00a0') + '\u00a0' + symbol + ')';
				};
				var matched;
				// pairs of insert position and money denoted in new currency
				var pairs = [];
				// whether the money is the sole content of the node
				var sole = false;
				// we may have numerous entries within one node, so we loop to
				// find out all of them
				while ((matched = re.exec(node.textContent)) != null) {
					var oldAmount = matched[1].replace(/\s/g, '');
					var newAmountProjected = oldAmount * oldRate / rate;

					//show 1 decimal for quite low values
					if (newAmountProjected > 100 || newAmountProjected == 0)
						var newAmount = Math.floor(newAmountProjected);
					else
						var newAmount = newAmountProjected.toFixed(1);

					var begin = re.lastIndex - matched[0].length;
					var end = re.lastIndex;
					sole = node.textContent.substr(0, begin).trim() === ''
						&& node.textContent.substr(end).trim() === ''
						&& node.parentNode.childNodes.length === 1;

					pairs.push([end, formatMoney(newAmount)]);
				}
				// now we insert the money denoted in new currency
				if (sole) {
					var div = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.CurrencyConverter,
															 'div');
					div.textContent = pairs[0][1];
					node.parentNode.appendChild(div);
				}
				else {
					while (pairs.length) {
						// reduce the array from the end - otherwise the indices
						// in upcoming pairs will be wrong
						var pair = pairs.pop();
						var pos = pair[0];
						var ins = pair[1];
						node.textContent = node.textContent.substr(0, pos) + ' '
							+ ins + node.textContent.substr(pos);
					}
					Foxtrick.makeFeaturedElement(node.parentNode, Foxtrick.modules.CurrencyConverter);
				}
			};
			var traverse = function(node) {
				if (node.childNodes.length == 0)
					parseLeaf(node);
				else
					Foxtrick.map(traverse, node.childNodes);
			};
			Foxtrick.map(traverse, nodes);
		});
	}
};
