'use strict';
/**
 * header-fix.js
 * Script which fixes the header
 * @author htbaumanns, CSS by Catalyst2950
 */

Foxtrick.modules['HeaderFix'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	OPTIONS: ['FixLeft'],
	CSS: Foxtrick.InternalPath + 'resources/css/header-fix.css',
	OPTIONS_CSS: [Foxtrick.InternalPath + 'resources/css/header-fix-left.css'],

	run: function(doc) {

		// flash objects protrude from the header in Firefox
		var isArena = Foxtrick.isPage(doc, 'arena');
		var isMatch = Foxtrick.isPage(doc, 'match');

		// nothing to fix other than these two pages
		if (!isArena && !isMatch)
			return;

		if (doc.location.href.search(/Youth/i) != -1)
			return;

		var panel =
			doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlPreMatch');
		if (isArena)
			panel = doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlMain');
		var panelTeamInfo = doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlTeamInfo');
		var panelArenaFlash = doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlArenaFlash');

		// check right page and is supporter
		if (isMatch && (!panel || !panelTeamInfo))
			return;
		if (isArena && !panel)
			return;
		if (!panelArenaFlash)
			return;

		if (isArena && panel.getElementsByTagName('h1').length > 1)
			return; // don't move if arena is under constriction

		var mainBox = panel.getElementsByClassName('mainBox')[0];
		if (mainBox && Foxtrick.util.layout.isStandard(doc))
			mainBox.setAttribute('style', 'margin-bottom:0px;');

		// (re)move sperators
		var seps = Foxtrick.toArray(doc.querySelectorAll('#mainBody .separator'));
		if (seps.length) {
			var separator = seps.shift();
			panel.appendChild(separator);
			Foxtrick.forEach(function(sep) {
				sep.parentNode.removeChild(sep);
			}, seps);
		}

		// move flash
		panelArenaFlash = panel.removeChild(panelArenaFlash);
		Foxtrick.removeClass(panelArenaFlash, 'float_left');
		panel.appendChild(panelArenaFlash);
	}
};
