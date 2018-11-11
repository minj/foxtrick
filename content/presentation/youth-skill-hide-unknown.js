/**
 * youth-skill-hide-unknown.js
 * Hide unknown skills and/or 'maximum' word on youth players page
 * @author convincedd, LA-MJ
 */

'use strict';

Foxtrick.modules['YouthSkillHideUnknown'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['youthPlayers'],
	OPTIONS: ['HideUnknown', 'HideMaximalKeyWord'],

	run: function(doc) {
		// only for own team
		var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		if (ownTeamId != teamId)
			return;

		if (Foxtrick.Pages.Players.isYouthPerfView(doc))
			return;

		// checks whether a table cell (<td> element) is unknown
		var isUnknown = function(row) {
			return !row.querySelector('.youthSkillBar, .highlight, .skill, .ht-bar') &&
				!row.id.endsWith('trSpeciality');
		};

		var hideUnknown = Foxtrick.Prefs.isModuleOptionEnabled(this, 'HideUnknown');
		var hideMaximal = Foxtrick.Prefs.isModuleOptionEnabled(this, 'HideMaximalKeyWord');

		var playerInfos = doc.getElementsByClassName('playerInfo');
		for (let playerInfo of playerInfos) {
			let table = playerInfo.querySelector('table');
			for (let row of table.rows) {
				if (hideUnknown) {
					if (isUnknown(row))
						Foxtrick.addClass(row, 'hidden');
				}

				let skillBar = row.querySelector('.youthSkillBar');
				if (!hideMaximal || !skillBar)
					continue;

				let nodes = [...skillBar.childNodes];
				let textNodes = nodes.filter(n => n.nodeType == Foxtrick.NodeTypes.TEXT_NODE);
				for (let [idx, node] of textNodes.entries())
					node.textContent = idx == 1 ? ' / ' : ' ';
			}
		}
	},
};
