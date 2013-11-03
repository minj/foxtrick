'use strict';
/**
 * youth-skill-hide-unknown.js
 * Hide unknown skills and/or 'maximum' word on youth players page
 * @author convincedd
 */

Foxtrick.modules['YouthSkillHideUnknown'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['youthPlayers'],
	OPTIONS: ['HideUnknown', 'HideMaximalKeyWord'],

	run: function(doc) {
		// checks whether a table cell (<td> element) is unknown
		var isUnknown = function(cell) {
			return cell.getElementsByClassName('youthSkillBar').length == 0
				&& cell.getElementsByClassName('highlight').length == 0;
		};

		// only for own team
		var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		if (ownTeamId != teamId)
			return;

		var playerInfos = doc.getElementsByClassName('playerInfo');
		for (var i = 0; i < playerInfos.length; i++) {
			var playerInfo = playerInfos[i];
			var trs = playerInfo.getElementsByTagName('table')[0].getElementsByTagName('tr');
			for (var j = 0; j < trs.length; j++) {
				var tds = trs[j].getElementsByTagName('td');
				if (Foxtrick.Prefs.isModuleOptionEnabled('YouthSkillHideUnknown', 'HideUnknown')) {
					if (isUnknown(tds[1]))
						Foxtrick.addClass(trs[j], 'hidden');
				}
				if (Foxtrick.Prefs.isModuleOptionEnabled('YouthSkillHideUnknown',
				    'HideMaximalKeyWord')) {
					var skillBars = doc.getElementsByClassName('youthSkillBar');
					Foxtrick.map(function(skillBar) {
						var textNodes = Foxtrick.filter(function(n) {
							return n.nodeType == Foxtrick.NodeTypes.TEXT_NODE;
						}, skillBar.childNodes);
						for (var i = 0; i < textNodes.length; ++i)
							textNodes[i].textContent = (i == 1) ? ' / ' : ' ';
					}, skillBars);
				}
			}
		}
	}
};
