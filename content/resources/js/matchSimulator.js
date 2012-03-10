// function for the match-simulator which use hattrick scripts


//update Players stamina
function ft_updatePlayers() {
	//console.log('ft_updatePlayers stamina');
	var fieldplayers = document.getElementById('fieldplayers');
	var playerdivs = fieldplayers.getElementsByClassName('position');
	for (var position=0; position<14; ++position) {	
		var player = ht.field.positions[position].player;
		
		if (player != null ) {
			playerdivs[position].setAttribute('stamina', player.stamina);
		}
		else {
			playerdivs[position].removeAttribute('stamina');
		}
	}
}


// queue DOMchanges and run only once after all have passed
var ft_queued = 0;
function ft_queueChange(ev) {
	var fieldOverlay = document.getElementById('fieldplayers');
	fieldOverlay.removeEventListener( "DOMNodeInserted", ft_queueChange, false);
	++ft_queued;
	window.setTimeout(ft_checkStamina, 0);
};

// run when all changes have passed
function ft_checkStamina() {
	var fieldOverlay = document.getElementById('fieldplayers');
	if (--ft_queued > 0)
		return;
	ft_updatePlayers();
	fieldOverlay.addEventListener( "DOMNodeInserted", ft_queueChange, false);
};

// listen to field player changes
document.getElementById('fieldplayers').addEventListener( "DOMNodeInserted", ft_queueChange, false);

