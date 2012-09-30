'use strict';
/**
 * highlight-ownerless.js
 * Highlight ownerless teams
 * @author ljushaff, ryanli
 */

Foxtrick.modules['HighlightOwnerless'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['series'],

	run: function(doc) {
		var span = doc.getElementById('ctl00_ctl00_CPContent_CPMain_repLeagueTable');
		var table = span.getElementsByTagName('table')[0];
		var ownerless = table.getElementsByClassName('shy');
		for (var i = 0; i < ownerless.length; ++i) {
			Foxtrick.addClass(ownerless[i], 'ft-ownerless');
		}
	}
};
