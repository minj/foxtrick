'use strict';

/* global ht */
/* @author LA-MJ */
(function() {

	var ftInit = function() {
		document.dispatchEvent(new Event('ftinterfaceready'));
	};

	if (ht.txt) {
		// README: this is the first object defined by ht.orders.handleData
		// need to check this in case we run too slow
		ftInit();
	}
	else {
		ht.orders.handleDataOrg = ht.orders.handleData;
		ht.orders.handleData = function(...args) {
			// all org
			ht.orders.handleDataOrg.apply(this, args);

			// raise event after
			ftInit();

			// restore old
			ht.orders.handleData = ht.orders.handleDataOrg;
		};
	}

	/* function to swap players left to right including their orientation */
	var ftSwapPositions = function() {

		// position ids to swap
		/* eslint-disable no-magic-numbers */
		var swaps = [
			[1, 5], // right/left WB
			[2, 4], // right/left CD
			[6, 10], // right/left WI
			[7, 9], // right/left IM
			[11, 13], // right/left FW
		];
		/* eslint-enable no-magic-numbers */

		for (let [first, second] of swaps) {
			var pos1 = ht.field.positions[first];
			var pos2 = ht.field.positions[second];

			var player1 = null, player2 = null, tactic1, tactic2;

			// get player and their orientation
			if (pos1.player != null) {
				player1 = ht.playerManager.getPlayer(pos1.player.id);
				tactic1 = pos1.tacticInt;
			}
			if (pos2.player != null) {
				player2 = ht.playerManager.getPlayer(pos2.player.id);
				tactic2 = pos2.tacticInt;
			}

			// move player to new position and set their orientation
			// there's no ht function to remove a behaviour (stored in the class),
			// so we do that ourselves
			if (player1) {
				pos2.changePlayer(player1);
				ht.$('#' + pos2.id).removeClass(pos2.getTactic());
				pos2.tacticInt = tactic1;
				pos2.initTactic();
			}
			if (player2) {
				if (!player1) {
					// calling changePlayer swaps players immediately
					// the problem is that calling changePlayer twice is not only unnecessary
					// but also loses sp/captain assignment for some reason
					pos1.changePlayer(player2);
				}

				ht.$('#' + pos1.id).removeClass(pos1.getTactic());
				pos1.tacticInt = tactic2;
				pos1.initTactic();
			}
		}
	};
	var enableSwap = function() {
		var target = document.getElementById('ft_swap_positions');
		if (target)
			target.addEventListener('click', ftSwapPositions);
	};

	var ftFixPenaltyTakers = function() {
		// based on matchorder_1_0_7.js:1691

		if (ht.field.ftKickersFixed)
			return;

		ht.$.each(ht.field.positions, function(i, p) {
			p.ftHandleKickerOld = p.handleKicker; // saving function
			p.handleKicker = function(...args) {
				var playerHere, draggedFromPlayer, draggedFrom;
				try {
					// saving data
					var [player] = args;
					playerHere = this.player;
					draggedFrom = player.getKickerPosition();
					draggedFromPlayer = draggedFrom && draggedFrom.player !== null;
				}
				catch (e) {}

				p.ftHandleKickerOld.apply(this, args); // redirecting to saved
				try {
					if (draggedFromPlayer && draggedFrom.player === null) {
						// HTs messed up: let's fix it
						if (playerHere)
							draggedFrom.changePlayer(playerHere);
					}
				}
				catch (e) {}
			};
		});

		ht.field.ftKickersFixed = true;
	};

	var enableFix = function() {
		var target = document.querySelector('#li_tab_subs + li > a');
		if (target)
			target.addEventListener('click', ftFixPenaltyTakers);
	};

	var ftClearPenalties = function() {
		ht.$.each(ht.field.positions, function(i, item) {
			// eslint-disable-next-line no-magic-numbers
			if (i > 20)
				item.reset();
		});
		ht.field.updateFormation();
	};
	var enableClear = function() {
		var target = document.getElementById('ft_clear_penalty_takers');
		if (target)
			target.addEventListener('click', ftClearPenalties);
	};

	var enableStay = function() {
		var target = document.getElementById('send');
		if (target) {
			target.addEventListener('click', function() {
				ht.orders.doneURL = document.location.href;
			});
		}
	};


	if (document.documentElement.dataset.ftEnableSwap)
		enableSwap();
	else
		document.addEventListener('ftenableswap', enableSwap);

	if (document.documentElement.dataset.ftEnablePenaltiesFix)
		enableFix();
	else
		document.addEventListener('ftenablepenaltiesfix', enableFix);

	if (document.documentElement.dataset.ftEnablePenaltyControls)
		enableClear();
	else
		document.addEventListener('ftenablepenaltycontrols', enableClear);

	if (document.documentElement.dataset.ftEnableStay)
		enableStay();
	else
		document.addEventListener('ftenablestay', enableStay);

})();
