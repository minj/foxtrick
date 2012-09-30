'use strict';
/**
 * linkschallnges.js
 * Foxtrick add links to challenges pages
 * @author convinced
 */

Foxtrick.modules['LinksChallenges'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['challenges', 'youthChallenges'],
	LINK_TYPES: ['challengeslink', 'youthchallengeslink'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links'].getOptionsHtml(doc, 'LinksChallenges', this.LINK_TYPES,
		                                                callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var teamid = Foxtrick.util.id.findTeamId(doc.getElementsByClassName('subMenu')[0]);
		var youthteamid = Foxtrick.util.id.findYouthTeamId(doc.getElementsByClassName('main')[0]);
		var ownteamid = Foxtrick.util.id.getOwnLeagueId();

		//addExternalLinksToChallengesDetail
		var links;
		if (Foxtrick.isPage('challenges', doc))
			links = Foxtrick.modules['Links'].getLinks('challengeslink', {'teamid': teamid,
			                                           'ownteamid': ownteamid}, doc, this);
		else
			links = Foxtrick.modules['Links']
				.getLinks('youthchallengeslink', {'teamid': teamid, 'youthteamid': youthteamid,
				          'ownteamid': ownteamid}, doc, this);
		var ownBoxBody = null;

		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
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
		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, {});
	}
};
