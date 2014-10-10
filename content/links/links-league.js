'use strict';
/**
 * links-league.js
 * Foxtrick add links to league pages
 * @author convinced
 */

Foxtrick.modules['LinksLeague'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['series'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links'].getOptionsHtml(doc, 'LinksLeague', 'leaguelink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		//addExternalLinksToLeagueDetail
		var ownBoxBody = null;
		var thisdiv = Foxtrick.Pages.All.getMainHeader(doc);
		var leagueid = Foxtrick.util.id.findLeagueLeveUnitId(thisdiv);
		var countryid = Foxtrick.util.id.findLeagueId(thisdiv);

		var leaguename = Foxtrick.util.id.extractLeagueName(thisdiv);
		var leaguename2 = leaguename;
		var leaguename3 = leaguename;

		var seriesnum = Foxtrick.util.id.getSeriesNum(leaguename);
		var levelnum = Foxtrick.util.id.getLevelNum(leaguename, countryid);

		if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
			leaguename2 = 'I';
			leaguename3 = '1';
		}

		var links = Foxtrick.modules['Links'].getLinks('leaguelink', {
			'countryid': countryid,
			'leagueid': leagueid,
			'levelnum': levelnum,
			'seriesnum': seriesnum,
			'leaguename': leaguename,
			'leaguename2': leaguename2,
			'leaguename3': leaguename3
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
			'countryid': countryid,
			'leagueid': leagueid,
			'levelnum': levelnum,
			'seriesnum': seriesnum,
			'leaguename': leaguename
		});
	}
};
