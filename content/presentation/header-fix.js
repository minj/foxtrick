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

	init: function() {
		if (Foxtrick.Prefs.isModuleOptionEnabled('HeaderFix', 'FixLeft'))
			Foxtrick.Prefs.setBool('module.HeaderFixLeft.enabled', true);
		else
			Foxtrick.Prefs.setBool('module.HeaderFixLeft.enabled', false);
	},

	run: function(doc) {

		var isArena = Foxtrick.isPage(doc, 'arena');
		var isMatch = Foxtrick.isPage(doc, 'match');

		// nothing to fix other than these two pages
		if (!isArena && !isMatch)
			return;

		if (doc.location.href.search(/Youth/i) != -1)
			return;

		var ctl00_ctl00_CPContent_CPMain_pnl =
			doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlPreMatch');
		if (isArena)
			ctl00_ctl00_CPContent_CPMain_pnl =
				doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlMain');
		var ctl00_ctl00_CPContent_CPMain_pnlTeamInfo =
			doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlTeamInfo');
		var ctl00_ctl00_CPContent_CPMain_pnlArenaFlash =
			doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlArenaFlash');

		// check right page and is supporter
		if (isMatch && (!ctl00_ctl00_CPContent_CPMain_pnl ||
		    !ctl00_ctl00_CPContent_CPMain_pnlTeamInfo))
			return;
		if (isArena && !ctl00_ctl00_CPContent_CPMain_pnl)
			return;
		if (!ctl00_ctl00_CPContent_CPMain_pnlArenaFlash)
			return;

		if (isArena && ctl00_ctl00_CPContent_CPMain_pnl.getElementsByTagName('h1').length > 1)
			return; // don't move if arena is under constriction

		// get some divs to move
		var arenaInfo = ctl00_ctl00_CPContent_CPMain_pnlArenaFlash.nextSibling;
		var separator = null;
		var mainBox = null;
		var divs = ctl00_ctl00_CPContent_CPMain_pnl.getElementsByTagName('div');
		for (var i = 0; i < divs.length; ++i) {
			if (divs[i].className == 'arenaInfo')
				arenaInfo = divs[i];
			if (divs[i].className == 'separator')
				separator = divs[i];
			if (divs[i].className == 'mainBox')
				mainBox = divs[i];
		}

		// reduce margins of new top div
		if (ctl00_ctl00_CPContent_CPMain_pnlTeamInfo)
			ctl00_ctl00_CPContent_CPMain_pnlTeamInfo
				.setAttribute('style', 'float:left !important; margin-top:-20px;');
		else {
			mainBox.getElementsByTagName('h2')[0].setAttribute('style', 'margin-top:-20px;');
			if (Foxtrick.util.layout.isStandard(doc))
				mainBox.setAttribute('style', 'margin-bottom:0px;');
		}

		// move or delete seperator
		if (separator && (isMatch || !Foxtrick.util.layout.isStandard(doc))) {
			separator = ctl00_ctl00_CPContent_CPMain_pnl.removeChild(separator);
			ctl00_ctl00_CPContent_CPMain_pnl.appendChild(separator);
		}
		// move areainfo
		if (arenaInfo) {
			arenaInfo = ctl00_ctl00_CPContent_CPMain_pnl.removeChild(arenaInfo);
			ctl00_ctl00_CPContent_CPMain_pnl.appendChild(arenaInfo);
			var margin;
			if (isArena)
				margin = 'margin-right:18px';
			else
				margin = '';
			if (Foxtrick.util.layout.isStandard(doc))
				arenaInfo.setAttribute('style', 'float:right !important;');
			else
				arenaInfo.setAttribute('style', 'float:right !important; width:190px !important;' +
				                       margin);
		}

		// move flash
		ctl00_ctl00_CPContent_CPMain_pnlArenaFlash = ctl00_ctl00_CPContent_CPMain_pnl.removeChild(ctl00_ctl00_CPContent_CPMain_pnlArenaFlash);
		ctl00_ctl00_CPContent_CPMain_pnl.appendChild(ctl00_ctl00_CPContent_CPMain_pnlArenaFlash);
		ctl00_ctl00_CPContent_CPMain_pnlArenaFlash.setAttribute('style', 'margin-top:25px;');
		if (isArena)
			ctl00_ctl00_CPContent_CPMain_pnlArenaFlash
				.setAttribute('style', 'margin-top:25px; margin-left:-8px !important;' +
				              ' margin-right:-3px !important;');
	}
};

Foxtrick.modules['HeaderFixLeft'] = {
	CSS: Foxtrick.InternalPath + 'resources/css/header-fix-left.css',

	init: function() {
		if (!Foxtrick.Prefs.isModuleEnabled('HeaderFix'))
			Foxtrick.Prefs.setBool('module.HeaderFixLeft.enabled', false);
	}
};
