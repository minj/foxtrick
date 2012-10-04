'use strict';
/**
 * skill-translation.js
 * Script which add trasnlations to english to skills
 * @author convincedd
 */

Foxtrick.modules['SkillTranslation'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['denominations'],

	player_abilities: [
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
		'non-existent'
	],
	coach_skills: [
		'Coach skills / Leadership / Form / Youth Squad',
		'excellent',
		'solid',
		'passable',
		'inadequate',
		'weak',
		'poor',
		'wretched',
		'disastrous',
		'non-existent'
	],
	formation_experience: [
		'Formation experience',
		'outstanding',
		'formidable',
		'excellent',
		'solid',
		'passable',
		'inadequate',
		'weak',
		'poor'
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
		'murderous'
	],
	fan_mood: [
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
		'murderous'
	],
	fan_match_expectations: [
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
		'Better not show up'
	],
	fan_season_expectations: [
		'Fan season expectations',
		'We are so much better than this division!',
		'We have to win this season',
		'Aim for the title!',
		'We belong in the top 4',
		'A mid table finish is nice',
		'We will have to fight to stay up',
		'Every day in this division is a bonus',
		'We are not worthy of this division'
	],
	agreeability: [
		'Agreeability',
		'beloved team member',
		'popular guy',
		'sympathetic guy',
		'pleasant guy',
		'controversial person',
		'nasty fellow'
	],
	honesty: [
		'Honesty',
		'saintly',
		'righteous',
		'upright',
		'honest',
		'dishonest',
		'infamous'
	],
	aggressiveness: [
		'Aggressiveness',
		'unstable',
		'fiery',
		'temperamental',
		'balanced',
		'calm',
		'tranquil'
	],
	team_spirit: [
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
		'like the Cold War'
	],
	team_confidence: [
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
		'non-existent'
	],

	run: function(doc) {
		// no need to translate if language is already English
		if (FoxtrickPrefs.getString('htLanguage') === 'en') {
			return;
		}
		var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];

		// is english test
		if (table.rows[1].cells[0].getElementsByTagName('b')[0].textContent ==
		    this.player_abilities[0])
			return;

			this.translate_category(doc, table, 1, this.player_abilities, false);
			this.translate_category(doc, table, 2, this.coach_skills, false);
			this.translate_category(doc, table, 3, this.formation_experience, false);
			this.translate_category(doc, table, 4, this.sponsors, false);
			this.translate_category(doc, table, 5, this.fan_mood, false);
			this.translate_category(doc, table, 6, this.fan_match_expectations, true);
			this.translate_category(doc, table, 7, this.fan_season_expectations, true);
			this.translate_category(doc, table, 8, this.agreeability, true);
			this.translate_category(doc, table, 9, this.honesty, false);
			this.translate_category(doc, table, 10, this.aggressiveness, false);
			this.translate_category(doc, table, 11, this.team_spirit, false);
			this.translate_category(doc, table, 12, this.team_confidence, false);

		doc.location.hash = doc.location.hash;
	},

	translate_category: function(doc, table, index, denominations, two_lines) {
		table.rows[index].cells[0].appendChild(doc.createElement('br'));
		var span = Foxtrick.createFeaturedElement(doc, this, 'span');
		Foxtrick.addClass(span, 'shy');
		span.textContent = '(' + denominations[0] + ')';
		table.rows[index].cells[0].appendChild(span);

		var org_skills = table.rows[index].cells[1].innerHTML.split('<br>');
		table.rows[index].cells[1].textContent = '';
		for (var i = 1; i < denominations.length; ++i) {
			var strong = org_skills[i - 1].match(/<strong>(.+)<\/strong>/);
			if (!strong)
				table.rows[index].cells[1].appendChild(doc.createTextNode(org_skills[i - 1]));
			else {
				var node = doc.createElement('strong');
				node.textContent = strong[1];
					table.rows[index].cells[1].appendChild(node);
			}
			if (two_lines)
				table.rows[index].cells[1].appendChild(doc.createElement('br'));
			else
				table.rows[index].cells[1].appendChild(doc.createTextNode(' '));
			var span = Foxtrick.createFeaturedElement(doc, this, 'span');
			Foxtrick.addClass(span, 'nowrap shy');
			span.textContent = '(' + denominations[i] + ')';
			table.rows[index].cells[1].appendChild(span);
			table.rows[index].cells[1].appendChild(doc.createElement('br'));
		}
	}
};
