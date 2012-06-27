"use strict";
/**
 * skill-coloring.js
 * Script which add colorizes skills and shows numbers for the skills
 * @author spambot, LA-MJ, thx to baumanns
 */

Foxtrick.modules["SkillColoring"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	OPTIONS : [
		"skill_color",
		"only_skill_color",
		"no_colors",
		"skill_number",
		"skill_number_translated",
		"skill_select",
	],
	OPTIONS_CSS : [
		Foxtrick.InternalPath+"resources/skillcolors/skill-color.css",
		Foxtrick.InternalPath+"resources/skillcolors/only-skill-color.css",
		Foxtrick.InternalPath+"resources/skillcolors/no-colors.css",
		Foxtrick.InternalPath+"resources/skillcolors/skill-number.css",
		Foxtrick.InternalPath+"resources/skillcolors/skill-number.css",
		Foxtrick.InternalPath+"resources/skillcolors/skill-number-selectoption.css",
	],

	init : function() {
		if (FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "only_skill_color"))
			this.OPTIONS_CSS[0] = null;
	},

	NAMES : {
		skill : [
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
		skillshort : [
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
		teamskills : [
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
		sponsors	: [
			"murderous",
			"furious",
			"irritated",
			"calm",
			"content",
			"satisfied",
			"delirious",
			"high on life",
			"dancing in the streets",
			"Sending love poems to you",
		],
		FanMood : [
			"murderous",
			"furious",
			"angry",
			"irritated",
			"disappointed",
			"calm",
			"content",
			"satisfied",
			"delirious",
			"high on life",
			"dancing in the streets",
			"Sending love poems to you",
		],
		FanMatch : [
			"Better not show up",
			"We are outclassed",
			"We will lose",
			"They are favourites",
			"They have the edge",
			"It will be a close affair",
			"We have the edge",
			"We are favourites",
			"We will win",
			"Piece of cake!",
			"Let's humiliate them",
		],
		FanSeason : [
			"We are not worthy of this division",
			"Every day in this division is a bonus",
			"We will have to fight to stay up",
			"A mid table finish is nice",
			"We belong in the top 4",
			"Aim for the title!",
			"We have to win this season",
			"We are so much better than this division!",
		],
		gentleness : [
			"nasty fellow",
			"controversial person",
			"pleasant guy",
			"sympathetic guy",
			"popular guy",
			"beloved team member",
		],
		honesty : [
			"infamous",
			"dishonest",
			"honest",
			"upright",
			"righteous",
			"saintly",
		],
		aggressiveness	: [
			"tranquil",
			"calm",
			"balanced",
			"temperamental",
			"fiery",
			"unstable",
		],
		morale : {
			indexOf : function(key){
				var index = key - 12;
				return (index == -1) ? 10 : index; 
			},
			12 : "like the Cold War",
			13 : "murderous",
			14 : "furious",
			15 : "irritated",
			16 : "composed",
			17 : "calm",
			18 : "content",
			19 : "satisfied",
			20 : "delirious",
			21 : "walking on clouds",
			11 : "Paradise on Earth!",
		},
		confidence : {
			indexOf : function(key){
				var index = key - 23;
				return (index == -1) ? 9 : index; 
			},
			23 : "non-existent",
			24 : "disastrous",
			25 : "wretched",
			26 : "poor",
			27 : "decent",
			28 : "strong",
			29 : "wonderful",
			30 : "slightly exaggerated",
			31 : "exaggerated",
			22 : "completely exaggerated",
		},
	},
	addSkill : function(doc, el, type, htIndex, translate){					
		
		var skill = this.NAMES[type][htIndex];
		var level, addNum = false;
		if ( ! (this.NAMES[type] instanceof Array))
			level = this.NAMES[type].indexOf(htIndex);
		else level = htIndex;

		if ( ! FoxtrickPrefs.isModuleEnabled("PersonalityImages") || 
			(type != 'gentleness' && type != 'honesty' && type != 'aggressiveness')
		) addNum = true;
		
		if ( ! (addNum || translate)) return;

		var n = doc.createElement('span');
		Foxtrick.addClass(n,'ft-skill-number');
		var t = doc.createElement('span');
		Foxtrick.addClass(t,'ft-skill');
		n.textContent = (addNum && translate) ? ' ' + level : level;

		t.appendChild(doc.createTextNode(
			(translate) ? ' (' + skill : ' ('
		));
		if (addNum) t.appendChild(n);
		t.appendChild(doc.createTextNode(')'));
		el.appendChild(t);
		
	},
	
	run : function (doc) {
		
		var translate = FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "skill_number_translated");

		var playerDetailsChange = function (ev) { 
			//Foxtrick.log('playerDetailsChange')

			var details = doc.getElementById('details');
			if (details) {
				var tds = details.getElementsByTagName('td');
				for (var i = 0, td; td = tds[i]; ++i){
					if (Foxtrick.hasClass(td, 'type')) continue;
					if (td.getElementsByTagName('span')[0]) {//Foxtrick.log('reject:'+JSON.stringify(td.innerHTML));
					continue;}
					//Foxtrick.log(JSON.stringify());
					var s_name = td.textContent.trim();
					var percentImage = td.getElementsByTagName('img')[0];
					var s_level = (percentImage) ? percentImage.title.match(/\d+/) : Foxtrickl10n.getLevelFromText(s_name);
					td.removeChild(td.lastChild);
					if (percentImage) td.appendChild(doc.createTextNode('\u00a0'));
					var newLink = doc.createElement('a');
					Foxtrick.addClass(newLink, 'ft-skill');
					if( ! FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "skill_color") &&
						! FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "only_skill_color")
						|| FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "no_colors")
					)
						Foxtrick.addClass(newLink, 'ft-skill-dont-touch');
					newLink.textContent = s_name;
					newLink.href = '/Help/Rules/AppDenominations.aspx?lt=skill&ll=' + s_level + '#skill';
					td.appendChild(newLink);
					if(translate) translate = !percentImage; // to prevent overflow
					Foxtrick.modules["SkillColoring"].addSkill(doc, newLink, 'skill', s_level, translate);
				}
			}
		};

		// add skillnumbers to the dynamically filled player details div on the lineup page
		if ( Foxtrick.isPage('matchOrder', doc) && 
			(FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "skill_number") || translate)
		)
		{
			Foxtrick.addMutationEventListener(doc.getElementById('details'), "DOMNodeInserted", playerDetailsChange, false);
		}
		
		if ( Foxtrick.isPage('transferSearchForm', doc) && 
			FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "skill_select") )
		{
			var skills = doc.getElementById('mainBody').querySelectorAll('select[id*="Skill"][id$="Min"]>option, select[id*="Skill"][id$="Max"]>option');
			for (var i = 0, skill; skill = skills[i]; ++i){
				if (skill.value != -1){
					var s_level = doc.createElement('span');
					s_level.textContent = ' (' + skill.value + ')';
					skill.appendChild(s_level);
				}
			}
		}
		
		if ( FoxtrickPrefs.isModuleOptionEnabled("SkillColoring", "skill_number") || translate){		
			var links = doc.getElementsByTagName('a');
			for (var i = 0, link; link = links[i]; ++i){
				var e = new RegExp(/\/Help\/Rules\/AppDenominations\.aspx\?lt=\w+&ll=(\d+)#(\w+)/);
				if (e.test(link.href)){
					var r = link.href.match(e), type = r[2], htIndex = r[1];
					
					this.addSkill(doc, link, type, htIndex, translate);
										
				}
			}
		}
	}
};
