(function() {
	'use strict';
	// save player objects onto player strips
	var playerlist = document.getElementById('list');
	var ft_updatePlayers = function() {
		var strips = document.querySelectorAll('#players .player');
		if (!strips.length)
			return;

		ht.playerManager.players.forEach(function(player) {
			var id = player.id;
			// HTs use the same ID for elements in '#players' and in '.position'
			var playerStrip = document.querySelector('#players #list_playerID' + id);
			if (playerStrip && !playerStrip.dataset.json)
				playerStrip.setAttribute('data-json', JSON.stringify(player));
		});
	};

	var MO = window.MutationObserver || window.WebKitMutationObserver;
	var opts = { childList: true, subtree: true };
	var observer = new MO(function() {
		ft_updatePlayers();
	});
	observer.observe(playerlist, opts);
})();
