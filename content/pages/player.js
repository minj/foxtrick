'use strict';
/* player.js
 * Utilities on player page
 * @author ryanli, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.Player = {};

/**
 * Test whether this page is player page
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.Player.isPage = function(doc) {
	return this.isSeniorPlayerPage(doc) || this.isYouthPlayerPage(doc);
};

/**
 * Test whether this page is senior player page
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.Player.isSeniorPlayerPage = function(doc) {
	return Foxtrick.isPage(doc, 'playerDetails');
};

/**
 * Test whether this page is youth player page
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.Player.isYouthPlayerPage = function(doc) {
	return Foxtrick.isPage(doc, 'youthPlayerDetails');
};

/**
 * Get player age
 * @param  {document} doc
 * @return {Integer}
 */
Foxtrick.Pages.Player.getAge = function(doc) {
	try {
		// returns age in the following format:
		// age = { years: xx, days: yyy };
		var birthdayRe = /(\d+).*?(\d+).*?\d+.*?\d+.*?\d+.*?/;
		var birthdayCell = doc.getElementsByClassName('byline')[0];
		var birthdayMatch = birthdayRe.exec(birthdayCell.textContent);

		var age = {
			years: parseInt(birthdayMatch[1], 10),
			days: parseInt(birthdayMatch[2], 10)
		};
		return age;
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/**
 * Get player name
 * @param  {document} doc
 * @return {String}
 */
Foxtrick.Pages.Player.getName = function(doc) {
	var name = null;
	try {
		var links = Foxtrick.Pages.Player.getBreadCrumbs(doc);
		var player = Foxtrick.nth(function(link) {
			return /PlayerID=\d+/i.test(link.href);
		}, links);
		if (player) {
			// for some reason youth players have extended spaces
			name = player.textContent.replace(/\s+/g, ' ');
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return name;
};

/**
 * Get player ID
 * @param  {document} doc
 * @return {Inteber}
 */
Foxtrick.Pages.Player.getId = function(doc) {
	var param = this.isSeniorPlayerPage(doc) ? 'playerId' : 'youthPlayerId';
	var id = Foxtrick.getParameterFromUrl(doc.location.href, param);
	return parseInt(id, 10) || null;
};

/**
 * Get player nationality ID
 * @param  {document} doc
 * @return {Integer}
 */
Foxtrick.Pages.Player.getNationalityId = function(doc) {
	var id = null;
	try {
		var link = this.isSeniorPlayerPage(doc) ? doc.getElementsByClassName('flag')[0] :
			doc.querySelector('.playerInfo a[href^="/World/Leagues/League.aspx"]');

		var val = Foxtrick.getParameterFromUrl(link.href, 'LeagueID');
		id = parseInt(val, 10);
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return id;
};

/**
 * Get player nationality name.
 * Returns country name in English.
 * @param  {document} doc
 * @return {String}
 */
Foxtrick.Pages.Player.getNationalityName = function(doc) {
	var name = null;
	try {
		var id = this.getNationalityId(doc);
		name = Foxtrick.XMLData.League[id].EnglishName;
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return name;
};

/**
 * Get player TSI.
 * Senior players only.
 * @param  {document} doc
 * @return {Integer}
 */
Foxtrick.Pages.Player.getTsi = function(doc) {
	var tsi = null;
	if (this.isSeniorPlayerPage(doc)) {
		try {
			var infoTable = doc.querySelector('.playerInfo table');
			var rowIdx = this.isFreeAgent(doc) ? 0 : 1;
			var tsiCell = infoTable.rows[rowIdx].cells[1];
			var tsiString = tsiCell.textContent.replace(/\D/g, '');
			tsi = parseInt(tsiString, 10);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
	return tsi;
};

/**
 * Get player attributes.
 * Returns an object with leadership, experience, coachSkill, stamina, form, loyalty
 * and personality (gentleness, aggressiveness, honesty) fields.
 * Senior players only.
 * @param  {document} doc
 * @return {Object}
 */
Foxtrick.Pages.Player.getAttributes = function(doc) {
	var attrs = null;
	if (this.isSeniorPlayerPage(doc)) {
		try {
			var links = doc.querySelectorAll('.playerInfo .skill');
			var regE = /skillshort/i;
			attrs = {};
			var num = function(link) {
				return Foxtrick.util.id.getSkillLevelFromLink(link);
			};
			// form vs stamina
			if (regE.test(links[1].href)) {
				attrs.form = num(links[1]);
				attrs.stamina = num(links[0]);
			}
			else {
				attrs.form = num(links[0]);
				attrs.stamina = num(links[1]);
			}
			// coaches have an additional link at this point
			var offset = 0;
			if (this.isCoach(doc)) {
				offset = 1;
				attrs.coachSkill = num(links[2]);
			}
			// personality:
			// gentleness aggressiveness honesty
			for (var i = 2 + offset; i < 5 + offset; i++) {
				var attr = Foxtrick.getParameterFromUrl(links[i], 'lt');
				attrs[attr] = num(links[i]);
			}
			// leadership vs experience
			if (regE.test(links[6 + offset].href)) {
				attrs.leadership = num(links[6 + offset]);
				attrs.experience = num(links[5 + offset]);
			}
			else {
				attrs.leadership = num(links[5 + offset]);
				attrs.experience = num(links[6 + offset]);
			}
			// loyalty
			attrs.loyalty = num(links[7 + offset]);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
	return attrs;
};

/**
 * Test whether player is a coach.
 * Seniors only.
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.Player.isCoach = function(doc) {
	var coach = false;
	if (this.isSeniorPlayerPage(doc)) {
		coach = doc.querySelectorAll('.playerInfo .skill').length > 8;
	}
	return coach;
};

/**
 * Test whether player is bruised
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.Player.isBruised = function(doc) {
	var bruised = false;
	try {
		var infoTable = doc.querySelector('.playerInfo table');
		var injuryCell = infoTable.rows[4].cells[1];
		var injuryImages = injuryCell.getElementsByTagName('img');
		if (injuryImages.length > 0) {
			bruised = /bruised.gif/i.test(injuryImages[0].src);
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return bruised;
};

/**
 * Get the player injury length
 * @param  {document} doc
 * @return {Integer}
 */
Foxtrick.Pages.Player.getInjuryWeeks = function(doc) {
	var weeks = 0;
	try {
		var infoTable = doc.querySelector('.playerInfo table');
		var injuryCell = infoTable.rows[4].cells[1];
		var injuryImages = injuryCell.getElementsByTagName('img');
		if (injuryImages.length) {
			if (/injured.gif/i.test(injuryImages[0].src)) {
				var length = injuryImages[0].nextSibling;
				weeks = parseInt(length.textContent.match(/\d+/), 10);
			}
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return weeks;
};

/**
 * Get the number of bookings player has accumulated.
 * Red card = 3.
 * @param  {document} doc
 * @return {Integer}
 */
Foxtrick.Pages.Player.getCards = function(doc) {
	var cards = 0;
	try {
		var infoTable = doc.querySelector('.playerInfo table');
		var cardCell = infoTable.rows[3].cells[1];
		cards = parseInt(cardCell.textContent.trim(), 10);
		if (isNaN(cards))
			cards = 3;
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return cards;
};

/**
 * Test whether a player is a free agent.
 * Free agents are external coaches wit no club to coach.
 * .playerInfo table has a different structure in such a case.
 * E. g. [playerid=182715495]
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.Player.isFreeAgent = function(doc) {
	return this.getTeamName(doc) === null;
};

/**
 * Get the name of player's team.
 * Free agents have no team thus null is returned.
 * @param  {document} doc
 * @return {String}
 */
Foxtrick.Pages.Player.getTeamName = function(doc) {
	var name = null;
	try {
		var links = Foxtrick.Pages.Player.getBreadCrumbs(doc);
		if (links.length >= 2)
			name = links[0].textContent;
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return name;
};

/**
 * Get the player wage.
 * Returns {base, bonus, total: Integer}.
 * Senior player only.
 * @param  {document} doc
 * @return {{base: Integer, bonus: Integer, total: Integer}}
 */
Foxtrick.Pages.Player.getWage = function(doc) {
	var ret = null;
	if (this.isSeniorPlayerPage(doc)) {
		try {
			var infoTable = doc.querySelector('.playerInfo table');
			// wage position varies for free agents
			var rowIdx = this.isFreeAgent(doc) ? 1 : 2;
			var wageText = infoTable.rows[rowIdx].cells[1].textContent;
			wageText = wageText.replace(/\s*(\d+)\s+/g, '$1');
			var hasBonus = /%/.test(wageText);
			var wage = parseInt(wageText, 10);
			ret = (hasBonus) ? { base: wage / 1.2, bonus: wage / 6, total: wage } :
				{ base: wage, bonus: 0, total: wage };
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
	return ret;
};

/**
 * Get the player specialty name in English
 * @param  {document} doc
 * @return {String}
 */
Foxtrick.Pages.Player.getSpeciality = function(doc) {
	var speciality = null;
	try {
		var infoTable = doc.querySelector('.playerInfo table');
		var specRow = infoTable.rows[5];
		if (specRow) {
			var specText = specRow.cells[1].textContent.trim();
			speciality = Foxtrick.L10n.getEnglishSpeciality(specText);
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return speciality;
};

/**
 * Get player skills.
 * For senior players returns an integer skill map:
 * {keeper, defending, playmaking, winger, passing, scoring, setPieces}.
 * Youth player skill map contains {current, max: Integer, maxed: Boolean} or
 * an empty object if no data is known.
 * @param  {document} doc
 * @return {Object}
 */
Foxtrick.Pages.Player.getSkills = function(doc) {
	var skillsWithText = this.getSkillsWithText(doc);
	return skillsWithText ? skillsWithText.values : null;
};

/**
 * Get player skills with text.
 * Returns {values, texts, names} where texts and names are
 * localized skill levels and names respectively.
-	 * Each field is a skill map:
 * {keeper, defending, playmaking, winger, passing, scoring, setPieces}.
 * For seniors values are integers, while youth values are
 * {current, max: Integer, maxed: Boolean} or
 * an empty object if no data is known.
 * For seniors texts are strings, while youth texts are {current, max: String}.
 * Texts may contain level numbers, e.g. 'weak (3)'.'
 * @param  {document} doc
 * @return {Object}
 */
Foxtrick.Pages.Player.getSkillsWithText = function(doc) {
	// youth example
	// {
	// 	values: {
	// 		keeper: { current: 4, max: 7, maxed: false },
	// 		// ...
	// 	},
	// 	texts: {
	// 		keeper: { current: 'weak (3)', max: 'solid (7)' },
	// 		// ...
	// 	},
	// 	names: {
	// 		keeper: 'Keeper',
	// 		// ...
	// 	}
	// }
	var skillMap = {
		senior_bars: [
			'keeper',
			'defending',
			'playmaking',
			'winger',
			'passing',
			'scoring',
			'setPieces',
		],
		senior: [
			'stamina',
			'keeper',
			'playmaking',
			'passing',
			'winger',
			'defending',
			'scoring',
			'setPieces',
		],
		youth: [
			'keeper',
			'defending',
			'playmaking',
			'winger',
			'passing',
			'scoring',
			'setPieces',
		],
	};
	var found = true, regE = /ll=(\d+)/i;
	var skills = {}, skillTexts = {}, skillNames = {};
	var parseSeniorBars = function() {
		var order = skillMap.senior_bars;
		var rows = skillTable.rows;
		for (var i = 0; i < order.length; ++i) {
			var skillLink = rows[i].getElementsByTagName('a')[0];
			if (!regE.test(skillLink.href)) {
				found = false;
				return; //skills are not visible
			}
			var skillValue = parseInt(skillLink.href.match(regE)[1], 10);
			var skillText = skillLink.textContent.trim();
			var skillContent = rows[i].cells[0].textContent;
			var skillName = skillContent.replace(':', '').trim();
			skills[order[i]] = skillValue;
			skillTexts[order[i]] = skillText;
			skillNames[order[i]] = skillName;
		}
	};
	var parseSeniorTable = function() {
		var order = skillMap.senior;
		var cells = skillTable.getElementsByTagName('td');
		for (var i = 0; i < order.length; ++i) {
			var cell = cells[2 * i + 1];
			if (!cell) {
				found = false;
				return; //skills are not visible
			}
			var skillLink = cell.getElementsByTagName('a')[0];
			if (!regE.test(skillLink.href)) {
				found = false;
				return; //skills are not visible
			}
			var skillValue = parseInt(skillLink.href.match(regE)[1], 10);
			var skillText = skillLink.textContent.trim();
			var skillContent = cells[2 * i].textContent;
			var skillName = skillContent.replace(':', '').trim();
			skills[order[i]] = skillValue;
			skillTexts[order[i]] = skillText;
			skillNames[order[i]] = skillName;
		}
	};
	var parseYouthBars = function() {
		var order = skillMap.youth;
		var rows = skillTable.rows;
		if (rows.length < order.length) {
			found = false;
			return;
		}
		for (var i = 0; i < order.length; ++i) {
			var skill = skills[order[i]] = {};
			var imgs = rows[i].getElementsByTagName('img');
			if (imgs.length) {
				// when max is unknown first title is empty
				// second title is 'n/?'
				// when current is unknown first title is 'm/8'
				// second title is '-1/m'
				// when both are known first title is 'm/8'
				// second titile is 'n/m'
				// when maxed out, first title is 'm/8'
				// second title is empty
				skill.maxed = false;
				var max = parseInt(imgs[0].title.match(/\d/), 10);
				var current = parseInt(imgs[1].title.match(/-?\d/), 10);
				if (!current) {
					skill.maxed = true;
					current = max;
				}
				else if (current === -1)
					current = 0;
				// if current and/or max is unknown, mark it as 0
				skill.current = current;
				skill.max = max || 0;
			}
			else {
				// no image is present, meaning nothing about
				// that skill has been revealed
				skill = { current: 0, max: 0, maxed: false };
			}
			var currentText = '';
			var maxText = '';
			var textCell = rows[i].cells[0];
			var skillCell = rows[i].cells[1];
			var bar = skillCell.getElementsByClassName('youthSkillBar')[0];
			if (bar) {
				// bar is present
				// skills could either be a skill or unknown (span.shy)
				var skillNodes = bar.querySelectorAll('.skill, .shy');
				if (skillNodes.length > 1) {
					currentText = skillNodes[0].textContent;
					maxText = skillNodes[1].textContent;
				}
			}
			else {
				// no images, the cell says 'unknown'
				currentText = maxText = skillCell.textContent.trim();
			}
			skillTexts[order[i]] = { current: currentText, max: maxText };
			skillNames[order[i]] = textCell.textContent.replace(':', '').trim();
		}
	};

	try {
		var skillTable = doc.querySelector('.mainBox table');
		if (skillTable && this.isPage(doc)) {
			if (this.isSeniorPlayerPage(doc)) {
				var hasBars = skillTable.querySelector('.percentImage, .ft-percentImage');
				if (hasBars)
					parseSeniorBars();
				else
					parseSeniorTable();
			}
			else
				parseYouthBars();
		}
		else
			found = false;

		return found ? { values: skills, texts: skillTexts, names: skillNames } : null;
	}
	catch (e) {
		Foxtrick.log(e);
		return null;
	}
};

/**
 * Get player transfer deadline, if any.
 * Returns a date object.
 * Seniors only.
 * @param  {document} doc
 * @return {Date}
 */
Foxtrick.Pages.Player.getTransferDeadline = function(doc) {
	var deadline = null;
	try {
		var bidDiv = doc.getElementById('ctl00_ctl00_CPContent_CPMain_updBid');
		if (bidDiv) {
			var bidPara = bidDiv.getElementsByTagName('p')[0];
			deadline = Foxtrick.util.time.getDateFromText(bidPara.textContent);
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return deadline;
};

/**
 * Get player object.
 * Calls callback(player) where player contains various fields from playerdetails.xml.
 * Seniors only.
 * @param  {document}   doc
 * @param  {Integer}   playerid
 * @param  {function(Object)} callback
 */
Foxtrick.Pages.Player.getPlayer = function(doc, playerid, callback) {
	var args = [
		['file', 'playerdetails'],
		['version', '2.1'],
		['playerId', playerid],
	];
	Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'session' },
	  function(xml, errorText) {
		if (!xml || errorText) {
			Foxtrick.log(errorText);
			callback(null);
			return;
		}

		var node = function(tagName) {
			return xml.getElementsByTagName(tagName)[0];
		};
		var text = function(tagName) {
			return node(tagName).textContent;
		};
		var num = function(tagName) {
			return parseInt(text(tagName), 10);
		};


		var player = {};
		player.PlayerID = num('PlayerID');
		player.LastName = text('LastName');
		player.FirstName = text('FirstName');
		player.NickName = text('NickName');
		if (node('PlayerNumber'))
			player.PlayerNumber = num('PlayerNumber');
		player.Age = num('Age');
		player.AgeDays = num('AgeDays');
		player.NextBirthDay = text('NextBirthDay');
		player.PlayerForm = num('PlayerForm');
		player.Cards = num('Cards');
		player.InjuryLevel = num('InjuryLevel');
		if (node('Statement'))
			player.Statement = text('Statement');
		if (node('PlayerLanguage'))
			player.PlayerLanguage = text('PlayerLanguage');
		if (node('PlayerLanguageID'))
			player.PlayerLanguageID = num('PlayerLanguageID');
/*
  <TrainerData />
  <OwningTeam>
  <TeamID>522356</TeamID>
  <TeamName>FC Karbrüggen</TeamName>
  <LeagueID>3</LeagueID>
</OwningTeam>*/
		player.Salary = num('Salary');
		player.IsAbroad = text('IsAbroad');
		player.Agreeability = num('Agreeability');
		player.Aggressiveness = num('Aggressiveness');
		player.Honesty = num('Honesty');
		player.Experience = num('Experience');
		player.Loyalty = num('Loyalty');
		player.MotherClubBonus = text('MotherClubBonus');
		player.Leadership = num('Leadership');
		player.Specialty = num('Specialty');
		player.NativeCountryID = num('NativeCountryID');
		player.NativeLeagueID = num('NativeLeagueID');
		player.NativeLeagueName = text('NativeLeagueName');
		player.TSI = num('TSI');
//  <PlayerSkills>
		player.StaminaSkill = num('StaminaSkill');
		player.Caps = num('Caps');
		player.CapsU20 = num('CapsU20');
		player.CareerGoals = num('CareerGoals');
		player.CareerHattricks = num('CareerHattricks');
		player.LeagueGoals = num('LeagueGoals');
		player.LeagueGoals = num('LeagueGoals');
		player.TransferListed = text('TransferListed');
// LastMatch
		callback(player);
	});
};

/**
 * Get position contributions from skill map and English specialty.
 * Skill map must be {keeper, defending, playmaking, winger, passing, scoring, setPieces}.
 * Returns position contribution map.
 * @author Grebliux, LA-MJ
 * @param  {Object<String,Integer>} skills skill map
 * @param  {String}                 spec   English specialty
 * @return {Object<String,Number>}         position map
 */
Foxtrick.Pages.Player.getContributions = function(skills, spec) {
	var getValue = function(coefs, skills) {
		var value = coefs[0] * skills.keeper;
		value += coefs[1] * skills.defending;
		value += coefs[2] * skills.playmaking;
		value += coefs[3] * skills.winger;
		value += coefs[4] * skills.passing;
		value += coefs[5] * skills.scoring;

		return parseFloat(value.toFixed(1));
	};

	// all coefficients taken from http://wiki.hattrick.org/wiki/Hattrick_-_Skill_positions
	var coefs = {
		//    kp      df     pm     w      ps     sc
		kp:   [1.468, 0.701, 0,     0,     0,     0],
		wbd:  [0,     1.479, 0.066, 0.323, 0,     0],
		wb:   [0,     1.368, 0.167, 0.506, 0,     0],
		wbtm: [0,     1.37,  0.167, 0.276, 0,     0],
		wbo:  [0,     1.079, 0.23,  0.618, 0,     0],
		cd:   [0,     1.516, 0.244, 0,     0,     0],
		cdtw: [0,     1.492, 0.171, 0.252, 0,     0],
		cdo:  [0,     1.103, 0.329, 0,     0,     0],
		wd:   [0,     0.738, 0.381, 0.723, 0.223, 0],
		w:    [0,     0.55,  0.455, 0.854, 0.311, 0],
		wtm:  [0,     0.528, 0.574, 0.564, 0.278, 0],
		wo:   [0,     0.268, 0.381, 1,     0.378, 0],
		imd:  [0,     0.864, 0.944, 0,     0.358, 0],
		im:   [0,     0.589, 1,     0,     0.541, 0],
		imtw: [0,     0.597, 0.881, 0.489, 0.496, 0],
		imo:  [0,     0.318, 0.944, 0,     0.697, 0],
		fw:   [0,     0,     0,     0.18,  0.49,  1.221],
		fwtw: [0,     0,     0,     0.524, 0.339, 1.236],
		tdf:  [0,     0,     0.429, 0.124, 0.885, 0.729],
		fwd:  [0,     0,     0.429, 0.124, 0.814, 0.729],
	};

	var cntrb = {};
	for (var pos in coefs) {
		cntrb[pos] = getValue(coefs[pos], skills);
	}

	if (spec === 'Technical') {
		cntrb.fwd = 0;
	}
	else {
		cntrb.tdf = 0;
	}

	return cntrb;
};

/**
 * Find the highest contribution in a position map.
 * Returns {position, value}.
 * @author Grebliux
 * @param  {Object<String,Number>}             contributions position map
 * @return {{position: String, value: Number}}
 */
Foxtrick.Pages.Player.getBestPosition = function(contributions) {
	var max = { position: '', value: 0 };
	for (var name in contributions)
		if (contributions[name] > max.value) {
			max.position = name;
			max.value = contributions[name];
		}
	return max;
};
