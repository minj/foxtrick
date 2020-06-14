/**
 * loyalty-display.js
 * Extends the skill bar representation with a version
 * that reflects the Homegrown/loyalty bonus
 * @author CatzHoek
 */

'use strict';

Foxtrick.modules['LoyaltyDisplay'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['players', 'playerDetails'],
	CSS: Foxtrick.InternalPath + 'resources/css/loyalty-display.css',

	exec: function(player, node) {
		var module = this;
		const HOME_GROUND_BONUS = 1.5;
		const THRESHOLD_COUNT = 8;
		const DECIMAL_COUNT = (1 / THRESHOLD_COUNT).toString(10).length - 2;

		let loyalty = player.loyalty;
		let mcb = !!player.motherClubBonus;
		let skillUp = Foxtrick.Predict.loyaltyBonus(loyalty, mcb);

		var l10nMCB = Foxtrick.L10n.getString('LoyaltyDisplay.motherClubBonus');
		var l10nLB = Foxtrick.L10n.getString('LoyaltyDisplay.loyaltyBonus');
		let bonus = skillUp.toString().slice(0, DECIMAL_COUNT + 2);
		let l10n = skillUp == HOME_GROUND_BONUS ? l10nMCB : l10nLB;

		// find correct style for this loyalty level
		if (skillUp == HOME_GROUND_BONUS) {
			let cls = 'homegrown';
			module.addInfo(node, bonus, l10n, cls);
			return;
		}
		for (let coef of Foxtrick.range(THRESHOLD_COUNT)) {
			let threshold = 1 - coef / THRESHOLD_COUNT;
			if (skillUp < threshold)
				continue;

			let cls = threshold.toFixed(DECIMAL_COUNT).replace(/^0|\./g, '');
			module.addInfo(node, bonus, l10n, cls);
			return;
		}
	},

	addInfo: function(node, bonus, l10n, cls) {
		var module = this;
		var doc = node.ownerDocument;

		let newTable;
		if ((newTable = node.querySelector('.transferPlayerSkills'))) {
			let bars = newTable.querySelectorAll('.ht-bar');
			for (let bar of bars) {
				let level = parseInt(bar.getAttribute('level'), 10);
				let max = parseInt(bar.getAttribute('max'), 10);
				let val = Math.min(max, level + parseFloat(bonus));

				let widthTotal = bar.getBoundingClientRect().width;
				let widthNeeded = Math.round(val / max * widthTotal);

				// let widthAvail = maxBar.getBoundingClientRect().width;
				// let widthUsed = widthTotal - widthAvail;
				// let widthTaken = widthNeeded - widthUsed;
				// if (!widthTaken)
				// 	return;
				// widthAvail -= widthTaken;

				let bonusBar = Foxtrick.createFeaturedElement(doc, module, 'div');
				Foxtrick.addClass(bonusBar, `bar-level ft-bar-loyalty`);
				bonusBar.style.width = `${widthNeeded}px`;
				bonusBar.title = `+${bonus}\u00a0${l10n}`;

				let denomination = bar.querySelector('.bar-denomination');
				bonusBar.appendChild(Foxtrick.cloneElement(denomination, true));

				let maxBar = bar.querySelector('.bar-max');
				let levelBar = bar.querySelector('.bar-level');
				if (levelBar)
					Foxtrick.insertBefore(bonusBar, levelBar);
				else
					Foxtrick.insertAfter(bonusBar, maxBar);
			}
		}
		else {
			let className = 'ft-percentImage ft-percentImage-loyalty-' + cls;
			let bars = node.querySelectorAll('.percentImage');
			for (let bar of bars) {
				if (bar.title) {
					let [num] = bar.title.match(/\S+/);
					bar.title = `${num}\u00a0+${bonus}\u00a0${l10n}`;
				}
				Foxtrick.addClass(bar, className);
				Foxtrick.removeClass(bar, 'percentImage');
			}
		}
	},

	run: function(doc) {
		var module = this;

		if (Foxtrick.isPage(doc, 'ownPlayers')) {
			let players = Foxtrick.Pages.Players.getPlayerList(doc);
			let playerNodes = Foxtrick.Pages.Players.getPlayerNodes(doc);
			for (let pNode of playerNodes) {
				let playerId = Foxtrick.Pages.Players.getPlayerId(pNode);
				if (!playerId)
					continue;

				let info = Foxtrick.Pages.Players.getPlayerFromListById(players, playerId);
				if (info)
					module.exec(info, pNode);
			}
		}
		else if (Foxtrick.isPage(doc, 'playerDetails')) {
			if (Foxtrick.Pages.Player.wasFired(doc))
				return;

			let player = Foxtrick.Pages.Player.getAttributes(doc);
			module.exec(player, doc.getElementById('mainBody'));
		}
	},
};
