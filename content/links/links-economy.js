'use strict';
/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced
 */

Foxtrick.modules['LinksEconomy'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['finances'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links']
			.getOptionsHtml(doc, 'LinksEconomy', 'economylink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();

		// only on current finances
		var links = doc.getElementById('mainBody').getElementsByTagName('a');
		if (links[0] && links[0].href.search('season') != -1)
			return;

		//addExternalLinksToEconomyDetail
		var Cash = 0, newCash = 1;
		var main = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var ownBoxBody = null;
		var thisdiv = main.getElementsByTagName('div')[0];
		var CashTable = main.getElementsByTagName('table')[0];
		var nums = CashTable.rows[0].cells[1].textContent.replace(/\u00a0/g, '').match(/\d+/g);
		Cash = nums[0];
		newCash = nums[1];

		// symbol maybe undefined here, #care
		var currencySymbol = Foxtrick.util.currency.getSymbol();
		var teamid = Foxtrick.Pages.All.getTeamId(doc);
		var links = Foxtrick.modules['Links'].getLinks('economylink', {
			'Cash': Cash,
			'newCash': newCash,
			'Currency': currencySymbol,
			'owncountryid': owncountryid,
			'teamid': teamid
		}, doc, this);
		var ownBoxBody = null;
		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrick.L10n.getString('links.boxheader');
			var ownBoxBodyId = 'foxtrick_links_content';
			ownBoxBody.setAttribute('id', ownBoxBodyId);

			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
			}

			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}
		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, {
			'Cash': Cash,
			'Currency': currencySymbol,
			'newCash': newCash
		});
	}
};
