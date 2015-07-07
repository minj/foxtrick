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
		var thisDiv = Foxtrick.Pages.All.getMainHeader(doc);
		var seriesId = Foxtrick.util.id.findLeagueLeveUnitId(thisDiv);
		var leagueId = Foxtrick.util.id.findLeagueId(thisDiv);

		var seriesName = Foxtrick.util.id.extractLeagueName(thisDiv);

		var series = Foxtrick.util.id.parseSeries(seriesName, leagueId);
		var levelNum = series[0];
		var seriesNum = series[1];

		var info = {
			leagueId: leagueId,
			seriesId: seriesId,
			levelNum: levelNum,
			seriesNum: seriesNum,
			seriesName: seriesName,
		};
		return { info: info };
	}
};
