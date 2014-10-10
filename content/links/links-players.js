'use strict';
/**
 * links-players.js
 * Foxtrick add links to manager pages
 * @author convinced
 */

Foxtrick.modules['LinksPlayers'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['allPlayers'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links']
			.getOptionsHtml(doc, 'LinksPlayers', 'playerslink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var ownBoxBody = null;
		var main = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');

		var teamid = Foxtrick.util.id.findTeamId(main);
		var teamname = Foxtrick.Pages.All.getTeamName(doc);
		var playerids = '';
		var players = main.getElementsByTagName('a');
		var i = 0, player;
		while (player = players[i++]) {
			if (player.href.search(/BrowseIds/i) != -1) {
				playerids += player.href.replace(/.+BrowseIds=/i, '');
				break;
			}
		}

		var links = Foxtrick.modules['Links'].getLinks('playerslink', {
			'teamid': teamid,
			'teamname': teamname,
			'playerids': playerids
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
			'teamid': teamid,
			'teamname': teamname,
			'playerids': playerids
		});
	}
};
