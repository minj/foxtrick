/**
 * copy-player-ad.js
 * Copies a player ad to the clipboard
 * @author larsw84, ryanli
 */

'use strict';

Foxtrick.modules.CopyPlayerAd = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['playerDetails', 'youthPlayerDetails'],
	OPTIONS: ['Sorted', 'NonTableStyle'],

	CSS: Foxtrick.InternalPath + 'resources/css/copy-player-ad.css',

	/** @param {document} doc */
	run: function(doc) {
		// skip non-existent and free agents
		let header = Foxtrick.Pages.All.getMainHeader(doc);
		let id = Foxtrick.util.id.findTeamId(header);
		if (!id)
			return;

		let button = Foxtrick.util.copyButton.add(doc, Foxtrick.L10n.getString('copy.playerad'));
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-player-ad');
			Foxtrick.onClick(button, this.createPlayerAd);
		}
	},

	/** @type {Listener<HTMLAnchorElement,MouseEvent>} */
	/* eslint-disable complexity */
	createPlayerAd: function(ev) {
		var doc = this.ownerDocument;
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
			let byLinePars = byLine.getElementsByTagName('p');
			Foxtrick.forEach(function(p) {
				p.parentNode.insertBefore(doc.createTextNode('\n'), p);
			}, byLinePars);
			ad += byLine.textContent.trim() + '\n\n';

			let nationality = Foxtrick.Pages.Player.getNationalityName(doc);
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

				/** @type {Element} */
				let infoParent = infoTable;
				let prev = null;
				let pInfo = null;
				while (infoParent) {
					if (infoParent.matches('.playerInfo'))
						break;

					let children = [...infoParent.children].filter(c => c.matches('.playerInfo'));
					if (children.length) {
						[pInfo] = children;
						break;
					}

					prev = infoParent;
					infoParent = infoParent.parentElement;
				}
				if (infoParent) {
					let child = infoParent.firstChild;
					while (child && child != pInfo && child != prev) {
						playerInfo.appendChild(child.cloneNode(true));
						child = child.nextSibling;
					}
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

			/** @type {Element | DocumentFragment} */
			var basicInfo;

			/** @type {HTMLTableRowElement} */
			var specialtyRow;
			if (isSenior) {
				// add new lines before <br> so that textContent would have breaks
				// at <br>s.
				basicInfo = Foxtrick.cloneElement(playerInfo, true);
				let tables = Foxtrick.toArray(basicInfo.querySelectorAll('table'));
				for (let tbl of tables)
					tbl.remove();

				let basicInfoBreaks = basicInfo.querySelectorAll('br');
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
					let match = specialty.match(colonRe);
					if (match) {
						let colonIndex = match.index;
						let [colonText] = match;
						let colonLength = colonText.length;
						let colonEndIdx = colonIndex + colonLength;
						ad += specialty.slice(0, colonEndIdx) +
							'[b]' + specialty.slice(colonEndIdx) + '[/b]\n\n';
					}
					else {
						ad += `${specialty}\n\n`;
					}
				}
				else {
					specialtyRow = infoTable.querySelector('tr[id$="trSpeciality"]');
				}
			}

			// owner, TSI wage, etc.
			let tables = Foxtrick.toArray(playerInfo.querySelectorAll('table'));
			let table = tables.shift();
			if (table) {
				const SPECIALTY_ROW_IDX = 5;
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
					if (r === SPECIALTY_ROW_IDX)
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
					const SPECIALTY_ROW_IDX = 2;
					const HTMS_ROW_IDX = 5;
					for (let [r, row] of [...table.rows].entries()) {
						let [header, data] = row.cells;

						ad += header.textContent.trim();
						if (!data) {
							ad += '\n';
							continue;
						}

						let copy = Foxtrick.cloneElement(data, true);
						for (let tNode of Foxtrick.getTextNodes(copy)) {
							if (tNode.parentElement.closest('.bar-max'))
								tNode.textContent = ''; // prevent dupes

							let text = tNode.textContent.replace(/\n/g, ' ').replace(/\s+/g, ' ');
							if (!text.trim()) {
								tNode.textContent = text;
								continue;
							}

							let parent = tNode.parentElement;
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

						if (parseInt(text, 10).toString() == text) {
							/** @type {HTMLElement} */
							let level = copy.querySelector('.bar-level');
							if (level)
								text = level.title.trim() + ` (${text})`;
						}

						// bolding for specialty+htms
						if (r === SPECIALTY_ROW_IDX || r === HTMS_ROW_IDX)
							text = '[b]' + text + '[/b]';

						ad += ' ' + text + '\n';
					}

					ad += '\n';
				}
			}

			var formatSkill = function(text, value) {
				const IMPORTANT_SKILL_THRESHOLD = 5;

				let skillText = /\d/.test(text) ? text : `${text} (${value})`;
				if (value > IMPORTANT_SKILL_THRESHOLD)
					return '[b]' + skillText + '[/b]';
				else if (value == IMPORTANT_SKILL_THRESHOLD)
					return '[i]' + skillText + '[/i]';

				return skillText;
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
							skillArray[s].max = skillArray[s].max ||
								{ text: 'undefined', value: -1 };
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
							skillArray[s].max = skillArray[s].max ||
								{ text: 'undefined', value: -1 };

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
			let bidDiv = Foxtrick.Pages.Player.getBidInfo(doc);
			if (bidDiv) {
				ad += '\n';
				let paragraphs = bidDiv.querySelectorAll('p');
				for (let para of paragraphs) {
					let parCopy = Foxtrick.cloneElement(para, true);
					let links = parCopy.querySelectorAll('a');
					for (let link of [...links].slice(1))
						link.textContent = '';

					ad += parCopy.textContent.trim();
					ad += '\n';
				}
			}

			Foxtrick.copy(doc, ad);
			const COPIED = Foxtrick.L10n.getString('copy.playerad.copied');
			Foxtrick.util.note.add(doc, COPIED, 'ft-playerad-copy-note');
		}
		catch (e) {
			Foxtrick.alert('createPlayerAd');
			Foxtrick.log(e);
		}
	},
};
