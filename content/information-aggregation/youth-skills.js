'use strict';

/* eslint-disable complexity */

Foxtrick.modules['YouthSkills'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['youthPlayers'],
	CSS: Foxtrick.InternalPath + 'resources/css/youth-skills.css',
	NICE: -10,

	/**
	 * @param {document} doc
	 */
	run: function(doc) {
		if (!Foxtrick.isPage(doc, 'ownYouthPlayers'))
			return;

		if (Foxtrick.Pages.Players.isYouthPerfView(doc))
			return;

		var module = this;
		var isRtl = Foxtrick.util.layout.isRtl(doc);
		var hasNewBars = doc.querySelector('.ht-bar');
		var barMax = hasNewBars && hasNewBars.getAttribute('max');
		var entry, loading;

		// string to use when current skill is estimated
		var l10nApprox = Foxtrick.L10n.getString('YouthSkills.estimated');

		// string to use for top3 skill title
		var l10nTop3 = Foxtrick.L10n.getString('YouthSkills.top3');

		const UNKNOWN_LEVEL_SYMBOL = '-';

		// this maps HY skill-id to the row index in the table
		// (when looking for n-th child, add 1 to the result)
		const ROW_MAP = {};
		{
			let skillOrder = [
				'keeper',
				'defending',
				'playmaking',
				'winger',
				'passing',
				'scoring',
				'setPieces',
			];

			for (let [hyIdx, skill] of Object.entries(Foxtrick.api.hy.skillMap)) {
				let htIdx = skillOrder.indexOf(skill);
				if (htIdx != -1)
					ROW_MAP[hyIdx] = htIdx;
			}
		}

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

			let potPredLegend = doc.createElement('li');
			potPredLegend.textContent = Foxtrick.L10n.getString('YouthSkills.skillPotentialMax');
			Foxtrick.addImage(doc, potPredLegend, {
				src: '/Img/icons/transparent.gif',
				class: 'ft-skillbar-hy-pot-pred ft-skillbar-singlet',
			}, potPredLegend.firstChild);
			legend.appendChild(potPredLegend);
			hyInfoDiv.appendChild(legend);

			let info2 = doc.createElement('span');
			info2.textContent = Foxtrick.L10n.getString('YouthSkills.info2');
			hyInfoDiv.appendChild(info2);

			entry.parentNode.insertBefore(hyInfoDiv, entry);
		};

		/**
		 * parse HY reponse and merge the info
		 * @param {HYPlayers} json
		 */
		var addSkills = function(json) {
			/**
			 * Create new-type bar
			 * @param  {HTMLTableCellElement} skillCell
			 * @return {HTMLElement}                    skillBar created
			 */
			var createBar = function(skillCell) {
				let barDef = {
					class: 'ht-bar',
					level: -1,
					cap: -1,
					'is-cap': 0,
					max: barMax,
				};

				let div = doc.createElement('div');
				for (let [attr, val] of Object.entries(barDef))
					div.setAttribute(attr, '' + val);

				let maxBar = doc.createElement('div');
				maxBar.className = 'bar-max';
				maxBar.style.width = '100%';
				div.appendChild(maxBar);
				let contents = maxBar.appendChild(doc.createElement('span'));
				contents.className = 'bar-denomination';

				if (skillCell.nextElementSibling)
					skillCell.nextElementSibling.textContent = '?/?';

				skillCell.textContent = '';
				return skillCell.appendChild(div);
			};

			/**
			 * replace HT skill bars into our own
			 * retain HT skill info on titleDiv
			 * @param {Element} node
			 */
			var replaceBars = function(node) {
				const BAR_WIDTH = 8;
				var htPot = 0, htCur = 0, maxed = 0;

				/** @type {HTMLImageElement} */
				let el = node.querySelector('.youthSkillBar_max');
				if (el) {
					let pos = isRtl ?
						2 - parseInt(el.style.backgroundPosition, 10) :
						// eslint-disable-next-line no-magic-numbers
						parseInt(el.style.backgroundPosition, 10) + 126;
					htPot = pos / BAR_WIDTH;
				}
				el = node.querySelector('.youthSkillBar_current');
				if (el) {
					let width = parseInt(el.style.width, 10) + 1;
					htCur = Math.floor(width / BAR_WIDTH);
				}
				el = node.querySelector('.youthSkillBar_full');
				if (el) {
					let width = parseInt(el.style.width, 10) + 1;
					maxed = Math.floor(width / BAR_WIDTH);
				}
				if (htPot + htCur + maxed === 0 && node.querySelector('a.skill')) {
					// new design sans skill-bars
					// retrieve current / potential
					let [current, potential] = [...node.children];
					if (current.nodeName == 'A') {
						let link = /** @type {HTMLAnchorElement} */ (current);
						htCur = Foxtrick.util.id.getSkillLevelFromLink(link);
					}

					if (typeof potential == 'undefined') {
						let link = /** @type {HTMLAnchorElement} */ (current);
						maxed = Foxtrick.util.id.getSkillLevelFromLink(link);
					}
					else if (potential.nodeName == 'A') {
						let link = /** @type {HTMLAnchorElement} */ (potential);
						htPot = Foxtrick.util.id.getSkillLevelFromLink(link);
					}
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
					'ft-skillbar-hy-pot-pred ft-skillbar-hy',
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
						const MARGIN = 1;
						const BAR_WIDTH = 10 + 1;

						if (image.classList.contains('ft-skillbar-ht-pot') && htPot) {
							image.style.width = `${MARGIN + BAR_WIDTH * htPot}px`;
							div.setAttribute('ht-pot', '' + htPot);
						}
						else if (image.classList.contains('ft-skillbar-ht-cur') && htCur) {
							image.style.width = `${MARGIN + BAR_WIDTH * htCur}px`;
							div.setAttribute('ht-cur', '' + htCur);
						}
						else if (image.classList.contains('ft-skillbar-maxed') && maxed) {
							image.style.width = `${MARGIN + BAR_WIDTH * maxed}px`;
							div.setAttribute('ht-maxed', '' + maxed);
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
			 * @param {Element} titleDiv
			 * @param {string}  name     'hy-pot', 'hy-cur', 'hy-pred', or 'hy-pot-pred'
			 * @param {number}  value    {Float}
			 */
			var setHYValue = function(titleDiv, name, value) {
				titleDiv.setAttribute(name, '' + value);

				/** @type {HTMLImageElement} */
				let img = titleDiv.querySelector('.ft-skillbar-' + name);
				if (img) {
					let width = 1 + Math.floor(value) + 10 * value;
					img.style.width = width + 'px';
					if (isRtl) {
						// eslint-disable-next-line no-magic-numbers
						img.style.backgroundPosition = `${width - 91}px 0`;
					}
				}
			};

			/**
			 * set the length of the corresponding HY skillbar inside ht-bar
			 * @param  {Element} bar
			 * @param  {number}  value    {Float}
			 * @return {number}
			 */
			var calcWidth = function(bar, value) {
				const PRECISION = 2;
				let factor = Math.pow(10, PRECISION);

				let widthTotal = bar.getBoundingClientRect().width;
				let max = parseInt(bar.getAttribute('max'), 10);
				let val = Math.min(max, value);

				return Math.round(factor * val / max * widthTotal) / factor;
			};

			/**
			 * set the length of the corresponding HY skillbar inside ht-bar
			 * @param {Element} bar
			 * @param {string}  name     'hy-pot', 'hy-cur', 'hy-pred', or 'hy-pot-pred'
			 * @param {number}  value    {Float}
			 */
			var setHYBar = function(bar, name, value) {
				bar.setAttribute(name, '' + value);

				let widthNeeded = calcWidth(bar, value);

				let hyBar = Foxtrick.createFeaturedElement(doc, module, 'div');
				Foxtrick.addClass(hyBar, `bar-level ft-bar ft-bar-${name}`);
				hyBar.style.width = `${widthNeeded}px`;

				let target;

				switch (name) {
					case 'hy-cur':
					case 'hy-pred':
						target = [...bar.querySelectorAll('.bar-max, .bar-cap')].pop();
						break;
					case 'hy-pot':
					case 'hy-pot-pred':
						target = bar.querySelector('.bar-max');
						break;
					default:
						throw new Error('unknown bar type');
				}

				if (!target)
					return;

				Foxtrick.insertAfter(hyBar, target);
			};

			/**
			 * add skill link (if possible) to the node based on the skill level {Integer}
			 * @param {Element} node
			 * @param {number}  level {Integer}
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
					minText.textContent = UNKNOWN_LEVEL_SYMBOL;
					node.appendChild(minText);
				}
			};

			/**
			 * parse all available info and assemble the node.title
			 * add skill link(s)
			 * @param {HTMLElement} node
			 */
			var setTitleAndLinks = function(node) {
				let cur, pot, curInt, potInt = 0;
				let prediction = false;
				let hyCur = parseFloat(node.getAttribute('hy-cur')) || 0;
				let hyPot = parseFloat(node.getAttribute('hy-pot')) || 0;
				let hyPotPred = parseFloat(node.getAttribute('hy-pot-pred')) || 0;
				let hyPred = parseFloat(node.getAttribute('hy-pred')) || 0;
				let htCur = parseFloat(node.getAttribute('ht-cur')) || 0;
				let htPot = parseFloat(node.getAttribute('ht-pot')) || 0;
				let htMaxed = parseFloat(node.getAttribute('ht-maxed')) || 0;

				// htCur is not available when skill is maxed!!!
				htCur = htCur || htMaxed;

				// add HY info if no info available or it matches HT info
				if (hyCur && (!htCur || Math.floor(htCur) == Math.floor(hyCur)))
					cur = hyCur;
				else
					cur = htCur;

				// use prediction (if available) in the worst case
				if (!cur && hyPred) {
					prediction = true;
					cur = hyPred;
				}

				// add HY info if no info available or it matches HT info
				if (hyPot && (!htPot || Math.floor(htPot) == Math.floor(hyPot)))
					pot = hyPot;
				else
					pot = htPot;

				curInt = Math.floor(cur);
				potInt = Math.floor(pot);

				if (!pot && hyPotPred)
					pot = `<${hyPotPred}`;

				node.title = `${cur || '?'}${prediction ? ' ' + l10nApprox : ''}/${pot || '?'}`;

				// add aria info for a11y
				node.setAttribute('aria-label', node.title);

				if (Foxtrick.hasClass(node, 'ht-bar'))
					return;

				node.appendChild(doc.createTextNode(' '));
				addSkillLink(node, curInt);

				// only one link if levels match
				if (curInt == potInt)
					return;

				node.appendChild(doc.createTextNode(' / '));
				addSkillLink(node, potInt);
			};

			/**
			 * @typedef HYSkillObject
			 * @prop {number} current current_skill {Float}
			 * @prop {number} pred    skill_estimated {Float}
			 * @prop {number} max     skill_cap {Float}
			 * @prop {number} maxPred skill_capMaximal {Float}
			 */

			/**
			 * merge HY info into player's skill (row index)
			 * @param {Element}       playerInfo
			 * @param {number}        skill      row index
			 * @param {HYSkillObject} obj        skill object
			 */
			var setSkill = function(playerInfo, skill, obj) {
				let { current, pred, max, maxPred } = obj;
				let body = playerInfo.querySelector('tbody');
				let [first] = body.rows;
				let rIdx = first.id.endsWith('trSpeciality') ? skill + 1 : skill;

				/** @type {HTMLTableCellElement} */
				let sEntry = body.querySelector(`tr:nth-of-type(${rIdx + 1}) > td:nth-of-type(2)`);

				if (!sEntry)
					return;

				// need to unhide blank row since we have new info from HY for this skill
				let row = sEntry.closest('tr');
				Foxtrick.removeClass(row, 'hidden');

				/** @type {HTMLElement} */
				let ftBars;
				if (hasNewBars) {
					ftBars = sEntry.querySelector('.ht-bar') || createBar(sEntry);
					let level = parseInt(ftBars.getAttribute('level'), 10);
					if (level != -1) {
						ftBars.setAttribute('ht-cur', String(level));

						/** @type {HTMLElement} */
						let bar = ftBars.querySelector('.bar-level');
						if (bar != null) {
							// HTs can't math
							let widthNeeded = calcWidth(ftBars, level);
							bar.style.width = `${widthNeeded}px`;
						}
					}
					let cap = parseInt(ftBars.getAttribute('cap'), 10);
					if (cap != -1) {
						ftBars.setAttribute('ht-pot', String(cap));

						/** @type {HTMLElement} */
						let bar = ftBars.querySelector('.bar-cap');
						if (bar != null) {
							// HTs can't math
							let widthNeeded = calcWidth(ftBars, cap);
							bar.style.width = `${widthNeeded}px`;
						}
					}
					let isCap = parseInt(ftBars.getAttribute('is-cap'), 10);
					if (isCap == -1)
						ftBars.setAttribute('ht-maxed', '' + level);

					if (pred)
						setHYBar(ftBars, 'hy-pred', pred);
					else if (current)
						setHYBar(ftBars, 'hy-cur', current);

					if (max)
						setHYBar(ftBars, 'hy-pot', max);
					else if (maxPred)
						setHYBar(ftBars, 'hy-pot-pred', maxPred);
				}
				else {
					replaceBars(sEntry);

					ftBars = /** @type {HTMLElement} */
						(sEntry.firstElementChild.firstElementChild);

					if (!ftBars || !Foxtrick.hasClass(ftBars, 'ft-youthSkillBars'))
						return;

					if (pred)
						setHYValue(ftBars, 'hy-pred', pred);
					else if (current)
						setHYValue(ftBars, 'hy-cur', current);

					if (max)
						setHYValue(ftBars, 'hy-pot', max);
					else if (maxPred)
						setHYValue(ftBars, 'hy-pot-pred', maxPred);
				}

				setTitleAndLinks(ftBars);
			};

			/**
			 * mark top3 skill (1-based row index)
			 * @param {Element} playerInfo
			 * @param {number} skill       row index
			 */
			var markTopSkill = function(playerInfo, skill) {
				let body = playerInfo.querySelector('tbody');
				let [first] = body.rows;
				let rIdx = first.id.endsWith('trSpeciality') ? skill + 1 : skill;
				let sName = body.querySelector(`tr:nth-of-type(${rIdx + 1}) > td:nth-of-type(1)`);
				if (!sName)
					return;

				let b = Foxtrick.createFeaturedElement(doc, module, 'strong');
				b.textContent = sName.textContent;
				b.title = l10nTop3;
				sName.textContent = '';
				sName.appendChild(b);
			};

			// get a timer for some profiling as this module runs in async mode
			var start = new Date().getTime();

			var playerInfos = Foxtrick.Pages.Players.getPlayerNodes(doc);
			for (let playerInfo of playerInfos) {
				// get playerid
				let link = playerInfo.querySelector('a');
				let param = Foxtrick.getUrlParam(link.href, 'YouthPlayerId');
				let playerId = parseInt(param, 10);

				// stop if player unknown in HY
				if (!(playerId in json))
					continue;

				let player = json[playerId];

				// add specialty
				let specialty = player.speciality; // HY TYPO
				if (specialty) {
					let info = playerInfo.querySelector('p');
					let text = info.textContent;

					// skip if specialty known on HT
					if (!/\[/.test(text) && !playerInfo.querySelector('tr[id$="_trSpeciality"]')) {
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

				for (let sk of Object.keys(player.skills)) {
					// skip experience
					if (!(sk in ROW_MAP))
						continue;

					/** @type {HYSkill} */
					let skill = player.skills[sk];

					let cap = skill.cap || 0;
					let capMinimal = skill.cap_minimal || 0;

					// let maxed = skill.maxed || false;
					let top = skill.top3 || false;

					let current = skill.current || 0;
					let pred = skill.current_estimation || 0;
					let max = Math.max(cap, capMinimal);
					let maxPred = Math.floor((skill.cap_maximal || 0) * 10) / 10;

					if (pred || current || max || maxPred)
						setSkill(playerInfo, ROW_MAP[sk], { current, pred, max, maxPred });

					if (top)
						markTopSkill(playerInfo, ROW_MAP[sk]);
				}
			}

			// last point in time
			Foxtrick.log('YouthSkills:', new Date().getTime() - start, 'ms');
		};


		/**
		 * @param  {string|null} response
		 * @param  {number}      status
		 * @param  {string}      [prefLink] l10n key
		 */
		var showError = function(response, status, prefLink) {
			if (!entry)
				return;

			var header = `Hattrick Youthclub Error ${status}: `;

			/** @type {string|HTMLElement} */
			var text = response;

			try {
				let payload = { error: 'Unknown error' }; // lgtm[js/useless-assignment-to-local]
				if (response) {
					payload = JSON.parse(response);
					let { error } = payload;
					text = error;
				}
			}
			catch (e) {
				let msg = `[showError]: could not parse '${response}'`;
				Foxtrick.log(new Error(msg));
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
		/**
		 * @param  {string|HYPlayers|null} response
		 * @param  {'user'|'permission'}   [reason]
		 */
		var finalize = function(response, reason) {
			if (loading) {
				loading.parentNode.removeChild(loading);
				loading = null;
			}

			if (response == null) {
				const ERROR_CODE = 401;
				let userTmpl = Foxtrick.L10n.getString('youthclub.api.notuser');
				let userMsg = userTmpl.replace(/%s/, 'YouthSkills');
				switch (reason) {
					case 'user':
						showError(`{ "error": "${userMsg}" }`, ERROR_CODE);
						break;

					case 'permission':
						showError(null, ERROR_CODE, 'youthclub.api.nopermission');
						break;

					default:
						showError(`{ "error": "Unknown reason: ${reason}" }`, ERROR_CODE);
						break;
				}
			}

			if (Foxtrick.Prefs.isModuleEnabled('SkillColoring'))
				Foxtrick.modules['SkillColoring'].execute(doc);

			if (Foxtrick.Prefs.isModuleEnabled('TeamStats'))
				Foxtrick.modules['TeamStats'].execute(doc);
		};

		entry = doc.querySelector('#mainBody > .playerList');
		if (entry)
			drawMessage(doc);

		// get skills from HY
		let hy = { origins: ['https://*.hattrick-youthclub.org/*'] };
		Foxtrick.containsPermission(hy, async (perm) => {
			if (!perm) {
				Foxtrick.log('Permission missing!');
				finalize(null, 'permission');
				return;
			}

			let isUser = await Foxtrick.api.hy.isHYUser();
			if (!isUser) {
				finalize(null, 'user');
				return;
			}

			if (entry) {
				loading = Foxtrick.util.note.createLoading(doc);
				entry.insertBefore(loading, entry.firstChild);
			}

			let skills;
			try {
				skills = await Foxtrick.api.hy.getYouthSkills();
			}
			catch (err) {
				let { text, status } = err ||
					{ status: 0, text: `unknown error: ${typeof err}` };
				showError(text, status);
				finalize(text);
			}

			if (skills) {
				try {
					addSkills(skills);
				}
				catch (e) {
					Foxtrick.log(e);
				}
				finalize(skills);
			}
		});

	},
};
