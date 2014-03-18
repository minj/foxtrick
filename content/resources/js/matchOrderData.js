(function() {
	'use strict';
	// save player objects onto player strips
	var playerlist = document.getElementById('list');
	var ft_updatePlayers = function() {
		ht.playerManager.players.forEach(function(player) {
			var id = player.id;
			// HTs use the same ID for elements in '#players' and in '.position'
			var playerStrip = document.querySelector('#players #list_playerID' + id);
			if (playerStrip && !playerStrip.dataset.json)
				playerStrip.setAttribute('data-json', JSON.stringify(player));
		});
	};

	// run when all changes have passed
	var ft_checkStamina = function() {
		if (--ft_queued > 0)
			return;
		ft_updatePlayers();
		playerlist.addEventListener('DOMNodeInserted', ft_queueChange, false);
	};

	// queue DOMchanges and run only once after all have passed
	var ft_queued = 0;
	var ft_queueChange = function(ev) {
		playerlist.removeEventListener('DOMNodeInserted', ft_queueChange, false);
		++ft_queued;
		window.setTimeout(function() { ft_checkStamina(); }, 0);
	};

	// listen to field player changes
	playerlist.addEventListener('DOMNodeInserted', ft_queueChange, false);
})();
