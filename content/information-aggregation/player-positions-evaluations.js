'use strict';
/**
 * player-positions-evaluation.js
 * Compute and display player evaluation value for each position
 * @author Lukas Greblikas (greblys)
 */


Foxtrick.modules['PlayerPositionsEvaluations'] = {
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ['playerDetails'],
        
        run : function(doc) {

		if(Foxtrick.Pages.Player.isSeniorPlayerPage(doc)) {
			var speciality = Foxtrick.Pages.Player.getSpeciality(doc);
			var skills = Foxtrick.Pages.Player.getSkills(doc);
			
			if (skills.defending == null) {
				return;
			}
			var contributions = Foxtrick.Pages.Player.getPositionsContributions(skills, speciality);
			var feat_div = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.PlayerPositionsEvaluations, 'div');
			var entryPoint = doc.querySelector('#mainBody');
			var title = doc.createElement('h2');
			title.appendChild(doc.createTextNode(Foxtrick.L10n.getString("module.PlayerPositionsEvaluations.title")));
			feat_div.appendChild(title);
			var table = doc.createElement('table');
			Foxtrick.addClass(table, 'ft_positions_evaluations_table');
			var tbody = doc.createElement('tbody');
			
			var tr = doc.createElement('tr');
			var td = doc.createElement('th');
			td.textContent = "Position";
			tr.appendChild(td);
			td = doc.createElement('th');
			td.textContent = "Contribution";
			tr.appendChild(td);
			tbody.appendChild(tr);
			for(name in contributions) {
				tr = doc.createElement('tr');
				td = doc.createElement('td');
				td.textContent = Foxtrick.L10n.getString(name + "Position");
				tr.appendChild(td);
				td = doc.createElement('td');
				td.textContent = contributions[name];
				tr.appendChild(td);
				tbody.appendChild(tr);
			}
			
			table.appendChild(tbody);
			feat_div.appendChild(table);			
			entryPoint.appendChild(feat_div);
			
			/*
			var td = doc.createElement('td');
			var check = doc.createElement('input');
			check.id = properties[i].name;
			check.setAttribute('type', 'checkbox');
			if (properties[i].enabled) {
				check.setAttribute('checked', 'checked');
			}
			td.appendChild(check);
			headRow.appendChild(th);
			checkRow.appendChild(td);
			*/
		};
        },
}