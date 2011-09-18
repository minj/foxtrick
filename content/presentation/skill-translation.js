/**
 * skill-translation.js
 * Script which add trasnlations to english to skills
 * @author convincedd
 */

Foxtrick.util.module.register({
	MODULE_NAME : "SkillTranslation",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('denominations'),

	player_abilities	: new Array(
		"Player abilities",
		"divine",
		"utopian",
		"magical",
		"mythical",
		"extra-terrestrial",
		"titanic",
		"supernatural",
		"world class",
		"magnificent",
		"brilliant",
		"outstanding",
		"formidable",
		"excellent",
		"solid",
		"passable",
		"inadequate",
		"weak",
		"poor",
		"wretched",
		"disastrous",
		"non-existent"
	),
	coach_skills	: new Array(
		"Coach skills / Leadership / Form / Youth Squad",
		"excellent",
		"solid",
		"passable",
		"inadequate",
		"weak",
		"poor",
		"wretched",
		"disastrous",
		"non-existent"
	),
	formation_experience	: new Array(
		"Formation experience",
		"outstanding",
		"formidable",
		"excellent",
		"solid",
		"passable",
		"inadequate",
		"weak",
		"poor"
	),
	sponsors	: new Array(
		"Sponsors",
		"Sending love poems to you",
		"dancing in the streets",
		"high on life",
		"delirious",
		"satisfied",
		"content",
		"calm",
		"irritated",
		"furious",
		"murderous"
	),
	fan_mood	: new Array(
		"Fan mood",
		"Sending love poems to you",
		"dancing in the streets",
		"high on life",
		"delirious",
		"satisfied",
		"content",
		"calm",
		"disappointed",
		"irritated",
		"angry",
		"furious",
		"murderous"
	),
	fan_match_expectations	: new Array(
		"Fan match expectations",
		"Let's humiliate them",
		"Piece of cake!",
		"We will win",
		"We are favourites",
		"We have the edge",
		"It will be a close affair",
		"They have the edge",
		"They are favourites",
		"We will lose",
		"We are outclassed",
		"Better not show up"
	),
	fan_season_expectations	: new Array(
		"Fan season expectations",
		"We are so much better than this division!",
		"We have to win this season",
		"Aim for the title!",
		"We belong in the top 4",
		"A mid table finish is nice",
		"We will have to fight to stay up",
		"Every day in this division is a bonus",
		"We are not worthy of this division"
	),
	agreeability 	: new Array(
		"Agreeability",
		"beloved team member",
		"popular guy",
		"sympathetic guy",
		"pleasant guy",
		"controversial person",
		"nasty fellow"
	),
	honesty	: new Array(
		"Honesty",
		"saintly",
		"righteous",
		"upright",
		"honest",
		"dishonest",
		"infamous"
	),
	aggressiveness	: new Array(
		"Aggressiveness",
		"unstable",
		"fiery",
		"temperamental",
		"balanced",
		"calm",
		"tranquil"
	),
	team_spirit	: new Array(
		"Team spirit",
		"Paradise on Earth!",
		"walking on clouds",
		"delirious",
		"satisfied",
		"content",
		"calm",
		"composed",
		"irritated",
		"furious",
		"murderous",
		"like the Cold War"
	),
	team_confidence	: new Array(
		"Team confidence",
		"completely exaggerated",
		"exaggerated",
		"slightly exaggerated",
		"wonderful",
		"strong",
		"decent",
		"poor",
		"wretched",
		"disastrous",
		"non-existent"
	),

	run : function(doc) {
		// no need to translate if language is already English
		if (FoxtrickPrefs.getString("htLanguage") === "en") {
			return;
		}
		var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];

		// is english test
		if (table.rows[1].cells[0].getElementsByTagName('b')[0].innerHTML==this.player_abilities[0]) return;

			this.translate_category(doc,table,1,this.player_abilities,false);
			this.translate_category(doc,table,2,this.coach_skills,false);
			this.translate_category(doc,table,3,this.formation_experience,false);
			this.translate_category(doc,table,4,this.sponsors,false);
			this.translate_category(doc,table,5,this.fan_mood,false);
			this.translate_category(doc,table,6,this.fan_match_expectations,true);
			this.translate_category(doc,table,7,this.fan_season_expectations,true);
			this.translate_category(doc,table,8,this.agreeability,true);
			this.translate_category(doc,table,9,this.honesty,false);
			this.translate_category(doc,table,10,this.aggressiveness,false);
			this.translate_category(doc,table,11,this.team_spirit,false);
			this.translate_category(doc,table,12,this.team_confidence,false);

		doc.location.hash=doc.location.hash;
	},

	translate_category: function(doc,table,index,denominations,two_lines) {
		var br='';
		if (two_lines) br='<br>';
		table.rows[index].cells[0].innerHTML += '<br><span class="shy">(' + denominations[0] + '</span>)';
		var org_skills=table.rows[index].cells[1].innerHTML.split('<br>');
		table.rows[index].cells[1].innerHTML='';
		for (var i=1;i<denominations.length;++i) {
			//Foxtrick.dump(org_skills+'\n'+org_skills[i-1]+'\n');
			table.rows[index].cells[1].innerHTML += org_skills[i-1] + br + ' <span style="white-space:nowrap;" class="shy">('+denominations[i]+')</span><br>';
		}
	}
});
