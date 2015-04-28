'use strict';
/**
 * links-league.js
 * Foxtrick add links to series pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksLeague'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['series'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'serieslink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var thisdiv = Foxtrick.Pages.All.getMainHeader(doc);
		var seriesid = Foxtrick.util.id.findLeagueLeveUnitId(thisdiv);
		var leagueid = Foxtrick.util.id.findLeagueId(thisdiv);

		var seriesname = Foxtrick.util.id.extractLeagueName(thisdiv);
		var seriesname2 = seriesname;
		var seriesname3 = seriesname;

		var seriesnum = Foxtrick.util.id.getSeriesNum(seriesname);
		var levelnum = Foxtrick.util.id.getLevelNum(seriesname, leagueid);

		if (!seriesname.match(/^[A-Z]+\.\d+/i)) {
			seriesname2 = 'I';
			seriesname3 = '1';
		}

		var info = {
			leagueid: leagueid,
			seriesid: seriesid,
			levelnum: levelnum,
			seriesnum: seriesnum,
			seriesname: seriesname,
			seriesname2: seriesname2,
			seriesname3: seriesname3
		};
		var types = ['serieslink'];
		return { types: types, info: info };
	}
};
