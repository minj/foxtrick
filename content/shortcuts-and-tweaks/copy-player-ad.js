/**
 * copy-player-ad.js
 * Copies a player ad to the clipboard
 * @author larsw84, ryanli
 */

'use strict';

Foxtrick.modules['CopyPlayerAd'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['playerDetails', 'youthPlayerDetails'],
	OPTIONS: ['Sorted', 'NonTableStyle'],

	CSS: Foxtrick.InternalPath + 'resources/css/copy-player-ad.css',

	run: function(doc) {
		// skip non-existent and free agents
		var header = Foxtrick.Pages.All.getMainHeader(doc);
		var link = Foxtrick.util.id.findTeamId(header);
		if (!link)
			return;

		var button = Foxtrick.util.copyButton.add(doc, Foxtrick.L10n.getString('copy.playerad'));
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-player-ad');
			Foxtrick.onClick(button, this.createPlayerAd);
		}
	},
	/* eslint-disable complexity */
	createPlayerAd: function(ev) {
		var doc = ev.target.ownerDocument;
		var isSenior = Foxtrick.Pages.Player.isSenior(doc);
		try {
			var ad = '';

			ad += Foxtrick.Pages.Player.getName(doc);
			if (isSenior)
				ad += ' [playerid=' + Foxtrick.Pages.Player.getId(doc) + ']\n';
			else
				ad += ' [youthplayerid=' + Foxtrick.Pages.Player.getId(doc) + ']\n';

			// nationality, age and next birthday
			var byLine = doc.querySelector('.byline');

			// add new lines before <p> so that textContent would have breaks
			// at <p>s.
			var byLinePars = byLine.getElementsByTagName('p');
			Foxtrick.forEach(function(p) {
				p.parentNode.insertBefore(doc.createTextNode('\n'), p);
			}, byLinePars);
			ad += byLine.textContent.trim() + '\n\n';

			var nationality = Foxtrick.Pages.Player.getNationalityName(doc);
			if (nationality)
				ad += Foxtrick.L10n.getString('Nationality') + ': ' + nationality + '\n\n';

			let { isNewDesign, isYouth, table: infoTable } =
				Foxtrick.Pages.Player.getInfoTable(doc);

			let playerInfo;
			if (isNewDesign || isYouth) {
				playerInfo = doc.createDocumentFragment();
				let el = byLine.nextElementSibling;
				while (el && !el.classList.contains('playerInfo') &&
				       !el.querySelector('.playerInfo')) {
					// let text = el.textContent.trim();
					playerInfo.appendChild(Foxtrick.cloneElement(el, true));
					if (el.nodeName == 'P')
						playerInfo.appendChild(doc.createTextNode('\n'));

					el = el.nextElementSibling;
				}
				playerInfo.appendChild(Foxtrick.cloneElement(infoTable, true));
			}
			else {
				playerInfo = doc.querySelector('.playerInfo');
			}

			// basic information
			// for senior players:
			// (coach), form, stamina, experience, leadership, personality (always there)
			// for youth players:
			// specialty (only when he has a specialty)
			var basicInfo, specialtyRow;
			if (isSenior) {
				// add new lines before <br> so that textContent would have breaks
				// at <br>s.
				basicInfo = Foxtrick.cloneElement(playerInfo, true);
				let tables = Foxtrick.toArray(basicInfo.querySelectorAll('table'));
				for (let tbl of tables)
					tbl.remove();

				var basicInfoBreaks = basicInfo.querySelectorAll('br');
				Foxtrick.forEach(function(br) {
					br.parentNode.insertBefore(doc.createTextNode('\n'), br);
				}, basicInfoBreaks);
				ad += basicInfo.textContent.trim() + '\n\n';
			}
			else {
				// sometime it's a string tag sometimes a paragraph seemingly
				basicInfo = playerInfo.querySelector('p') ||
					playerInfo.querySelector('strong');

				if (basicInfo) {
					let specialty = basicInfo.textContent.trim();

					// we will bold the specialty part, right after
					// colon plus space
					let colonRe = /:\s*/;
					let colonIndex = specialty.search(colonRe);
					let colonLength = specialty.match(colonRe)[0].length;
					let colonEndIdx = colonIndex + colonLength;
					ad += specialty.slice(0, colonEndIdx) + '[b]' +
						specialty.slice(colonEndIdx, colonEndIdx + specialty.length) +
						'[/b]\n\n';
				}
				else {
					specialtyRow = infoTable.querySelector('tr[id$="trSpeciality"]');
				}
			}

			// owner, TSI wage, etc.
			let tables = Foxtrick.toArray(playerInfo.querySelectorAll('table'));
			let table = tables.shift();
			if (table) {
				for (let [r, row] of [...table.rows].entries()) {
					let [header, data] = row.cells;
					ad += header.textContent.trim();

					if (typeof data === 'undefined') {
						ad += '\n\n';
						continue;
					}

					// remove teampopuplinks
					let teamLink;
					let cellCopy = Foxtrick.cloneElement(data, true);
					let popupLinks = Foxtrick.toArray(cellCopy.querySelectorAll('a'));
					if ((teamLink = popupLinks.shift()))
						teamLink.textContent = '[b]' + teamLink.textContent.trim() + '[/b]';

					for (let link of popupLinks)
						link.textContent = '';

					// bolding for specialty
					let part = cellCopy.textContent.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
					if (r === 5)
						part = '[b]' + part + '[/b]';

					ad += ' ' + part + '\n';
				}
				if (specialtyRow) {
					let [header, data] = specialtyRow.cells;
					ad += header.textContent.trim();
					let part = data.textContent.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
					ad += ' [b]' + part + '[/b]\n';
				}
				ad += '\n';

				if ((table = tables.shift()) && !isYouth) {
					// ad += '[table]\n';
					for (let [r, row] of [...table.rows].entries()) {
						let [header, data] = row.cells;
						// ad += '[tr][th]';
						ad += header.textContent.trim();
						// ad += '[/th]';

						let copy = Foxtrick.cloneElement(data, true);
						for (let tNode of Foxtrick.getTextNodes(copy)) {
							let text = tNode.textContent.replace(/\n/g, ' ').replace(/\s+/g, ' ');
							if (!text.trim()) {
								tNode.textContent = text;
								continue;
							}

							let parent = tNode.parentNode;
							if (!Foxtrick.hasClass(parent, 'ft-skill') &&
							    !Foxtrick.hasClass(parent, 'ft-skill-number') &&
							    parent.id != 'ft_bonuswage' &&
							    !text.startsWith(' '))
								text = ' ' + text;

							tNode.textContent = text.trimEnd();
						}

						let brs = copy.querySelectorAll('br');
						for (let br of Foxtrick.toArray(brs))
							br.parentNode.replaceChild(doc.createTextNode('\n'), br);

						let text = copy.textContent.trim();

						// bolding for specialty+htms
						if (r === 2 || r === 5)
							text = '[b]' + text + '[/b]';

						// ad += '[td]' + text + '[/td][/tr]\n';
						ad += ' ' + text + '\n';
					}

					// ad += '[/table]\n\n';
					ad += '\n';
				}
			}

			var formatSkill = function(text, value) {
				if (value > 5)
					return '[b]' + text + '[/b]';
				else if (value == 5)
					return '[i]' + text + '[/i]';

				return text;
			};

			// skills
			var skills = Foxtrick.Pages.Player.getSkillsWithText(doc);
			if (skills !== null) {
				var skillArray = [];
				if (isSenior) {
					for (let n in skills.names) {
						skillArray.push({
							name: skills.names[n],
							value: skills.values[n],
							text: skills.texts[n],
						});
					}
					if (Foxtrick.Prefs.isModuleOptionEnabled('CopyPlayerAd', 'Sorted') ||
					    doc.getElementsByClassName('percentImage').length > 0 ||
					    doc.getElementsByClassName('ft-percentImage').length > 0) {
						// if skills are sorted or skill bars are enabled,
						// the skills are arranged in a table with one cell
						// in each row
						if (Foxtrick.Prefs.isModuleOptionEnabled('CopyPlayerAd', 'Sorted')) {
							var skillSort = function(a, b) {
								return b.value - a.value;
							};

							// sort skills by level, descending
							skillArray.sort(skillSort);
						}

						if (Foxtrick.Prefs.isModuleOptionEnabled('CopyPlayerAd', 'NonTableStyle')) {
							ad += '\n';
							for (let s = 0; s < skillArray.length; ++s) {
								ad += skillArray[s].name + ': ' +
									formatSkill(skillArray[s].text, skillArray[s].value) + '\n';
							}
							ad += '\n';
						}
						else {
							ad += '[table]\n';
							for (let s = 0; s < skillArray.length; ++s) {
								ad += '[tr]' +
									'[th]' + skillArray[s].name + '[/th]' +
									'[td]' +
									formatSkill(skillArray[s].text, skillArray[s].value) +
									'[/td]' +
									'[/tr]\n';
							}
							ad += '[/table]';
						}
					}

					// otherwise, they are arranged in a table with two
					// cells in each row
					else if (Foxtrick.Prefs.isModuleOptionEnabled('CopyPlayerAd',
					                                              'NonTableStyle')) {
						ad += '\n';
						for (let s = 0; s < skillArray.length; ++s) {
							if (s % 2 == 1)
								ad += ' ';
							ad += skillArray[s].name + ': ' +
								formatSkill(skillArray[s].text, skillArray[s].value);
							if (s % 2 == 1)
								ad += '\n';
						}
						ad += '\n';
					}
					else {
						ad += '[table]\n';
						for (let [s, skill] of skillArray.entries()) {
							if (s % 2 === 0)
								ad += '[tr]';

							ad += '[th]' + skill.name + '[/th]';
							ad += `[td]${formatSkill(skill.text, skill.value)}[/td]`;

							if (s % 2 == 1)
								ad += '[/tr]\n';
						}
						if (skillArray.length % 2 == 1)
							ad += '[/tr]\n';

						ad += '[/table]';
					}
				}
				else {
					// for youth players, always in a table with one cell
					// in each row
					for (let n in skills.names) {
						skillArray.push({
							name: skills.names[n],
							current: {
								value: skills.values[n].current,
								text: skills.texts[n].current,
							},
							max: { value: skills.values[n].max, text: skills.texts[n].max },
							maxed: skills.values[n].maxed,
						});
					}

					if (Foxtrick.Prefs.isModuleOptionEnabled('CopyPlayerAd', 'Sorted')) {
						var sorter = function(a, b) {
							if (a.current.value !== b.current.value)
								return b.current.value - a.current.value;
							else if (a.max.value !== b.max.value)
								return b.max.value - a.max.value;

							return b.maxed - a.maxed;
						};

						// sort skills by current level, maximum level,
						// and whether the skill has reached the potential,
						// descending
						skillArray.sort(sorter);
					}
					if (Foxtrick.Prefs.isModuleOptionEnabled('CopyPlayerAd', 'NonTableStyle')) {
						ad += '\n';
						for (let s = 0; s < skillArray.length; ++s) {
							ad += skillArray[s].name + ': ' +
								(skillArray[s].maxed ? '[b]' : '') +
								skillArray[s].current.text + ' / ' + skillArray[s].max.text +
								(skillArray[s].maxed ? '[/b]' : '') +
								'\n';
						}
						ad += '\n';
					}
					else {
						ad += '[table]\n';
						for (let s = 0; s < skillArray.length; ++s) {
							ad += '[tr]' +
								'[th]' + skillArray[s].name + '[/th]' +
								'[td]' + (skillArray[s].maxed ? '[b]' : '') +
								skillArray[s].current.text + ' / ' + skillArray[s].max.text +
								(skillArray[s].maxed ? '[/b]' : '') +
								'[/td]' +
								'[/tr]\n';
						}
						ad += '[/table]';
					}
				}
			}

			// current bid information
			var bidDiv = Foxtrick.Pages.Player.getBidInfo(doc);
			if (bidDiv) {
				ad += '\n';
				var paragraphs = bidDiv.getElementsByTagName('p');
				for (let p = 0; p < paragraphs.length; p++) {
					var parCopy = Foxtrick.cloneElement(paragraphs[p], true);
					var links = parCopy.getElementsByTagName('a');
					for (let l = 1; l < links.length; l++)
						links[l].textContent = '';

					ad += parCopy.textContent.trim();
					ad += '\n';
				}
			}

			Foxtrick.copy(doc, ad);
			Foxtrick.util.note.add(doc, Foxtrick.L10n.getString('copy.playerad.copied'),
			                       'ft-playerad-copy-note');
		}
		catch (e) {
			Foxtrick.alert('createPlayerAd', e);
		}
	},
};
