'use strict';

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
		var approx = Foxtrickl10n.getString('YouthSkills.estimated');
		// string to use for top3 skill title
		var top3 = Foxtrickl10n.getString('YouthSkills.top3');

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
			9: 6
		};
		/**
		 * parse HY reponse and merge the info
		 * @param	{Object}	json
		 */
		var addSkills = function(json) {
			/**
			 * replace HT skill bars into our own
			 * retain HT skill info on titleDiv
			 * @param	{element}	node
			 */
			var replaceBars = function(node) {
				var htPot, htCur, maxed;
				var el = node.getElementsByClassName('youthSkillBar_max')[0];
				if (el) {
					htPot = isRtl ? (2 - parseInt(el.style.backgroundPosition, 10)) / 8
						: (parseInt(el.style.backgroundPosition, 10) + 126) / 8;
				}
				el = node.getElementsByClassName('youthSkillBar_current')[0];
				if (el) {
					htCur = parseInt((parseInt(el.style.width, 10) + 1) / 8, 10);
				}
				el = node.getElementsByClassName('youthSkillBar_full')[0];
				if (el) {
					maxed = parseInt((parseInt(el.style.width, 10) + 1) / 8, 10);
				}

				while (node.childNodes.length) {
					node.removeChild(node.childNodes[0]);
				}

				var fragment = doc.createDocumentFragment();

				var bars = fragment.appendChild(Foxtrick.createFeaturedElement(doc, module, 'div'));
				Foxtrick.addClass(bars, 'youthSkillBar');
				var div = bars.appendChild(doc.createElement('div'));
				Foxtrick.addClass(div, 'ft-youthSkillBars');
				div.title = '?/?';

				var skillbars = [
					'ft-skillbar-bg',
					'ft-skillbar-hy-pot ft-skillbar-hy', 'ft-skillbar-ht-pot ft-skillbar-ht',
					'ft-skillbar-hy-pred ft-skillbar-hy',
					'ft-skillbar-hy-cur ft-skillbar-hy', 'ft-skillbar-ht-cur ft-skillbar-ht',
					'ft-skillbar-maxed ft-skillbar-ht',
				];

				Foxtrick.map(function(className) {
					Foxtrick.addImage(doc, div, {
						src: '/Img/icons/transparent.gif',
						class: className
					  }, null,
					  function (image) {
						if (image.className.split(' ')[0] == 'ft-skillbar-ht-pot' && htPot) {
							image.style.width = (1 + 11 * htPot) + 'px';
							div.setAttribute('ht-pot', htPot);
						}
						else if (image.className.split(' ')[0] == 'ft-skillbar-ht-cur' && htCur) {
							image.style.width = (1 + 11 * htCur) + 'px';
							div.setAttribute('ht-cur', htCur);
						}
						else if (image.className.split(' ')[0] == 'ft-skillbar-maxed' && maxed) {
							image.style.width = (1 + 11 * maxed) + 'px';
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
			 * @param	{element}	titleDiv
			 * @param	{String}	name		'hy-pot', 'hy-cur' or 'hy-pred
			 * @param	{Float}		value
			 */
			var setHYValue = function(titleDiv, name, value) {
				titleDiv.setAttribute(name, value);

				var img = titleDiv.getElementsByClassName('ft-skillbar-' + name)[0];
				if (img) {
					var width = 1 + parseInt(value, 10) + 10 * value;
					img.style.width = width + 'px';
					if (isRtl)
						img.style.backgroundPosition = (width - 91) + 'px 0';
				}
			};
			/**
			 * add skill link (if possible) to the node based on the skill level (integer)
			 * @param	{element}	node
			 * @param	{Integer}	level
			 */
			var addSkillLink = function(node, level) {
				if (level) {
					var minLink = doc.createElement('a');
					minLink.href = '/Help/Rules/AppDenominations.aspx?lt=skill&ll=' + level + '#skill';
					Foxtrick.addClass(minLink, 'skill ft-youthskills-link');
					//used to signal skillcoloring that we manually trigger coloring

					minLink.textContent = Foxtrickl10n.getTextByLevel(level);
					node.appendChild(minLink);
				} else {
					var minText = doc.createTextNode(UNKNOWNLEVELSYMBOL);
					node.appendChild(minText);
				}
			};
			/**
			 * parse all available info and assemble the node.title
			 * add skill link(s)
			 * @param	{element}	node
			 */
			var setTitleAndLinks = function(node) {
				var gapText = doc.createTextNode(' ');
				node.appendChild(gapText);

				var cur, pot, curInt, potInt = 0;
				var prediction = false;
				var hyCur = node.getAttribute('hy-cur') || 0;
				var hyPot = node.getAttribute('hy-pot') || 0;
				var hyPred = node.getAttribute('hy-pred') || 0;
				var htCur = node.getAttribute('ht-cur') || 0;
				var htPot = node.getAttribute('ht-pot') || 0;

				// add HY info if no info available or it matches HT info
				cur = (hyCur && (!htCur || parseInt(htCur, 10) == parseInt(hyCur, 10))) ?
					hyCur : htCur;

				// use prediction (if available) in the worst case
				if (!cur && hyPred) {
					prediction = true;
					cur = hyPred;
				}

				// add HY info if no info available or it matches HT info
				pot = (hyPot && (!htPot || parseInt(htPot, 10) == parseInt(hyPot, 10))) ?
					hyPot : htPot;

				node.title = (cur || '?') + (prediction ? ' ' + approx : '') + '/' + (pot || '?');

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
			 * @param	{element}	playerInfo
			 * @param	{Integer}	skill		row index (1-based)
			 * @param	{Float}		pred		skill_estimated
			 * @param	{Float}		current		current_skill
			 * @param	{Float}		max			skill_cap
			 * @param	{Boolean}	maxed		is maxed out
			 */
			var setSkill = function(playerInfo, skill, pred, current, max, maxed) {
				var table = playerInfo.getElementsByTagName('tbody')[0];
				var skillentry = table.querySelector('tr:nth-of-type(' + skill + ') ' +
				                                     '> td:nth-of-type(2)');

				if (!skillentry)
					return;

				// need to unhide blank row since we have new info from HY for this skill
				Foxtrick.removeClass(skillentry.parentNode, 'hidden');

				replaceBars(skillentry);
				var ftBars = skillentry.firstChild.firstChild;
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
			 * @param	{element}	playerInfo
			 * @param	{Integer}	skill		row index (1-based)
			 */
			var markTopSkill = function(playerInfo, skill) {
				var table = playerInfo.getElementsByTagName('tbody')[0];
				var skillName = table.querySelector('tr:nth-of-type(' + skill + ') ' +
				                                     '> td:nth-of-type(1)');

				if (!skillName)
					return;

				var b = Foxtrick.createFeaturedElement(doc, module, 'strong');
				b.textContent = skillName.textContent;
				b.title = top3;
				skillName.textContent = '';
				skillName.appendChild(b);
			};

			// get a timer for some profiling as this module runs in async mode
			var start = new Date().getTime();

			var playerInfos = doc.getElementsByClassName('playerInfo');

			for (var i = 0; i < playerInfos.length; i++) {
				var playerInfo = playerInfos[i];

				// get playerid
				var playerID = parseInt(playerInfo.getElementsByTagName('a')[0].href
				                        .match(/YouthPlayerID=(\d+)/i)[1], 10);

				// stop if player unknown in HY
				if (json[playerID] === undefined)
					continue;

				// add specialty
				var specialty = json[playerID].speciality;
				if (specialty) {
					var age = playerInfo.getElementsByTagName('p')[0];
					var text = age.textContent;
					// skip if specialty known on HT
					if (!/\[/.test(text)) {
						var span = Foxtrick.createFeaturedElement(doc, module, 'span');
						var text = doc.createElement('strong');
						Foxtrick.addClass(text, 'ft-hy-spec');
						text.title = Foxtrickl10n.getString('YouthSkills.newSpeciality');
						// use aria label for a11y
						text.setAttribute('aria-label', text.title);

						var spec = Foxtrickl10n.getSpecialityFromNumber(specialty);
						text.textContent = '[' + spec + ']';
						span.appendChild(text);
						age.appendChild(span);
					}
				}

				var sk;
				for (sk in json[playerID].skills) {
					if (json[playerID].skills.hasOwnProperty(sk)) {
						// skip experience
						if (sk == 10)
							continue;
						var skill = json[playerID].skills[sk];

						var cap = skill['cap'] || 0;
						var cap_minimal = skill['cap_minimal'] || 0;
						var current = skill['current'] || 0;
						var pred = skill['current_estimation'] || 0;
						var maxed = skill['maxed'] || false;
						var top = skill['top3'] || false;

						var min = current;
						var max = Math.max(cap_minimal, cap);

						if (pred || min || max)
							setSkill(playerInfo, rowMap[sk] + 1, pred, min, max, maxed);
						if (top)
							markTopSkill(playerInfo, rowMap[sk] + 1);
					}
				}
			}

			// last point in time
			Foxtrick.log('YouthSkills:', new Date().getTime() - start, 'ms');
		};

		// run this once we finish
		var finalize = function(response, status, reason) {
			if (loading) {
				loading.parentNode.removeChild(loading);
				loading = null;
			}
			if (response === null)
				showError(Foxtrickl10n.getString('youthclub.api.nopermission'), 401);

			if (reason === 'user')
				showError(Foxtrickl10n.getString('youthclub.api.notuser').replace(/%s/, 'YouthSkills'), 401);

			if (FoxtrickPrefs.isModuleEnabled('SkillColoring'))
				Foxtrick.modules['SkillColoring'].execute(doc);

			if (FoxtrickPrefs.isModuleEnabled('TeamStats'))
				Foxtrick.modules['TeamStats'].execute(doc);
		};

		var showError = function(response, status) {
			if (!entry)
				return;

			var insertBefore = entry.firstChild;
			var container = doc.createElement('div');
			var p = doc.createElement('p');
			var text;
			try {
				text = JSON.parse(response).error;
			}
			catch (e) {
				text = response;
			}

			p.textContent = 'Hattrick Youthclub Error ' + status + ': ' + text;
			container.appendChild(p);
			Foxtrick.util.note.add(doc, insertBefore, 'ft-youth-skills-error', container,
								   null, true, null, false);
		};

		var loading;

		var entry = doc.getElementsByClassName('playerList')[0];
		if (entry) {
			var hyInfoDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
			hyInfoDiv.id = 'ft-hy-skills-info';

			var heading = doc.createElement('h2');
			heading.textContent = Foxtrickl10n.getString('YouthSkills.header');
			hyInfoDiv.appendChild(heading);

			var info = doc.createElement('span');
			info.textContent = Foxtrickl10n.getString('YouthSkills.info');
			hyInfoDiv.appendChild(info);

			var legend = doc.createElement('ul');
			var curLegend = doc.createElement('li');
			curLegend.textContent = Foxtrickl10n.getString('YouthSkills.currentSkill');
			Foxtrick.addImage(doc, curLegend, {
				src: '/Img/icons/transparent.gif',
				class: 'ft-skillbar-hy-cur ft-skillbar-singlet'
			}, curLegend.firstChild);
			legend.appendChild(curLegend);

			var predLegend = doc.createElement('li');
			predLegend.textContent = Foxtrickl10n.getString('YouthSkills.skillEstimation');
			Foxtrick.addImage(doc, predLegend, {
				src: '/Img/icons/transparent.gif',
				class: 'ft-skillbar-hy-pred ft-skillbar-singlet'
			}, predLegend.firstChild);
			legend.appendChild(predLegend);

			var potLegend = doc.createElement('li');
			potLegend.textContent = Foxtrickl10n.getString('YouthSkills.skillPotential');
			Foxtrick.addImage(doc, potLegend, {
				src: '/Img/icons/transparent.gif',
				class: 'ft-skillbar-hy-pot ft-skillbar-singlet'
			}, potLegend.firstChild);
			legend.appendChild(potLegend);
			hyInfoDiv.appendChild(legend);

			var info2 = doc.createElement('span');
			info2.textContent = Foxtrickl10n.getString('YouthSkills.info2');
			hyInfoDiv.appendChild(info2);

			entry.parentNode.insertBefore(hyInfoDiv, entry);

		}

		// get skills from HY
		Foxtrick.containsPermission({ origins: ['http://*.hattrick-youthclub.org/*'] },
		  function(permission) {
			if (permission) {
				Foxtrick.api.hy.runIfHYUser(function() {
					if (entry) {
						loading = Foxtrick.util.note.createLoading(doc);
						entry.insertBefore(loading, entry.firstChild);
					}
					Foxtrick.api.hy.getYouthSkills(addSkills, showError, finalize);
				}, function (response, status) {
					// finalize if not user
					if (typeof(response) == 'undefined')
						finalize(0, 0, 'user');
					else
						finalize(response, status);
				});
			} else {
				Foxtrick.log('Sorry fucker, needs permission!');
				finalize(null);
			}
		});
		
	}
};
