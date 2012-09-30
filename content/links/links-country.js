'use strict';
/**
 * links-league.js
 * Foxtrick add links to country pages
 * @author convinced
 */

Foxtrick.modules['LinksCountry'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['country'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links'].getOptionsHtml(doc, 'LinksCountry', 'countrylink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var flag = doc.getElementsByClassName('flag')[0];
		var leagueId = Foxtrick.util.id.findLeagueId(flag.parentNode);

		// get English name
		var xml = Foxtrick.XMLData.worldDetailsXml;
		var it = xml.evaluate('//League[LeagueID=' + leagueId + ']/ShortName',
			xml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
		var node = it.iterateNext();
		if (node)
			var nameShort = node.textContent;

		var links = Foxtrick.modules['Links'].getLinks('countrylink', {
				'countryid': leagueId,
				'english_name': nameShort
			}, doc, this);

		if (links.length > 0) {
			var ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrickl10n.getString('links.boxheader');
			var ownBoxBodyId = 'foxtrick_links_content';
			ownBoxBody.setAttribute('id', ownBoxBodyId);

			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
			}

			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}
		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, { 'countryid': leagueId });
	}
};
