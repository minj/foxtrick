'use strict';
/**
 * links-manager.js
 * Foxtrick add links to manager pages
 * @author convinced
 */

Foxtrick.modules['LinksManager'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['managerPage'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links'].getOptionsHtml(doc, 'LinksManager', 'managerlink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var ownBoxBody = null;
		var mainBody = doc.getElementById('mainBody');

		var teamid = Foxtrick.util.id.findTeamId(mainBody);
		var teamname = Foxtrick.util.id.extractTeamName(mainBody);
		var userid = Foxtrick.util.id.findUserId(mainBody);
		var leaguename = Foxtrick.util.id.extractLeagueName(mainBody);
		var leagueid = Foxtrick.util.id.findLeagueLeveUnitId(mainBody);
   		var owncountryid = Foxtrick.util.id.getOwnLeagueId();

		var h1 = mainBody.getElementsByTagName('h1')[0];
		var username = h1.textContent.replace(/^\s+/, '').replace(/\s+$/, '')
			.replace(/\(.+/, '').replace(/\s+$/g, '');

		var links = Foxtrick.modules['Links'].getLinks('managerlink',
		                                               { 'teamid': teamid, 'teamname': teamname,
		                                               'userid': userid, 'username': username,
		                                               'leagueid': leagueid,
		                                               'owncountryid': owncountryid }, doc, this);
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
		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, { 'teamid': teamid,
		                        'teamname': teamname, 'userid': userid, 'username': username,
		                        'leagueid': leagueid, 'owncountryid': owncountryid });
	}
};
