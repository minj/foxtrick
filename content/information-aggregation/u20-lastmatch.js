/**
 * u20-lastmatch.js
 * Shows which would be the last official u20 match of a certain player.
 * @author: rferromoreno, LA-MJ
 */

'use strict';

/* eslint-disable no-magic-numbers */

Foxtrick.modules.U20LastMatch = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: [
		'youthPlayerDetails', 'playerDetails',
		'allPlayers', 'youthPlayers',
		'transferSearchResult',
	],
	OPTIONS: ['YouthPlayers', 'SeniorPlayers', 'AllPlayers'],
	DATE_CUTOFFS: [
		7,
		14,
		21,
		28,
		35,
		42,
		49,
		56,
		63,
		70,
		77,
		84,
		91,
		147,
		150,
		154,
		182,
		185,
		189,
		192,
		196,
		199,
		203,
		205,
		224,
	],

	/**
	 * @typedef U20LastMatch
	 * @prop {string} lastMatch
	 * @prop {number} worldCupNumber
	 * @prop {number} matchNumber
	 * @prop {Date} dateWhen21
	 */

	/**
	 * @param  {document} doc
	 * @param  {{years: number, days: number}} age
	 * @return {U20LastMatch}
	 */
	calculate: function(doc, age) {
		const module = this;

		const ROUND_STR = Foxtrick.L10n.getString('U20LastMatch.round');
		const SEMI_STR = Foxtrick.L10n.getString('U20LastMatch.semi');
		const FINAL_STR = Foxtrick.L10n.getString('U20LastMatch.final');

		const DAYS_IN_SEASON = Foxtrick.util.time.DAYS_IN_SEASON;
		const MSECS_IN_DAY = Foxtrick.util.time.MSECS_IN_DAY;
		const WORLD_CUP_DURATION = DAYS_IN_SEASON * 2;

		let playerAgeInDays = DAYS_IN_SEASON * age.years + age.days;
		let daysUntil21 = DAYS_IN_SEASON * 21 - playerAgeInDays;

		let now = Foxtrick.util.time.getHTDate(doc);
		let dateWhen21 = Foxtrick.util.time.addDaysToDate(now, daysUntil21);

		// Round I, Match #1 of World Cup XXVI. (26/05/2017)
		let origin = new Date(2017, 4, 26);
		let msDiff = dateWhen21.getTime() - origin.getTime();
		let dayDiff = Math.floor(msDiff / MSECS_IN_DAY) - 1;

		let daysOffset = dayDiff % WORLD_CUP_DURATION;
		let worldCupOffset = Foxtrick.Math.div(dayDiff, WORLD_CUP_DURATION);
		let worldCupNumber = 26 + worldCupOffset;

		let index = 0;
		for (let i = 0; i < module.DATE_CUTOFFS.length; i++) {
			if (daysOffset < module.DATE_CUTOFFS[i]) {
				index = i;
				break;
			}
		}

		let round1 = ROUND_STR.replace(/%1/, 'I');
		let round2 = ROUND_STR.replace(/%1/, 'II');
		let round3 = ROUND_STR.replace(/%1/, 'III');
		let round4 = ROUND_STR.replace(/%1/, 'IV');

		// Load the Match descriptions array.
		var matchDesc = [];
		for (let i of Foxtrick.range(1, 15))
			matchDesc.push(round1.replace(/%2/, String(i)));
		for (let i of Foxtrick.range(1, 4))
			matchDesc.push(round2.replace(/%2/, String(i)));
		for (let i of Foxtrick.range(1, 4))
			matchDesc.push(round3.replace(/%2/, String(i)));
		for (let i of Foxtrick.range(1, 4))
			matchDesc.push(round4.replace(/%2/, String(i)));

		matchDesc.push(SEMI_STR);
		matchDesc.push(FINAL_STR);

		return {
			lastMatch: matchDesc[index],
			worldCupNumber,
			matchNumber: index + 1,
			dateWhen21,
		};
	},

	/** @param {document} doc */
	// eslint-disable-next-line complexity
	run: function(doc) {
		const module = this;

		var isYouthPlayerDetailsPage = Foxtrick.isPage(doc, 'youthPlayerDetails');
		var isSeniorPlayerDetailsPage = Foxtrick.isPage(doc, 'playerDetails');
		var isPlayersPage = Foxtrick.isPage(doc, 'allPlayers');
		var isYouthPlayersPage = Foxtrick.isPage(doc, 'youthPlayers');
		var isTransferResultsPage = Foxtrick.isPage(doc, 'transferSearchResult');

		var isYouthEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'YouthPlayers');
		var isSeniorsEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SeniorPlayers');
		var isPlayersEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'AllPlayers');
		var isTransferEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'TransfersResults');

		// If the option isn't enabled for this page, don't show.
		if (isYouthPlayerDetailsPage && !isYouthEnabled)
			return;
		if (isSeniorPlayerDetailsPage && !isSeniorsEnabled)
			return;
		if (isPlayersPage && !isPlayersEnabled)
			return;
		if (isTransferResultsPage && !isTransferEnabled)
			return;

		if (isYouthPlayerDetailsPage || isSeniorPlayerDetailsPage)
			module.runPlayer(doc);
		else if (isPlayersPage || isYouthPlayersPage)
			module.runPlayerList(doc);
		else if (isTransferResultsPage)
			module.runTransferList(doc);
	},

	/** @param {document} doc */
	runPlayer: function(doc) {
		const module = this;

		const TITLE_STR = Foxtrick.L10n.getString('U20LastMatch.eligibilityTitle');
		const TEXT_STR = Foxtrick.L10n.getString('U20LastMatch.eligibilityText');
		const WC_STR = Foxtrick.L10n.getString('U20LastMatch.worldcup');
		const TMPL_STR = Foxtrick.L10n.getString('U20LastMatch.templateWithoutTable');

		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		let age = Foxtrick.Pages.Player.getAge(doc);
		if (!age || age.years > 20)
			return;

		let { worldCupNumber, lastMatch } = module.calculate(doc, age);
		let wcNum = Foxtrick.decToRoman(worldCupNumber);

		let text = TMPL_STR;
		text = text.replace(/%1/, TEXT_STR);
		text = text.replace(/%2/, WC_STR);
		text = text.replace(/%3/, wcNum);
		text = text.replace(/%4/, lastMatch);


		let entryPoint =
			doc.querySelector('#mainBody > .mainBox') ||
			doc.querySelector('#mainBody > .playerInfo');

		let wrapper = Foxtrick.createFeaturedElement(doc, module, 'div');
		Foxtrick.addClass(wrapper, 'mainBox');
		let titleElement = doc.createElement('h2');
		titleElement.textContent = TITLE_STR;
		let textElement = doc.createElement('div');
		textElement.textContent = text;
		wrapper.appendChild(titleElement);
		wrapper.appendChild(textElement);
		entryPoint.parentNode.insertBefore(wrapper, entryPoint.nextSibling);
	},

	/** @param {document} doc */
	runPlayerList: function(doc) {
		const module = this;
		const TITLE_STR = Foxtrick.L10n.getString('U20LastMatch.title');
		const WC_STR = Foxtrick.L10n.getString('U20LastMatch.worldcup');
		const TMPL_STR = Foxtrick.L10n.getString('U20LastMatch.templateWithoutTable');

		let players = Foxtrick.modules.Core.getPlayerList();
		for (let player of players) {
			if (player.age.years > 20)
				continue;

			let { worldCupNumber, lastMatch, matchNumber, dateWhen21 } =
				module.calculate(doc, player.age);

			let wcNum = Foxtrick.decToRoman(worldCupNumber);

			let text = TMPL_STR;
			text = text.replace(/%1/, TITLE_STR);
			text = text.replace(/%2/, WC_STR);
			text = text.replace(/%3/, wcNum);
			text = text.replace(/%4/, lastMatch);

			let container = Foxtrick.createFeaturedElement(doc, module, 'p');
			Foxtrick.addClass(container, 'ft-u20lastmatch');
			container.textContent = text;
			container.dataset.value = String(dateWhen21.getTime());
			container.dataset.valueString = `${wcNum}:${matchNumber}`;

			let entry = player.playerNode.querySelector('table') || player.playerNode.lastChild;
			while (entry.parentElement && entry.parentElement.matches('.flex'))
				entry = entry.parentElement;

			Foxtrick.insertAfter(container, entry);
		}
	},

	/** @param {document} doc */
	runTransferList: function(doc) {
		const module = this;
		const TITLE_STR = Foxtrick.L10n.getString('U20LastMatch.title');
		const WC_STR = Foxtrick.L10n.getString('U20LastMatch.worldcup');
		const TMPL_STR = Foxtrick.L10n.getString('U20LastMatch.templateWithoutTable');

		let players = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
		for (let player of players) {
			if (player.age.years > 20)
				continue;

			let { worldCupNumber, lastMatch, matchNumber, dateWhen21 } =
				module.calculate(doc, player.age);

			let wcNum = Foxtrick.decToRoman(worldCupNumber);

			let text = TMPL_STR;
			text = text.replace(/%1/, TITLE_STR);
			text = text.replace(/%2/, WC_STR);
			text = text.replace(/%3/, wcNum);
			text = text.replace(/%4/, lastMatch);

			let container = Foxtrick.createFeaturedElement(doc, module, 'div');
			Foxtrick.addClass(container, 'ft-u20lastmatch');
			container.textContent = text;
			container.dataset.value = String(dateWhen21.getTime());
			container.dataset.valueString = `${wcNum}:${matchNumber}`;

			let element = player.playerNode.querySelector('.flex') || player.playerNode.lastChild;
			Foxtrick.insertAfter(container, element);
		}
	},
};
