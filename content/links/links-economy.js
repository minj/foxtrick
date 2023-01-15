'use strict';
/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksEconomy'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['finances'],
	LINK_TYPES: 'economylink',
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		return Foxtrick.util.links.getPrefs(doc, this, cb);
	},

	run: function(doc) {
		var module = this;

		Foxtrick.util.currency.detect(doc).then(function() {
			Foxtrick.util.links.run(doc, module);
		}).catch(function(reason) {
			Foxtrick.log('WARNING: currency.detect aborted:', reason);
		});
	},

	links: function(doc) {
		// only on current finances
		var links = doc.getElementById('mainBody').getElementsByTagName('a');
		if (links[0] && /season/.test(links[0].href))
			return {};

		var cash = 0, newCash = 0;
		var main = doc.getElementById('mainBody');
		var cashTable = main.getElementsByTagName('table')[0];

		var nums = cashTable
		    ? cashTable.rows[0].cells[1].textContent.replace(/\u00a0/g, '').match(/\d+/g)
			: null;
		cash = nums ? nums[0] : NaN;

		// deal with currency converter
		newCash = nums ? nums[nums.length > 2 ? 2 : 1] : NaN;

		// symbol may be undefined here, #care
		var currencySymbol = Foxtrick.util.currency.getSymbol();
		var info = {
			cash: cash,
			newCash: newCash,
			currency: currencySymbol,
		};
		return { info };
	},
};
