'use strict';
/**
 * links-league.js
 * Foxtrick add links to series pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksLeague'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['series'],
	LINK_TYPE: 'serieslink',
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
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var thisdiv = Foxtrick.Pages.All.getMainHeader(doc);
		var seriesid = Foxtrick.util.id.findLeagueLeveUnitId(thisdiv);
		var leagueid = Foxtrick.util.id.findLeagueId(thisdiv);

		var seriesname = Foxtrick.util.id.extractLeagueName(thisdiv);

		var series = Foxtrick.util.id.parseSeries(seriesname, leagueid);
		var levelnum = series[0];
		var seriesnum = series[1];

		var info = {
			leagueid: leagueid,
			seriesid: seriesid,
			levelnum: levelnum,
			seriesnum: seriesnum,
			seriesname: seriesname,
		};
		return { info: info };
	}
};
