/**
 * skill-translation.js
 * Script which add trasnlations to english to skills
 * @author convincedd
 */

'use strict';

Foxtrick.modules.SkillTranslation = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['denominations'],

	playerAbilities: [
		'Player abilities',
		'divine',
		'utopian',
		'magical',
		'mythical',
		'extra-terrestrial',
		'titanic',
		'supernatural',
		'world class',
		'magnificent',
		'brilliant',
		'outstanding',
		'formidable',
		'excellent',
		'solid',
		'passable',
		'inadequate',
		'weak',
		'poor',
		'wretched',
		'disastrous',
		'non-existent',
	],
	coachSkills: [
		'Coach skills / Form / Youth Squad',
		'excellent',
		'solid',
		'passable',
		'inadequate',
		'weak',
		'poor',
		'wretched',
		'disastrous',
		'non-existent',
	],
	formationExperience: [
		'Formation experience',
		'outstanding',
		'formidable',
		'excellent',
		'solid',
		'passable',
		'inadequate',
		'weak',
		'poor',
	],
	leadership: [
		'Leadership',
		'solid',
		'passable',
		'inadequate',
		'weak',
		'poor',
		'wretched',
		'disastrous',
		'non-existent',
	],
	sponsors: [
		'Sponsors',
		'Sending love poems to you',
		'dancing in the streets',
		'high on life',
		'delirious',
		'satisfied',
		'content',
		'calm',
		'irritated',
		'furious',
		'murderous',
	],
	fanMood: [
		'Fan mood',
		'Sending love poems to you',
		'dancing in the streets',
		'high on life',
		'delirious',
		'satisfied',
		'content',
		'calm',
		'disappointed',
		'irritated',
		'angry',
		'furious',
		'murderous',
	],
	fanMatchExpectations: [
		'Fan match expectations',
		"Let's humiliate them",
		'Piece of cake!',
		'We will win',
		'We are favourites',
		'We have the edge',
		'It will be a close affair',
		'They have the edge',
		'They are favourites',
		'We will lose',
		'We are outclassed',
		'Better not show up',
	],
	fanSeasonExpectations: [
		'Fan season expectations',
		'We are so much better than this division!',
		'We have to win this season',
		'Aim for the title!',
		'We belong in the top 4',
		'A mid table finish is nice',
		'We will have to fight to stay up',
		'Every day in this division is a bonus',
		'We are not worthy of this division',
	],
	agreeability: [
		'Agreeability',
		'beloved team member',
		'popular guy',
		'sympathetic guy',
		'pleasant guy',
		'controversial person',
		'nasty fellow',
	],
	honesty: [
		'Honesty',
		'saintly',
		'righteous',
		'upright',
		'honest',
		'dishonest',
		'infamous',
	],
	aggressiveness: [
		'Aggressiveness',
		'unstable',
		'fiery',
		'temperamental',
		'balanced',
		'calm',
		'tranquil',
	],
	teamSpirit: [
		'Team spirit',
		'Paradise on Earth!',
		'walking on clouds',
		'delirious',
		'satisfied',
		'content',
		'calm',
		'composed',
		'irritated',
		'furious',
		'murderous',
		'like the Cold War',
	],
	teamConfidence: [
		'Team confidence',
		'completely exaggerated',
		'exaggerated',
		'slightly exaggerated',
		'wonderful',
		'strong',
		'decent',
		'poor',
		'wretched',
		'disastrous',
		'non-existent',
	],

	/** @param {document} doc */
	run: function(doc) {
		// no need to translate if language is already English
		if (Foxtrick.Prefs.getString('htLanguage') === 'en')
			return;

		const module = this;

		/** @type {HTMLTableElement} */
		var table = doc.querySelector('#mainBody table');

		// is english test
		if (table.rows[1].cells[0].querySelector('b').textContent ==
		    this.playerAbilities[0])
			return;

		/* eslint-disable no-magic-numbers */
		module.translateCategory(doc, table.rows[1], module.playerAbilities, false);
		module.translateCategory(doc, table.rows[2], module.coachSkills, false);
		module.translateCategory(doc, table.rows[3], module.leadership, false);
		module.translateCategory(doc, table.rows[4], module.formationExperience, false);
		module.translateCategory(doc, table.rows[5], module.sponsors, false);
		module.translateCategory(doc, table.rows[6], module.fanMood, false);
		module.translateCategory(doc, table.rows[7], module.fanMatchExpectations, true);
		module.translateCategory(doc, table.rows[8], module.fanSeasonExpectations, true);
		module.translateCategory(doc, table.rows[9], module.agreeability, true);
		module.translateCategory(doc, table.rows[10], module.honesty, false);
		module.translateCategory(doc, table.rows[11], module.aggressiveness, false);
		module.translateCategory(doc, table.rows[12], module.teamSpirit, false);
		module.translateCategory(doc, table.rows[13], module.teamConfidence, false);
		/* eslint-disable no-magic-numbers */
	},

	/**
	 * @param {document} doc
	 * @param {HTMLTableRowElement} row
	 * @param {string[]} denominations
	 * @param {boolean} twoLines
	 */
	translateCategory: function(doc, row, denominations, twoLines) {
		const module = this;

		var [titleCell, valueCell] = row.cells;

		titleCell.appendChild(doc.createElement('br'));
		let span = Foxtrick.createFeaturedElement(doc, module, 'span');
		Foxtrick.addClass(span, 'shy');
		let [category, ...levels] = denominations;
		span.textContent = `(${category})`;
		titleCell.appendChild(span);

		var orgSkills = valueCell.innerHTML.split('<br>');
		valueCell.textContent = '';
		for (let [i, level] of levels.entries()) {
			let orgSkill = orgSkills[i];
			let strong = orgSkill.match(/<strong>(.+)<\/strong>/);
			if (strong) {
				let [_, denom] = strong;
				let node = doc.createElement('strong');
				node.textContent = denom;
				valueCell.appendChild(node);
			}
			else {
				valueCell.appendChild(doc.createTextNode(orgSkill));
			}
			if (twoLines)
				valueCell.appendChild(doc.createElement('br'));
			else
				valueCell.appendChild(doc.createTextNode(' '));

			let span = Foxtrick.createFeaturedElement(doc, module, 'span');
			Foxtrick.addClass(span, 'nowrap shy');
			span.textContent = `(${level})`;
			valueCell.appendChild(span);
			valueCell.appendChild(doc.createElement('br'));
		}
	},
};
