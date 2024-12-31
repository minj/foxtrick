/**
 * player.js
 * Utilities on player page
 * @author ryanli, LA-MJ, Greblys
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	// @ts-ignore
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.Player = {};

/**
 * Test whether this page is player page
 * @param  {document}  doc
 * @return {boolean}
 */
Foxtrick.Pages.Player.isPage = function(doc) {
	return this.isSenior(doc) || this.isYouth(doc);
};

/**
 * Test whether this page is senior player page
 * @param  {document}  doc
 * @return {boolean}
 */
Foxtrick.Pages.Player.isSenior = function(doc) {
	return Foxtrick.isPage(doc, 'playerDetails');
};

/**
 * Test whether this page is youth player page
 * @param  {document}  doc
 * @return {boolean}
 */
Foxtrick.Pages.Player.isYouth = function(doc) {
	return Foxtrick.isPage(doc, 'youthPlayerDetails');
};

/**
 * Get player age
 *
 * returns age in the following format:
 * age = { years: xx, days: yyy };
 *
 * @param  {document} doc
 * @return {?{years:number, days:number}}
 */
Foxtrick.Pages.Player.getAge = function(doc) {
	var birthdayRe = /(\d+).*?(\d+).*?\d+.*?\d+.*?\d+.*?/;
	var birthdayCell = doc.querySelector('.byline');
	var age = null;

	if (birthdayCell && birthdayCell.textContent.trim()) {
		try {
			var birthdayMatch = birthdayRe.exec(birthdayCell.textContent);
			age = {
				years: parseInt(birthdayMatch[1], 10),
				days: parseInt(birthdayMatch[2], 10),
			};
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}

	return age;
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
	var id = Foxtrick.getUrlParam(doc.location.href, param);
	return parseInt(id, 10) || null;
};

/**
 * Get player nationality ID
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.Player.getNationalityId = function(doc) {
	var id = null;

	/** @type {HTMLAnchorElement} */
	var link = doc.querySelector('.playerInfo a[href^="/World/Leagues/League.aspx"]') ||
		doc.querySelector('.flag');

	if (link) {
		var val = Foxtrick.getUrlParam(link.href, 'LeagueID');
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
		if (id)
			name = Foxtrick.L10n.getCountryNameNative(id);
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
	/** @type {HTMLAnchorElement} */
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
 * @return {PlayerAttributes}
 */
// eslint-disable-next-line complexity
Foxtrick.Pages.Player.getAttributes = function(doc) {
	/** @type {PlayerAttributes} */
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

	const RE_SKILL_SHORT = /skillshort/i;
	const RE_LEADERSHIP = /leadership/i;

	/** @type {(keyof PlayerAttributes)[]} */
	const PERSONALITY = ['gentleness', 'aggressiveness', 'honesty'];

	/** @type {(keyof PlayerAttributes)[]} */
	const OTHER_TRAITS = ['leadership', 'experience', 'loyalty'];
	const TRAITS = [...PERSONALITY, ...OTHER_TRAITS];
	const FORM_ROW_NEW = 3;
	const STAMINA_ROW_NEW = 4;

	/**
	 * @param  {HTMLAnchorElement} link
	 * @return {number}
	 */
	var num = link => Foxtrick.util.id.getSkillLevelFromLink(link);

	/** @type {HTMLAnchorElement[]} */
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

			attrs.form = getNumFromRow(FORM_ROW_NEW);
			attrs.stamina = getNumFromRow(STAMINA_ROW_NEW);

			personLinks = Foxtrick.toArray(doc.querySelectorAll('.playerInfo > p .skill'));
		}
		else {
			/** @type {HTMLAnchorElement[]} */
			let links = Foxtrick.toArray(doc.querySelectorAll('.playerInfo .skill'));
			if (!links.length)
				return attrs;

			// form vs stamina
			if (RE_SKILL_SHORT.test(links[0].href)) {
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
		let idx, link;
		for (idx = 0; idx < PERSONALITY.length; idx++) {
			link = personLinks[idx];
			if (!link)
				break;
			let attr = /** @type {'gentleness'|'aggressiveness'|'honesty'} */
				(Foxtrick.getUrlParam(link.href, 'lt'));

			attrs[attr] = num(personLinks[idx]);
		}

		if (link) {
			// leadership vs experience
			if (RE_LEADERSHIP.test(personLinks[idx].href)) {
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
 * @return {boolean}
 */
Foxtrick.Pages.Player.isCoach = function(doc) {
	var attr = this.getAttributes(doc);
	return Foxtrick.hasProp(attr, 'coachSkill');
};

/**
 * Test whether player is bruised
 * @param  {document}  doc
 * @return {boolean}
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
		/** @type {HTMLTableElement} */
		var infoTable = doc.querySelector('.ownerAndStatusPlayerInfo table') ||
			doc.querySelector('.playerInfo table');

		if (infoTable) {
			let injuryRow;
			let icon = infoTable.querySelector('.plaster, .icon-injury');
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
	const MAX_CARDS = 3;
	var cards = 0;
	try {
		/** @type {HTMLTableElement} */
		var infoTable = doc.querySelector('.playerInfo table');
		var cardCell = infoTable.rows[3].cells[1];
		cards = parseInt(cardCell.textContent.trim(), 10);
		if (isNaN(cards))
			cards = MAX_CARDS;
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
 * @return {boolean}
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
 * @param  {document} doc
 * @return {{isNewDesign: boolean, isYouth: boolean, table: HTMLTableElement}}
 */
Foxtrick.Pages.Player.getInfoTable = function(doc) {
	var isNewDesign = false;
	var infoDiv = doc.querySelector('.transferPlayerInformation');
	if (infoDiv)
		isNewDesign = true;
	else
		infoDiv = doc.querySelector('.playerInfo');

	var table = infoDiv.querySelector('table');
	var isYouth = this.isYouth(doc);

	return { isNewDesign, isYouth, table };
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
 * @typedef PlayerWage
 * @prop {number} base
 * @prop {number} bonus
 * @prop {number} total
 */

/**
 * Get the player wage.
 *
 * Returns {base, bonus, total: number}.
 * Senior player only.
 * @param  {document}   doc
 * @param  {Element}    [wageCell] optional wage cell to parse; otherwise will be found
 * @return {PlayerWage}           {base: number, bonus: number, total: number}
 */
Foxtrick.Pages.Player.getWage = function(doc, wageCell) {
	const WAGE_BONUS = 0.2;
	const WAGE_BONUS_REC = WAGE_BONUS / (1 + WAGE_BONUS);

	var cell = wageCell || this.getWageCell(doc);
	if (!cell)
		return null;

	var wageText = cell.textContent;

	// we need to trim front text if any
	// unfortunately new lines force using multiline mode
	// thus '.' does not match '\n', /sigh
	wageText = wageText.replace(/^(.|[\r\n])*?(?=[\d\u00a0]{3,})/m, '');
	wageText = wageText.replace(/\u00a0/g, '');

	var wage = parseInt(wageText, 10);
	if (isNaN(wage))
		return null;

	var ret = { base: wage, bonus: 0, total: wage };

	var hasBonus = /%/.test(wageText) || cell.querySelector('span[title]');
	if (hasBonus) {
		var bonus = Math.round(wage * WAGE_BONUS_REC);
		ret.bonus = bonus;
		ret.base = wage - bonus;
	}
	return ret;
};

/**
 * Get the player specialty number
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.Player.getSpecialtyNumber = function(doc) {
	var specNr = 0;
	try {
		var playerNode = doc.querySelector('.playerInfo');
		var isNewDesign = !!playerNode.querySelector('.transferPlayerInformation');

		if (isNewDesign) {
			const SPEC_PREFIX = 'icon-speciality-'; // HT-TYPO
			const SPEC_SUFFIX = 'trSpeciality'; // HT-TYPO
			let specTd = playerNode.querySelector(`.transferPlayerInformation table tr[id$="${SPEC_SUFFIX}"] td:nth-child(2)`);
			let specIcon;
			if (specTd && (specIcon = specTd.querySelector(`i[class*="${SPEC_PREFIX}"]`))) {
				let classes = [...specIcon.classList];
				let specClass = classes.filter(c => c.startsWith(SPEC_PREFIX))[0];
				specNr = parseInt(specClass.match(/\d+/)[0], 10);
			}
		}
		else {
			/** @type {HTMLTableElement} */
			let playerInfo = playerNode.querySelector('table');
			let specRow = playerInfo.rows[5];
			if (specRow) {
				let specText = specRow.cells[1].textContent.trim();
				specNr = Foxtrick.L10n.getNumberFromSpecialty(specText);
			}
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
 * Youth player skill map contains {current, max: number, top3, maxed: boolean} or
 * an empty object if no data is known.
 * @param  {document}  doc
 * @return {AnySkills}
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
 * {current, max: number, maxed, top3: boolean} or
 * an empty object if no data is known.
 * For seniors texts are strings, while youth texts are {current, max: string}.
 * Texts may contain level numbers, e.g. 'weak (3)'.'
 *
 * @param  {document} doc
 * @return {{values: AnySkills, texts: AnySkillTexts, names: SkillNames}}
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
		if (this.isPage(doc)) {
			/** @type {HTMLTableElement} */
			var skillTable;
			if (this.isSenior(doc)) {
				skillTable = doc.querySelector('.transferPlayerSkills, .mainBox:not(.ft-dummy) table');
				return this.parseSeniorSkills(skillTable);
			}

			skillTable = doc.querySelector('.mainBox table');
			let hasBars = !!(skillTable && skillTable.querySelector('.youthSkillBar'));
			if (!hasBars)
				skillTable = doc.querySelector('.playerInfo table');

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
 * @return {{values: PlayerSkills, texts: SkillTexts, names: SkillNames}}
 */
Foxtrick.Pages.Player.parseSeniorSkills = function(table) {
	if (table == null)
		return null;

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

	/** @param {HTMLTableElement} table */
	var parseSeniorBars = function(table) {
		var order = skillMap.seniorBars;
		var rows = table.rows;
		for (var i = 0; i < order.length; ++i) {
			var skillLink = rows[i].getElementsByTagName('a')[0];
			if (!skillLink || !regE.test(skillLink.href)) {
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

	/** @param {HTMLTableElement} table */
	var parseSeniorTable = function(table) {
		var order = skillMap.senior;
		var cells = table.querySelectorAll('td');
		for (var i = 0; i < order.length; ++i) {
			var cell = cells[2 * i + 1];
			if (!cell) {
				found = false;
				return; // skills are not visible
			}
			var skillLink = cell.querySelector('a');
			if (!skillLink || !regE.test(skillLink.href)) {
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

	/** @param {HTMLTableElement} table */
	var parseNewSkills = function(table) {
		var order = skillMap.seniorBars;
		for (var i = 0; i < order.length; ++i) {
			var row = table.rows[i];
			if (!row) {
				found = false;
				return; // skills are not visible
			}
			var [cellName, cell, cellNum] = row.cells;
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

				/** @type {HTMLElement} */
				let titleCell = skillBar.querySelector('div[title]:not(.ft-bar-loyalty)');
				skillText = titleCell ? titleCell.title.trim() : '';
			}
			else {
				found = false;
				return; // skills are not visible
			}

			if (!skillText)
				skillText = Foxtrick.L10n.getTextByLevel(0);

			if (cellNum)
				skillText += ` (${cellNum.textContent.trim()})`;

			skillName = cellName.textContent.trim();
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
 * Each value is {current, max: number, maxed, top3: boolean}
 * or an empty object if no data is known.
 * Each text is {current, max: string}.
 * Texts may contain level numbers, e.g. 'weak (3)'.'
 * @param  {HTMLTableElement} table
 * @return {{values: YouthSkills, texts: YouthSkillTexts, names: SkillNames}}
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

	if (table == null)
		return null;

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

	/** @param {HTMLTableElement} table */
	/* eslint-disable complexity */
	var parseYouthBars = function(table) {
		var order = skillMap.youth;
		var rows = [...table.rows];
		if (rows.length < order.length) {
			found = false;
			return;
		}

		var hasNewBars = !!table.querySelector('.ht-bar');

		{
			let [first] = rows;
			if (first.id.endsWith('trSpeciality'))
				rows.shift();
		}

		for (let [idx, sType] of order.entries()) {
			let row = rows[idx];
			let [textCell, skillCell, numberCell] = row.cells;

			/** @type {YouthSkill} */
			let skill = { current: 0, max: 0, maxed: false };

			let imgs = skillCell.getElementsByTagName('img');
			let links = skillCell.querySelectorAll('.skill');

			/** @type {HTMLElement} */
			let HYSkills = skillCell.querySelector('.ft-youthSkillBars');
			if (HYSkills) {
				let [current, max] = HYSkills.title.split('/');
				skill.current = parseFloat(current) || 0;
				skill.max = parseFloat(max) || 0;
				skill.maxed = HYSkills.querySelector('.ft-skillbar-maxed').hasAttribute('style');
			}
			else if (hasNewBars) {
				// new bars
				let bar = skillCell.querySelector('.ht-bar');
				let ratings = numberCell.textContent.trim();
				if (ratings) {
					let [current, max] = ratings.split('/');
					if (typeof max !== 'undefined') {
						skill.current = parseFloat(current) || 0;
						skill.max = parseFloat(max) || 0;
						skill.maxed = !!(bar && bar.getAttribute('is-cap') !== '0');
					}
				}
				else if (bar) {
					skill.current = Math.max(parseInt(bar.getAttribute('level'), 10) || 0, 0);
					skill.max = Math.max(parseInt(bar.getAttribute('cap'), 10) || 0, 0);
					skill.maxed = bar.getAttribute('is-cap') !== '0';
				}
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

				let [maxTitle, currTitle] = Array.from(imgs).map(i => i.title);
				let maxStr = String(maxTitle.match(/\d/));
				let currStr = String(currTitle.match(/-?\d/));

				let max = parseInt(maxStr, 10);
				let current = parseInt(currStr, 10);
				if (!current) {
					skill.maxed = true;
					current = max;
				}
				else if (current === -1) {
					current = 0;
				}

				// if current and/or max is unknown, mark it as 0
				skill.current = current || 0;
				skill.max = max || 0;
			}
			else if (links.length) {
				// links may also be reveal links
				let [currNode, maxNode] =
					skillCell.querySelectorAll('a, .shy:not(.denominationNumber)');
				let current = 0, max = 0;

				if (currNode.matches('a.skill')) {
					let link = /** @type {HTMLAnchorElement} */ (currNode);
					current = Foxtrick.util.id.getSkillLevelFromLink(link);
				}

				let maxed = false;
				if (maxNode) {
					// may also be activation link
					if (maxNode.matches('a.skill')) {
						let link = /** @type {HTMLAnchorElement} */ (maxNode);
						max = Foxtrick.util.id.getSkillLevelFromLink(link);
					}
				}
				else if (current) {
					max = current;
					maxed = true;
				}

				skill = { current, max, maxed };
			}

			skill.top3 = !!row.querySelector('strong.ft-dummy');

			let current = '-';
			let max = '-';
			let bar = skillCell.querySelector('.youthSkillBar');
			if (bar || links.length) {
				// bar or links are present
				// skills could either be a skill or unknown (span.shy) or activation link
				let [currNode, maxNode] =
					skillCell.querySelectorAll('.shy:not(.denominationNumber), a');

				if (currNode.matches('a.skill'))
					current = currNode.textContent.trim();

				if (maxNode) {
					// may also be activation link
					if (maxNode.matches('a.skill'))
						max = maxNode.textContent.trim();
				}
				else if (current) {
					max = current;
				}
			}
			else if (hasNewBars) {
				// new bars
				let bar = skillCell.querySelector('.ht-bar');

				/** @type {NodeListOf<HTMLElement>} */
				let titles = bar ? bar.querySelectorAll('div[title]') : null;
				if (titles && titles.length) {
					[current, max] = [...titles].map(t => t.title);
					if (titles.length == 1) {
						if (skill.maxed) {
							max = current;
						}
						else if (skill.max) {
							max = current;
							current = '-';
						}
						else {
							max = '-';
						}
					}
				}
				else {
					if (skill.current)
						current = Foxtrick.L10n.getTextByLevel(skill.current);
					if (skill.max)
						max = Foxtrick.L10n.getTextByLevel(skill.max);
				}
			}
			else {
				// no images, the cell says 'unknown'
				current = max = skillCell.textContent.trim();
			}

			if (!/\d/.test(current) && skill.current)
				current = `${current} (${skill.current})`;
			if (!/\d/.test(max) && skill.max)
				max = `${max} (${skill.max})`;

			skills[sType] = skill;
			skillTexts[sType] = { current, max };
			skillNames[sType] = textCell.textContent.replace(':', '').trim();
		}
	};
	/* eslint-enable complexity */

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
		let bidDiv = this.getBidInfo(doc);
		if (bidDiv) {
			let bidPara = bidDiv.querySelector('p');
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
 * @return {boolean}
 */
Foxtrick.Pages.Player.isTransferListed = function(doc) {
	return !!this.getBidInfo(doc);
};

/**
 * Test whether player was fired
 * @param  {document} doc
 * @return {boolean}
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
 * @param  {number}   playerId
 * @param  {function(Player):void} callback function(object)
 */
Foxtrick.Pages.Player.getPlayer = function(doc, playerId, callback) {
	if (Foxtrick.Pages.Player.wasFired(doc))
		return;

	const MAX_CARDS = 3;

	/** @type {CHPPParams} */
	var args = [
		['file', 'playerdetails'],

		// README: version 2.5 is used in current transfers, but with specific deadlines
		// otherwise few gains are obtained by upgrading, new fields are commented below
		['version', '2.1'],
		['playerId', playerId],
	];
	Foxtrick.util.api.retrieve(doc, args, { cache: 'session' }, (xml, errorText) => {
		if (!xml || errorText) {
			Foxtrick.log(errorText);
			callback(null);
			return;
		}
		Foxtrick.util.currency.detect(doc).then(function({ rate }) {
			const WAGE_Q = 1.2;

			var node = function(nodeName) {
				return xml.node(nodeName);
			};
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

				return void 0;
			};

			/** @type {Player} */
			var player = {};
			player.id = playerId;
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
			for (let skill in player.skills) {
				// @ts-ignore
				player[skill] = player.skills[skill];
			}

			var optionalNums = [
				'Caps',
				'CapsU20', // NOTE: remains != U21
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

				// README: version=2.2
				// 'ArrivalDate',
				// README: version=2.3
				// 'FriendliesGoals',
				// README: version=2.5-2.6
				// 'TransferDetails',
				// README: version=2.7
				// 'GoalsCurrentTeam',
				// README: version=2.8
				// 'MatchesCurrentTeam',
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
			player.salaryBase = player.isAbroad
				? Math.floor(player.salary / WAGE_Q)
				: player.salary;

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
			if (player.yellowCard == MAX_CARDS) {
				player.yellowCard = 0;
				player.redCard = 1;
			}
			else {
				player.redCard = 0;
			}

			player.cards = player.yellowCard + player.redCard !== 0;

			player.injuredWeeks = xml.num('InjuryLevel');
			player.bruised = player.injuredWeeks === 0;
			player.injuredWeeks = Math.max(player.injuredWeeks, 0);
			player.injured = player.bruised || player.injuredWeeks !== 0;

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
 * @typedef PlayerContributionOpts
 * @prop {boolean} form
 * @prop {boolean} stamina
 * @prop {boolean} experience
 * @prop {boolean} loyalty
 * @prop {boolean} bruised
 * @prop {boolean} normalise
 */

/**
 * Get position contributions from skill map and player's attributes map
 *
 * Skill map must be {keeper, defending, playmaking, winger, passing, scoring, setPieces}.
 *
 * Attributes map must be:
 * {form, stamina, ?staminaPred, experience, loyalty, motherClubBonus, bruised,
 * transferListed, specialtyNumber}.
 *
 * Options is {form, stamina, experience, loyalty, bruised, normalise: boolean} (optional)
 *
 * Params is {CTR_VS_WG, WBD_VS_CD, WO_VS_FW, MF_VS_ATT, DF_VS_ATT: number} (optional)
 *
 *
 * By default options and params are assembled from prefs or need to be fully overridden otherwise.
 *
 * Returns position contribution map.
 *
 * @param  {PlayerSkills}             playerSkills skill map
 * @param  {PlayerProps}              playerAttrs  attributes map
 * @param  {PlayerContributionOpts}   [options]    options map
 * @param  {PlayerContributionParams} [params]     params map
 * @return {Contributions}                         position contribution map
 */
Foxtrick.Pages.Player.getContributions = function(playerSkills, playerAttrs, options, params) {
	if (!playerSkills)
		return null;

	let ppeNorm = Foxtrick.Prefs.isModuleOptionEnabled('PlayerPositionsEvaluations', 'Normalised');
	var doNormal = options ? options.normalise : ppeNorm;

	var factors = Foxtrick.Predict.contributionFactors(params);
	var skills = Foxtrick.Predict.effectiveSkills(playerSkills, playerAttrs, options);

	let entries = Object.entries(factors).map(([pos, factor]) => {
		// Foxtrick.log(pos);
		let score = 0;
		let sum = 0;
		for (let key in skills) {
			let skill = /** @type {PlayerSkillName} */ (key);
			let data = factor[skill];
			if (data) {
				sum += data.factor;
				score += data.factor * skills[skill];
			}
		}

		if (doNormal)
			score /= sum;

		let value = parseFloat(score.toFixed(2));
		return [pos, value];
	});

	/** @type {Contributions} */
	let contribs = Object.fromEntries(entries);

	let specialty = playerAttrs.specialtyNumber;
	if (specialty == 1) {
		// Technical
		contribs.fwd = 0;
	}
	else {
		contribs.tdf = 0;
	}
	return contribs;
};

/**
 * @typedef BestPlayerPosition
 * @prop {PlayerPositionCode} [position]
 * @prop {number} value
 */

/**
 * Find the highest contribution in a position map.
 * Returns {position, value}.
 * @author Greblys
 * @param  {Contributions}     contributions position map
 * @return {BestPlayerPosition}              {position: string, value: number}
 */
Foxtrick.Pages.Player.getBestPosition = function(contributions) {
	/**
	 * @type {BestPlayerPosition}
	 */
	var max = { position: null, value: 0 };
	for (let name of Object.keys(contributions)) {
		let key = /** @type {PlayerPositionCode} */ (name);
		if (contributions[key] > max.value) {
			max.position = key;
			max.value = contributions[key];
		}
	}
	return max;
};

/**
 * @typedef YouthSkill
 * @prop {number} current
 * @prop {number} max
 * @prop {boolean} maxed
 * @prop {boolean} [top3]
 */

/**
 * @typedef YouthSkillText
 * @prop {string} current
 * @prop {string} max
 */

// TODO Record?
/**
 * @typedef {SkillMap<YouthSkill>} YouthSkills
 * @typedef {PlayerSkills|YouthSkills} AnySkills
 * @typedef {SkillMap<YouthSkillText>} YouthSkillTexts
 * @typedef {SkillMap<string>} SkillTexts
 * @typedef {SkillTexts|YouthSkillTexts} AnySkillTexts
 * @typedef {SkillMap<string>} SkillNames
 */

/**
 * @typedef PlayerAttributes
 * @prop {number} leadership
 * @prop {number} experience
 * @prop {number} [coachSkill]
 * @prop {number} stamina
 * @prop {number} [staminaPred]
 * @prop {number} form
 * @prop {number} loyalty
 * @prop {boolean} motherClubBonus
 * @prop {number} gentleness
 * @prop {number} aggressiveness
 * @prop {number} honesty
 */
