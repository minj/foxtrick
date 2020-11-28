/**
 * skill-coloring.js
 * Script which add colorizes skills and shows numbers for the skills
 * @author spambot, LA-MJ, thx to baumanns
 */

'use strict';

Foxtrick.modules.SkillColoring = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	OPTIONS: [
		'skill_color',
		'non_skill_color',
		'no_colors',
		'skill_number',
		['skill_translated', 'skill_translated_title'],
	],
	CSS: Foxtrick.InternalPath + 'resources/skillcolors/common.css',
	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/skillcolors/skill-color.css',
		Foxtrick.InternalPath + 'resources/skillcolors/non-skill-color.css',
		Foxtrick.InternalPath + 'resources/skillcolors/no-colors.css',
		Foxtrick.InternalPath + 'resources/skillcolors/skill-number.css',
		[Foxtrick.InternalPath + 'resources/skillcolors/skill-number.css', ''],
	],

	/**
	 * @type {Record<string, string[] | Record<number, string> & { indexOf: (ll: number)=>number}>}
	 */
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
		leadership: [
			'non-existent',
			'disastrous',
			'wretched',
			'poor',
			'weak',
			'inadequate',
			'passable',
			'solid',
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
			/**
			 * @param  {number} key
			 * @return {number}
			 */
			indexOf: function(key) {
				// eslint-disable-next-line no-magic-numbers
				let index = key - 12; // shift by 12
				return index == -1 ? 10 : index; // 11 => 10
			},
			12: 'like the Cold War', // 0
			13: 'murderous',
			14: 'furious',
			15: 'irritated',
			16: 'composed',
			17: 'calm',
			18: 'content',
			19: 'satisfied',
			20: 'delirious',
			21: 'walking on clouds', // 9
			11: 'Paradise on Earth!', // 10
		},
		confidence: {
			/**
			 * @param  {number} key
			 * @return {number}
			 */
			indexOf: function(key) {
				// eslint-disable-next-line no-magic-numbers
				let index = key - 23; // shift by 23
				// eslint-disable-next-line no-magic-numbers
				return index == -1 ? 9 : index; // 22 => 9
			},
			23: 'non-existent', // 0
			24: 'disastrous',
			25: 'wretched',
			26: 'poor',
			27: 'decent',
			28: 'strong',
			29: 'wonderful',
			30: 'slightly exaggerated',
			31: 'exaggerated', // 8
			22: 'completely exaggerated', // 9
		},
	},

	/**
	 * @typedef SkillColoringFlags
	 * @prop {boolean} skillNumber
	 * @prop {boolean} skillTranslated
	 * @prop {boolean} skillTranslatedTitle
	 * @prop {boolean} isProblemPage
	 */

	/**
	 * @param {document} doc
	 * @param {Element}  el
	 * @param {string}   type
	 * @param {number}   htIndex
	 * @param {SkillColoringFlags} flags
	 */
	// eslint-disable-next-line complexity
	addSkill: function(doc, el, type, htIndex, flags) {

		const module = this;
		const MAX_SKILL = 20;

		let { skillNumber, skillTranslated, skillTranslatedTitle, isProblemPage } = flags;

		var level = parseInt(String(htIndex), 10) || 0;

		/** @type {string} */
		var skill;

		let def = module.NAMES[type];
		if (Array.isArray(def)) {
			let capped = Math.min(level, MAX_SKILL); // capped at 20
			skill = def[capped];

			if (capped < level) {
				// if (el.href) {
				// 	let re = new RegExp(`=${level}(?!\\d)`, 'g');
				// 	el.href = el.href.replace(re, `=${capped}`);
				// }

				skill += ` (+${level - capped})`;
			}
		}
		else if (def) {
			// some HT skills follow weird patterns
			skill = def[level];
			level = def.indexOf(level);
		}
		else {
			Foxtrick.log(new Error(`Unknown skill type '${type}'`));
			return;
		}


		if (skillTranslated && skillTranslatedTitle) {
			// add to title instead
			el.setAttribute('title', skill);
			skillTranslated = false;
		}

		if (skillNumber &&
		    (type == 'gentleness' || type == 'honesty' || type == 'aggressiveness') &&
		    Foxtrick.Prefs.isModuleEnabled('PersonalityImages')) {
			// don't add number if we have PersonalityImages
			skillNumber = false;
		}

		if (!(skillNumber || skillTranslated)) {
			// nothing else to do here
			return;
		}

		var result = doc.createElement('span');
		Foxtrick.addClass(result, 'ft-skill');
		if (isProblemPage && skillTranslated &&
		    (el.parentNode.nodeName == 'TD' || el.parentNode.parentNode.nodeName == 'TD')) {
			// add a br to pages with small width
			result.appendChild(doc.createElement('br'));
		}
		result.appendChild(doc.createTextNode(skillTranslated ? ` (${skill}` : ' ('));

		if (skillNumber) {
			let numSpan = doc.createElement('span');
			Foxtrick.addClass(numSpan, 'ft-skill-number');
			numSpan.textContent = skillTranslated ? ` ${level}` : String(level);
			result.appendChild(numSpan);
		}

		result.appendChild(doc.createTextNode(')'));
		el.appendChild(result);
	},

	/** @param {document} doc */
	run: function(doc) {
		if (Foxtrick.isPage(doc, 'ownYouthPlayers') &&
		    Foxtrick.Prefs.isModuleEnabled('YouthSkills'))
			return;

		this.execute(doc);
	},

	/** @param {document} doc */
	execute: function(doc) {
		const module = this;

		const skillColor = Foxtrick.Prefs.isModuleOptionEnabled(module, 'skill_color');
		const nonSkillColor = Foxtrick.Prefs.isModuleOptionEnabled(module, 'non_skill_color');
		const noColors = Foxtrick.Prefs.isModuleOptionEnabled(module, 'no_colors');
		const skillNumber = Foxtrick.Prefs.isModuleOptionEnabled(module, 'skill_number');
		const skillTranslated = Foxtrick.Prefs.isModuleOptionEnabled(module, 'skill_translated');
		const skillTranslatedTitle =
			Foxtrick.Prefs.isModuleOptionEnabled(module, 'skill_translated_title');

		// eslint-disable-next-line complexity
		var playerDetailsChange = function() {
			// Foxtrick.log('playerDetailsChange')

			/**
			 * @param  {string}  type
			 * @param  {number}  level
			 * @param  {string}  skill
			 * @param  {boolean} skillTranslated
			 * @return {HTMLAnchorElement}
			 */
			var createLink = function(type, level, skill, skillTranslated) {
				// skillTranslated has to be a parameter here to support specials
				let newLink = doc.createElement('a');
				Foxtrick.addClass(newLink, 'ft-skill');

				if (!skillColor && type == 'skill' || !nonSkillColor && type != 'skill' ||
				    noColors) {
					// this is a match order page, we don't want white backgrounds here
					Foxtrick.addClass(newLink, 'ft-skill-dont-touch');
				}

				newLink.textContent = skill;
				newLink.href = `/Help/Rules/AppDenominations.aspx?lt=${type}&ll=${level}#${type}`;

				let flags = {
					skillNumber,
					skillTranslated,
					skillTranslatedTitle,
					isProblemPage: false, // not problem page
				};

				module.addSkill(doc, newLink, type, level, flags);

				return newLink;
			};

			/**
			 * @param {[HTMLSpanElement, string][]} specials
			 */
			var toggleSpecials = function(specials) {
				for (let [span, type] of specials) {
					let skill = span.textContent;
					span.textContent = '';
					let level = Foxtrick.L10n.getLevelFromText(skill);

					// adding a link to apply styling, using 'global' skillTranslated
					let newLink = createLink(type, level, skill, skillTranslated);
					span.appendChild(newLink);
				}
			};

			let details = doc.getElementById('details');
			if (!details)
				return;

			// let's hope LAs don't mess with order of things here
			let span = details.querySelector('.experienceAndLeadership');
			let isYouth = !span.textContent;
			if (!isYouth) {
				let XPandLS = span.querySelectorAll('span');
				let [XPspan, LSspan] = XPandLS;

				if (XPspan.querySelector('a')) {
					// we've been here before
					return;
				}

				let STandFO = details.querySelector('.staminaAndForm').querySelectorAll('span');
				let [STspan, FOspan] = STandFO;

				/** @type {HTMLSpanElement} */
				let LOspan = details.querySelector('.loyalty span');

				toggleSpecials([
					[XPspan, 'skill'],
					[LSspan, 'leadership'],
					[STspan, 'skill'],
					[FOspan, 'skillshort'],
					[LOspan, 'skill'],
				]);
			}

			let tds = details.querySelectorAll('td');
			for (let td of tds) {
				if (Foxtrick.hasClass(td, 'type')) {
					// 'type' is for skill names (gk,pm etc)
					continue;
				}

				if (isYouth) {
					if (td.querySelector('.ft-skill')) {
						// we've been here before
						break;
					}

					let percentImage = td.querySelector('img');
					let translated = skillTranslated ? !percentImage : false;
					let parent = percentImage ? td.firstChild : td;
					for (let j = 0; j < parent.childNodes.length; j++) {
						let child = parent.childNodes[j];
						if (child.nodeType != doc.TEXT_NODE) {
							// we need only text nodes
							continue;
						}

						let temp = doc.createElement('span');
						temp.className = 'ft-skill';
						td.appendChild(temp);
						let skills = child.textContent.split('/');
						let [curr, cap] = skills;

						if (curr) {
							let level = Foxtrick.L10n.getLevelFromText(curr);
							let newLink = createLink('skill', level, curr, translated);
							parent.insertBefore(newLink, child);
							++j;
						}

						if (/\//.test(child.textContent)) {
							parent.insertBefore(doc.createTextNode('/'), child);
							++j;
						}

						if (cap) {
							let level = Foxtrick.L10n.getLevelFromText(cap);
							let newLink = createLink('skill', level, cap, translated);
							parent.insertBefore(newLink, child);
							++j;
						}
						parent.removeChild(child);
						--j;
					}
				}
				else {
					let skill = td.textContent.trim();
					let percentImage = td.querySelector('img');

					let level = percentImage ?
						parseInt(String(percentImage.title.match(/\d+/)), 10) :
						Foxtrick.L10n.getLevelFromText(skill);

					if (td.lastChild)
						td.removeChild(td.lastChild);

					if (percentImage)
						td.appendChild(doc.createTextNode('\u00a0'));

					// if skillbars are activated never show inline translation to prevent
					// overflow
					let translated = skillTranslated ? !percentImage : false;

					// we have to use a 'local' translated not to interfere with specials
					let newLink = createLink('skill', level, skill, translated);

					// adding a link to apply styling
					td.appendChild(newLink);
				}
			}
		};

		if ((skillColor || nonSkillColor || skillNumber || skillTranslated) &&
		    Foxtrick.isPage(doc, 'matchOrder')) {
			// add skill link colors (and or) numbers to the dynamically filled player details div
			// on the lineup page
			Foxtrick.onChange(doc.getElementById('details'), playerDetailsChange);
		}

		if (skillNumber || skillTranslated) {
			// too little space on these pages
			let isProblemPage = Foxtrick.isPage(doc, ['ownPlayers', 'transferSearchResult']);

			let links = doc.querySelectorAll('a');

			let e = /\/Help\/Rules\/AppDenominations\.aspx\?.*&(?:ll|labellevel)=(\d+)#(\w+)/;
			for (let link of links) {
				if (!e.test(link.href))
					continue;

				let [_, ll, type] = link.href.match(e);
				let htIndex = parseInt(ll, 10);

				let flags = {
					skillNumber,
					skillTranslated,
					skillTranslatedTitle,
					isProblemPage,
				};

				module.addSkill(doc, link, type, htIndex, flags);
			}
		}
	},

};
