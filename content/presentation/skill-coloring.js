'use strict';
/**
 * skill-coloring.js
 * Script which add colorizes skills and shows numbers for the skills
 * @author spambot, LA-MJ, thx to baumanns
 */

Foxtrick.modules['SkillColoring'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	OPTIONS: [
		'skill_color',
		'non_skill_color',
		'no_colors',
		'skill_number',
		['skill_translated', 'skill_translated_title'],
		'skill_select',
	],
	CSS: Foxtrick.InternalPath + 'resources/skillcolors/common.css',
	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/skillcolors/skill-color.css',
		Foxtrick.InternalPath + 'resources/skillcolors/non-skill-color.css',
		Foxtrick.InternalPath + 'resources/skillcolors/no-colors.css',
		Foxtrick.InternalPath + 'resources/skillcolors/skill-number.css',
		[Foxtrick.InternalPath + 'resources/skillcolors/skill-number.css', ''],
		Foxtrick.InternalPath + 'resources/skillcolors/skill-number-selectoption.css',
	],

	NAMES: {
		skill: [
			'non-existent',
			'disastrous',
			'wretched',
			'poor',
			'weak',
			'inadequate',
			'passable',
			'solid',
			'excellent',
			'formidable',
			'outstanding',
			'brilliant',
			'magnificent',
			'world class',
			'supernatural',
			'titanic',
			'extra-terrestrial',
			'mythical',
			'magical',
			'utopian',
			'divine',
		],
		skillshort: [
			'non-existent',
			'disastrous',
			'wretched',
			'poor',
			'weak',
			'inadequate',
			'passable',
			'solid',
			'excellent',
		],
		teamskills: [
			'non-existent',
			'disastrous',
			'wretched',
			'poor',
			'weak',
			'inadequate',
			'passable',
			'solid',
			'excellent',
			'formidable',
			'outstanding',
		],
		sponsors: [
			'murderous',
			'furious',
			'irritated',
			'calm',
			'content',
			'satisfied',
			'delirious',
			'high on life',
			'dancing in the streets',
			'Sending love poems to you',
		],
		FanMood: [
			'murderous',
			'furious',
			'angry',
			'irritated',
			'disappointed',
			'calm',
			'content',
			'satisfied',
			'delirious',
			'high on life',
			'dancing in the streets',
			'Sending love poems to you',
		],
		FanMatch: [
			'Better not show up',
			'We are outclassed',
			'We will lose',
			'They are favourites',
			'They have the edge',
			'It will be a close affair',
			'We have the edge',
			'We are favourites',
			'We will win',
			'Piece of cake!',
			"Let's humiliate them",
		],
		FanSeason: [
			'We are not worthy of this division',
			'Every day in this division is a bonus',
			'We will have to fight to stay up',
			'A mid table finish is nice',
			'We belong in the top 4',
			'Aim for the title!',
			'We have to win this season',
			'We are so much better than this division!',
		],
		gentleness: [
			'nasty fellow',
			'controversial person',
			'pleasant guy',
			'sympathetic guy',
			'popular guy',
			'beloved team member',
		],
		honesty: [
			'infamous',
			'dishonest',
			'honest',
			'upright',
			'righteous',
			'saintly',
		],
		aggressiveness: [
			'tranquil',
			'calm',
			'balanced',
			'temperamental',
			'fiery',
			'unstable',
		],
		morale: {
			indexOf: function(key) {
				var index = key - 12;
				return (index == -1) ? 10 : index;
			},
			12: 'like the Cold War',
			13: 'murderous',
			14: 'furious',
			15: 'irritated',
			16: 'composed',
			17: 'calm',
			18: 'content',
			19: 'satisfied',
			20: 'delirious',
			21: 'walking on clouds',
			11: 'Paradise on Earth!',
		},
		confidence: {
			indexOf: function(key) {
				var index = key - 23;
				return (index == -1) ? 9 : index;
			},
			23: 'non-existent',
			24: 'disastrous',
			25: 'wretched',
			26: 'poor',
			27: 'decent',
			28: 'strong',
			29: 'wonderful',
			30: 'slightly exaggerated',
			31: 'exaggerated',
			22: 'completely exaggerated',
		},
	},
	addSkill: function(doc, el, type, htIndex, skill_number, skill_translated,
	                   skill_translated_title, isProblemPage) {

		var text = el.textContent;

		var skill = this.NAMES[type][htIndex];
		var level;
		if (!(this.NAMES[type] instanceof Array))
			level = this.NAMES[type].indexOf(htIndex); //some HT skills follow weird patterns

		else level = htIndex;
		if (skill_translated && skill_translated_title) { //add to title instead
			el.setAttribute('title', skill);
			skill_translated = false;
		}

		if (skill_number && (type == 'gentleness' || type == 'honesty' || type == 'aggressiveness')
		    && Foxtrick.Prefs.isModuleEnabled('PersonalityImages'))
			skill_number = false; //don't add number if we have PersonalityImages

		if (!(skill_number || skill_translated))
			return; //nothing else to do here

		var n = doc.createElement('span');
		Foxtrick.addClass(n, 'ft-skill-number');
		var t = doc.createElement('span');
		Foxtrick.addClass(t, 'ft-skill');
		if (isProblemPage && skill_translated &&
		    (el.parentNode.nodeName == 'TD' || el.parentNode.parentNode.nodeName == 'TD'))
			t.appendChild(doc.createElement('br')); //add a br to pages with small width
		n.textContent = (skill_number && skill_translated) ? ' ' + level : level;

		t.appendChild(doc.createTextNode(
			(skill_translated) ? ' (' + skill : ' ('
		));
		if (skill_number)
			t.appendChild(n);
		t.appendChild(doc.createTextNode(')'));
		el.appendChild(t);
	},
	run: function(doc) {
		if (Foxtrick.isPage(doc, 'ownYouthPlayers') &&
			Foxtrick.Prefs.isModuleEnabled('YouthSkills'))
			return;
		this.execute(doc);
	},
	execute: function(doc) {

		var skill_color = Foxtrick.Prefs.isModuleOptionEnabled('SkillColoring', 'skill_color');
		var non_skill_color = Foxtrick.Prefs.isModuleOptionEnabled('SkillColoring',
		                                                          'non_skill_color');
		var no_colors = Foxtrick.Prefs.isModuleOptionEnabled('SkillColoring', 'no_colors');
		var skill_number = Foxtrick.Prefs.isModuleOptionEnabled('SkillColoring', 'skill_number');
		var skill_translated = Foxtrick.Prefs.isModuleOptionEnabled('SkillColoring',
		                                                           'skill_translated');
		var skill_translated_title = Foxtrick.Prefs.isModuleOptionEnabled('SkillColoring',
		                                                                 'skill_translated_title');
		var skill_select = Foxtrick.Prefs.isModuleOptionEnabled('SkillColoring', 'skill_select');

		var playerDetailsChange = function() {
			// Foxtrick.log('playerDetailsChange')

			var createLink = function(type, level, skill, skill_translated) {
				// skill_translated has to be a parameter here to support specials
				var newLink = doc.createElement('a');
				Foxtrick.addClass(newLink, 'ft-skill');
				if ((!skill_color && type == 'skill') || (!non_skill_color && type != 'skill') ||
				    no_colors)
					Foxtrick.addClass(newLink, 'ft-skill-dont-touch');
					// this is a match order page, we don't want white backgrounds here
				newLink.textContent = skill;
				newLink.href = '/Help/Rules/AppDenominations.aspx?lt=' + type + '&ll=' + level
					+ '#' + type;

				Foxtrick.modules['SkillColoring'].addSkill(doc, newLink, type, level, skill_number,
					skill_translated, skill_translated_title, false);
				// not problem page

				return newLink;
			};
			var toggleSpecials = function(specials) {
				for (var i = 0, special; special = specials[i]; ++i) {
					var span = special[0], type = special[1];
					var skill = span.textContent;
					span.textContent = null;
					var level = Foxtrick.L10n.getLevelFromText(skill);
					var newLink = createLink(type, level, skill, skill_translated);
					// adding a link to apply styling, using 'global' skill_translated
					span.appendChild(newLink);
				}
			};

			var details = doc.getElementById('details');
			if (details) {

				// let's hope LAs don't mess with order of things here
				var span = details.getElementsByClassName('experienceAndLeadership')[0];
				var isYouth = ! (span.textContent);
				if (!isYouth) {
					var XPandLS = span.getElementsByTagName('span');
					if (XPandLS[0].getElementsByTagName('a')[0])
						return; // we've been here before
					var XPspan = XPandLS[0], LSspan = XPandLS[1];
					var STandFO = details.getElementsByClassName('staminaAndForm')[0]
						.getElementsByTagName('span');
					var STspan = STandFO[0], FOspan = STandFO[1];
					var LOspan = details.getElementsByClassName('loyalty')[0]
						.getElementsByTagName('span')[0];

					toggleSpecials([
						[XPspan, 'skill'],
						[LSspan, 'skillshort'],
						[STspan, 'skill'],
						[FOspan, 'skillshort'],
						[LOspan, 'skill'],
					]);
				}

				var tds = details.getElementsByTagName('td');
				for (var i = 0, td; td = tds[i]; ++i) {
					if (Foxtrick.hasClass(td, 'type'))
						continue; // 'type' is for skill names (gk,pm etc)
					if (isYouth) {
						if (td.getElementsByClassName('ft-skill')[0])
							break; // we've been here before
						var percentImage = td.getElementsByTagName('img')[0];
						var translated = (skill_translated) ? !percentImage : false;
						var parent = (percentImage) ? td.firstChild : td;
						var childs = parent.childNodes;
						for (var j = 0, child; child = childs[j]; ++j) {
							if (child.nodeType != 3) continue; // we need only text nodes
							var temp = doc.createElement('span');
							temp.className = 'ft-skill';
							td.appendChild(temp);
							var skills = child.textContent.split('/');
							if (skills[0]) {
								var level = Foxtrick.L10n.getLevelFromText(skills[0]);
								var newLink = createLink('skill', level, skills[0], translated);
								parent.insertBefore(newLink, child);
								++j;
							}
							if (child.textContent.search(/\//) != -1) {
								parent.insertBefore(doc.createTextNode('/'), child);
								++j;
							}
							if (skills[1]) {
								var level = Foxtrick.L10n.getLevelFromText(skills[1]);
								var newLink = createLink('skill', level, skills[1], translated);
								parent.insertBefore(newLink, child);
								++j;
							}
							parent.removeChild(child);
							--j;
						}
					}
					else {
						var skill = td.textContent.trim();
						var percentImage = td.getElementsByTagName('img')[0];
						var level = (percentImage) ? percentImage.title.match(/\d+/) :
							Foxtrick.L10n.getLevelFromText(skill);
						td.removeChild(td.lastChild);
						if (percentImage) td.appendChild(doc.createTextNode('\u00a0'));

						var translated = (skill_translated) ? !percentImage : false;
						// if skillbars are activated never show inline translation to prevent
						// overflow

						// we have to use a 'local' translated not to interfere with specials
						var newLink = createLink('skill', level, skill, translated);
						// adding a link to apply styling
						td.appendChild(newLink);
					}
				}
			}
		};

		// add skill link colors (and or) numbers to the dynamically filled player details div
		// on the lineup page
		if ((skill_color || non_skill_color || skill_number || skill_translated) &&
		    Foxtrick.isPage(doc, 'matchOrder')) {
			Foxtrick.onChange(doc.getElementById('details'), playerDetailsChange);
		}

		if (skill_select && Foxtrick.isPage(doc, 'transferSearchForm')) {
			var body = doc.getElementById('mainBody');
			var query = 'select[id*="Skill"][id$="Min"]>option, ' +
				'select[id*="Skill"][id$="Max"]>option';
			var skills = body.querySelectorAll(query);
			Foxtrick.forEach(function(skill) {
				if (skill.value != -1) {
					var level = doc.createElement('span');
					Foxtrick.addClass(level, 'ft-tl-search-skill');
					level.textContent = ' (' + skill.value + ')';
					skill.appendChild(level);
				}
			}, skills);
		}

		if (skill_number || skill_translated) {
			var isProblemPage = (Foxtrick.isPage(doc, 'ownPlayers') ||
			                     Foxtrick.isPage(doc, 'transferSearchResult'));
			// too little space on these pages
			var l = doc.getElementsByTagName('a');
			// turn this into an array
			var links = Foxtrick.map(function(link) {
				return link;
			}, l);
			var e = /\/Help\/Rules\/AppDenominations\.aspx\?.*&(?:ll|labellevel)=(\d+)#(\w+)/;
			for (var i = 0, link; link = links[i]; ++i) {
				if (e.test(link.href)) {
					var r = link.href.match(e), type = r[2], htIndex = r[1];

					this.addSkill(doc, link, type, htIndex, skill_number, skill_translated,
					              skill_translated_title, isProblemPage);

				}
			}
		}
	}
};
