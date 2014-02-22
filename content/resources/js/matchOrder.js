'use strict';
/* fixing ht function to raise and custom event after init of interface */
ht.orders.handleDataOrg = ht.orders.handleData;
ht.orders.handleData = function(arg) {
	// all org
	ht.orders.handleDataOrg.apply(this, arguments);
	// raise event after
	document.body.dispatchEvent(new Event('interface_ready', { bubbles: true }));
	// restore old
	ht.orders.handleData = ht.orders.handleDataOrg;
};

/* function to swap players left to right including their orientation */
function ft_swap_positions() {

	// position ids to swap
	var swaps = [
		[1, 5],  // right/left WB
		[2, 4],  // right/left CD
		[6, 10], // right/left WI
		[7, 9],  // right/left IM
		[11, 13] // right/left FW
	];

	for (var i = 0; i < swaps.length; ++i) {
		var pos1 = ht.field.positions[swaps[i][0]];
		var pos2 = ht.field.positions[swaps[i][1]];

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
		// there's no ht function to remove a behaviour (stored in the class). so we do that ourself
		if (player1) {
			pos2.changePlayer(player1);
			ht.$('#' + pos2.id).removeClass(pos2.getTactic());
			pos2.tacticInt = tactic1;
			pos2.initTactic();
		}
		if (player2) {
			if (!player1)
				// calling changePlayer swaps players immediately
				// the problem is that calling changePlayer twice is not only unnecessary
				// but also looses sp/captain assignment for some reason
				pos1.changePlayer(player2);

			ht.$('#' + pos1.id).removeClass(pos1.getTactic());
			pos1.tacticInt = tactic2;
			pos1.initTactic();
		}
	}
}
function ft_clear_penalty_takers() {
	ht.$.each(ht.field.positions, function(i, item) {
		if (i > 20)
			item.reset();
	});
	ht.field.updateFormation();
}
function ft_fix_penalty_takers() {
// based on matchorder_1_0_7.js:1691
	if (ht.field.ft_kickersFixed) return;
	ht.$.each(ht.field.positions, function(i, p) {
		p.ft_handleKickerOld = p.handleKicker; // saving function
		p.handleKicker = function() {
			try {
				// saving data
				var player = arguments[0];
				var playerHere = this.player;
				var draggedFrom = player.getKickerPosition();
				var draggedFromPlayer = (draggedFrom && draggedFrom.player !== null);
			}
			catch (e) {}
			p.ft_handleKickerOld.apply(this, arguments); // redirecting to saved
			try {
				if (draggedFromPlayer && draggedFrom.player === null) { // HTs messed up: let's fix
					if (playerHere)
						draggedFrom.changePlayer(playerHere);
				}
			}
			catch (e) {}
		};
	});
	ht.field.ft_kickersFixed = true;
}

function ft_stay_on_page() {
	ht.orders.doneURL = document.location.href;
}

//# sourceURL=matchOrder.js
