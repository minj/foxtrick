"use strict";
/**
 * match-order.js
 * adding extra info to match order interface
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "MatchOrderInterface",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['matchOrder'],
	OPTIONS : ["PlayedLastMatch","Specialties"],
	CSS : Foxtrick.InternalPath + "resources/css/match-order.css",
	OPTIONS_CSS : [ "", Foxtrick.InternalPath + "resources/css/match-order-specialties.css"],

	run : function(doc) { 
		// add extra info
		var hasPlayerInfo = false;
		var hasInterface = false;
		var playerList = null;
		var teamid = Foxtrick.util.id.findTeamId(doc.getElementById('mainWrapper'));
		
		// load ahead players and then wait for interface loaded
		Foxtrick.Pages.Players.getPlayerList(doc, function(playerInfo) {
			if (!playerInfo || playerInfo.length==0) {
				Foxtrick.log("unable to retrieve player list.");
				return;
			} 
			
			hasPlayerInfo = true;
			playerList = playerInfo;
			
			if (hasInterface)
				showPlayerInfo();
		}, {teamid:teamid, current_squad:true, includeMatchInfo:true} );
		
		var waitForInterface = function(ev) {
			hasInterface = true;
			if (hasPlayerInfo)
				showPlayerInfo();
		};

		var showPlayerInfo = function() {
			if (FoxtrickPrefs.isModuleOptionEnabled("MatchOrderInterface",'PlayedLastMatch')) {
				// get lastMatchdates
				var getLastMatchDates = function (playerNode) {
					if (!playerNode.id) 
						return 0;
					var id = Number(playerNode.id.match(/list_playerID(\d+)/i)[1]);
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);
					if (player.lastMatchDate)
						return Foxtrick.util.time.getDateFromText(player.lastMatchDate,'yyyy-mm-dd').getTime();
					else
						return 0;
				};
				var players = doc.getElementById('players').getElementsByClassName('player');
				var lastMatchDates = Foxtrick.Pages.Players.getLastMatchDates (players, getLastMatchDates);

				if (lastMatchDates) {
					for (var i=0; i<players.length; ++i) {
						if (!players[i].id) 
							continue;
						var id = Number(players[i].id.match(/list_playerID(\d+)/i)[1]);
						var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);
						if (player.lastMatchDate)
							var matchDay = Foxtrick.util.time.getDateFromText(player.lastMatchDate,'yyyy-mm-dd').getTime();
						else
							var matchDay = 0;
						if (matchDay == lastMatchDates.lastMatchDate)
							Foxtrick.addClass( players[i],'playedLast'); 
						else if (matchDay == lastMatchDates.secondLastMatchDate)
							Foxtrick.addClass( players[i],'playedSecondLast'); 
						else 
							Foxtrick.addClass( players[i],'playedOther'); 
					}
				}
				
				var addLastMatchtoDetails = function(ev) {
					// add last match to details
					var details = doc.getElementById('details');
					var specials = details.getElementsByClassName('specials')[0];
					if (specials && !details.getElementsByClassName('extraInfo')[0]) {
						var playerid = Number(specials.parentNode.getAttribute('playerid'));
						if (playerid) {
							var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, playerid);
							var span = doc.createElement('span');
							span.className = 'extraInfo';
							span.appendChild(doc.createElement('br'));
							span.appendChild(doc.createTextNode( player.lastMatchText ));
							specials.appendChild(span);
						}
					}
				};
				var details = doc.getElementById('details');
				Foxtrick.addMutationEventListener(details, "DOMNodeInserted", addLastMatchtoDetails, false);
			}

			if (FoxtrickPrefs.isModuleOptionEnabled("MatchOrderInterface",'Specialties')) {
				var cards_health = doc.getElementsByClassName('cards_health');
				for (var i=0; i<cards_health.length; ++i) {
					var playerNode = cards_health[i].parentNode;
					if (!playerNode.id || Foxtrick.hasClass(cards_health[i], 'specialty')) 
						continue;
					
					var id = Number(playerNode.id.match(/list_playerID(\d+)/i)[1]);
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);
					if (player.specialityNumber != 0) {
						Foxtrick.addClass(cards_health[i], 'specialty');
						var title = Foxtrickl10n.getSpecialityFromNumber(player.specialityNumber);
						var alt = Foxtrickl10n.getShortSpeciality(title);
						Foxtrick.addImage(doc, cards_health[i], { 
							alt: alt, 
							title: title, 
							src: Foxtrick.InternalPath + 'resources/img/spec'+player.specialityNumber+'.png',
							class: 'specialty'
						});
					}
				}
			}
		}

		// add playerid to details
		Foxtrick.listen(doc.getElementById('players'), 'mouseover', function(ev) {
			if (Foxtrick.hasClass(ev.target,'player')) {
				var detailsTemplate = doc.getElementById('detailsTemplate');
				var idSearch = ev.target.id.match(/list_playerID(\d+)/i);
				if (idSearch)
					detailsTemplate.setAttribute('playerid', idSearch[1]);
			}
		}, true);
		
		// listen to all that has players (seperatelly to reduce excessive calling)
		var details = doc.getElementById('details');
		Foxtrick.addMutationEventListener(details, "DOMNodeInserted", function(ev){Foxtrick.log('details change');waitForInterface(ev)}, false);
		
		var list = doc.getElementById('list');
		Foxtrick.addMutationEventListener(list, "DOMNodeInserted", function(ev){Foxtrick.log('list change');waitForInterface(ev)}, false);
		
		var fieldplayers = doc.getElementById('fieldplayers');
		Foxtrick.addMutationEventListener(fieldplayers, "DOMNodeInserted", function(ev){Foxtrick.log('fieldplayers change');waitForInterface(ev)}, false);
		
		var tab_subs = doc.getElementById('tab_subs');
		Foxtrick.addMutationEventListener(tab_subs, "DOMNodeInserted", function(ev){Foxtrick.log('tab_subs change');waitForInterface(ev)}, false);
		
		var tab_penaltytakers = doc.getElementById('tab_penaltytakers');
		Foxtrick.addMutationEventListener(tab_penaltytakers, "DOMNodeInserted", function(ev){Foxtrick.log('tab_penaltytakers change');waitForInterface(ev)}, false);
	},
});
