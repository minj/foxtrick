/**
 * u20-lastmatch.js
 * Shows which would be the last official u20 match of a certain player.
 * @Author: rferromoreno
 */

'use strict';

/* eslint-disable no-magic-numbers */

Foxtrick.modules['U20LastMatch'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['youthPlayerDetails', 'playerDetails', 'players'],
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

		var playerAgeInDays = DAYS_IN_SEASON * age.years + age.days;
		var daysUntil21 = DAYS_IN_SEASON * 21 - playerAgeInDays;

		var now = Foxtrick.util.time.getHTDate(doc);
		var dateWhen21 = Foxtrick.util.time.addDaysToDate(now, daysUntil21);

		// Round I, Match #1 of World Cup XXVI. (26/05/2017)
		var origin = new Date(2017, 4, 26);
		var msDiff = dateWhen21.getTime() - origin.getTime();
		var dayDiff = Math.floor(msDiff / MSECS_IN_DAY) - 1;

		var daysOffset = dayDiff % WORLD_CUP_DURATION;
		var worldCupOffset = Foxtrick.Math.div(dayDiff, WORLD_CUP_DURATION);
		var worldCupNumber = 26 + worldCupOffset;

		var index = 0;
		for (let i = 0; i < this.DATE_CUTOFFS.length; i++) {
			if (daysOffset < this.DATE_CUTOFFS[i]) {
				index = i;
				break;
			}
		}

		var round1 = ROUND_STR.replace(/%1/, 'I');
		var round2 = ROUND_STR.replace(/%1/, 'II');
		var round3 = ROUND_STR.replace(/%1/, 'III');
		var round4 = ROUND_STR.replace(/%1/, 'IV');

		// Load the Match descriptions array.
		var matchDesc = [];
		for (let i = 1; i < 15; i++)
			matchDesc.push(round1.replace(/%2/, i));
		for (let i = 1; i < 4; i++)
			matchDesc.push(round2.replace(/%2/, i));
		for (let i = 1; i < 4; i++)
			matchDesc.push(round3.replace(/%2/, i));
		for (let i = 1; i < 4; i++)
			matchDesc.push(round4.replace(/%2/, i));

		matchDesc.push(SEMI_STR);
		matchDesc.push(FINAL_STR);

		return {
			lastMatch: matchDesc[index],
			worldCupNumber,
		};
	},

	/* eslint-disable complexity */

	run: function(doc) {
		var module = this;
		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		var isYouthPlayerDetailsPage = Foxtrick.isPage(doc, 'youthPlayerDetails');
		var isSeniorPlayerDetailsPage = Foxtrick.isPage(doc, 'playerDetails');
		var isPlayersPage = Foxtrick.isPage(doc, 'players');

		var isYouthEnabled = Foxtrick.Prefs.isModuleOptionEnabled(this, 'YouthPlayers');
		var isSeniorsEnabled = Foxtrick.Prefs.isModuleOptionEnabled(this, 'SeniorPlayers');
		var isPlayersEnabled = Foxtrick.Prefs.isModuleOptionEnabled(this, 'AllPlayers');

		// If the option isn't enabled for this page, don't show.
		if (isYouthPlayerDetailsPage && !isYouthEnabled)
			return;
		if (isSeniorPlayerDetailsPage && !isSeniorsEnabled)
			return;
		if (isPlayersPage && !isPlayersEnabled)
			return;

		var title = Foxtrick.L10n.getString('U20LastMatch.title');
		var worldCup = Foxtrick.L10n.getString('U20LastMatch.worldcup');

		if (isYouthPlayerDetailsPage || isSeniorPlayerDetailsPage) {
			var age = Foxtrick.Pages.Player.getAge(doc);
			if (age.years > 20)
				return;

			var result = module.calculate(age, doc);

			// Display the U20 Last Match information.
			var table = doc.querySelector('.playerInfo table');
			var row = Foxtrick.insertFeaturedRow(table, module, table.rows.length);
			let titleCell = row.insertCell(0);
			Foxtrick.addClass(row, 'ft-u20-last-match');
			titleCell.textContent = title;
			var lastMatch = row.insertCell(1);
			var lastMatchText = Foxtrick.L10n.getString('U20LastMatch.templateWithTable');
			lastMatchText = lastMatchText.replace(/%1/, worldCup);
			lastMatchText = lastMatchText.replace(/%2/, Foxtrick.decToRoman(result.worldCupNumber));
			lastMatchText = lastMatchText.replace(/%3/, result.lastMatch);
			lastMatch.textContent = lastMatchText;
		}
		else if (isPlayersPage) {
			var players = Foxtrick.modules.Core.getPlayerList();
			for (let player of players) {
				if (player.age.years > 20)
					continue;

				let result = module.calculate(player.age, doc);

				let table = player.playerNode.querySelector('table');
				var container = Foxtrick.createFeaturedElement(doc, module, 'div');
				Foxtrick.addClass(container, 'ft-u20-last-match');
				var containerText = Foxtrick.L10n.getString('U20LastMatch.templateWithoutTable');
				containerText = containerText.replace(/%1/, title);
				containerText = containerText.replace(/%2/, worldCup);
				let wcNum = Foxtrick.decToRoman(result.worldCupNumber);
				containerText = containerText.replace(/%3/, wcNum);
				containerText = containerText.replace(/%4/, result.lastMatch);
				container.textContent = containerText;
				var before = table.nextSibling;
				before.parentNode.insertBefore(container, before);
			}
		}
	},
};
