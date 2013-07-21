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
		var module = this;
		var UNKNOWNLEVELSYMBOL = '-';

		if (!Foxtrick.isPage(doc, 'ownYouthPlayers'))
			return;

		// string to use when current skill is estimated
		var approx = Foxtrickl10n.getString('YouthSkills.estimated');

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
					htPot = (parseInt(el.style.backgroundPosition, 10) + 126) / 8;
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
					'ft-skillbar-hy-pot', 'ft-skillbar-ht-pot',
					'ft-skillbar-hy-pred',
					'ft-skillbar-hy-cur', 'ft-skillbar-ht-cur',
					'ft-skillbar-maxed'
				];

				Foxtrick.map(function(className) {
					Foxtrick.addImage(doc, div, {
						src: '/Img/icons/transparent.gif',
						class: className
					  }, null,
					  function (image) {
						if (image.className == 'ft-skillbar-ht-pot' && htPot) {
							image.style.width = (1 + 11 * htPot) + 'px';
							div.setAttribute('ht-pot', htPot);
						}
						else if (image.className == 'ft-skillbar-ht-cur' && htCur) {
							image.style.width = (1 + 11 * htCur) + 'px';
							div.setAttribute('ht-cur', htCur);
						}
						else if (image.className == 'ft-skillbar-maxed' && maxed) {
							image.style.width = (1 + 11 * maxed) + 'px';
							div.setAttribute('ht-maxed', maxed);
						}
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
				if (img)
					img.style.width = (1 + parseInt(value, 10) + 10 * value) + 'px';
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
						var maxed = skill['maxed'];
						var pred = skill['current_estimation'] || 0;

						var min = current;
						var max = Math.max(cap_minimal, cap);

						if (pred || min || max)
							setSkill(playerInfo, rowMap[sk] + 1, pred, min, max, maxed);
					}
				}
			}

			// last point in time
			Foxtrick.log('YouthSkills:', new Date().getTime() - start, 'ms');
		};

		// run this once we finish
		var finalize = function() {
			Foxtrick.modules['SkillColoring'].execute(doc);
		};

		// get skills from HY
		Foxtrick.containsPermission({ origins: ['http://*.hattrick-youthclub.org/*'] },
		  function(permission) {
			if (permission) {
				Foxtrick.api.hy.runIfHYUser(function() {
					Foxtrick.api.hy.getYouthSkills(addSkills, null, finalize);
				}, finalize); // finalize if not user
			} else {
				Foxtrick.log('Sorry fucker, needs permission!');
			}
		});
		
	}
};
