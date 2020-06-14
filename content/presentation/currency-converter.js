/**
 * currency-converter.js
 * Denote amount of money in a different currency
 * @author smates
 * @author ryanli
 * @author LA-MJ
 */

'use strict';

Foxtrick.modules.CurrencyConverter = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	NICE: 10, // after anythings that adds currencies

	/**
	 * @param  {document} doc
	 * @return {HTMLSelectElement}
	 */
	OPTION_FUNC: function(doc) {
		var currencySelect = doc.createElement('select');
		currencySelect.setAttribute('pref', 'module.CurrencyConverter.to');
		var currencies = [];
		var currency = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/htcurrency.json');
		var currencyJSON = JSON.parse(currency);
		var currencyNodes = currencyJSON.hattrickcurrencies;
		for (let { code, name: desc } of currencyNodes)
			currencies.push({ code, desc });

		currencies.sort((a, b) => a.desc.localeCompare(b.desc));
		var selectedCurrencyTo = Foxtrick.Prefs.getString('module.CurrencyConverter.to');
		for (let i = 0; i < currencies.length; ++i) {
			let item = doc.createElement('option');
			item.value = currencies[i].code;
			item.textContent = currencies[i].desc;
			if (selectedCurrencyTo == item.value)
				item.selected = true;

			currencySelect.appendChild(item);
		}
		return currencySelect;
	},

	/** @param {document} doc */
	run: function(doc) {
		// don't run on forum pages
		if (/Forum/i.test(doc.URL))
			return;

		var module = this;

		Foxtrick.util.currency.detect(doc).then(function(curr) {
			var { rate: oldRate, symbol: oldSymbol } = curr;

			// regular expressions for getting out money
			const RE = new RegExp("(-?[\\d][.,'\\d\\s]+)" + Foxtrick.strToRe(oldSymbol), 'g');

			// new stuffs
			var code = Foxtrick.Prefs.getString('module.CurrencyConverter.to');
			var symbol = Foxtrick.util.currency.getSymbolByCode(code);
			var rate = Foxtrick.util.currency.getRateByCode(code);

			// don't convert if both symbol and rate are the same
			if (oldSymbol == symbol && oldRate == rate)
				return;

			// only convert in div#page
			var page = doc.getElementById('page');

			// only convert most inner td and p tags
			var types = 'td, p';
			var candidates = [...page.querySelectorAll(types)];
			var nodes = candidates.filter(c => !c.querySelector(types));

			// filter out nodes without currency symbols
			nodes = nodes.filter(n => RE.test(n.textContent));

			/** @param {Node} node */
			var parseLeaf = function(node) {
				/**
				 * @param  {string} x
				 * @return {string}
				 */
				var formatMoney = x => ` (${Foxtrick.formatNumber(x, '\u00a0')}\u00a0${symbol})`;

				/** @type {[number, string][]} */
				var pairs = []; // pairs of insert position and money denoted in new currency
				var sole = false; // whether the money is the sole content of the node

				var parent = node.parentElement;

				// we may have numerous entries within one node, so we loop to
				// find out all of them
				var matched;
				while ((matched = RE.exec(node.textContent)) != null) {
					let [full, digits] = matched;
					let amStr = digits.replace(/[^\d.-]/g, '');
					let oldAmount = parseFloat(amStr);
					let amountProjected = oldAmount * oldRate / rate;

					// show 1 decimal for quite low values
					let newAmount;
					if (amountProjected && amountProjected > 100)
						newAmount = Math.floor(amountProjected).toString();
					else
						newAmount = amountProjected.toFixed(1);

					let begin = RE.lastIndex - full.length;
					let end = RE.lastIndex;
					sole = parent.childNodes.length === 1 &&
						node.textContent.slice(0, begin).trim() === '' &&
						node.textContent.slice(end).trim() === '';

					pairs.push([end, formatMoney(newAmount)]);
				}

				if (!pairs.length)
					return;

				// now we insert the money denoted in new currency
				if (sole) {
					let [pair] = pairs;
					let [_, conv] = pair; // lgtm[js/unused-local-variable]
					let span = Foxtrick.createFeaturedElement(doc, module, 'span');
					span.textContent = conv;
					parent.appendChild(span);
				}
				else {
					let fr = doc.createDocumentFragment();
					let children = [], lastPos = 0, text = node.textContent;
					for (let [pos, conv] of pairs) {
						children.push(text.slice(lastPos, pos));
						let span = Foxtrick.createFeaturedElement(doc, module, 'span');
						span.textContent = conv;
						children.push(span);
						lastPos = pos;
					}
					children.push(text.slice(lastPos));
					Foxtrick.append(fr, children);
					parent.replaceChild(fr, node);
				}

				if (parent.matches('.nowrap'))
					Foxtrick.removeClass(parent, 'nowrap');
			};
			nodes.forEach(n => Foxtrick.getTextNodes(n).forEach(parseLeaf));

		}).catch(function(reason) {
			Foxtrick.log('WARNING: currency.detect aborted:', reason);
		});

	},
};
