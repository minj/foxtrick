'use strict';
/**
 * move-manager-online.js
 * Move online managers to the top of the page on region page
 * @author convinced, ryanli
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.modules['MoveManagerOnline'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['region'],

	run: function(doc) {
		var mainBody = doc.getElementById('mainBody');
		var mainBoxes = mainBody.getElementsByClassName('mainBox');
		// consider managerBox as the last mainBox
		var managerBox = mainBoxes[mainBoxes.length - 1];
		var target = mainBody.getElementsByClassName('separator')[0].nextSibling;
		target.parentNode.insertBefore(managerBox, target);
	}
};
