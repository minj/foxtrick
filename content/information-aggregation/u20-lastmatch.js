/**
 * u20-lastmatch.js
 * Shows which would be the last official u20 match of a certain player.
 * @author: rferromoreno, LA-MJ
 */

'use strict';

/* eslint-disable no-magic-numbers */

Foxtrick.modules['U20LastMatch'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['youthPlayerDetails', 'playerDetails', 'players', 'transferSearchResult'],
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

	calculate: function(age, doc) {
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
		for (let i = 0; i < this.DATE_CUTOFFS.length; i++) {
			if (daysOffset < this.DATE_CUTOFFS[i]) {
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
			matchDesc.push(round1.replace(/%2/, i));
		for (let i of Foxtrick.range(1, 4))
			matchDesc.push(round2.replace(/%2/, i));
		for (let i of Foxtrick.range(1, 4))
			matchDesc.push(round3.replace(/%2/, i));
		for (let i of Foxtrick.range(1, 4))
			matchDesc.push(round4.replace(/%2/, i));

		matchDesc.push(SEMI_STR);
		matchDesc.push(FINAL_STR);

		return {
			lastMatch: matchDesc[index],
			worldCupNumber,
		};
	},

	run: function(doc) {
		var module = this;

		var isYouthPlayerDetailsPage = Foxtrick.isPage(doc, 'youthPlayerDetails');
		var isSeniorPlayerDetailsPage = Foxtrick.isPage(doc, 'playerDetails');
		var isPlayersPage = Foxtrick.isPage(doc, 'players');
		var isTransferResultsPage = Foxtrick.isPage(doc, 'transferSearchResult');

		if (Foxtrick.Pages.Player.wasFired(doc) && !isTransferResultsPage)
			return;

		var isYouthEnabled = Foxtrick.Prefs.isModuleOptionEnabled(this, 'YouthPlayers');
		var isSeniorsEnabled = Foxtrick.Prefs.isModuleOptionEnabled(this, 'SeniorPlayers');
		var isPlayersEnabled = Foxtrick.Prefs.isModuleOptionEnabled(this, 'AllPlayers');
		var isTransferResultsPageEnabled = Foxtrick.Prefs.isModuleOptionEnabled(this, 'TransfersResults');

		// If the option isn't enabled for this page, don't show.
		if (isYouthPlayerDetailsPage && !isYouthEnabled)
			return;
		if (isSeniorPlayerDetailsPage && !isSeniorsEnabled)
			return;
		if (isPlayersPage && !isPlayersEnabled)
			return;
		if (isTransferResultsPage && !isTransferResultsPageEnabled)
			return;

		if (isYouthPlayerDetailsPage || isSeniorPlayerDetailsPage)
			module.runPlayer(doc);
		else if (isPlayersPage)
			module.runPlayerList(doc);
		else if (isTransferResultsPage)
			module.runTransferList(doc);
	},

	runPlayer: function(doc) {
		var module = this;

		const TITLE_STR = Foxtrick.L10n.getString('U20LastMatch.eligibilityTitle');
		const TEXT_STR = Foxtrick.L10n.getString('U20LastMatch.eligibilityText');
		const WC_STR = Foxtrick.L10n.getString('U20LastMatch.worldcup');
		const TMPL_STR = Foxtrick.L10n.getString('U20LastMatch.templateWithoutTable');

		let age = Foxtrick.Pages.Player.getAge(doc);
		if (age.years > 20)
			return;

		let { worldCupNumber, lastMatch } = module.calculate(age, doc);
		let wcNum = Foxtrick.decToRoman(worldCupNumber);

		let text = TMPL_STR;
		text = text.replace(/%1/, TEXT_STR);
		text = text.replace(/%2/, WC_STR);
		text = text.replace(/%3/, wcNum);
		text = text.replace(/%4/, lastMatch);


		let entryPoint = doc.querySelector('#mainBody > .mainBox');
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

	runPlayerList: function(doc) {
		var module = this;
		const TITLE_STR = Foxtrick.L10n.getString('U20LastMatch.title');
		const WC_STR = Foxtrick.L10n.getString('U20LastMatch.worldcup');
		const TMPL_STR = Foxtrick.L10n.getString('U20LastMatch.templateWithoutTable');

		let players = Foxtrick.modules.Core.getPlayerList();
		for (let player of players) {
			if (player.age.years > 20)
				continue;

			let { worldCupNumber, lastMatch } = module.calculate(player.age, doc);
			let wcNum = Foxtrick.decToRoman(worldCupNumber);

			let text = TMPL_STR;
			text = text.replace(/%1/, TITLE_STR);
			text = text.replace(/%2/, WC_STR);
			text = text.replace(/%3/, wcNum);
			text = text.replace(/%4/, lastMatch);

			let container = Foxtrick.createFeaturedElement(doc, module, 'p');
			container.textContent = text;
			let table = player.playerNode.querySelector('table') || player.playerNode.lastChild;
			Foxtrick.insertAfter(container, table);
		}
	},

	runTransferList: function(doc) {
		var module = this;
		const TITLE_STR = Foxtrick.L10n.getString('U20LastMatch.title');
		const WC_STR = Foxtrick.L10n.getString('U20LastMatch.worldcup');
		const TMPL_STR = Foxtrick.L10n.getString('U20LastMatch.templateWithoutTable');

		let players = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
		for (let player of players) {
			if (player.age.years > 20)
				continue;

			let { worldCupNumber, lastMatch } = module.calculate(player.age, doc);
			let wcNum = Foxtrick.decToRoman(worldCupNumber);

			let text = TMPL_STR;
			text = text.replace(/%1/, TITLE_STR);
			text = text.replace(/%2/, WC_STR);
			text = text.replace(/%3/, wcNum);
			text = text.replace(/%4/, lastMatch);

			let container = Foxtrick.createFeaturedElement(doc, module, 'div');
			container.textContent = text;
			let element = player.playerNode.querySelector('.flex') || player.playerNode.lastChild;
			Foxtrick.insertAfter(container, element);
		}
	}
};
