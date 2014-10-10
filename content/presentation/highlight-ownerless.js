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
		var table = Foxtrick.Pages.Series.getTable(doc);
		var ownerless = table.getElementsByClassName('shy');
		for (var i = 0; i < ownerless.length; ++i) {
			Foxtrick.addClass(ownerless[i], 'ft-ownerless');
		}
	}
};
