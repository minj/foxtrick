'use strict';
/**
 * copy-player-ad.js
 * Copies a player ad to the clipboard
 * @author larsw84, ryanli
 */

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

	createPlayerAd: function(ev) {
		var doc = ev.target.ownerDocument;
		var isSenior = Foxtrick.Pages.Player.isSenior(doc);
		try {
			var ad = '';

			ad += Foxtrick.Pages.Player.getName(doc);
			if (isSenior) {
				ad += ' [playerid=' + Foxtrick.Pages.Player.getId(doc) + ']\n';
			}
			else {
				ad += ' [youthplayerid=' + Foxtrick.Pages.Player.getId(doc) + ']\n';
			}

			// nationality, age and next birthday
			var byLine = doc.getElementsByClassName('byline')[0];
			// add new lines before <p> so that textContent would have breaks
			// at <p>s.
			var byLinePars = byLine.getElementsByTagName('p');
			Foxtrick.forEach(function(p) {
				p.parentNode.insertBefore(doc.createTextNode('\n'), p);
			}, byLinePars);
			ad += byLine.textContent.trim() + '\n\n';

			var nationality = Foxtrick.Pages.Player.getNationalityName(doc);
			if (nationality) {
				ad += Foxtrick.L10n.getString('Nationality') + ': ' + nationality + '\n\n';
			}

			var playerInfo = doc.getElementsByClassName('playerInfo')[0];

			// basic information
			// for senior players:
			// form, stamina, experience, leadership, personality (always there)
			// for youth players:
			// speciality (only when he has a speciality)
			var basicInfo;
			if (isSenior) {
				// add new lines before <br> so that textContent would have breaks
				// at <br>s.
				basicInfo = playerInfo.cloneNode(true);
				basicInfo.removeChild(basicInfo.getElementsByTagName('table')[0]);
				var basicInfoBreaks = basicInfo.getElementsByTagName('br');
				Foxtrick.forEach(function(br) {
					br.parentNode.insertBefore(doc.createTextNode('\n'), br);
				}, basicInfoBreaks);
				ad += basicInfo.textContent.trim() + '\n\n';
			}
			else {
				// sometime it's a string tag sometimes a paragraph seemingly
				basicInfo = playerInfo.getElementsByTagName('p')[0] ||
					playerInfo.getElementsByTagName('strong')[0];
				if (basicInfo) {
					var speciality = basicInfo.textContent.trim();
					// we will bold the speciality part, right after
					// colon plus space
					var colonRe = /:\s*/;
					var colonIndex = speciality.search(colonRe);
					var colonLength = speciality.match(colonRe)[0].length;
					ad += speciality.substr(0, colonIndex + colonLength) + '[b]' +
						speciality.substr(colonIndex + colonLength, speciality.length) +
						'[/b]' + '\n\n';
				}
			}

			// owner, TSI wage, etc.
			var table = playerInfo.getElementsByTagName('table')[0];
			if (table) {
				for (var i = 0; i < table.rows.length; i++) {
					ad += table.rows[i].cells[0].textContent.trim() + ' ';
					// remove teampopuplinks
					var cellCopy = table.rows[i].cells[1].cloneNode(true);
					var popupLinks = cellCopy.getElementsByTagName('a');
					for (var j = 1; j < popupLinks.length; j++) {
						popupLinks[j].textContent = '';
					}
					// bolding for speciality
					var part = cellCopy.textContent.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
					if (i === 5)
						part = '[b]' + part + '[/b]';
					ad += part + '\n';
				}
				ad += '\n';
			}

			var formatSkill = function(text, value) {
				if (value > 5) {
					return '[b]' + text + '[/b]';
				}
				else if (value == 5) {
					return '[i]' + text + '[/i]';
				}
				return text;
			};

			// skills
			var skills = Foxtrick.Pages.Player.getSkillsWithText(doc);
			if (skills !== null) {
				var skillArray = [];
				if (isSenior) {
					for (var i in skills.names) {
						skillArray.push({
							name: skills.names[i],
							value: skills.values[i],
							text: skills.texts[i]
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

						if (!Foxtrick.Prefs.isModuleOptionEnabled('CopyPlayerAd',
						                                          'NonTableStyle')) {
							ad += '[table]\n';
							for (var i = 0; i < skillArray.length; ++i) {
								ad += '[tr]' +
									'[th]' + skillArray[i].name + '[/th]' +
									'[td]' +
									formatSkill(skillArray[i].text, skillArray[i].value) +
									'[/td]' +
									'[/tr]\n';
							}
							ad += '[/table]';
						}
						else {
							ad += '\n';
							for (var i = 0; i < skillArray.length; ++i) {
								ad += skillArray[i].name + ': ' +
									formatSkill(skillArray[i].text, skillArray[i].value) + '\n';
							}
							ad += '\n';
						}
					}
					else {
						// otherwise, they are arranged in a table with two
						// cells in each row
						if (!Foxtrick.Prefs.isModuleOptionEnabled('CopyPlayerAd',
						                                          'NonTableStyle')) {
							ad += '[table]\n';
							for (var skill = 0; skill < skillArray.length; ++skill) {
								if (skill % 2 === 0)
									ad += '[tr]';

								ad += '[th]' + skillArray[skill].name + '[/th]';
								ad += '[td]' +
									formatSkill(skillArray[skill].text, skillArray[skill].value) +
									'[/td]';

								if (skill % 2 == 1)
									ad += '[/tr]\n';
							}
							ad += '[/table]';
						}
						else {
							ad += '\n';
							for (var index = 0; index < skillArray.length; ++index) {
								if (index % 2 == 1)
									ad += ' ';
								ad += skillArray[index].name + ': ' +
									formatSkill(skillArray[index].text, skillArray[index].value);
								if (index % 2 == 1)
									ad += '\n';
							}
							ad += '\n';
						}
					}
				}
				else {
					// for youth players, always in a table with one cell
					// in each row
					for (var i in skills.names) {
						skillArray.push({
							name: skills.names[i],
							current: {
								value: skills.values[i].current,
								text: skills.texts[i].current
							},
							max: { value: skills.values[i].max, text: skills.texts[i].max },
							maxed: skills.values[i].maxed
						});
					}

					if (Foxtrick.Prefs.isModuleOptionEnabled('CopyPlayerAd', 'Sorted')) {
						var sorter = function(a, b) {
							if (a.current.value !== b.current.value) {
								return b.current.value - a.current.value;
							}
							else if (a.max.value !== b.max.value) {
								return b.max.value - a.max.value;
							}
							return b.maxed - a.maxed;
						};
						// sort skills by current level, maximum level,
						// and whether the skill has reached the potential,
						// descending
						skillArray.sort(sorter);
					}
					if (!Foxtrick.Prefs.isModuleOptionEnabled('CopyPlayerAd', 'NonTableStyle')) {
						ad += '[table]\n';
						for (var i = 0; i < skillArray.length; ++i) {
							ad += '[tr]' +
								'[th]' + skillArray[i].name + '[/th]' +
								'[td]' + (skillArray[i].maxed ? '[b]' : '') +
								skillArray[i].current.text + ' / ' + skillArray[i].max.text +
								(skillArray[i].maxed ? '[/b]' : '') +
								'[/td]' +
								'[/tr]\n';
						}
						ad += '[/table]';
					}
					else {
						ad += '\n';
						for (var i = 0; i < skillArray.length; ++i) {
							ad += skillArray[i].name + ': ' +
								(skillArray[i].maxed ? '[b]' : '') +
								skillArray[i].current.text + ' / ' + skillArray[i].max.text +
								(skillArray[i].maxed ? '[/b]' : '') +
								'\n';
						}
						ad += '\n';
					}
				}
			}

			// current bid information
			var bidDiv = Foxtrick.Pages.Player.getBidInfo(doc);
			if (bidDiv) {
				ad += '\n';
				var paragraphs = bidDiv.getElementsByTagName('p');
				for (var i = 0; i < paragraphs.length; i++) {
					var parCopy = paragraphs[i].cloneNode(true);
					var links = parCopy.getElementsByTagName('a');
					for (var j = 1; j < links.length; j++) {
						links[j].textContent = '';
					}
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
	}
};
