'use strict';
/**
 * player-positions-evaluation.js
 * Compute and display player evaluation value for each position
 * @author Greblys
 */


Foxtrick.modules['PlayerPositionsEvaluations'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails', 'transferSearchResult', 'players', 'ntPlayers'],
	OPTIONS: ['ShowBestPosition', 'Normalised', 'FormIncluded', 'LoyaltyAndMotherClubBonusIncluded', 'ExperienceIncluded', 							'BruisedIncluded'],

	insertEvaluationsTable: function(doc, contributions) {
		
		var feat_div = Foxtrick.createFeaturedElement(doc, this, 'div');
		var entryPoint = doc.getElementById('mainBody');
		var title = doc.createElement('h2');
		title.textContent = Foxtrick.L10n.getString('module.PlayerPositionsEvaluations.title');
		feat_div.appendChild(title);
		var table = doc.createElement('table');
		Foxtrick.addClass(table, 'ft_positions_evaluations_table');
		var tbody = doc.createElement('tbody');

		var tr = doc.createElement('tr');
		var td = doc.createElement('th');
		td.textContent = Foxtrick.L10n.getString('module.PlayerPositionsEvaluations.position');
		tr.appendChild(td);
		td = doc.createElement('th');
		td.textContent =
			Foxtrick.L10n.getString('module.PlayerPositionsEvaluations.contribution');
		tr.appendChild(td);
		tbody.appendChild(tr);

		var sortable = [];
		for (var name in contributions)
			sortable.push([name, contributions[name]]);

		sortable.sort(function(a, b) { return b[1] - a[1]; });

		for (var item in sortable) {
			name = sortable[item][0];
			tr = doc.createElement('tr');
			td = doc.createElement('td');
			td.textContent = Foxtrick.L10n.getString(name + 'Position');
			tr.appendChild(td);
			td = doc.createElement('td');
			td.textContent = contributions[name];
			tr.appendChild(td);
			tbody.appendChild(tr);
		}

		table.appendChild(tbody);
		feat_div.appendChild(table);
		entryPoint.appendChild(feat_div);
	},

	insertBestPosition: function(module, doc, contributions) {
		if(Foxtrick.Prefs.isModuleOptionEnabled('PlayerPositionsEvaluations', 'ShowBestPosition')) {
			if (Foxtrick.Pages.Player.isSeniorPlayerPage(doc)) {
				if (!doc.getElementsByClassName('playerInfo').length)
					return;

				// creating the new element
				var table = doc.querySelector('#ctl00_ctl00_CPContent_CPMain_pnlplayerInfo table');
				var row = Foxtrick.insertFeaturedRow(table, module, table.rows.length);
				Foxtrick.addClass(row, 'ft-best-player-position');
				var title = row.insertCell(0);
				title.textContent = Foxtrick.L10n.getString('BestPlayerPosition.title');
				var bestPositionCell = row.insertCell(1);
				var bestPositionValue = Foxtrick.Pages.Player.getBestPosition(contributions);
				bestPositionCell.textContent =
					Foxtrick.L10n.getString(bestPositionValue.position + 'Position') +
					' (' + bestPositionValue.value.toFixed(2) + ')';

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
						' (' + p.bestPositionValue.toFixed(2) + ')';
				}, transfers);
			}
			else if (Foxtrick.isPage(doc, 'ownPlayers')) {
				var playerList = Foxtrick.Pages.Players.getPlayerList(doc);
				Foxtrick.forEach(function(p) {
					var table = p.playerNode.querySelector('table');
					var container = Foxtrick.createFeaturedElement(doc, module, 'div');
					Foxtrick.addClass(container, 'ft-best-player-position');
					container.textContent = Foxtrick.L10n.getString('BestPlayerPosition.title') +
						' ' + p.bestPositionLong + ' (' + p.bestPositionValue.toFixed(2) + ')';

					var before = table.nextSibling;
					before.parentNode.insertBefore(container, before);
				}, playerList);
			}
		}
	},

	run: function(doc) {
		if (Foxtrick.Pages.Player.isSeniorPlayerPage(doc)) {
			var id = Foxtrick.Pages.Player.getId(doc);
			Foxtrick.Pages.Player.getPlayer(doc, id, function(player) {
				var skills = Foxtrick.Pages.Player.getSkills(doc);
				player.bruised = player.InjuryLevel == 0;
				var contributions = Foxtrick.Pages.Player.getContributions(skills, player);
				Foxtrick.modules['PlayerPositionsEvaluations'].insertEvaluationsTable(doc, contributions);
				//lets reuse contributions and don't recalculate them for bestPosition
				Foxtrick.modules['PlayerPositionsEvaluations'].insertBestPosition(this, doc, contributions);
			});
		} else
				Foxtrick.modules['PlayerPositionsEvaluations'].insertBestPosition(this, doc, {});
	},
};
