'use strict';
/**
* htms-points.js
* Foxtrick show HTMS points in player page
* @author taised
*/

Foxtrick.modules['HTMSPoints'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails', 'transferSearchResult', 'players'],
	OPTIONS: ['AddToPlayer', 'AddToSearchResult', 'AddToPlayerList'],

	run: function(doc) {
		var getLink = function(skillList) {
			var lang = Foxtrick.Prefs.getString('htLanguage');
			var prefix = 'http://www.fantamondi.it/HTMS/index.php?page=htmspoints&lang=' + lang +
				'&action=calc';
			var link = doc.createElement('a');
			link.textContent = Foxtrick.L10n.getString('HTMSPoints');
			link.href = prefix + skillList;
			link.target = '_blank';
			return link;
		};

		var AddToPlayer = Foxtrick.Prefs.isModuleOptionEnabled('HTMSPoints', 'AddToPlayer');
		var AddToSearchResult = Foxtrick.Prefs.isModuleOptionEnabled('HTMSPoints',
		                                                            'AddToSearchResult');
		var AddToPlayerList = Foxtrick.Prefs.isModuleOptionEnabled('HTMSPoints', 'AddToPlayerList');

		if (Foxtrick.isPage(doc, 'playerDetails') && AddToPlayer) {
			if (!doc.getElementsByClassName('playerInfo').length)
				return;
			var age = Foxtrick.Pages.Player.getAge(doc);
			var skills = Foxtrick.Pages.Player.getSkillsWithText(doc);
			if (skills === null) {
				return; // no skills available, goodbye
			}

			var skillList = '&anni=' + age.years + '&giorni=' + age.days;
			var skillArray = [];
			skillArray['years'] = age.years;
			skillArray['days'] = age.days;
			//checking if bars or not
			var hasBars = (doc.getElementsByClassName('percentImage').length > 0)
							|| (doc.getElementsByClassName('ft-percentImage').length > 0);
			var totSkills = 0;
			if (hasBars) {
				//bars
				var skillOrder = [
					'keeper', 'defending', 'playmaking', 'winger', 'passing', 'scoring', 'setPieces'
				];
				var htmsValues = ['parate', 'difesa', 'regia', 'cross', 'passaggi', 'attacco', 'cp'];
				var j = 0, i;
				for (i in skills.names) {
					//Foxtrick.dump('text: '+skills.texts[i]+' name: '+skills.names[i]+'\n');
					skillList += '&' + htmsValues[j] + '=' + skills.values[i];
					skillArray[skillOrder[j]] = skills.values[i];
					totSkills += skills.values[i];
					j++;
				}
			}
			else {
				//normal, we skip stamina
				var skillOrder = [
					'keeper', 'playmaking', 'passing', 'winger', 'defending', 'scoring', 'setPieces'
				];
				var htmsValues = ['parate', 'regia', 'passaggi', 'cross', 'difesa', 'attacco', 'cp'];
				var skipStamina = true;
				var j = 0, i;
				for (i in skills.names) {
					if (skipStamina) {
						skipStamina = false;
					}
					else {
						skillList += '&' + htmsValues[j] + '=' + skills.values[i];
						skillArray[skillOrder[j]] = skills.values[i];
						totSkills += skills.values[i];
						j++;
					}
				}
			}

			if (totSkills > 0) {
				//creating the new element
				var table = doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlplayerInfo')
					.getElementsByTagName('table').item(0);
				var row = Foxtrick.insertFeaturedRow(table, this, table.rows.length);
				row.className = 'ft-htms-points';
				var link = row.insertCell(0);
				link.appendChild(getLink(skillList));
				var points = row.insertCell(1);
				var calcResult = this.calc(skillArray);
				points.textContent = Foxtrick.L10n.getString('HTMSPoints.AbilityAndPotential')
						.replace(/%1/, calcResult[0])
						.replace(/%2/, calcResult[1]);
			}
		}
		else if (Foxtrick.isPage(doc, 'transferSearchResult') && AddToSearchResult) {
			var skillOrder = [
				'keeper', 'playmaking', 'passing', 'winger', 'defending', 'scoring', 'setPieces'
			];
			var htmsValues = ['parate', 'regia', 'passaggi', 'cross', 'difesa', 'attacco', 'cp'];
			var players = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
			//Foxtrick.dump('found pp '+players.length+'\n');
			var transferPlayers = doc.getElementById('mainBody')
				.getElementsByClassName('transferPlayerInfo');
			var cellId = 0;
			for (var p = 0; p < players.length; ++p, ++cellId) {
				//if there is not the following container player is sold and skill aren't visible
				//Foxtrick.dump('htmsp: '+cellId+': ');
				if (transferPlayers[cellId].getElementsByClassName('transferPlayerCharacteristics')
				    .length > 0) {
					//getting skills
					var skillList = '&anni=' + players[cellId].age.years + '&giorni=' +
						players[cellId].age.days;
					var skillArray = [];
					skillArray['years'] = players[cellId].age.years;
					skillArray['days'] = players[cellId].age.days;

					for (var i = 0; i < 7; i++) {
						skillList += '&' + htmsValues[i] + '=' + players[cellId][skillOrder[i]];
						skillArray[skillOrder[i]] = players[cellId][skillOrder[i]];
					}
					//creating element
					var firstdiv = transferPlayers[cellId].getElementsByTagName('div')[0];
					var container = Foxtrick.createFeaturedElement(doc, this, 'span');
					container.className = 'ft-htms-points';
					container.appendChild(getLink(skillList));
					container.appendChild(doc.createTextNode(' '));
					var points = doc.createElement('span');
					var calcResult = this.calc(skillArray);
					points.textContent = Foxtrick.L10n.getString('HTMSPoints.AbilityAndPotential')
						.replace(/%1/, calcResult[0])
						.replace(/%2/, calcResult[1]);
					//points.appendChild(Foxtrick.util.note.createLoading(doc, true));
					container.appendChild(points);
					firstdiv.appendChild(container);
					//Foxtrick.dump('skills: '+skillList);
				}
				//Foxtrick.dump('\n');
			}
		}
		else if (Foxtrick.isPage(doc, 'players') && AddToPlayerList) {
			var playersHtml = doc.getElementsByClassName('playerInfo');
			var players = Foxtrick.modules.Core.getPlayerList();

			var skillOrder = [
				'keeper', 'playmaking', 'passing', 'winger', 'defending', 'scoring', 'setPieces'
			];
			var htmsValues = ['parate', 'regia', 'passaggi', 'cross', 'difesa', 'attacco', 'cp'];
			for (var p = 0; p < players.length; p++) {
				//getting skills...
				var totSkills = 0;
				var skillList = '&anni=' + players[p].age.years + '&giorni=' + players[p].age.days;
				var skillArray = [];
				skillArray['years'] = players[p].age.years;
				skillArray['days'] = players[p].age.days;

				for (var i = 0; i < 7; i++) {
					skillList += '&' + htmsValues[i] + '=' + players[p][skillOrder[i]];
					skillArray[skillOrder[i]] = players[p][skillOrder[i]];
					totSkills += players[p][skillOrder[i]];
				}

				//Only if skill are relevant we show points
				if (totSkills > 0) {
					// create elements
					var container = Foxtrick.createFeaturedElement(doc, this, 'div');
					container.className = 'ft-htms-points';
					container.appendChild(getLink(skillList));
					container.appendChild(doc.createTextNode(' '));
					var points = doc.createElement('span');
					//points.appendChild(Foxtrick.util.note.createLoading(doc, true));
					var calcResult = this.calc(skillArray);
					points.textContent = Foxtrick.L10n.getString('HTMSPoints.AbilityAndPotential')
						.replace(/%1/, calcResult[0])
						.replace(/%2/, calcResult[1]);
					container.appendChild(points);

					// insert it
					var tables = playersHtml[p].getElementsByTagName('table');
					var before = tables.item(0).nextSibling;
					before.parentNode.insertBefore(container, before);
				}
			}
		}
	},

	calc: function(skills) {
		var pointsAge = [];
		pointsAge[17] = 10;
		pointsAge[18] = 9.92;
		pointsAge[19] = 9.81;
		pointsAge[20] = 9.69;
		pointsAge[21] = 9.54;
		pointsAge[22] = 9.39;
		pointsAge[23] = 9.22;
		pointsAge[24] = 9.04;
		pointsAge[25] = 8.85;
		pointsAge[26] = 8.66;
		pointsAge[27] = 8.47;
		pointsAge[28] = 8.27;
		pointsAge[29] = 8.07;
		pointsAge[30] = 7.87;
		pointsAge[31] = 7.67;
		pointsAge[32] = 7.47;
		pointsAge[33] = 7.27;
		pointsAge[34] = 7.07;
		pointsAge[35] = 6.87;
		pointsAge[36] = 6.67;
		pointsAge[37] = 6.47;
		pointsAge[38] = 6.26;
		pointsAge[39] = 6.06;
		pointsAge[40] = 5.86;
		pointsAge[41] = 5.65;
		pointsAge[42] = 6.45;
		pointsAge[43] = 6.24;
		pointsAge[44] = 6.04;
		pointsAge[45] = 5.83;

		//keeper, defending, playmaking, winger, passing, scoring, setPieces
		var pointsSkills = [];
		pointsSkills[0] = [0, 0, 0, 0, 0, 0, 0];
		pointsSkills[1] = [2, 4, 4, 2, 3, 4, 1];
		pointsSkills[2] = [7, 13, 11, 8, 10, 12, 2];
		pointsSkills[3] = [16, 29, 25, 17, 23, 26, 5];
		pointsSkills[4] = [29, 52, 44, 31, 41, 46, 9];
		pointsSkills[5] = [45, 81, 69, 48, 64, 72, 15];
		pointsSkills[6] = [64, 116, 99, 68, 91, 103, 21];
		pointsSkills[7] = [86, 157, 133, 92, 123, 139, 28];
		pointsSkills[8] = [112, 203, 172, 120, 159, 179, 37];
		pointsSkills[9] = [140, 254, 216, 150, 199, 225, 46];
		pointsSkills[10] = [171, 310, 263, 183, 243, 274, 56];
		pointsSkills[11] = [206, 373, 317, 220, 293, 330, 68];
		pointsSkills[12] = [245, 444, 378, 262, 349, 393, 81];
		pointsSkills[13] = [289, 525, 447, 310, 412, 465, 95];
		pointsSkills[14] = [340, 617, 525, 364, 484, 546, 112];
		pointsSkills[15] = [398, 722, 614, 426, 566, 639, 131];
		pointsSkills[16] = [465, 844, 717, 498, 662, 747, 153];
		pointsSkills[17] = [544, 987, 840, 582, 774, 874, 179];
		pointsSkills[18] = [638, 1157, 984, 683, 908, 1025, 210];
		pointsSkills[19] = [747, 1356, 1153, 800, 1063, 1200, 246];
		pointsSkills[20] = [872, 1583, 1346, 934, 1242, 1402, 287];

		var actValue = pointsSkills[skills['keeper']][0];
		actValue += pointsSkills[skills['defending']][1];
		actValue += pointsSkills[skills['playmaking']][2];
		actValue += pointsSkills[skills['winger']][3];
		actValue += pointsSkills[skills['passing']][4];
		actValue += pointsSkills[skills['scoring']][5];
		actValue += pointsSkills[skills['setPieces']][6];

		//now calculating the potential at 28yo
		var points_diff = 0;
		if (skills['years'] < 28) {
			//we add days of his year to reach 112
			points_diff = ((112 - skills['days']) / 7) * pointsAge[skills['years']];
			//adding 16 weeks per whole year until 28 y.o.
			for (var i = skills['years'] + 1; i < 28; i++) {
				points_diff += 16 * pointsAge[i];
				//Foxtrick.log('adding '+pointsAge[i]+'');
			}
		}
		else {
			//we subtract days of his year to reach 112
			points_diff = (skills['days'] / 7) * pointsAge[skills['years']];
			//subtracting 16 weeks per whole year until 28
			for (var i = skills['years']; i > 28; i--) {
				points_diff += 16 * pointsAge[i];
				//Foxtrick.log('sub '+pointsAge[i]+'');
			}
			points_diff = -points_diff;
		}
		var potValue = actValue + points_diff;

		return ([actValue, Math.round(potValue)]);
	}
};
