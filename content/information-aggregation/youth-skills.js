'use strict';

Foxtrick.modules['YouthSkills'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['youthPlayers'],
	CSS: Foxtrick.InternalPath + 'resources/css/youth-skills.css',
	NICE: -10,
	run: function(doc) {
		var UNKNOWNLEVELSYMBOL = '-';

		if (!Foxtrick.isPage(doc, 'ownYouthPlayers'))
			return;

		//this maps HY skill-id to the row index in the table
		//cf Foxtrick.api.hy.skillMap
		//(when looking for n-th child, add 1 to the result)
		var rowMap = {
			3: 2,
			4: 3,
			5: 5,
			6: 0,
			7: 4,
			8: 1,
			9: 6
		};

		var addSkills = function(json) {
			var addBars = function(node) {
				if (!node)
					return;

				var htPot, htCur, maxed;
				var el = node.getElementsByClassName('youthSkillBar_max')[0];
				if (el) {
					htPot = (parseInt(el.style.backgroundPositionX, 10) + 126) / 8;
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

				if (!node.getElementsByClassName('youthSkillBar')[0])
				{
					var fragment = doc.createDocumentFragment();

					var bars = fragment.appendChild(doc.createElement('div'));
					Foxtrick.addClass(bars, 'youthSkillBar');
					var div = bars.appendChild(doc.createElement('div'));
					div.title = '?/?';
					div.className = 'ft-youthSkillBars';

					var skillbars = [
						'ft-skillbar-bg',
						'ft-skillbar-hy-pot', 'ft-skillbar-ht-pot',
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
							}
							else if (image.className == 'ft-skillbar-ht-cur' && htCur) {
								image.style.width = (1 + 11 * htCur) + 'px';
							}
							else if (image.className == 'ft-skillbar-maxed' && maxed) {
								image.style.width = (1 + 11 * maxed) + 'px';
							}
						});
					}, skillbars);

					//var bar1 = doc.createElement('img');
					//bar1.setAttribute('src', '/App_Themes/Standard/youthSkillBar/back.png');
					//bar1.setAttribute('alt', 'x/y');
					//bar1.setAttribute('title', 'x/y');
					//bar1.setAttribute('style', 'background-position: -126px 0px');
					//Foxtrick.addClass(bar1, 'youthSkillBar_max');
					//
					//var bar2 = doc.createElement('img');
					//bar2.setAttribute('src', '/Img/icons/transparent.gif');
					//bar2.setAttribute('alt', 'x/y');
					//bar2.setAttribute('title', 'x/y');
					//bar2.setAttribute('style', 'width: 0px');
					//Foxtrick.addClass(bar2, 'youthSkillBar_current');
					//
					//bars.appendChild(bar1);
					//bars.appendChild(bar2);

					node.appendChild(fragment);
				}
			};

			var setMaxSkill = function(skillentry, value, maxed) {
				//var maximg = skillentry.querySelector('img:nth-of-type(1)');
				//var offset = 62 + (8 - value) * 8;
				//var style = 'background-position: -' + offset + 'px 0px';
				//maximg.setAttribute('style', style);
				//maximg.setAttribute('alt', value + '/8');
				//maximg.setAttribute('title', value + '/8');
				var titleDiv = skillentry.getElementsByClassName('ft-youthSkillBars')[0];
				if (titleDiv && value)
					titleDiv.title = titleDiv.title.replace('/?', '/' + value);
				if (maxed)
					return;

				var maximg = skillentry.getElementsByClassName('ft-skillbar-hy-pot')[0];
				if (maximg && value)
					maximg.style.width = (1 + parseInt(value, 10) + 10 * value) + 'px';

				var gapText = doc.createTextNode(' / ');
				maximg.parentNode.appendChild(gapText);

				if (value) {
					var maxLink = doc.createElement('a');
					maxLink.setAttribute('href', '/Help/Rules/AppDenominations.aspx?lt=skill&ll=' +
					                     parseInt(value, 10) + '#skill');
					var maxText = doc.createTextNode(value ? Foxtrickl10n.getTextByLevel(value) :
					                                 UNKNOWNLEVELSYMBOL);
					Foxtrick.addClass(maxLink, 'skill ft-youthskills-link');
					//used to signal skillcoloring that we manually trigger coloring
					maxLink.appendChild(maxText);
					maximg.parentNode.appendChild(maxLink);
				} else {
					var maxText = doc.createTextNode(UNKNOWNLEVELSYMBOL);
					maximg.parentNode.appendChild(maxText);
				}
			};
			var setCurrentSkill = function(skillentry, value, max, maxed) {
				//var curimg = skillentry.querySelector('img:nth-of-type(2)');
				//if (Foxtrick.hasClass(curimg, 'youthSkillBar_current') && maxed) {
				//	Foxtrick.removeClass(curimg, 'youthSkillBar_current');
				//	Foxtrick.addClass(curimg, 'youthSkillBar_full');
				//} else if (Foxtrick.hasClass(curimg, 'youthSkillBar_full') && !maxed) {
				//	Foxtrick.removeClass(curimg, 'youthSkillBar_full');
				//	Foxtrick.addClass(curimg, 'youthSkillBar_current');
				//}
				//var width = value ? -1 + value * 8 : 0;

				//var style = 'width:' + width + 'px';
				//curimg.setAttribute('style', style);
				//curimg.setAttribute('alt', value + '/' + max);
				//curimg.setAttribute('title', value + '/' + max);

				//generate
				var curImg = skillentry.getElementsByClassName('ft-skillbar-hy-cur')[0];
				if (curImg && value)
					curImg.style.width = (1 + parseInt(value, 10) + 10 * value) + 'px';

				var gapText = doc.createTextNode(' ');
				curImg.parentNode.appendChild(gapText);

				if (value) {
					var titleDiv = skillentry.getElementsByClassName('ft-youthSkillBars')[0];
					if (titleDiv)
						titleDiv.title = titleDiv.title.replace('?', value);
					var minLink = doc.createElement('a');
					minLink.setAttribute('href', '/Help/Rules/AppDenominations.aspx?lt=skill&ll=' +
					                     parseInt(value, 10) + '#skill');
					Foxtrick.addClass(minLink, 'skill ft-youthskills-link');
					//used to signal skillcoloring that we manually trigger coloring
					var minText = doc.createTextNode(value ?
					                                 Foxtrickl10n.getTextByLevel(value) :
					                                 UNKNOWNLEVELSYMBOL);
					minLink.appendChild(minText);
					curImg.parentNode.appendChild(minLink);
				} else {
					var minText = doc.createTextNode(UNKNOWNLEVELSYMBOL);
					curImg.parentNode.appendChild(minText);
				}

			};

			var setSkill = function(playerInfo, skill, current, max, maxed) {
				var table = playerInfo.getElementsByTagName('tbody')[0];
				var skillentry = table.querySelector('tr:nth-of-type(' + skill + ') ' +
				                                     '> td:nth-of-type(2)');

				if (!skillentry)
					return;

				Foxtrick.removeClass(skillentry.parentNode, 'hidden');

				addBars(skillentry);
				setCurrentSkill(skillentry, current, max, maxed);

				setMaxSkill(skillentry, max, maxed);
			};

			var start = new Date().getTime();

			var playerInfos = doc.getElementsByClassName('playerInfo');

			for (var i = 0; i < playerInfos.length; i++) {
				var playerInfo = playerInfos[i];

				//get playerid
				var playerID = parseInt(playerInfo.getElementsByTagName('a')[0].href
				                        .match(/YouthPlayerID=(\d+)/i)[1], 10);

				//add specialty
				if (json[playerID] === undefined)
					continue;
				var specialty = json[playerID].speciality;
				if (specialty) {
					var age = playerInfo.getElementsByTagName('p')[0];
					var text = age.textContent;
					if (!/\[/g.test(text)) {
						var text = doc.createElement('b');
						var title = Foxtrickl10n.getSpecialityFromNumber(specialty);
						var alt = Foxtrickl10n.getShortSpeciality(title);

						text.textContent = '[' + title + ']';
						age.appendChild(text);
					}
				}

				var sk;
				for (sk in json[playerID].skills) {
					if (json[playerID].skills.hasOwnProperty(sk)) {
						if (sk == 10)
							continue;
						var skill = json[playerID].skills[sk];

						var cap = skill['cap'] || 0;
						var cap_minimal = skill['cap_minimal'] || 0;
						var current = skill['current'] || 0;
						var maxed = skill['maxed'];

						var min = current;
						var max = Math.max(cap_minimal, cap);

						if (min || max)
							setSkill(playerInfo, rowMap[sk] + 1, min, max, maxed);
					}
				}
			}

			Foxtrick.log('YouthSkills:', new Date().getTime() - start, 'ms');
			//last point in time
		};

		// run this once we finish
		var finalize = function() {
			Foxtrick.modules['SkillColoring'].execute(doc);
		};

		//get skills from HY
		Foxtrick.containsPermission({origins:["http://*.hattrick-youthclub.org/*"]}, function(permission){
			if(permission){
				Foxtrick.api.hy.runIfHYUser(function() {
					Foxtrick.api.hy.getYouthSkills(addSkills, null, finalize);
				}, finalize); // finalize if not user
			} else {
				Foxtrick.log("Sorry fucker, needs permission!");
			}
		});
		
	}
};
