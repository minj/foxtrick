'use strict';
/**
 * linksyouthoverview.js
 * Foxtrick add links to arena pages
 * @author larsw84
 */

Foxtrick.modules['LinksAlliances'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['federation'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links']
			.getOptionsHtml(doc, 'LinksAlliances', 'federationlink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var ownBoxBody = null;
		var allianceId = Foxtrick.Pages.All.getId(doc);

		var links = Foxtrick.modules['Links'].getLinks('federationlink', {
			'federationid': allianceId
		}, doc, this);
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
			'AllianceID': allianceId
		});
	}
};
