'use strict';
/**
 * best-player-position.js
 * Show best position for player
 * @author Lukas Greblikas (greblys)
 */

Foxtrick.modules['BestPlayerPosition'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails', 'transferSearchResult', 'players'],

	run: function(doc) {
		var module = this;
		if (Foxtrick.Pages.Player.isSeniorPlayerPage(doc)) {
			if (!doc.getElementsByClassName('playerInfo').length)
				return;

			var skills = Foxtrick.Pages.Player.getSkills(doc);
			if (!skills)
				return;

			// creating the new element
			var table = doc.querySelector('#ctl00_ctl00_CPContent_CPMain_pnlplayerInfo table');
			var row = Foxtrick.insertFeaturedRow(table, module, table.rows.length);
			Foxtrick.addClass(row, 'ft-best-player-position');
			var title = row.insertCell(0);
			title.textContent = Foxtrick.L10n.getString('BestPlayerPosition.title');
			var bestPositionCell = row.insertCell(1);
			var speciality = Foxtrick.Pages.Player.getSpeciality(doc);
			var contributions = Foxtrick.Pages.Player.getContributions(skills, speciality);
			var bestPositionValue = Foxtrick.Pages.Player.getBestPosition(contributions);
			bestPositionCell.textContent =
				Foxtrick.L10n.getString(bestPositionValue.position + 'Position') +
				' (' + bestPositionValue.value.toFixed(1) + ')';

		}
		else if (Foxtrick.isPage(doc, 'transferSearchResult')) {
			var list = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
			// filter out players with out skill data (after deadline)
			var transfers = Foxtrick.filter(function(p) {
				return typeof p.bestPositionValue !== 'undefined';
			}, list);
			Foxtrick.forEach(function(p) {
				var table = p.playerNode.querySelector('.transferPlayerSkills table');
				var row = Foxtrick.insertFeaturedRow(table, module, table.rows.length);
				Foxtrick.addClass(row, 'ft-best-player-position');
				var title = row.insertCell(0);
				title.colSpan = '2';
				var b = doc.createElement('strong');
				b.textContent = Foxtrick.L10n.getString('BestPlayerPosition.title');
				title.appendChild(b);
				var bestPositionCell = row.insertCell(1);
				bestPositionCell.colSpan = '2';
				bestPositionCell.textContent = p.bestPositionLong +
					' (' + p.bestPositionValue.toFixed(1) + ')';
			}, transfers);
		}
		else if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc) &&
		         Foxtrick.Pages.Players.isOwnPlayersPage(doc)) {
			var playerList = Foxtrick.Pages.Players.getPlayerList(doc);
			Foxtrick.forEach(function(p) {
				var table = p.playerNode.querySelector('table');
				var container = Foxtrick.createFeaturedElement(doc, module, 'div');
				Foxtrick.addClass(container, 'ft-best-player-position');
				container.textContent = Foxtrick.L10n.getString('BestPlayerPosition.title') +
					' ' + p.bestPositionLong + ' (' + p.bestPositionValue.toFixed(1) + ')';

				var before = table.nextSibling;
				before.parentNode.insertBefore(container, before);
			}, playerList);
		}
	}
};
