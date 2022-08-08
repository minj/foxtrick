/**
 * highlight-ownerless.js
 * Highlight ownerless teams
 * @author ljushaff, ryanli
 */

'use strict';

Foxtrick.modules.HighlightOwnerless = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['series'],

	/** @param {document} doc */
	run: function(doc) {
		let table = Foxtrick.Pages.Series.getTable(doc);
		if (table) {
			let ownerless = table.getElementsByClassName('shy');
			for (let shy of ownerless)
				Foxtrick.addClass(shy, 'ft-ownerless');
		}
	},
};
