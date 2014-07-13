'use strict';
/**
 * player-positions-evaluation.js
 * Compute and display player evaluation value for each position
 * @author Lukas Greblikas (greblys)
 */


Foxtrick.modules['PlayerPositionsEvaluations'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails'],
  //Might be better to add this option as global because it used not only by this module
  OPTIONS: ['Normalised'],

	run: function(doc) {

		if (Foxtrick.Pages.Player.isSeniorPlayerPage(doc)) {
			var speciality = Foxtrick.Pages.Player.getSpeciality(doc);
			var skills = Foxtrick.Pages.Player.getSkills(doc);

			if (!skills)
				return;

			// for testing specific players
			/*
			skills.keeper = 1;
			skills.defending = 7;
			skills.passing = 4;
			skills.playmaking = 5;
			skills.scoring = 5;
			skills.setPieces = 4;
			skills.winger = 4;
			speciality = ""
			console.log(skills);
			*/
			
			
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

			var sortable = []
			for (var name in contributions) sortable.push([name, contributions[name]]);
			sortable.sort(function(a, b) {return b[1] - a[1]});
			for (var item in sortable) {
				name = sortable[item][0]
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
