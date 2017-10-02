'use strict';
/**
 * personality-images.js
 * Script which add character image
 * @author smates/convinced
 */

Foxtrick.modules['PersonalityImages'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['playerDetails', 'training', 'matchStatus', 'matchReferees'],

	run: function(doc) {
		var skills = doc.getElementsByClassName('skill');
		for (var j = 0; j < skills.length; ++j) {
			var skill = skills[j];
			if (!skill.href) {
				// it should be an <a> element
				continue;
			}
			var level;
			if (/lt\=honesty/i.test(skill.href) || /lt\=gentleness/i.test(skill.href)) {
				level = skill.href.match(/ll\=(\d)/)[1];
				Foxtrick.addImage(doc, skill, {
					class: 'ft-personality-img',
					src: Foxtrick.InternalPath + 'resources/personality/red2blue/' + level + '.jpg'
				});
			}
			else if (/lt\=aggressiveness/i.test(skill.href)) {
				level = skill.href.match(/ll\=(\d)/)[1];
				Foxtrick.addImage(doc, skill, {
					class: 'ft-personality-img',
					src: Foxtrick.InternalPath + 'resources/personality/blue2red/' + level + '.jpg'
				});
			}
		}
	}
};
