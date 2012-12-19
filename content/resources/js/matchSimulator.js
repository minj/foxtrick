// function for the match-simulator which use hattrick scripts


//update Players stamina
var ft_updatePlayers = function() {
	//console.log('ft_updatePlayers stamina');
	var fieldplayers = document.getElementById('fieldplayers');
	var playerdivs = fieldplayers.getElementsByClassName('position');
	for (var position = 0; position < 14; ++position) {
		var player = ht.field.positions[position].player;

		if (player != null) {
			playerdivs[position].setAttribute('stamina', player.stamina);
		}
		else {
			playerdivs[position].removeAttribute('stamina');
		}
	}
};

// run when all changes have passed
var ft_checkStamina = function() {
	var fieldOverlay = document.getElementById('fieldplayers');
	if (--ft_queued > 0)
		return;
	ft_updatePlayers();
	fieldOverlay.addEventListener('DOMNodeInserted', ft_queueChange, false);
};

// queue DOMchanges and run only once after all have passed
var ft_queued = 0;
var ft_queueChange = function(ev) {
	var fieldOverlay = document.getElementById('fieldplayers');
	fieldOverlay.removeEventListener('DOMNodeInserted', ft_queueChange, false);
	++ft_queued;
	window.setTimeout(function() { ft_checkStamina(); }, 0);
};

// listen to field player changes
document.getElementById('fieldplayers').addEventListener('DOMNodeInserted', ft_queueChange, false);
