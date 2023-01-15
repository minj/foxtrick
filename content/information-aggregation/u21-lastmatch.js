/**
 * u21-lastmatch.js
 * Shows which would be the last official u21 match of a certain player.
 * @author: rferromoreno, LA-MJ
 */

'use strict';

/* eslint-disable no-magic-numbers */

Foxtrick.modules.U21LastMatch = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: [
		'youthPlayerDetails', 'playerDetails',
		'allPlayers', 'youthPlayers',
		'transferSearchResult',
	],
	OPTIONS: ['YouthPlayers', 'SeniorPlayers', 'AllPlayers'],
	DATE_CUTOFFS: [
		3, // CC M2
		7,
		10,
		14, // CC M5
		21,
		28,
		35, // CC M8
		42,
		49,
		56, // CC QF
		59, // CC SF
		63, // CC Finals
		70, // WC R1 M1
		73,
		77,
		84,
		91, // WC R1 M5
		98,
		105,
		112,
		119,
		126,
		133, // WC R2 M1
		136,
		140,
		143,
		147,
		154,
		161, // WC R3 M1
		164,
		168,
		175, // WC R4 M1
		178,
		182,
		189, // WC R5 M1
		192,
		196,
		199, // Semi
		203, // Finals
		224
	],

	/**
	 * @typedef U21LastMatch
	 * @prop {string} lastMatch
	 * @prop {number} worldCupNumber
	 * @prop {number} matchNumber
	 * @prop {Date} dateWhen22
	 */

	/**
	 * @param  {document} doc
	 * @param  {{years: number, days: number}} age
	 * @return {U21LastMatch}
	 */
	calculate: function(doc, age) {
		const module = this;

		const CONTINENTAL_STR = Foxtrick.L10n.getString('U21LastMatch.continental');
		const CONTINENTALPO_STR = Foxtrick.L10n.getString('U21LastMatch.continentalpo');
		const ROUND_STR = Foxtrick.L10n.getString('U21LastMatch.round');
		const QUARTER_STR = Foxtrick.L10n.getString('U21LastMatch.quarter');
		const SEMI_STR = Foxtrick.L10n.getString('U21LastMatch.semi');
		const FINAL_STR = Foxtrick.L10n.getString('U21LastMatch.final');

		const DAYS_IN_SEASON = Foxtrick.util.time.DAYS_IN_SEASON;
		const MSECS_IN_DAY = Foxtrick.util.time.MSECS_IN_DAY;
		const WORLD_CUP_DURATION = DAYS_IN_SEASON * 2;

		let playerAgeInDays = DAYS_IN_SEASON * age.years + age.days;
		let daysUntil22 = DAYS_IN_SEASON * 22 - playerAgeInDays;

		let now = Foxtrick.util.time.getHTDate(doc);
		let dateWhen22 = Foxtrick.util.time.addDaysToDate(now, daysUntil22);

		// Round I, Match #1 of World Cup XXVI. (26/05/2017)
		let origin = new Date(2017, 4, 26);
		let msDiff = dateWhen22.getTime() - origin.getTime();
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

		let round1 = ROUND_STR.replace(/%2/, 'I');
		let round2 = ROUND_STR.replace(/%2/, 'II');
		let round3 = ROUND_STR.replace(/%2/, 'III');
		let round4 = ROUND_STR.replace(/%2/, 'IV');
		let round5 = ROUND_STR.replace(/%2/, 'V');

		// Load the Match descriptions array.
		var matchDesc = [];
		for (let i of Foxtrick.range(1, 11))
			matchDesc.push(CONTINENTAL_STR.replace(/%1/, String(i)));

		matchDesc.push(CONTINENTALPO_STR.replace(/%1/, QUARTER_STR));
		matchDesc.push(CONTINENTALPO_STR.replace(/%1/, SEMI_STR));
		matchDesc.push(CONTINENTALPO_STR.replace(/%1/, FINAL_STR));

		for (let i of Foxtrick.range(1, 11))
			matchDesc.push(round1.replace(/%1/, String(i)));
		for (let i of Foxtrick.range(1, 7))
			matchDesc.push(round2.replace(/%1/, String(i)));
		for (let i of Foxtrick.range(1, 4))
			matchDesc.push(round3.replace(/%1/, String(i)));
		for (let i of Foxtrick.range(1, 4))
			matchDesc.push(round4.replace(/%1/, String(i)));
		for (let i of Foxtrick.range(1, 4))
			matchDesc.push(round5.replace(/%1/, String(i)));

		matchDesc.push(SEMI_STR);
		matchDesc.push(FINAL_STR);

		return {
			lastMatch: matchDesc[index],
			worldCupNumber,
			matchNumber: index + 1,
			dateWhen22,
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

		const TITLE_STR = Foxtrick.L10n.getString('U21LastMatch.eligibilityTitle');
		const TEXT_STR = Foxtrick.L10n.getString('U21LastMatch.eligibilityText');
		const WC_STR = Foxtrick.L10n.getString('U21LastMatch.worldcup');
		const TMPL_STR = Foxtrick.L10n.getString('U21LastMatch.templateWithoutTable');

		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		let age = Foxtrick.Pages.Player.getAge(doc);
		if (!age || age.years > 21)
			return;

		let { worldCupNumber, lastMatch } = module.calculate(doc, age);
		let wcNum = Foxtrick.decToRoman(worldCupNumber);

		let text = TMPL_STR;
		text = text.replace(/%1/, TEXT_STR);
		text = text.replace(/%2/, WC_STR);
		text = text.replace(/%3/, wcNum);
		text = text.replace(/%4/, lastMatch);

		let panel = Foxtrick.getMBElement(doc, 'pnlplayerInfo') ||
			doc.querySelector('.playerInfo');
		if (!panel)
			return;
		let table = panel.querySelector('table');
		let row = Foxtrick.insertFeaturedRow(table, module, table.rows.length);
		Foxtrick.addClass(row, 'ft-u21-lastmatch');
		let title = row.insertCell(-1);
		title.textContent = TITLE_STR;
		let val = row.insertCell(-1);
		val.textContent = text;
	},

	/** @param {document} doc */
	runPlayerList: function(doc) {
		const module = this;
		const TITLE_STR = Foxtrick.L10n.getString('U21LastMatch.title');
		const WC_STR = Foxtrick.L10n.getString('U21LastMatch.worldcup');
		const TMPL_STR = Foxtrick.L10n.getString('U21LastMatch.templateWithoutTable');

		let players = Foxtrick.modules.Core.getPlayerList();
		if (!players)
			return;

		for (let player of players) {
			if (player.age.years > 21)
				continue;

			let { worldCupNumber, lastMatch, matchNumber, dateWhen22 } =
				module.calculate(doc, player.age);

			let wcNum = Foxtrick.decToRoman(worldCupNumber);

			let text = TMPL_STR;
			text = text.replace(/%1/, TITLE_STR);
			text = text.replace(/%2/, WC_STR);
			text = text.replace(/%3/, wcNum);
			text = text.replace(/%4/, lastMatch);

			let container = Foxtrick.createFeaturedElement(doc, module, 'p');
			Foxtrick.addClass(container, 'ft-U21LastMatch');
			container.textContent = text;
			container.dataset.value = String(dateWhen22.getTime());
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
		const TITLE_STR = Foxtrick.L10n.getString('U21LastMatch.title');
		const WC_STR = Foxtrick.L10n.getString('U21LastMatch.worldcup');
		const TMPL_STR = Foxtrick.L10n.getString('U21LastMatch.templateWithoutTable');

		let players = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
		for (let player of players) {
			if (!player.age || player.age.years > 21)
				continue;

			let { worldCupNumber, lastMatch, matchNumber, dateWhen22 } =
				module.calculate(doc, player.age);

			let wcNum = Foxtrick.decToRoman(worldCupNumber);

			let text = TMPL_STR;
			text = text.replace(/%1/, TITLE_STR);
			text = text.replace(/%2/, WC_STR);
			text = text.replace(/%3/, wcNum);
			text = text.replace(/%4/, lastMatch);

			let container = Foxtrick.createFeaturedElement(doc, module, 'div');
			Foxtrick.addClass(container, 'ft-U21LastMatch');
			container.textContent = text;
			container.dataset.value = String(dateWhen22.getTime());
			container.dataset.valueString = `${wcNum}:${matchNumber}`;

			let element = player.playerNode.querySelector('.flex') || player.playerNode.lastChild;
			Foxtrick.insertAfter(container, element);
		}
	},
};
