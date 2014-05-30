'use strict';
/**
 * player-positions-evaluation.js
 * Compute and display player evaluation value for each position
 * @author Lukas Greblikas (greblys)
 */


Foxtrick.modules['PlayerPositionsEvaluations'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails'],

	run: function(doc) {

		if (Foxtrick.Pages.Player.isSeniorPlayerPage(doc)) {
			var speciality = Foxtrick.Pages.Player.getSpeciality(doc);
			var skills = Foxtrick.Pages.Player.getSkills(doc);

			if (!skills)
				return;

			var contributions = Foxtrick.Pages.Player.getContributions(skills, speciality);
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
			for (var name in contributions) {
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
		}
	},
}
