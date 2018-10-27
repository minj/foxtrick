/* player.js
 * Utilities on player page
 * @author ryanli, LA-MJ, Greblys
 */

'use strict';

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
	return this.isSenior(doc) || this.isYouth(doc);
};

/**
 * Test whether this page is senior player page
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.Player.isSenior = function(doc) {
	return Foxtrick.isPage(doc, 'playerDetails');
};

/**
 * Test whether this page is youth player page
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.Player.isYouth = function(doc) {
	return Foxtrick.isPage(doc, 'youthPlayerDetails');
};

/**
 * Get player age
 * @param  {document} doc
 * @return {number}
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
			days: parseInt(birthdayMatch[2], 10),
		};
		return age;
	}
	catch (e) {
		Foxtrick.log(e);
		return null;
	}
};

/**
 * Get player name
 * @param  {document} doc
 * @return {string}
 */
Foxtrick.Pages.Player.getName = function(doc) {
	var name = null;
	try {
		var links = Foxtrick.Pages.All.getBreadCrumbs(doc);
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
 * @return {number}
 */
Foxtrick.Pages.Player.getId = function(doc) {
	var param = this.isSenior(doc) ? 'playerId' : 'youthPlayerId';
	var id = Foxtrick.getParameterFromUrl(doc.location.href, param);
	return parseInt(id, 10) || null;
};

/**
 * Get player nationality ID
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.Player.getNationalityId = function(doc) {
	var id = null;
	var link = this.isSenior(doc) ?
		doc.getElementsByClassName('flag')[0] :
		doc.querySelector('.playerInfo a[href^="/World/Leagues/League.aspx"]');

	if (link) {
		var val = Foxtrick.getParameterFromUrl(link.href, 'LeagueID');
		id = parseInt(val, 10);
	}
	return id;
};

/**
 * Get player nationality name.
 * @param  {document} doc
 * @return {string}
 */
Foxtrick.Pages.Player.getNationalityName = function(doc) {
	var name = null;
	try {
		var id = this.getNationalityId(doc);
		name = Foxtrick.L10n.getCountryName(id);
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
 * @return {number}
 */
Foxtrick.Pages.Player.getTsi = function(doc) {
	var tsi = null;
	if (this.isSenior(doc)) {
		try {
			let { isNewDesign, table: infoTable } = this.getInfoTable(doc);
			let rowIdx = isNewDesign || this.isFreeAgent(doc) ? 0 : 1;
			let tsiCell = infoTable.rows[rowIdx].cells[1];
			let tsiString = tsiCell.textContent.trim();
			tsi = parseInt(tsiString.replace(/\D/g, ''), 10);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
	return tsi;
};

/**
 * Get skill level from element containing skill link/bar.
 * Senior players only.
 * @param  {Element} el
 * @return {number?}    {Int?}
 */
Foxtrick.Pages.Player.getSkillLevel = function(el) {
	let link = el.querySelector('.skill');
	let skillBar = el.querySelector('.ht-bar');
	if (link)
		return Foxtrick.util.id.getSkillLevelFromLink(link);
	else if (skillBar)
		return parseInt(skillBar.getAttribute('level'), 10);

	return null;
};

/**
 * Get player attributes.
 * Returns {leadership, experience, coachSkill, stamina, staminaPred, form,
 * loyalty, motherClubBonus, gentleness, aggressiveness, honesty}.
 *
 * Senior players only.
 * @param  {document} doc
 * @return {object}
 */
Foxtrick.Pages.Player.getAttributes = function(doc) {
	var attrs = {};
	if (!this.isSenior(doc))
		return null;

	// stamina prediction
	var ownId = Foxtrick.util.id.getOwnTeamId();
	var pid = Foxtrick.Pages.All.getId(doc);
	var data = null, dataText = Foxtrick.Prefs.getString('StaminaData.' + ownId);
	try {
		data = JSON.parse(dataText);
	}
	catch (e) {
		Foxtrick.log(e);
	}
	if (data && typeof data === 'object' && data[pid])
		attrs.staminaPred = parseFloat(data[pid][1]);

	// motherClub
	attrs.motherClubBonus = !!doc.querySelector('.motherclubBonus, .icon-mother-club');

	const RE_SKILL = /skillshort/i;
	const PERSONALITY = ['gentleness', 'aggressiveness', 'honesty'];
	const OTHER_TRAITS = ['leadership', 'experience', 'loyalty'];
	const TRAITS = [...PERSONALITY, ...OTHER_TRAITS];

	var num = link => Foxtrick.util.id.getSkillLevelFromLink(link);
	var personLinks;

	try {
		let { isNewDesign, table: infoTable } = this.getInfoTable(doc);
		if (isNewDesign) {
			let getNumFromRow = (i) => {
				let cell = infoTable.rows[i].cells[1];
				let level = Foxtrick.Pages.Player.getSkillLevel(cell);
				if (level == null)
					throw Error('trait not found');

				return level;
			};

			attrs.form = getNumFromRow(3);
			attrs.stamina = getNumFromRow(4);

			personLinks = Foxtrick.toArray(doc.querySelectorAll('#mainBody > .skill'));
		}
		else {
			let links = Foxtrick.toArray(doc.querySelectorAll('.playerInfo .skill'));

			// form vs stamina
			if (RE_SKILL.test(links[0].href)) {
				attrs.form = num(links[0]);
				attrs.stamina = num(links[1]);
			}
			else {
				attrs.stamina = num(links[0]);
				attrs.form = num(links[1]);
			}

			personLinks = links.slice(2);
		}

		// coaches have an additional link as the first personality link
		if (personLinks.length > TRAITS.length)
			attrs.coachSkill = num(personLinks.shift());

		// personality
		let idx;
		for (idx = 0; idx < PERSONALITY.length; idx++) {
			let attr = Foxtrick.getParameterFromUrl(personLinks[idx], 'lt');
			attrs[attr] = num(personLinks[idx]);
		}

		// leadership vs experience
		if (RE_SKILL.test(personLinks[idx].href)) {
			attrs.leadership = num(personLinks[idx]);
			attrs.experience = num(personLinks[idx + 1]);
		}
		else {
			attrs.experience = num(personLinks[idx]);
			attrs.leadership = num(personLinks[idx + 1]);
		}

		// loyalty
		attrs.loyalty = num(personLinks[idx + 2]);
	}
	catch (e) {
		Foxtrick.log(e);
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
	var attr = this.getAttributes(doc);
	return Foxtrick.hasProp(attr, 'coachSkill');
};

/**
 * Test whether player is bruised
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.Player.isBruised = function(doc) {
	let mainBody = doc.getElementById('mainBody');
	return !!mainBody.querySelector('.plaster, img[src$="/bruised.gif"]');
};

/**
 * Get the player injury cell.
 *
 * Senior player only.
 * @param  {document} doc
 * @return {Element}
 */
Foxtrick.Pages.Player.getInjuryCell = function(doc) {
	var ret = null;
	try {
		var injuryRow, infoTable;
		var teamLink = doc.querySelector('#mainBody a[href^="/Club/?TeamID="]');
		if (teamLink && (infoTable = teamLink.closest('table')) ||
			(infoTable = doc.querySelector('.playerInfo table'))) {
			var icon = infoTable.querySelector('.plaster, .icon-injury');
			if (icon)
				ret = icon.closest('td');
			else if ((injuryRow = infoTable.rows[4]))
				ret = injuryRow.cells[1];
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return ret;
};

/**
 * Get the player injury length
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.Player.getInjuryWeeks = function(doc) {
	var weeks = 0;
	try {
		let injuryCell = this.getInjuryCell(doc);
		if (injuryCell) {
			let injuryText = injuryCell.textContent.trim().replace(/\u221e/, 'Infinity');
			weeks = parseFloat(injuryText) || 0;
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
 * @return {number}
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
 * @return {string}
 */
Foxtrick.Pages.Player.getTeamName = function(doc) {
	var name = null;
	try {
		var links = Foxtrick.Pages.All.getBreadCrumbs(doc);
		if (links.length >= 2)
			name = links[0].textContent;
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return name;
};

/**
 * Get the player info table.
 *
 * Senior player only.
 * @param  {document} doc
 * @return {{isNewDesign: Boolean, table: element}}
 */
Foxtrick.Pages.Player.getInfoTable = function(doc) {
	var isNewDesign = false;
	var infoDiv = doc.querySelector('.transferPlayerInformation');
	if (infoDiv)
		isNewDesign = true;
	else
		infoDiv = doc.querySelector('.playerInfo');

	var table = infoDiv.querySelector('table');

	return { isNewDesign, table };
};

/**
 * Get the player wage cell.
 *
 * Senior player only.
 * @param  {document} doc
 * @return {Element}
 */
Foxtrick.Pages.Player.getWageCell = function(doc) {
	var ret = null;
	if (this.isSenior(doc)) {
		try {
			let { isNewDesign, table: infoTable } = this.getInfoTable(doc);

			// wage position varies for free agents
			var rowIdx = isNewDesign || this.isFreeAgent(doc) ? 1 : 2;
			ret = infoTable.rows[rowIdx].cells[1];
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
	return ret;
};

/**
 * Get the player wage.
 *
 * Returns {base, bonus, total: number}.
 * Senior player only.
 * @param  {document} doc
 * @param  {?element} wageCell optional wage cell to parse; otherwise will be found
 * @return {object}            {base: number, bonus: number, total: number}
 */
Foxtrick.Pages.Player.getWage = function(doc, wageCell) {
	var cell = wageCell || this.getWageCell(doc);
	if (!cell)
		return null;

	var wageText = cell.textContent;

	// we need to trim front text if any
	// unfortunately new lines force using multiline mode
	// thus '.' does not match '\n', /sigh
	wageText = wageText.replace(/^(.|\s)*?(?=[\d\u00a0]{3,})/m, '');
	wageText = wageText.replace(/\u00a0/g, '');

	var wage = parseInt(wageText, 10);
	if (isNaN(wage))
		return null;

	var ret = { base: wage, bonus: 0, total: wage };

	var hasBonus = /%/.test(wageText) || cell.querySelector('span[title]');
	if (hasBonus) {
		var bonus = Math.round(wage / 6);
		ret.bonus = bonus;
		ret.base = wage - bonus;
	}
	return ret;
};

/**
 * Get the player specialty number
 * @param  {document} doc
 * @return {string}
 */
Foxtrick.Pages.Player.getSpecialtyNumber = function(doc) {
	var specNr = 0;
	try {
		var infoTable = doc.querySelector('.playerInfo table');
		var specRow = infoTable.rows[5];
		if (specRow) {
			var specText = specRow.cells[1].textContent.trim();
			specNr = Foxtrick.L10n.getNumberFromSpecialty(specText);
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return specNr;
};

/**
 * Get player skills.
 * For senior players returns an integer skill map:
 * {keeper, defending, playmaking, winger, passing, scoring, setPieces}.
 * Youth player skill map contains {current, max: number, top3, maxed: Boolean} or
 * an empty object if no data is known.
 * @param  {document} doc
 * @return {object}       {current: number, max: number, maxed: Boolean}
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
 * {current, max: number, maxed, top3: Boolean} or
 * an empty object if no data is known.
 * For seniors texts are strings, while youth texts are {current, max: string}.
 * Texts may contain level numbers, e.g. 'weak (3)'.'
 * @param  {document} doc
 * @return {object}       {values, texts, names}
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

	try {
		var skillTable = doc.querySelector('.transferPlayerSkills, .mainBox table');
		if (skillTable && this.isPage(doc)) {
			if (this.isSenior(doc))
				return this.parseSeniorSkills(skillTable);

			return this.parseYouthSkills(skillTable);
		}
		return null;
	}
	catch (e) {
		Foxtrick.log(e);
		return null;
	}
};

/**
 * Parse senior player skills from skill table.
 * Returns {values, texts, names} where texts and names are
 * localized skill levels and names respectively.
-	 * Each field is a skill map:
 * {keeper, defending, playmaking, winger, passing, scoring, setPieces}.
 * Texts may contain level numbers, e.g. 'weak (3)'.'
 * @param  {HTMLTableElement} table
 * @return {object}                 {values, texts, names}
 */
Foxtrick.Pages.Player.parseSeniorSkills = function(table) {
	var skillMap = {
		seniorBars: [
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
	};
	var found = true, regE = /ll=(\d+)/i;
	var skills = {}, skillTexts = {}, skillNames = {};
	var parseSeniorBars = function(table) {
		var order = skillMap.seniorBars;
		var rows = table.rows;
		for (var i = 0; i < order.length; ++i) {
			var skillLink = rows[i].getElementsByTagName('a')[0];
			if (!regE.test(skillLink.href)) {
				found = false;
				return; // skills are not visible
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
	var parseSeniorTable = function(table) {
		var order = skillMap.senior;
		var cells = table.getElementsByTagName('td');
		for (var i = 0; i < order.length; ++i) {
			var cell = cells[2 * i + 1];
			if (!cell) {
				found = false;
				return; // skills are not visible
			}
			var skillLink = cell.getElementsByTagName('a')[0];
			if (!regE.test(skillLink.href)) {
				found = false;
				return; // skills are not visible
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
	var parseNewSkills = function(table) {
		var order = skillMap.seniorBars;
		for (var i = 0; i < order.length; ++i) {
			var row = table.rows[i];
			var cell = row.cells[1];
			if (!cell) {
				found = false;
				return; // skills are not visible
			}

			var skillText, skillValue, skillName;

			var skillLink = cell.querySelector('a');
			var skillBar = cell.querySelector('.ht-bar');
			if (skillLink) {
				if (!regE.test(skillLink.href)) {
					found = false;
					return; // skills are not visible
				}
				skillValue = parseInt(skillLink.href.match(regE)[1], 10);
				skillText = skillLink.textContent.trim();
			}
			else if (skillBar) {
				skillValue = parseInt(skillBar.getAttribute('level'), 10);
				let titleCell = skillBar.querySelector('td[title]');
				skillText = titleCell ? titleCell.title : '';
			}
			else {
				found = false;
				return; // skills are not visible
			}

			skillName = row.cells[0].textContent.trim();
			skills[order[i]] = skillValue;
			skillTexts[order[i]] = skillText;
			skillNames[order[i]] = skillName;
		}
	};

	try {
		if (Foxtrick.hasClass(table, 'transferPlayerSkills')) {
			parseNewSkills(table.querySelector('table'));
		}
		else {
			var hasBars = table.querySelector('.percentImage, .ft-percentImage');
			if (hasBars)
				parseSeniorBars(table);
			else
				parseSeniorTable(table);
		}
	}
	catch (e) {
		Foxtrick.log(e);
		return null;
	}

	return found ? { values: skills, texts: skillTexts, names: skillNames } : null;
};

/**
 * Parse youth player skills from skill table.
 * Returns {values, texts, names} where texts and names are
 * localized skill levels and names respectively.
 * Each field is a skill map:
 * {keeper, defending, playmaking, winger, passing, scoring, setPieces}.
 * Each value is {current, max: number, maxed, top3: Boolean}
 * or an empty object if no data is known.
 * Each text is {current, max: string}.
 * Texts may contain level numbers, e.g. 'weak (3)'.'
 * @param  {HTMLTableElement} table
 * @return {object}                 {values, texts, names}
 */
Foxtrick.Pages.Player.parseYouthSkills = function(table) {
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
	var found = true;
	var skills = {}, skillTexts = {}, skillNames = {};

	var parseYouthBars = function(table) {
		var order = skillMap.youth;
		var rows = table.rows;
		if (rows.length < order.length) {
			found = false;
			return;
		}
		for (var i = 0; i < order.length; ++i) {
			var textCell = rows[i].cells[0];
			var skillCell = rows[i].cells[1];
			var skill = skills[order[i]] = {};
			var imgs = skillCell.getElementsByTagName('img');
			var HYSkills = skillCell.querySelector('.ft-youthSkillBars');
			if (HYSkills) {
				var info = HYSkills.title.split('/');
				skill.current = parseFloat(info[0]) || 0;
				skill.max = parseFloat(info[1]) || 0;
				skill.maxed = HYSkills.querySelector('.ft-skillbar-maxed').hasAttribute('style');
			}
			else if (imgs.length) {
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

			skill.top3 = !!rows[i].querySelector('strong.ft-dummy');

			var currentText = '';
			var maxText = '';
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
		parseYouthBars(table);
	}
	catch (e) {
		Foxtrick.log(e);
		return null;
	}
	return found ? { values: skills, texts: skillTexts, names: skillNames } : null;
};

/**
 * Get the container with bidding information
 * @param  {document}    doc
 * @return {HTMLElement}
 */
Foxtrick.Pages.Player.getBidInfo = function(doc) {
	return Foxtrick.getMBElement(doc, 'updBid');
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
		var bidDiv = this.getBidInfo(doc);
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
 * Test whether player is transfer listed
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Player.isTransferListed = function(doc) {
	return !!this.getBidInfo(doc);
};

/**
 * Test whether player was fired
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Player.wasFired = function(doc) {
	var div = doc.getElementsByClassName('playerInfo')[0];
	return typeof div === 'undefined';
};

/**
 * Get player object.
 * Calls callback(player) where player contains various fields from playerdetails.xml.
 * Seniors only.
 * @param  {document} doc
 * @param  {number}   playerid
 * @param  {Function} callback function(object)
 */
Foxtrick.Pages.Player.getPlayer = function(doc, playerid, callback) {
	if (Foxtrick.Pages.Player.wasFired(doc))
		return;

	var args = [
		['file', 'playerdetails'],

		// README: version 2.5 is used in current transfers, but with specific deadlines
		// otherwise few gains are obtained by upgrading, new fields are commented below
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
		Foxtrick.util.currency.detect(doc).then(function(curr) {
			var rate = curr.rate;
			var addProperty = function(player, fn) {
				return function(name) {
					var newName, nodeName;
					if (Array.isArray(name)) {
						newName = name[0];
						nodeName = name[1];
					}
					else {
						newName = name.replace(/^./, function(m) {
							return m.toLowerCase();
						});
						newName = newName.replace(/Skill$/, '');
						nodeName = name;
					}
					if (node(nodeName))
						player[newName] = fn(nodeName);
				};
			};

			var num = function(nodeName) {
				return xml.num(nodeName);
			};
			var money = function(nodeName) {
				return xml.money(nodeName, rate);
			};
			var node = function(nodeName) {
				return xml.node(nodeName);
			};
			var text = function(nodeName) {
				return xml.text(nodeName);
			};
			var bool = function(nodeName) {
				return xml.bool(nodeName);
			};
			var ifPositive = function(nodeName) {
				var value = num(nodeName);
				if (value > 0)
					return value;
				return undefined;
			};

			var player = {};
			player.skills = {};

			var skills = [
				['defending', 'DefenderSkill'],
				'KeeperSkill',
				'PassingSkill',
				['playmaking', 'PlaymakerSkill'],
				['scoring', 'ScorerSkill'],
				'SetPiecesSkill',
				'WingerSkill',
			];
			Foxtrick.forEach(addProperty(player.skills, num), skills);
			for (var skill in player.skills) {
				player[skill] = player.skills[skill];
			}

			var optionalNums = [
				'Caps',
				'CapsU20',
				['category', 'PlayerCategoryID'], // inconsistent spelling
			];
			Foxtrick.forEach(addProperty(player, ifPositive), optionalNums);

			var nums = [
				['countryId', 'NativeCountryID'],
				['form', 'PlayerForm'],
				['id', 'PlayerID'],
				['tsi', 'TSI'],
				'Aggressiveness',
				'Agreeability',
				'CareerGoals',
				'CareerHattricks',
				'CupGoals',
				'Experience',
				// README: version=2.3
				// 'FriendliesGoals',
				// README: version=2.7
				// 'GoalsCurrentTeam',
				'Honesty',
				'Leadership',
				'LeagueGoals',
				'Loyalty',
				'NativeLeagueID',
				'PlayerLanguageID',
				'StaminaSkill',
			];
			Foxtrick.forEach(addProperty(player, num), nums);

			var texts = [
				'FirstName',
				'LastName',
				'NativeLeagueName',
				'NickName',
				'OwnerNotes',
				'PlayerLanguage',
				'Statement',
			];
			Foxtrick.forEach(addProperty(player, text), texts);

			var bools = [
				'IsAbroad',
				'MotherClubBonus',
				'TransferListed',
			];
			Foxtrick.forEach(addProperty(player, bool), bools);

			player.nextBirthDay = xml.date('NextBirthDay');
			player.salary = money('Salary');

			if (xml.node('PlayerNumber')) {
				var number = xml.num('PlayerNumber');
				if (number >= 1 && number < 100)
					player.number = number;
			}

			player.age = {
				years: xml.num('Age'),
				days: xml.num('AgeDays'),
			};
			player.ageYears = player.age.years;

			player.yellowCard = xml.num('Cards');
			if (player.yellowCard == 3) {
				player.yellowCard = 0;
				player.redCard = 1;
			}
			else
				player.redCard = 0;
			player.cards = player.yellowCard + player.redCard !== 0;

			player.injuredWeeks = xml.num('InjuryLevel');
			player.bruised = player.injuredWeeks === 0;
			player.injuredWeeks = Math.max(player.injuredWeeks, 0);
			player.injured = (player.bruised || player.injuredWeeks !== 0);

			player.specialtyNumber = xml.num('Specialty');
			player.specialty = Foxtrick.L10n.getSpecialtyFromNumber(player.specialtyNumber);

			// README: version=2.2
			// player.joinedSince = xml.time('ArrivalDate');

			/*
			    <TrainerData>
			      <TrainerType>2</TrainerType>
			      <TrainerSkill>7</TrainerSkill>
			    </TrainerData>
			    <OwningTeam>
			      <TeamID>672194</TeamID>
			      <TeamName>Strange quarks</TeamName>
			      <LeagueID>66</LeagueID>
			    </OwningTeam>

			    // README: version=2.5
			    <TransferDetails>
			      <AskingPrice>760000</AskingPrice>
			      <Deadline>2016-10-31 08:40:25</Deadline>
			      <HighestBid>760000</HighestBid>
			      <MaxBid/> // version=2.6, optional
			      <BidderTeam> // may be empty
			        <TeamID>1064154</TeamID>
			        <TeamName>Dinamo3000</TeamName>
			      </BidderTeam>
			    </TransferDetails>

			    <LastMatch>
			      <Date>2014-07-26 15:20:00</Date>
			      <MatchId>483831455</MatchId>
			      <PositionCode>109</PositionCode>
			      <PlayedMinutes>90</PlayedMinutes>
			      <Rating>7</Rating>
			      <RatingEndOfGame>6</RatingEndOfGame>
			    </LastMatch>
			 */

			callback(player);

		}).catch(function(reason) {
			Foxtrick.log('WARNING: currency.detect aborted:', reason);
		});

	});
};

/**
 * Get position contributions from skill map and player's attributes map
 * Skill map must be {keeper, defending, playmaking, winger, passing, scoring, setPieces}.
 * Attributes map must be:
 * {form, stamina, ?staminaPred, experience, loyalty, motherClubBonus, bruised,
 * transferListed, specialtyNumber}.
 * Options is {form, stamina, experience, loyalty, bruised, normalise: Boolean} (optional)
 * Params is {CTR_VS_WG, WBD_VS_CD, WO_VS_FW, MF_VS_ATT, DF_VS_ATT: number} (optional)
 * By default options and params are assembled from prefs or need to be fully overridden otherwise.
 *
 * Returns position contribution map.
 * @param  {object} playerSkills Object.<string, number>  skill map
 * @param  {object} playerAttrs  Object.<string, ?>       attributes map
 * @param  {object} options      Object.<string, Boolean> options map
 * @param  {object} params       Object.<string, number>  params map
 * @return {object}              Object.<string, number>  position contribution map
 */
Foxtrick.Pages.Player.getContributions = function(playerSkills, playerAttrs, options, params) {
	if (!playerSkills)
		return null;

	var doNormal = options ? options.normalise :
		Foxtrick.Prefs.isModuleOptionEnabled('PlayerPositionsEvaluations', 'Normalised');

	var cntrbMap = Foxtrick.Predict.contributionFactors(params);
	var skills = Foxtrick.Predict.effectiveSkills(playerSkills, playerAttrs, options);

	for (var pos in cntrbMap) {
		// Foxtrick.log(pos);
		var score = 0;
		var sum = 0;
		for (var skill in skills) {
			var data = cntrbMap[pos][skill];
			if (typeof data !== 'undefined') {
				sum += data.factor;
				score += data.factor * skills[skill];
			}
		}

		if (doNormal) {
			score /= sum;
		}

		var value = parseFloat(score.toFixed(2));
		cntrbMap[pos] = value;
	}

	var specialty = playerAttrs.specialtyNumber;
	if (specialty == 1) {
		// Technical
		cntrbMap.fwd = 0;
	}
	else {
		cntrbMap.tdf = 0;
	}
	return cntrbMap;
};

/**
 * Find the highest contribution in a position map.
 * Returns {position, value}.
 * @author Greblys
 * @param  {object} contributions Object<string, number> position map
 * @return {object}               {position: string, value: number}
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
