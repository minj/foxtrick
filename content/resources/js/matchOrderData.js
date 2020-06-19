/* eslint-disable strict */
/* global ht */
(function() {
	'use strict';

	const BRUISED_HEALTH = 0.5;

	// save player objects onto player strips
	var playerlist = document.getElementById('list');
	var ftUpdatePlayers = function() {
		var strips = document.querySelectorAll('#players .player');
		if (!strips.length)
			return;

		ht.playerManager.players.forEach(function(player) {
			// clone standardise for FT use
			var clone = JSON.parse(JSON.stringify(player));

			// FIXME: no motherClubBonus data
			clone.transferListed = clone.isTransferlisted;
			clone.skills.setPieces = clone.skills.setpieces;
			delete clone.skills.setpieces;
			clone.bruised = clone.health == BRUISED_HEALTH;

			var id = clone.id;

			// HTs use the same ID for elements in '#players' and in '.position'
			/** @type {HTMLElement} */
			var playerStrip = document.querySelector('#players #list_playerID' + id);
			if (playerStrip && !playerStrip.dataset.json)
				playerStrip.setAttribute('data-json', JSON.stringify(clone));
		});
	};

	var opts = { childList: true, subtree: true };
	var observer = new window.MutationObserver(function() {
		ftUpdatePlayers();
	});
	observer.observe(playerlist, opts);

})();
