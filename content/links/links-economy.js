'use strict';
/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksEconomy'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['finances'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'economylink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		// only on current finances
		var links = doc.getElementById('mainBody').getElementsByTagName('a');
		if (links[0] && /season/.test(links[0].href))
			return;

		var cash = 0, newCash = 0;
		var main = doc.getElementById('mainBody');
		var cashTable = main.getElementsByTagName('table')[0];

		var nums = cashTable.rows[0].cells[1].textContent.replace(/\u00a0/g, '').match(/\d+/g);
		cash = nums[0];
		// deal with currency converter
		newCash = nums[nums.length > 2 ? 2 : 1];

		// symbol may be undefined here, #care
		var currencySymbol = Foxtrick.util.currency.getSymbol();
		var info = {
			cash: cash,
			newcash: newCash,
			currency: currencySymbol,
		};
		var types = ['economylink'];
		return { types: types, info: info };
	}
};
