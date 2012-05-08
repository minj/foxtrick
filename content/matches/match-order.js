"use strict";
/**
 * match-order.js
 * adding extra info to match order interface
 * @author convinced
 */

Foxtrick.modules["MatchOrderInterface"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['matchOrder', 'matchLineup'],
	OPTIONS : ["PlayedLastMatch","Specialties", "ShowFaces", "SwapPositions","StayOnPage"],
	CSS : Foxtrick.InternalPath + "resources/css/match-order.css",
	OPTIONS_CSS : [ "", Foxtrick.InternalPath + "resources/css/match-order-specialties.css", Foxtrick.InternalPath + "resources/css/match-order-faces.css"],

	run : function(doc) { 
	
		var check_images = function(doc, target, avatarsXml, getID, scale) {		
			if (!FoxtrickPrefs.isModuleOptionEnabled("MatchOrderInterface",'ShowFaces'))
				return;
			if (!Foxtrick.util.layout.isSupporter(doc))
				return;
			var isYouth = (doc.location.href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
			var add_image = function(fieldplayer) {
				var id = getID(fieldplayer);
				if (!id) 
					return;
				var players = avatarsXml.getElementsByTagName((isYouth?"Youth":"")+'Player');
				for (var i=0; i<players.length; ++i) {
					if (id == Number(players[i].getElementsByTagName((isYouth?"Youth":"")+'PlayerID')[0].textContent))
						break;
				}
				if (i == players.length)
					return; // id not found
				
				Foxtrick.addClass(fieldplayer, "smallFaceCardBox");
				var shirt = fieldplayer.getElementsByClassName('shirt')[0];
				if (!shirt) {
					var outer = doc.createElement('div');
					outer.className = 'smallFaceCardOuter';
					fieldplayer.appendChild(outer);
					shirt = doc.createElement('div');
					outer.appendChild(shirt);
				}
				if (Foxtrick.hasClass(shirt,'smallFaceCard'))
					return;
									
				Foxtrick.addClass(shirt,'smallFaceCard');
				var style  = 
					'background-image:url('
					// cleaning background//+players[i].getElementsByTagName('BackgroundImage')[0].textContent
					+');'
					+'top:-20px; width:'+Math.round(100/scale)+'px; height:'+Math.round(123/scale)+'px';
				shirt.setAttribute('style',style);
				var sizes = {
					backgrounds:[0, 0],// don't show
					bodies:[92, 123],
					faces: [92, 123],
					eyes: [60, 60],
					mouths: [50, 50],
					goatees: [70, 70],
					noses: [70, 70],
					hair: [92, 123],
					misc:[0,0] // don't show (eg cards)
				};
				var layers = players[i].getElementsByTagName('Layer');
				for (var j=0; j<layers.length; ++j) {
					var src = layers[j].getElementsByTagName('Image')[0].textContent;
					for (var bodypart in sizes) {
						if (src.search(bodypart) != -1)
							break;
					}
					if (!bodypart) 
						continue;
												
					var x = Math.round(Number(layers[j].getAttribute('x'))/scale);
					var y = Math.round(Number(layers[j].getAttribute('y'))/scale);
					var img =  doc.createElement('img');
					if (FoxtrickPrefs.isModuleOptionEnabled("OriginalFace", "ColouredYouth"))
						src = src.replace(/y_/, "");
					img.src = src;
					img.setAttribute('style','top:'+y+'px;left:'+x+'px;position:absolute;');
					img.width = Math.round(sizes[bodypart][0] / scale);
					img.height = Math.round(sizes[bodypart][1] / scale);
					shirt.appendChild(img);
				}
			};
			
			if (Foxtrick.isPage("matchOrder", doc))	{
				var playerdivs = target.getElementsByClassName('player');				
				for (var k=0; k<playerdivs.length; ++k) 
					add_image(playerdivs[k]);
			}
			else if (Foxtrick.isPage("matchLineup", doc)) {
				var playerdivs = target.getElementsByClassName('box_lineup');				
				for (var k=0; k<playerdivs.length; ++k) 
					add_image(playerdivs[k]);
				playerdivs = target.getElementsByClassName('box_substitute');				
				for (var k=0; k<playerdivs.length; ++k) 
					add_image(playerdivs[k]);
			}
		};

		var check_Specialties = function(doc, target, playerList, getID, targetClass) {		
			if (FoxtrickPrefs.isModuleOptionEnabled("MatchOrderInterface",'Specialties')) {
				var cards_health = target.getElementsByClassName(targetClass);
				for (var i=0; i<cards_health.length; ++i) {
					var id = getID(cards_health[i]);
					if (!id || Foxtrick.hasClass(cards_health[i], 'ft-specialty')) 
						continue;
					
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);
					if (player && player.specialityNumber != 0) {
						Foxtrick.addClass(cards_health[i], 'ft-specialty');
						var title = Foxtrickl10n.getSpecialityFromNumber(player.specialityNumber);
						var alt = Foxtrickl10n.getShortSpeciality(title);
						var icon_suffix = "";
						if (FoxtrickPrefs.getBool("anstoss2icons")) 
							icon_suffix = "_alt";
						Foxtrick.addImage(doc, cards_health[i], { 
							alt: alt, 
							title: title, 
							src: Foxtrick.InternalPath + 'resources/img/matches/spec'+player.specialityNumber+icon_suffix+'.png',
							class: 'ft-specialty'
						});
					}
				}
			}
		};

		var runMatchLineup = function(doc) { 
			var isYouth = (doc.location.href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
			if (isYouth) {
				var teamid = Foxtrick.util.id.findYouthTeamId(doc.getElementsByClassName("subMenu")[0]);
				var ownteamid = Foxtrick.util.id.getOwnYouthTeamId()
			}
			else {
				var teamid = Foxtrick.util.id.findTeamId(doc.getElementsByClassName("subMenu")[0]);
				var ownteamid = Foxtrick.util.id.getOwnTeamId();
			}
			var getID = function (fieldplayer) {
				return Foxtrick.util.id.findPlayerId(fieldplayer); 
			};
					
			// load ahead players and then wait for interface loaded
			Foxtrick.Pages.Players.getPlayerList(doc, function(playerInfo) {
				if (!playerInfo || playerInfo.length==0) {
					Foxtrick.log("unable to retrieve player list.");
					return;
				} 
				check_Specialties(doc, doc.getElementsByClassName('field')[0], playerInfo, getID, 'box_lineup');	
				check_Specialties(doc, doc.getElementsByClassName('field')[0], playerInfo, getID, 'box_substitute');	
			}, {teamid:teamid, current_squad:true, includeMatchInfo:true} );


			if (teamid == ownteamid) {
				Foxtrick.util.api.retrieve(doc, [["file", (isYouth?"youth":"")+"avatars"]], {cache_lifetime:'session'},
				function(xml, errorText) {
					if (errorText) {
						/*if (loadingOtherMatches && loadingOtherMatches.parentNode) {
							loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
							loadingOtherMatches = null;
						}*/
						Foxtrick.log(errorText);
						return;
					}
					check_images(doc, doc.getElementsByClassName('field')[0],xml, getID,4);
				});
			}
		};
		
		var runMatchOrder = function(doc) { 
			var isYouth = (doc.location.href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
			var getID = function (fieldplayer) {
				if (!fieldplayer.id)
					return null;
				return Number(fieldplayer.id.match(/list_playerID(\d+)/i)[1]);
			};
			var getIDParent = function (node) {
				if (!node.parentNode.id)
					return null;
				return Number(node.parentNode.id.match(/list_playerID(\d+)/i)[1]);
			};

			Foxtrick.util.inject.jsLink(doc, Foxtrick.InternalPath+"resources/js/matchOrder.js");
					
			// add extra info
			var hasPlayerInfo = false;
			var hasAvatars = true;
			var hasInterface = false;
			var playerList = null;
			var avatarsXml = null;
			var teamid = Foxtrick.util.id.findTeamId(doc.getElementsByClassName("main")[0]);
			//store most accurate list on first load
			var lastMatchDates = null;
			
			// load ahead players and then wait for interface loaded
			Foxtrick.Pages.Players.getPlayerList(doc, function(playerInfo) {
				if (!playerInfo || playerInfo.length==0) {
					Foxtrick.log("unable to retrieve player list.");
					return;
				} 
				
				Foxtrick.log('hasPlayerInfo');
				hasPlayerInfo = true;
				playerList = playerInfo;
				
				if (hasInterface)
					showPlayerInfo(doc.getElementById('orders'));
			}, {teamid:teamid, current_squad:true, includeMatchInfo:true} );

			Foxtrick.util.api.retrieve(doc, [["file",  (isYouth?"youth":"")+"avatars"]], {cache_lifetime:'session'},
			function(xml, errorText) {
				if (errorText) {
					/*if (loadingOtherMatches && loadingOtherMatches.parentNode) {
						loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
						loadingOtherMatches = null;
					}*/
					Foxtrick.log(errorText);
					return;
				}
				Foxtrick.log('hasAvatars');
				avatarsXml = xml;
				hasAvatars = true;
				if (hasInterface)
					check_images(doc, doc.getElementById('field'),avatarsXml, getID,3);
			});

			var loading = doc.getElementById('loading');				
			var waitForInterface = function(ev) {
				loading.removeEventListener("DOMCharacterDataModified", waitForInterface, false);
				loading.removeEventListener("DOMSubtreeModified", waitForInterface, false);
				loading.removeEventListener("DOMNodeInserted", waitForInterface, false);
				if (hasInterface)
					return;
				Foxtrick.log('hasInterface');
				hasInterface = true;
				if (hasPlayerInfo)
					showPlayerInfo(doc.getElementById('orders'));
				if (hasAvatars)
					check_images(doc, doc.getElementById('field'),avatarsXml, getID,3);

				if (FoxtrickPrefs.isModuleOptionEnabled("MatchOrderInterface",'SwapPositions')
					&& !doc.getElementById('ft_swap_positions')) {
					var swapPositionsDiv =  Foxtrick.createFeaturedElement(doc, Foxtrick.modules.MatchOrderInterface,'div');
					swapPositionsDiv.id = "ft_swap_positions";
					var swapPositionsLink =  doc.createElement('span');
					// invoke our injected script which changes the webpage's script variables
					swapPositionsLink.setAttribute('onclick',"javascript:ft_swap_positions();");
					swapPositionsLink.textContent = Foxtrickl10n.getString("matchOrder.swapPositions");
					swapPositionsDiv.appendChild(swapPositionsLink);
					var formations = doc.getElementById('formations');
					formations.parentNode.insertBefore(swapPositionsDiv, formations.nextSibling);
				}
				
				if (FoxtrickPrefs.isModuleOptionEnabled("MatchOrderInterface",'StayOnPage') 
					&&  doc.getElementById('send').getAttribute('onclick') == null) {
					// use our injected script to changes the webpage's script after action url
					doc.getElementById('send').setAttribute('onclick',"javascript:ft_stay_on_page()");
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
				Foxtrick.addMutationEventListener(details, "DOMNodeInserted", function(ev){
					//Foxtrick.log('details change');
					if (hasPlayerInfo) {
						//if (Foxtrick.util.layout.isSupporter(doc))
							addLastMatchtoDetails();
						if (FoxtrickPrefs.isModuleEnabled("LoyaltyDisplay"))
							injectLoyaltyBars();
					}
				}, false);
				
				var list = doc.getElementById('list');
				Foxtrick.addMutationEventListener(list, "DOMNodeInserted", function(ev){
					//Foxtrick.log('list change');
					if (hasPlayerInfo)
						showPlayerInfo(list);
					if (hasAvatars)
						check_images(doc, list, avatarsXml, getID,3);
				}, false);
				
				var fieldplayers = doc.getElementById('fieldplayers');
				Foxtrick.addMutationEventListener(fieldplayers, "DOMNodeInserted", function(ev){
					//Foxtrick.log('fieldplayers change');
					if (hasPlayerInfo)
						showPlayerInfo(fieldplayers);
					if (hasAvatars)
						check_images(doc, fieldplayers, avatarsXml, getID,3);
				}, false);
				
				var tab_subs = doc.getElementById('tab_subs');
				Foxtrick.addMutationEventListener(tab_subs, "DOMNodeInserted", function(ev){
					//Foxtrick.log('tab_subs change');
					if (hasPlayerInfo)
						showPlayerInfo(tab_subs);
					if (hasAvatars)
						check_images(doc, tab_subs, avatarsXml, getID,3);
				}, false);
				
				var tab_penaltytakers = doc.getElementById('tab_penaltytakers');
				Foxtrick.addMutationEventListener(tab_penaltytakers, "DOMNodeInserted", function(ev){
					//Foxtrick.log('tab_penaltytakers change');
					if (hasPlayerInfo)
						showPlayerInfo(tab_penaltytakers);
					if (hasAvatars)
						check_images(doc, tab_penaltytakers, avatarsXml, getID,3);
				}, false);
			};

			var addLastMatchtoDetails = function() {
				// add last match to details
				var details = doc.getElementById('details');
				var specials = details.getElementsByClassName('specials')[0];
				if (specials && !details.getElementsByClassName('ft-extraInfo')[0]) {
					var playerid = Number(specials.parentNode.getAttribute('playerid'));
					if (playerid) {
						var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, playerid);
						var span = doc.createElement('span');
						span.className = 'ft-extraInfo';
						span.appendChild(doc.createElement('br'));
						span.appendChild(doc.createTextNode( player.lastMatchText ));
						specials.appendChild(span);
					}
				}
			};

			//loyalty, uses loyalty-display.js module code
			var injectLoyaltyBars = function(){
				var details = doc.getElementById('details');
				var specials = details.getElementsByClassName('specials')[0];
				if (specials) {
					var playerid = Number(specials.parentNode.getAttribute('playerid'));
					if (playerid) {
						var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, playerid);
						Foxtrick.modules["LoyaltyDisplay"].replacePercentageImage(player, doc.getElementById('mainBody'));
					}
				}
			};
			
			var showPlayerInfo = function(target) {

				//original version was removed due to HT request,
				//this highlights players on the field for supporters only
				if (FoxtrickPrefs.isModuleOptionEnabled("MatchOrderInterface",'PlayedLastMatch')){	
					//players aren't send with the document, but the addMutationEventListeners later will take care
					var listplayers = target.getElementsByClassName('player');

					if(!listplayers.length)
						return;
					
					for (var i=0; i<listplayers.length; ++i)
						if(Foxtrick.hasClass(listplayers[i], "trained")) //only available for supporters
							Foxtrick.addClass( listplayers[i],'ft-highlight-onfield');			
				}
				
				//show potential speciality icons
				check_Specialties(doc, target, playerList, getIDParent, 'cards_health');				
			};
			
			loading.addEventListener("DOMCharacterDataModified", waitForInterface, false);
			loading.addEventListener("DOMSubtreeModified", waitForInterface, false);
			loading.addEventListener("DOMNodeInserted", waitForInterface, false);
		};
	
		var isYouth = (doc.location.href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
		if (Foxtrick.isPage("matchOrder", doc))	
			runMatchOrder(doc);
		else if (Foxtrick.isPage("matchLineup", doc))
			runMatchLineup(doc);
	}
};
