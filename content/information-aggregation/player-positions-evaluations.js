/**
 * player-positions-evaluations.js
 * Compute and display player evaluation value for each position
 * @author Greblys, LA-MJ
 */

'use strict';

Foxtrick.modules.PlayerPositionsEvaluations = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails', 'transferSearchResult', 'players', 'ntPlayers'],
	CSS: Foxtrick.InternalPath + 'resources/css/player-positions-evaluations.css',
	OPTIONS: [
		'ShowBestPosition', 'Normalised',
		'FormIncluded', 'StaminaIncluded',
		'LoyaltyAndMCBIncluded', 'ExperienceIncluded', 'BruisedIncluded',
	],

	prefMap: {
		experience: 'ExperienceIncluded',
		loyalty: 'LoyaltyAndMCBIncluded',
		form: 'FormIncluded',
		stamina: 'StaminaIncluded',
		bruised: 'BruisedIncluded',
		normalise: 'Normalised',
	},
	paramMap: {
		CTR_VS_WG: 35 / 25,
		WBD_VS_CD: 1.7,
		WO_VS_FW: 1.3,
		IM_VS_CD: 0.6,
		MF_VS_ATT: 3,
		DF_VS_ATT: 1.1,
	},

	/**
	 * @return {PlayerContributionOpts}
	 */
	getPrefs: function() {
		var prefs = {};
		for (var pref in this.prefMap) {
			prefs[pref] = Foxtrick.Prefs.isModuleOptionEnabled(this, this.prefMap[pref]);
		}
		return prefs;
	},
	getDefaultPrefs: function() {
		return {
			experience: true,
			loyalty: true,
			form: true,
			stamina: true,
			bruised: true,
			normalise: true,
		};
	},
	setPrefs: function(prefs) {
		var mName = this.MODULE_NAME;
		for (var pref in this.prefMap) {
			Foxtrick.Prefs.setModuleEnableState(mName + '.' + this.prefMap[pref], prefs[pref]);
		}
	},

	/**
	 * @return {PlayerContributionParams}
	 */
	getParams: function() {
		var params = {};
		for (var param in this.paramMap) {
			var str = Foxtrick.Prefs.getString('PlayerPositionsEvaluations.' + param);
			params[param] = parseFloat(str) || this.paramMap[param];
		}
		return params;
	},
	setParams: function(params) {
		for (var param in this.paramMap) {
			var str = params[param].toString();
			Foxtrick.Prefs.setString('PlayerPositionsEvaluations.' + param, str);
		}
	},

	insertEvaluationsTable: function(doc, contributions) {
		var featDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
		featDiv.id = 'ft-ppe';
		var title = doc.createElement('h2');
		title.textContent = Foxtrick.L10n.getString('module.PlayerPositionsEvaluations.title');
		featDiv.appendChild(title);
		var table = doc.createElement('table');
		table.id = 'ft-ppe-table';
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
			td.id = 'ft-ppe-' + name;
			tr.appendChild(td);
			td = doc.createElement('td');
			td.className = 'ft-ppe-number';
			td.textContent = contributions[name].toFixed(2);
			tr.appendChild(td);
			tbody.appendChild(tr);
		}

		table.appendChild(tbody);
		featDiv.appendChild(table);

		var existing = doc.getElementById('ft-ppe-table');
		if (existing) {
			existing.parentNode.replaceChild(table, existing);
		}
		else {
			var entryPoint = doc.getElementById('mainBody');
			entryPoint.appendChild(featDiv);
		}
	},

	insertBestPosition: function(doc, contributions) {
		var module = this;
		if (Foxtrick.Prefs.isModuleOptionEnabled('PlayerPositionsEvaluations',
		                                         'ShowBestPosition')) {
			if (Foxtrick.Pages.Player.isSenior(doc)) {
				if (!doc.getElementsByClassName('playerInfo').length)
					return;

				// creating the new element
				var panel = Foxtrick.getMBElement(doc, 'pnlplayerInfo');
				var table = panel.querySelector('table');
				var row = Foxtrick.insertFeaturedRow(table, module, table.rows.length);
				Foxtrick.addClass(row, 'ft-best-player-position');
				var title = row.insertCell(0);
				title.textContent = Foxtrick.L10n.getString('BestPlayerPosition.title');
				var best = Foxtrick.Pages.Player.getBestPosition(contributions);
				if (best.position) {
					var str = Foxtrick.L10n.getString(best.position + 'Position');
					var bestPosCell = row.insertCell(1);
					bestPosCell.id = 'ft-ppe-bestPos';
					bestPosCell.dataset.position = best.position;
					bestPosCell.textContent = str + ' (' + best.value.toFixed(2) + ')';
				}
			}
			else if (Foxtrick.isPage(doc, 'transferSearchResult')) {
				let isNewDesign = Foxtrick.Pages.TransferSearchResults.isNewDesign(doc);
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
					if (!isNewDesign)
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

					table.parentElement.appendChild(container);
				}, playerList);
			}
		}
	},

	insertSettingsAndBreakDown: function(doc, skills, attrs) {
		var module = this;
		var PPE = 'PlayerPositionsEvaluations';
		var COLUMNS = ['center', 'wings', 'factor'];

		var updateSkills = function(doc) {
			// option change
			for (var pref in opts) {
				opts[pref] = doc.getElementById('ft-ppe-' + pref).checked;
			}
			for (var param in params) {
				var input = doc.getElementById('ft-ppe-' + param);
				params[param] = parseFloat(input.value) || params[param];
			}

			// update summary table
			var contributions = Foxtrick.Pages.Player.getContributions(skills, attrs, opts, params);
			module.insertEvaluationsTable(doc, contributions);

			factors = Foxtrick.Predict.contributionFactors(params);
			var effSkills = Foxtrick.Predict.effectiveSkills(skills, attrs, opts);

			var table = doc.getElementById('ft-ppeBd-table');
			var skillRows = table.tBodies[0].rows;
			Foxtrick.forEach(function(row) {
				var skill = row.dataset.skill;
				var input = row.querySelector('.ft-ppeBd-input');
				input.dataset.value = effSkills[skill];
				input.value = effSkills[skill].toFixed(2);
			}, skillRows);

			// updateFactors
			var select = doc.getElementById('ft-ppeBd-pos');
			updateFactors(doc, select.value);
		};
		var updateFactors = function(doc, position) {
			// position change
			var skills = factors[position];

			var table = doc.getElementById('ft-ppeBd-table');
			var skillRows = table.tBodies[0].rows;
			Foxtrick.forEach(function(row) {
				var skill = row.dataset.skill;
				if (!(skill in skills)) {
					Foxtrick.addClass(row, 'hidden');
					return;
				}
				Foxtrick.removeClass(row, 'hidden');

				var data = skills[skill];
				Foxtrick.forEach(function(datum) {
					var factor = row.querySelector('.ft-ppeBd-' + datum);
					factor.dataset.value = data[datum];
					factor.textContent = data[datum].toFixed(3);
				}, COLUMNS);
			}, skillRows);

			updateContributions(doc);
		};
		var updateContributions = function(doc) {
			// skill value change
			var table = doc.getElementById('ft-ppeBd-table');
			var skillRows = table.tBodies[0].rows;

			var sumFactors = 0, sumCntrbs = 0;
			Foxtrick.forEach(function(row) {
				if (Foxtrick.hasClass(row, 'hidden'))
					return;

				var skillEl = row.querySelector('.ft-ppeBd-input');
				var skill = parseFloat(skillEl.value) || 0;
				var dataSkill = parseFloat(skillEl.dataset.value) || 0;
				if (dataSkill.toFixed(2) == skillEl.value) {
					// unchanged so using exact value
					skill = dataSkill;
				}

				var results = Foxtrick.map(function(datum) {
					var factEl = row.querySelector('.ft-ppeBd-' + datum);
					var factor = parseFloat(factEl.dataset.value) || 0;
					var valEl = row.querySelector('.ft-ppeBd-' + datum + 'Val');
					var value = skill * factor;
					valEl.textContent = value.toFixed(3);

					return [factor, value];
				}, COLUMNS);

				var sums = results[2]; // sum only 'factor' for now
				sumFactors += sums[0];
				sumCntrbs += sums[1];
			}, skillRows);
			// update sums
			table.querySelector('.ft-ppeBd-sumFactors').textContent = sumFactors.toFixed(3);
			table.querySelector('.ft-ppeBd-sumCntrbs').textContent = sumCntrbs.toFixed(3);
			table.querySelector('.ft-ppeBd-norm').textContent = (sumCntrbs / sumFactors).toFixed(3);
		};
		var createControls = function(doc) {
			var controls = doc.createElement('div');
			controls.id = 'ft-ppe-controls';

			var cntrlHead = doc.createElement('h3');
			cntrlHead.textContent = Foxtrick.L10n.getString(PPE + '.settings');
			controls.appendChild(cntrlHead);

			var simple = doc.createElement('div');
			simple.id = 'ft-ppe-controlsSimple';
			controls.appendChild(simple);

			var simpleTitle = doc.createElement('p');
			simpleTitle.textContent = Foxtrick.L10n.getString(PPE + '.settings.title');
			simple.appendChild(simpleTitle);

			var inputs = [
				'experience',
				'loyalty',
				null,
				'form',
				'stamina',
				'bruised',
				null,
				'normalise',
			];

			var prefListener = function() {
				updateSkills(this.ownerDocument);
			};
			Foxtrick.forEach(function(s) {
				if (!s) {
					simple.appendChild(doc.createElement('br'));
					return;
				}

				var input = doc.createElement('input');
				input.type = 'checkbox';
				input.id = 'ft-ppe-' + s;
				input.checked = presetPrefs[s];
				Foxtrick.listen(input, 'change', prefListener);

				var label = doc.createElement('label');
				label.setAttribute('for', 'ft-ppe-' + s);
				label.textContent = strMap[s];

				simple.appendChild(input);
				simple.appendChild(label);
			}, inputs);

			var paramTable = doc.createElement('table');
			paramTable.id = 'ft-ppe-controlsAdvanced';
			paramTable.className = 'hidden';
			controls.appendChild(paramTable);

			var pRow = paramTable.insertRow(-1);
			var nameCell = pRow.appendChild(doc.createElement('th'));
			nameCell.textContent = Foxtrick.L10n.getString(PPE + '.parameter');
			var descCell = pRow.appendChild(doc.createElement('th'));
			descCell.textContent = Foxtrick.L10n.getString(PPE + '.description');
			var valCell = pRow.appendChild(doc.createElement('th'));
			valCell.textContent = Foxtrick.L10n.getString(PPE + '.value');
			var defCell = pRow.appendChild(doc.createElement('th'));
			defCell.textContent = Foxtrick.L10n.getString(PPE + '.default');

			for (var param in params) {
				pRow = paramTable.insertRow(-1);

				nameCell = pRow.insertCell(-1);
				nameCell.textContent = param;

				descCell = pRow.insertCell(-1);
				descCell.textContent = Foxtrick.L10n.getString(PPE + '.params.' + param + '.desc');

				valCell = pRow.insertCell(-1);
				var pInput = doc.createElement('input');
				pInput.id = 'ft-ppe-' + param;
				pInput.size = 1;
				pInput.value = params[param];
				Foxtrick.listen(pInput, 'change', prefListener);
				valCell.appendChild(pInput);

				defCell = pRow.insertCell(-1);
				defCell.textContent = module.paramMap[param];
			}

			var buttons = doc.createElement('div');
			buttons.id = 'ft-ppe-prefButtons';
			controls.appendChild(buttons);

			var btnSave = doc.createElement('a');
			btnSave.textContent = Foxtrick.L10n.getString('button.save');
			Foxtrick.addClass(btnSave, 'ft-link');
			Foxtrick.onClick(btnSave, function() {
				module.setPrefs(opts);
				module.setParams(params);

				var msg = Foxtrick.L10n.getString('status.saved');
				var doc = this.ownerDocument;
				var target = this.parentNode.parentNode;
				Foxtrick.util.note.add(doc, msg, null, { to: target });
			});
			buttons.appendChild(btnSave);

			buttons.appendChild(doc.createTextNode(' '));

			var btnReset = doc.createElement('a');
			btnReset.textContent = Foxtrick.L10n.getString('button.reset');
			Foxtrick.addClass(btnReset, 'ft-link');
			Foxtrick.onClick(btnReset, function() {
				var doc = this.ownerDocument;

				let o = Object.assign(opts, presetPrefs);
				for (var pref in o) {
					doc.getElementById('ft-ppe-' + pref).checked = o[pref];
				}

				let p = Object.assign(params, presetParams);
				for (var param in p) {
					doc.getElementById('ft-ppe-' + param).value = p[param];
				}
				updateSkills(doc);
			});
			buttons.appendChild(btnReset);

			buttons.appendChild(doc.createTextNode(' '));

			var btnAdvanced = doc.createElement('a');
			btnAdvanced.className = 'float_right';
			btnAdvanced.dataset.open = Foxtrick.L10n.getString('button.advanced');
			btnAdvanced.dataset.close = Foxtrick.L10n.getString('button.close');
			btnAdvanced.textContent = btnAdvanced.dataset.open;
			Foxtrick.addClass(btnAdvanced, 'ft-link');
			Foxtrick.onClick(btnAdvanced, function() {
				var doc = this.ownerDocument;

				var advanced = doc.getElementById('ft-ppe-controlsAdvanced');
				Foxtrick.toggleClass(advanced, 'hidden');
				var simple = doc.getElementById('ft-ppe-controlsSimple');
				Foxtrick.toggleClass(simple, 'hidden');

				var opened = Foxtrick.hasClass(simple, 'hidden');
				this.textContent = this.dataset[opened ? 'close' : 'open'];
			});
			buttons.appendChild(btnAdvanced);

			return controls;
		};
		var createBreakDown = function(doc) {
			var breakdown = doc.createElement('div');
			breakdown.id = 'ft-ppe-breakdown';

			var bdHead = doc.createElement('h3');
			Foxtrick.addClass(bdHead, 'float_left');
			bdHead.textContent = Foxtrick.L10n.getString(PPE + '.breakdown');
			breakdown.appendChild(bdHead);

			var posDiv = doc.createElement('h3');
			posDiv.id = 'ft-ppeBd-posDiv';
			Foxtrick.addClass(posDiv, 'float_right');
			breakdown.appendChild(posDiv);

			var posLabel = doc.createElement('label');
			posLabel.setAttribute('for', 'ft-ppeBd-pos');
			posLabel.textContent = Foxtrick.L10n.getString(PPE + '.position');
			posDiv.appendChild(posLabel);

			posDiv.appendChild(doc.createTextNode(' '));

			var posSelect = doc.createElement('select');
			posSelect.id = 'ft-ppeBd-pos';
			Foxtrick.listen(posSelect, 'change', function() {
				var doc = this.ownerDocument;
				updateFactors(doc, this.value);
			});
			posDiv.appendChild(posSelect);

			var bestPosCell = doc.getElementById('ft-ppe-bestPos');
			var bestPos = bestPosCell ? bestPosCell.dataset.position : null;
			for (var pos in factors) {
				var option = doc.createElement('option');
				option.value = pos;
				option.selected = pos === bestPos;
				option.textContent = Foxtrick.L10n.getString(pos + 'Position');
				posSelect.appendChild(option);
			}

			var table = createBreakDownTable(doc);
			breakdown.appendChild(table);

			return breakdown;
		};
		var createBreakDownTable = function(doc) {
			var addRow = function(skill) {
				var row = tbody.insertRow(-1);
				row.className = 'hidden';
				row.dataset.skill = skill;

				var skillTd = row.insertCell(-1);
				skillTd.className = 'ft-ppeBd-skill';
				skillTd.textContent = strMap[skill];

				var inputTd = row.insertCell(-1);
				inputTd.className = 'ft-ppeBd-NaN';
				var input = doc.createElement('input');
				input.className = 'ft-ppeBd-input';
				input.size = 1;
				input.maxLength = 5;
				Foxtrick.listen(input, 'change', function() {
					var doc = this.ownerDocument;
					updateContributions(doc);
				});
				inputTd.appendChild(input);

				inputTd.appendChild(doc.createTextNode(' '));

				var reset = doc.createElement('a');
				reset.className = 'ft-link';
				reset.textContent = '↻';
				reset.title = Foxtrick.L10n.getString('button.reset');
				reset.setAttribute('aria-label', reset.title);
				Foxtrick.onClick(reset, function() {
					var doc = this.ownerDocument;
					var input = this.previousElementSibling;
					input.value = parseFloat(input.dataset.value).toFixed(2);
					updateContributions(doc);
				});
				inputTd.appendChild(reset);

				Foxtrick.forEach(function(datum) {
					var factEl = row.insertCell(-1);
					factEl.className = 'ft-ppeBd-' + datum;
					var valEl = row.insertCell(-1);
					valEl.className = 'ft-ppeBd-' + datum + 'Val';
				}, COLUMNS);
			};

			var table = doc.createElement('table');
			table.id = 'ft-ppeBd-table';

			var thead = doc.createElement('thead');
			table.appendChild(thead);
			var headRow1 = thead.insertRow(-1);

			var skillsTh = doc.createElement('th');
			skillsTh.colSpan = 2;
			skillsTh.rowSpan = 2;
			skillsTh.textContent = Foxtrick.L10n.getString(PPE + '.effectiveSkills');
			skillsTh.title = Foxtrick.L10n.getString(PPE + '.effectiveSkills.title');
			skillsTh.setAttribute('data-label', skillsTh.title);
			headRow1.appendChild(skillsTh);

			var centerTh = doc.createElement('th');
			centerTh.colSpan = 2;
			centerTh.textContent = Foxtrick.L10n.getString(PPE + '.center');
			headRow1.appendChild(centerTh);

			var wingsTh = doc.createElement('th');
			wingsTh.colSpan = 2;
			wingsTh.textContent = Foxtrick.L10n.getString(PPE + '.wings');
			headRow1.appendChild(wingsTh);

			var cntrbTh = doc.createElement('th');
			cntrbTh.colSpan = 2;
			cntrbTh.textContent = Foxtrick.L10n.getString(PPE + '.contribution');
			cntrbTh.title = Foxtrick.L10n.getString(PPE + '.contribution.title');
			cntrbTh.setAttribute('data-label', cntrbTh.title);
			headRow1.appendChild(cntrbTh);

			var headRow2 = thead.insertRow(-1);
			for (var i = 0; i < 3; i++) {
				var factorTh = doc.createElement('th');
				factorTh.textContent = '×';
				headRow2.appendChild(factorTh);
				var valueTh = doc.createElement('th');
				valueTh.textContent = '=';
				headRow2.appendChild(valueTh);
			}

			var tbody = doc.createElement('tbody');
			table.appendChild(tbody);

			for (var skill in skills)
				addRow(skill);

			var tfoot = doc.createElement('tfoot');
			table.appendChild(tfoot);

			var footRow1 = tfoot.insertRow(-1);
			var sumLabel = footRow1.insertCell(-1);
			sumLabel.className = 'ft-ppeBd-NaN';
			sumLabel.colSpan = 6;
			sumLabel.textContent = 'Σ';
			var sumFactors = footRow1.insertCell(-1);
			sumFactors.className = 'ft-ppeBd-sumFactors';
			var sumCntrbs = footRow1.insertCell(-1);
			sumCntrbs.className = 'ft-ppeBd-sumCntrbs';

			var footRow2 = tfoot.insertRow(-1);
			var normLabel = footRow2.insertCell(-1);
			normLabel.colSpan = 7;
			normLabel.className = 'ft-ppeBd-NaN';
			normLabel.textContent = Foxtrick.L10n.getString(PPE + '.normalised');
			normLabel.title = Foxtrick.L10n.getString(PPE + '.normalised.title');
			normLabel.setAttribute('aria-label', normLabel.title);
			var norm = footRow2.insertCell(-1);
			norm.className = 'ft-ppeBd-norm';

			return table;
		};

		var presetPrefs = module.getPrefs();
		var opts = Object.assign({}, presetPrefs);
		var presetParams = module.getParams();
		var params = Object.assign({}, presetParams);
		var factors = Foxtrick.Predict.contributionFactors(params);

		var strMap = {
			experience: '',
			loyalty: '',
			form: '',
			stamina: '',
			bruised: PPE + '.bruised',
			normalise: PPE + '.normalise',
			keeper: '',
			defending: '',
			playmaking: '',
			passing: '',
			winger: '',
			scoring: '',
		};
		for (var str in strMap) {
			var code;
			if (strMap[str]) {
				code = strMap[str];
			}
			else
				code = str.replace(/^./, function(m) { return m.toUpperCase(); });

			strMap[str] = Foxtrick.L10n.getString(code);
		}

		var controls = createControls(doc);
		var breakdown = createBreakDown(doc);

		var entryPoint = doc.getElementById('ft-ppe');
		entryPoint.appendChild(doc.createElement('hr'));
		entryPoint.appendChild(controls);
		entryPoint.appendChild(doc.createElement('hr'));
		entryPoint.appendChild(breakdown);

		// first run
		updateSkills(doc);
	},

	run: function(doc) {
		var module = this;
		if (Foxtrick.Pages.Player.isSenior(doc)) {
			if (Foxtrick.Pages.Player.wasFired(doc))
				return;

			var skills = Foxtrick.Pages.Player.getSkills(doc);
			if (!skills)
				return;

			var attrs = Foxtrick.Pages.Player.getAttributes(doc);
			attrs.bruised = Foxtrick.Pages.Player.isBruised(doc);
			attrs.transferListed = Foxtrick.Pages.Player.isTransferListed(doc);
			attrs.specialtyNumber = Foxtrick.Pages.Player.getSpecialtyNumber(doc);

			var contributions = Foxtrick.Pages.Player.getContributions(skills, attrs);
			module.insertBestPosition(doc, contributions);
			module.insertEvaluationsTable(doc, contributions);
			module.insertSettingsAndBreakDown(doc, skills, attrs);
		}
		else
			module.insertBestPosition(doc, {});
	},
};
