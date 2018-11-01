'use strict';

/* eslint-disable complexity */

Foxtrick.modules['YouthSkills'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['youthPlayers'],
	CSS: Foxtrick.InternalPath + 'resources/css/youth-skills.css',
	NICE: -10,

	/**
	 * @param	{document}	doc
	 */
	run: function(doc) {
		if (!Foxtrick.isPage(doc, 'ownYouthPlayers'))
			return;

		var module = this;
		var UNKNOWNLEVELSYMBOL = '-';
		var isRtl = Foxtrick.util.layout.isRtl(doc);

		// string to use when current skill is estimated
		var approx = Foxtrick.L10n.getString('YouthSkills.estimated');

		// string to use for top3 skill title
		var top3 = Foxtrick.L10n.getString('YouthSkills.top3');

		// this maps HY skill-id to the row index in the table
		// cf Foxtrick.api.hy.skillMap
		// (when looking for n-th child, add 1 to the result)
		var rowMap = {
			3: 2,
			4: 3,
			5: 5,
			6: 0,
			7: 4,
			8: 1,
			9: 6,
		};

		var entry, loading;

		/**
		 * Draw informational message about HY skill data
		 * @param {document} doc
		 */
		var drawMessage = function(doc) {
			let hyInfoDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
			hyInfoDiv.id = 'ft-hy-skills-info';

			let heading = doc.createElement('h2');
			heading.textContent = Foxtrick.L10n.getString('YouthSkills.header');
			hyInfoDiv.appendChild(heading);

			let info = doc.createElement('span');
			info.textContent = Foxtrick.L10n.getString('YouthSkills.info');
			hyInfoDiv.appendChild(info);

			let legend = doc.createElement('ul');
			let curLegend = doc.createElement('li');
			curLegend.textContent = Foxtrick.L10n.getString('YouthSkills.currentSkill');
			Foxtrick.addImage(doc, curLegend, {
				src: '/Img/icons/transparent.gif',
				class: 'ft-skillbar-hy-cur ft-skillbar-singlet',
			}, curLegend.firstChild);
			legend.appendChild(curLegend);

			let predLegend = doc.createElement('li');
			predLegend.textContent = Foxtrick.L10n.getString('YouthSkills.skillEstimation');
			Foxtrick.addImage(doc, predLegend, {
				src: '/Img/icons/transparent.gif',
				class: 'ft-skillbar-hy-pred ft-skillbar-singlet',
			}, predLegend.firstChild);
			legend.appendChild(predLegend);

			let potLegend = doc.createElement('li');
			potLegend.textContent = Foxtrick.L10n.getString('YouthSkills.skillPotential');
			Foxtrick.addImage(doc, potLegend, {
				src: '/Img/icons/transparent.gif',
				class: 'ft-skillbar-hy-pot ft-skillbar-singlet',
			}, potLegend.firstChild);
			legend.appendChild(potLegend);
			hyInfoDiv.appendChild(legend);

			let info2 = doc.createElement('span');
			info2.textContent = Foxtrick.L10n.getString('YouthSkills.info2');
			hyInfoDiv.appendChild(info2);

			entry.parentNode.insertBefore(hyInfoDiv, entry);
		};

		/**
		 * parse HY reponse and merge the info
		 * @param {object} json
		 */
		var addSkills = function(json) {
			/**
			 * replace HT skill bars into our own
			 * retain HT skill info on titleDiv
			 * @param	{element}	node
			 */
			var replaceBars = function(node) {
				const BAR_WIDTH = 8;
				var htPot, htCur, maxed;

				let el = node.querySelector('.youthSkillBar_max');
				if (el) {
					let pos = isRtl ?
						2 - parseInt(el.style.backgroundPosition, 10) :
						parseInt(el.style.backgroundPosition, 10) + 126;
					htPot = pos / BAR_WIDTH;
				}
				el = node.querySelector('.youthSkillBar_current');
				if (el) {
					let width = parseInt(el.style.width, 10) + 1;
					htCur = parseInt(width / BAR_WIDTH, 10);
				}
				el = node.querySelector('.youthSkillBar_full');
				if (el) {
					let width = parseInt(el.style.width, 10) + 1;
					maxed = parseInt(width / BAR_WIDTH, 10);
				}

				for (let child of [...node.childNodes])
					child.remove();

				var fragment = doc.createDocumentFragment();

				let bars = fragment.appendChild(Foxtrick.createFeaturedElement(doc, module, 'div'));
				Foxtrick.addClass(bars, 'youthSkillBar');
				var div = bars.appendChild(doc.createElement('div'));
				Foxtrick.addClass(div, 'ft-youthSkillBars');
				div.title = '?/?';

				let skillbars = [
					'ft-skillbar-bg',
					'ft-skillbar-hy-pot ft-skillbar-hy', 'ft-skillbar-ht-pot ft-skillbar-ht',
					'ft-skillbar-hy-pred ft-skillbar-hy',
					'ft-skillbar-hy-cur ft-skillbar-hy', 'ft-skillbar-ht-cur ft-skillbar-ht',
					'ft-skillbar-maxed ft-skillbar-ht',
				];
				Foxtrick.forEach(function(className) {
					Foxtrick.addImage(doc, div, {
						src: '/Img/icons/transparent.gif',
						class: className,
					}, null, (image) => {
						if (image.className.split(' ')[0] == 'ft-skillbar-ht-pot' && htPot) {
							image.style.width = `${1 + 11 * htPot}px`;
							div.setAttribute('ht-pot', htPot);
						}
						else if (image.className.split(' ')[0] == 'ft-skillbar-ht-cur' && htCur) {
							image.style.width = `${1 + 11 * htCur}px`;
							div.setAttribute('ht-cur', htCur);
						}
						else if (image.className.split(' ')[0] == 'ft-skillbar-maxed' && maxed) {
							image.style.width = `${1 + 11 * maxed}px`;
							div.setAttribute('ht-maxed', maxed);
						}
						if (image.className != 'ft-skillbar-bg')
							Foxtrick.addClass(image, 'ft-skillbar');
					});
				}, skillbars);

				node.appendChild(fragment);
			};

			/**
			 * set the length of the corresponding HY skillbar
			 * and save the value on titleDiv
			 * @param {element} titleDiv
			 * @param {string}  name     'hy-pot', 'hy-cur' or 'hy-pred
			 * @param {Float}   value
			 */
			var setHYValue = function(titleDiv, name, value) {
				titleDiv.setAttribute(name, value);

				let img = titleDiv.querySelector('.ft-skillbar-' + name);
				if (img) {
					let width = 1 + parseInt(value, 10) + 10 * value;
					img.style.width = width + 'px';
					if (isRtl)
						img.style.backgroundPosition = `${width - 91}px 0`;
				}
			};

			/**
			 * add skill link (if possible) to the node based on the skill level (integer)
			 * @param {element} node
			 * @param {Integer} level
			 */
			var addSkillLink = function(node, level) {
				if (level) {
					let minLink = doc.createElement('a');
					minLink.href = `/Help/Rules/AppDenominations.aspx?lt=skill&ll=${level}#skill`;

					// used to signal skillcoloring that we manually trigger coloring
					Foxtrick.addClass(minLink, 'skill ft-youthskills-link');

					minLink.textContent = Foxtrick.L10n.getTextByLevel(level);
					node.appendChild(minLink);
				}
				else {
					let minText = doc.createElement('span');
					minText.className = 'shy';
					minText.textContent = UNKNOWNLEVELSYMBOL;
					node.appendChild(minText);
				}
			};

			/**
			 * parse all available info and assemble the node.title
			 * add skill link(s)
			 * @param	{element}	node
			 */
			var setTitleAndLinks = function(node) {
				let gapText = doc.createTextNode(' ');
				node.appendChild(gapText);

				let cur, pot, curInt, potInt = 0;
				let prediction = false;
				let hyCur = node.getAttribute('hy-cur') || 0;
				let hyPot = node.getAttribute('hy-pot') || 0;
				let hyPred = node.getAttribute('hy-pred') || 0;
				let htCur = node.getAttribute('ht-cur') || 0;
				let htPot = node.getAttribute('ht-pot') || 0;
				let htMaxed = node.getAttribute('ht-maxed') || 0;

				// htCur is not available when skill is maxed!!!
				htCur = htCur || htMaxed;

				// add HY info if no info available or it matches HT info
				if (hyCur && (!htCur || parseInt(htCur, 10) == parseInt(hyCur, 10)))
					cur = hyCur;
				else
					cur = htCur;

				// use prediction (if available) in the worst case
				if (!cur && hyPred) {
					prediction = true;
					cur = hyPred;
				}

				// add HY info if no info available or it matches HT info
				if (hyPot && (!htPot || parseInt(htPot, 10) == parseInt(hyPot, 10)))
					pot = hyPot;
				else
					pot = htPot;

				node.title = `${cur || '?'}${prediction ? ' ' + approx : ''}/${pot || '?'}`;

				// add aria info for a11y
				node.setAttribute('aria-label', node.title);

				curInt = parseInt(cur, 10);
				potInt = parseInt(pot, 10);

				addSkillLink(node, curInt);

				// only one link if levels match
				if (curInt == potInt)
					return;

				gapText = doc.createTextNode(' / ');
				node.appendChild(gapText);

				addSkillLink(node, potInt);
			};

			/**
			 * merge HY info into player's skill (1-based row index)
			 * @param {element} playerInfo
			 * @param {Integer} skill      row index (1-based)
			 * @param {Float}   pred       skill_estimated
			 * @param {Float}   current    current_skill
			 * @param {Float}   max	       skill_cap
			 */
			var setSkill = function(playerInfo, skill, pred, current, max) {
				let table = playerInfo.querySelector('tbody');
				let sEntry = table.querySelector(`tr:nth-of-type(${skill}) > td:nth-of-type(2)`);

				if (!sEntry)
					return;

				// need to unhide blank row since we have new info from HY for this skill
				Foxtrick.removeClass(sEntry.parentNode, 'hidden');

				replaceBars(sEntry);
				let ftBars = sEntry.firstChild.firstChild;
				if (!ftBars || !Foxtrick.hasClass(ftBars, 'ft-youthSkillBars'))
					return;

				if (pred)
					setHYValue(ftBars, 'hy-pred', pred);
				if (current)
					setHYValue(ftBars, 'hy-cur', current);
				if (max)
					setHYValue(ftBars, 'hy-pot', max);

				setTitleAndLinks(ftBars);
			};

			/**
			 * mark top3 skill (1-based row index)
			 * @param {element} playerInfo
			 * @param {Integer} skill      row index (1-based)
			 */
			var markTopSkill = function(playerInfo, skill) {
				let table = playerInfo.querySelector('tbody');
				let sName = table.querySelector(`tr:nth-of-type(${skill}) > td:nth-of-type(1)`);
				if (!sName)
					return;

				let b = Foxtrick.createFeaturedElement(doc, module, 'strong');
				b.textContent = sName.textContent;
				b.title = top3;
				sName.textContent = '';
				sName.appendChild(b);
			};

			// get a timer for some profiling as this module runs in async mode
			var start = new Date().getTime();

			var playerInfos = doc.getElementsByClassName('playerInfo');
			for (let playerInfo of playerInfos) {
				// get playerid
				let link = playerInfo.querySelector('a');
				let param = Foxtrick.getParameterFromUrl(link.href, 'YouthPlayerId');
				let playerId = parseInt(param, 10);

				// stop if player unknown in HY
				if (typeof json[playerId] == 'undefined')
					continue;

				// add specialty
				let specialty = json[playerId].speciality; // HY TYPO
				if (specialty) {
					let info = playerInfo.querySelector('p');
					let text = info.textContent;

					// skip if specialty known on HT
					if (!/\[/.test(text)) {
						let span = Foxtrick.createFeaturedElement(doc, module, 'span');
						let text = doc.createElement('strong');
						Foxtrick.addClass(text, 'ft-hy-spec');
						text.title = Foxtrick.L10n.getString('YouthSkills.newSpecialty');

						// use aria label for a11y
						text.setAttribute('aria-label', text.title);

						let spec = Foxtrick.L10n.getSpecialtyFromNumber(specialty);
						text.textContent = '[' + spec + ']';
						span.appendChild(text);
						info.appendChild(span);
					}
				}

				for (let sk in json[playerId].skills) {
					// skip experience
					if (sk == 10)
						continue;

					let skill = json[playerId].skills[sk];

					// let cap_maximal = skill['cap_maximal'] || 0;
					let cap = skill.cap || 0;
					let capMinimal = skill.cap_minimal || 0;
					let current = skill.current || 0;
					let pred = skill.current_estimation || 0;
					let maxed = skill.maxed || false;
					let top = skill.top3 || false;

					let min = current;
					let max = Math.max(cap, capMinimal);

					if (pred || min || max)
						setSkill(playerInfo, rowMap[sk] + 1, pred, min, max, maxed);
					if (top)
						markTopSkill(playerInfo, rowMap[sk] + 1);
				}
			}

			// last point in time
			Foxtrick.log('YouthSkills:', new Date().getTime() - start, 'ms');
		};


		var showError = function(response, status, prefLink) {
			if (!entry)
				return;

			var header = `Hattrick Youthclub Error ${status}: `;
			var text;
			try {
				text = JSON.parse(response).error;
			}
			catch (e) {
				text = response;
			}

			if (!text && prefLink) {
				text = doc.createElement('span');
				text.textContent = header;

				let link = Foxtrick.L10n.appendLink(prefLink, text, '#');
				if (link) {
					Foxtrick.onClick(link, function() {
						Foxtrick.Prefs.show();
					});
				}
			}
			else {
				text = header + text;
			}

			let target = doc.getElementById('ft-hy-skills-info');
			Foxtrick.util.note.add(doc, text, 'ft-youth-skills-error', { at: target });
		};

		// run this once we finish
		var finalize = function(response, status, reason) {
			const ERROR_CODE = 401;
			if (loading) {
				loading.parentNode.removeChild(loading);
				loading = null;
			}

			if (response === null)
				showError(null, ERROR_CODE, 'youthclub.api.nopermission');

			if (reason === 'user') {
				let moduleTemplate = Foxtrick.L10n.getString('youthclub.api.notuser');
				let explanation = moduleTemplate.replace(/%s/, 'YouthSkills');
				showError(explanation, ERROR_CODE);
			}

			if (Foxtrick.Prefs.isModuleEnabled('SkillColoring'))
				Foxtrick.modules['SkillColoring'].execute(doc);

			if (Foxtrick.Prefs.isModuleEnabled('TeamStats'))
				Foxtrick.modules['TeamStats'].execute(doc);
		};

		entry = doc.querySelector('.playerList');
		if (entry) {
			drawMessage(doc);
		}

		// get skills from HY
		Foxtrick.containsPermission({ origins: ['https://*.hattrick-youthclub.org/*'] }, (perm) => {
			if (perm) {
				Foxtrick.api.hy.runIfHYUser(function() {
					if (entry) {
						loading = Foxtrick.util.note.createLoading(doc);
						entry.insertBefore(loading, entry.firstChild);
					}
					Foxtrick.api.hy.getYouthSkills(addSkills, showError, finalize);
				}, (response, status) => {
					// finalize if not user
					if (typeof response == 'undefined')
						finalize(0, 0, 'user');
					else
						finalize(response, status);
				});
			}
			else {
				Foxtrick.log('Sorry fucker, needs permission!');
				finalize(null);
			}
		});

	},
};
