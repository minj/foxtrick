/* global ht */
(function() {
	'use strict';
	// save player objects onto player strips
	var playerlist = document.getElementById('list');
	var ft_updatePlayers = function() {
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
			clone.bruised = clone.health == 0.5;

			var id = clone.id;
			// HTs use the same ID for elements in '#players' and in '.position'
			var playerStrip = document.querySelector('#players #list_playerID' + id);
			if (playerStrip && !playerStrip.dataset.json)
				playerStrip.setAttribute('data-json', JSON.stringify(clone));
		});
	};

	var MO = window.MutationObserver || window.WebKitMutationObserver;
	var opts = { childList: true, subtree: true };
	var observer = new MO(function() {
		ft_updatePlayers();
	});
	observer.observe(playerlist, opts);
})();
