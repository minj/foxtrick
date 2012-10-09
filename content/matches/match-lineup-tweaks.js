'use strict';
/**
 * match-lineup-teaks.js
 * Tweaks for the new style match lineup
 * @author CatzHoek
 */

Foxtrick.modules['MatchLineupTweaks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	OPTIONS: [
		'DisplayTeamNameOnField', 'ShowSpecialties', 'ShowFaces', 'StarCounter', 'StaminaCounter',
		'HighlighEventPlayers'
	],
	CSS: Foxtrick.InternalPath + 'resources/css/match-lineup-tweaks.css',
	run: function(doc) {
		// this is where we fix HTs shit
		var timeline = Foxtrick.map(function(el) {
			var time = el.value;
			return { min: Number(time.match(/^\d+/)), sec: Number(time.match(/\d+$/)) };
		}, doc.querySelectorAll('input[id$="_time"]'));

		var fixRatings = function(home) {
			var playerRatings = document.querySelectorAll('input[id$="_playerRatings' +
														  (home? 'Home' : 'Away') + '"]');
			var playerRatingsData = Foxtrick.map(function(ratings) {
				return { players: JSON.parse(ratings.value), el: ratings };
			}, playerRatings);

			var played = [];
			for (var i = 0; i < playerRatingsData[0].players.length; ++i) {
				var player = playerRatingsData[0].players[i];
				if (!(player.FromMin == 0 && player.ToMin == 0)) {
					player.i = i;
					played.push(player);
				}
			}

			var leavesField = Foxtrick.filter(function(player) {
				return player.ToMin != timeline[timeline.length - 1].min;
			}, played);
			var entersField = Foxtrick.filter(function(player) {
				return player.FromMin != -1;
			}, played);

			//var comesAndGoes = Foxtrick.intersect(leavesField, entersField);
			//var leavesFieldOnly = Foxtrick.filter(function(player) {
			//	return !Foxtrick.member(player, comesAndGoes);
			//}, leavesField);
			//var entersFieldOnly = Foxtrick.filter(function(player) {
			//	return !Foxtrick.member(player, comesAndGoes);
			//}, entersField);

			for (var i = 0; i < leavesField.length; ++i) {
				var subMin = leavesField[i].ToMin;
				var k = leavesField[i].i;
				for (var j = 0; j < timeline.length; ++j) {
					if (timeline[j].min == subMin) {
						// reached the sub minute
						while (playerRatingsData[j].players[k].Stars != -1)
							++j;
						// reached the sub second because stars = -1
						var starsLast = playerRatingsData[j - 1].players[k].Stars;
						var subSec = timeline[j].sec;
						// save stamina
						leavesField[i].lastStamina = playerRatingsData[j].players[k].Stamina;
						while (timeline[j]) {
							// add stars for all events at the same second
							playerRatingsData[j].players[k].Stars = starsLast;
							++j;
						}
						//while (timeline[j].min == subMin && timeline[j].sec == subSec) {
						//	// add stars for all events at the same second
						//	playerRatingsData[j].players[k].Stars = starsLast;
						//	++j;
						//}
						// timeline parsed
						break;
					}
				}
			}

			// save modifications
			for (var i = 0; i < playerRatingsData.length; ++i) {
				playerRatingsData[i].el.value = JSON.stringify(playerRatingsData[i].players);
			}

		};
		fixRatings(true);
		fixRatings(false);
	},

	//adds teamsnames to the field for less confusion
	runTeamnNames: function(doc) {
		var teams = doc.querySelectorAll('h1 > a, h1 > span > a');

		var homeIdx = Foxtrick.util.layout.isRtl(doc) ? 1 : 0;
		var awayIdx = !homeIdx + 0;

		var homeTeamName = teams[homeIdx].textContent;
		var awayTeamName = teams[awayIdx].textContent;

		var homeSpan = doc.createElement('span');
		var awaySpan = doc.createElement('span');

		homeSpan.textContent = homeTeamName;
		awaySpan.textContent = awayTeamName;

		Foxtrick.addClass(homeSpan, 'ft-match-lineup-tweaks-teamname');
		Foxtrick.addClass(awaySpan, 'ft-match-lineup-tweaks-teamname');

		Foxtrick.addClass(homeSpan, 'ft-match-lineup-tweaks-teamname-home');
		Foxtrick.addClass(awaySpan, 'ft-match-lineup-tweaks-teamname-away');

		doc.getElementById('playersField').appendChild(homeSpan);
		doc.getElementById('playersField').appendChild(awaySpan);

	},
	//adds apecialty icons for all players, on field and on bench
	runSpecialties: function(doc) {
		var teams = doc.querySelectorAll('h1 > a, h1 > span > a');

		if (!teams.length)
			return; // we're not ready yet

		var homeIdx = Foxtrick.util.layout.isRtl(doc) ? 1 : 0;
		var awayIdx = !homeIdx + 0;

		var homeTeamId = Foxtrick.util.id.getTeamIdFromUrl(teams[homeIdx].href);
		var awayTeamId = Foxtrick.util.id.getTeamIdFromUrl(teams[awayIdx].href);

		var homePlayerLinks =
			doc.querySelectorAll('.playersField > div.playerBoxHome > div > a, ' +
			                     '#playersBench > div#playersBenchHome > div.playerBoxHome > div > a');
		var awayPlayerLinks =
			doc.querySelectorAll('.playersField > div.playerBoxAway > div > a, #playersBench > ' +
			                     'div#playersBenchAway > div.playerBoxAway > div > a');

		var addSpecialty = function(node, player) {
			Foxtrick.stopListenToChange(doc);
			if (player && player.specialityNumber != 0) {
				var title = Foxtrickl10n.getSpecialityFromNumber(player.specialityNumber);
				var alt = Foxtrickl10n.getShortSpeciality(title);
				var icon_suffix = '';
				if (FoxtrickPrefs.getBool('anstoss2icons'))
					icon_suffix = '_alt';
				Foxtrick.addImage(doc, node, {
					alt: alt,
					title: title,
					src: Foxtrick.InternalPath + 'resources/img/matches/spec' +
						player.specialityNumber + icon_suffix + '.png',
					class: 'ft-specialty ft-match-lineup-tweaks-specialty-icon'
				});
			}
			Foxtrick.startListenToChange(doc);
		};

		var addSpecialtiesByTeamId = function(teamid, players) {
			Foxtrick.Pages.Players.getPlayerList(doc,
			  function(playerInfo) {
				var missing = [];
				for (var i = 0; i < players.length; i++) {
					var id = Number(Foxtrick.getParameterFromUrl(players[i].href, 'playerid'));
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerInfo, id);
					if (player)
						addSpecialty(players[i].parentNode.parentNode, player);
					else
						missing.push({ id: id, i: i });
				}
				if (missing.length) {
					for (var j = 0; j < missing.length; ++j) {
						Foxtrick.Pages.Player.getPlayer(doc, missing[j].id,
						  (function(j) {
							return function(p) {
								addSpecialty(players[missing[j].i].parentNode.parentNode, p ? {
									specialityNumber: p.Specialty
								} : null);
							}
						})(j));
					}
				}
			}, { teamid: teamid, current_squad: true, includeMatchInfo: true });
		};

		addSpecialtiesByTeamId(homeTeamId, homePlayerLinks);
		addSpecialtiesByTeamId(awayTeamId, awayPlayerLinks);
	},
	runFaces: function(doc) {
		var teams = doc.querySelectorAll('h1 > a, h1 > span > a');

		if (!teams.length)
			return; // we're not ready yet

		var homeIdx = Foxtrick.util.layout.isRtl(doc) ? 1 : 0;
		var awayIdx = !homeIdx + 0;

		var isYouth = (doc.location.href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
		if (isYouth) {
			// TODO youth?
		}
		else {
			var homeTeamId = Foxtrick.util.id.getTeamIdFromUrl(teams[homeIdx].href);
			var awayTeamId = Foxtrick.util.id.getTeamIdFromUrl(teams[awayIdx].href);
			var ownteamid = Foxtrick.util.id.getOwnTeamId();
		}


		var homePlayerLinks =
			doc.querySelectorAll('.playersField > div.playerBoxHome > div > a, ' +
			                     '#playersBench > div#playersBenchHome > div.playerBoxHome > div > a');
		var awayPlayerLinks =
			doc.querySelectorAll('.playersField > div.playerBoxAway > div > a, #playersBench > ' +
			                     'div#playersBenchAway > div.playerBoxAway > div > a');

        var scale = 3;
		var addFace = function(fieldplayer, id, avatarsXml) {
			Foxtrick.stopListenToChange(doc);
			if (avatarsXml) {
				if (!id)
					return;
				var players = avatarsXml.getElementsByTagName((isYouth ? 'Youth' : '') + 'Player');
				for (var i = 0; i < players.length; ++i) {
					if (id == Number(players[i].getElementsByTagName((isYouth ? 'Youth' : '') +
					    'PlayerID')[0].textContent))
						break;
				}
				if (i == players.length)
					return; // id not found

				Foxtrick.addClass(fieldplayer, 'smallFaceCardBox');

				var shirt = fieldplayer.getElementsByClassName('sectorShirt')[0];

				if (shirt) {
					var kiturl = shirt.getAttribute('kiturl');
					if (!kiturl && !isYouth) {
						var shirtstyle = shirt.getAttribute('style');
						var kiturl = shirtstyle
							.match(/http:\/\/res.hattrick.org\/kits\/\d+\/\d+\/\d+\/\d+\//)[0];
						shirt.setAttribute('kiturl', kiturl);
					}
				} else {
					// TODO: cleanup?
					var outer = doc.createElement('div');
					outer.className = 'ft-smallFaceCardOuter';
					fieldplayer.appendChild(outer);
					shirt = doc.createElement('div');
					outer.appendChild(shirt);
				}

				if (Foxtrick.hasClass(shirt, 'ft-smallFaceCard'))
					return;

					Foxtrick.addClass(shirt, 'ft-smallFaceCard');
					shirt.style.backgroundImage = null;
				//var style =
				//	'background-image:url('
				//	// cleaning background//+players[i].getElementsByTagName('BackgroundImage')[0].textContent
				//	+ ');'
				//	+ 'top:-20px; width:' + Math.round(100 / scale) + 'px; height:' +
				//	Math.round(123 / scale) + 'px';
				//	shirt.setAttribute('style', style);
				var sizes = {
					backgrounds: [0, 0],// don't show
					kits: [92, 123],
					bodies: [92, 123],
					faces: [92, 123],
					eyes: [60, 60],
					mouths: [50, 50],
					goatees: [70, 70],
					noses: [70, 70],
					hair: [92, 123],
					misc: [0, 0] // don't show (eg cards)
				};
				var layers = players[i].getElementsByTagName('Layer');
				for (var j = 0; j < layers.length; ++j) {
					var src = layers[j].getElementsByTagName('Image')[0].textContent;
					for (var bodypart in sizes) {
						if (src.search(bodypart) != -1)
							break;
					}
					if (!bodypart)
						continue;

					if (bodypart == 'backgrounds')
						src = '';

					if (kiturl && bodypart == 'kits') {
						var body = src.match(/([^\/]+)(\w+$)/)[0];
						src = kiturl + body;
					}
					var x = Math.round(Number(layers[j].getAttribute('x')) / scale);
					var y = Math.round(Number(layers[j].getAttribute('y')) / scale);

					if (FoxtrickPrefs.isModuleOptionEnabled('OriginalFace', 'ColouredYouth'))
						src = src.replace(/y_/, '');
					Foxtrick.addImage(doc, shirt, {
						src: src,
						style: 'top:' + y + 'px;left:' + x + 'px;position:absolute;',
						width: Math.round(sizes[bodypart][0] / scale),
						height: Math.round(sizes[bodypart][1] / scale)
					});
				}
			}
			Foxtrick.startListenToChange(doc);
		};

		var addFacesByTeamId = function(teamid, players) {
			if (teamid == ownteamid) {
				Foxtrick.util.api.retrieve(doc, [['file', (isYouth ? 'youth' : '') + 'avatars']],
				                           { cache_lifetime: 'session' },
				  function(xml, errorText) {
					if (errorText) {
						/*if (loadingOtherMatches && loadingOtherMatches.parentNode) {
							loadingOtherMatches.parentNode.removeChild(loadingOtherMatches);
							loadingOtherMatches = null;
						}*/
						Foxtrick.log(errorText);
						return;
					}
					for (var i = 0; i < players.length; i++) {
						var id = Number(Foxtrick.getParameterFromUrl(players[i].href, 'playerid'));
						addFace(players[i].parentNode.parentNode, id, xml);
					}
				});
			}
		};

		addFacesByTeamId(homeTeamId, homePlayerLinks);
		addFacesByTeamId(awayTeamId, awayPlayerLinks);
	},

	//adds a star summary to the page
	runStars: function(doc) {
		//get the sum of stars from all players on the 'palyersField'
		//@where: 'away' or 'home' ... that's replacing HTs classnames accordingly during lookup
		var countStars = function(doc, where) {
			var stars = 0;
			var ratings = doc.querySelectorAll('.playersField > .playerBox' + where +
				' > .playerRating');  //
			for (var i = 0; i < ratings.length; i++) {
				var id = Foxtrick.Pages.Players.getPlayerId(ratings[i].parentNode);
				stars += Number(ratings[i].textContent);
			}
			return stars;
		};
		var starsHome = countStars(doc, 'Home');
		var starsAway = countStars(doc, 'Away');

		var ratingTemplate = doc.getElementsByClassName('playerRating')[0];
		if (!ratingTemplate)
			return; // we're not ready yet

		// adding image dimensions to prevent flicker...
		ratingTemplate.getElementsByTagName('img')[0].height = 22;
		ratingTemplate.getElementsByTagName('img')[0].weight = 13;

		var displayHome = ratingTemplate.cloneNode(true);
		var displayAway = displayHome.cloneNode(true);
		var displayDiff = displayHome.cloneNode(true);

		//U+2211 is sum symbol, U+0394 is mathematical delta
		displayHome.getElementsByTagName('span')[0].textContent = '\u2211 ' + starsHome;
		displayAway.getElementsByTagName('span')[0].textContent = '\u2211 ' + starsAway;
		displayDiff.getElementsByTagName('span')[0].textContent = '\u0394 ' +
			Math.abs(starsHome - starsAway);

		Foxtrick.addClass(displayHome, 'ft-match-lineup-tweaks-stars-counter-sum-home');
		Foxtrick.addClass(displayDiff, 'ft-match-lineup-tweaks-stars-counter-diff');
		Foxtrick.addClass(displayAway, 'ft-match-lineup-tweaks-stars-counter-sum-away');

		var starsContainer = doc.createDocumentFragment();

		starsContainer.appendChild(displayHome);
		starsContainer.appendChild(displayDiff);
		starsContainer.appendChild(displayAway);

		doc.getElementById('playersField').appendChild(starsContainer);
	},

	//adds a stamina sumary to the page
	runStamina: function(doc) {
		//get the sum of stars from all players on the 'playersField'
		//@where: 'away' or 'home' ... that's replacing HTs classnames accordingly during lookup
		var getStaminaAverage = function(doc, where) {
			var stamina = 0.0;
			var fieldPlayerCount = 0.0;

			var getStaminaFromNode = function(doc, node) {
				var staminaTitle = node.getElementsByClassName('sectorShirt')[0].nextSibling
					.firstChild.title;

				var stamina = staminaTitle.match(RegExp('\\d+'));
				return Number(stamina);
			};

			var items = doc.querySelectorAll('.playersField > .playerBox' + where);
			fieldPlayerCount = items.length; //needed for determining the average later on

			for (var i = 0; i < items.length; i++) {
				stamina += getStaminaFromNode(doc, items[i]);
			}
			return parseInt(stamina / fieldPlayerCount);
		};

		if (!doc.querySelectorAll('.playersField > .playerBoxHome').length)
			return; // we're not ready yet

		var staminaHome = getStaminaAverage(doc, 'Home');
		var staminaAway = getStaminaAverage(doc, 'Away');

		var displayHome = doc.getElementsByClassName('playerRating')[0].cloneNode(true);
		var displayAway = displayHome.cloneNode(true);
		var displayDiff = displayHome.cloneNode(true);

		//U+2211 is sum symbol, U+0394 is mathematical delta
		displayHome.getElementsByTagName('span')[0].textContent = '\u00D8 ' + staminaHome + ' %';
		displayAway.getElementsByTagName('span')[0].textContent = '\u00D8 ' + staminaAway + ' %';
		displayDiff.getElementsByTagName('span')[0].textContent = '\u0394 ' +
			parseInt(Math.abs(staminaHome - staminaAway)) + ' %';

		displayHome.removeChild(displayHome.getElementsByTagName('img')[0]);
		displayAway.removeChild(displayAway.getElementsByTagName('img')[0]);
		displayDiff.removeChild(displayDiff.getElementsByTagName('img')[0]);

		Foxtrick.addClass(displayHome, 'ft-match-lineup-tweaks-stamina-counter-sum-home');
		Foxtrick.addClass(displayDiff, 'ft-match-lineup-tweaks-stamina-counter-diff');
		Foxtrick.addClass(displayAway, 'ft-match-lineup-tweaks-stamina-counter-sum-away');

		var staminaContainer = doc.createDocumentFragment();

		staminaContainer.appendChild(displayHome);
		staminaContainer.appendChild(displayDiff);
		staminaContainer.appendChild(displayAway);

		doc.getElementById('playersField').appendChild(staminaContainer);
	},

	runEventPlayers: function(doc) {
		var timelineEventDetails = doc.getElementById('timelineEventDetails');
		if (!timelineEventDetails || !timelineEventDetails.childNodes.length)
			return;

		var info = timelineEventDetails.getElementsByClassName('timelineEventDetailsInfo')[0];
		var players = info.getElementsByTagName('a');
		if (!players.length)
			return;

		var eventIcon = timelineEventDetails.getElementsByClassName('timelineEventDetailsIcon')[0]
			.getElementsByTagName('img')[0];

		var isHome = Foxtrick.hasClass(info, 'highlightHome');
		var isSub = /substitution\.png$/i.test(eventIcon.src);

		var playerLinks = doc.querySelectorAll('.playersField > div.playerBox' +
										   (isHome ? 'Home' : 'Away') + ' > div > a, ' +
										   '#playersBench > div#playersBench' +
										   (isHome ? 'Home' : 'Away') +
										   ' > div.playerBox' +
										   (isHome ? 'Home' : 'Away') + ' > div > a');

		var affectPlayer = function(playerId, func) {
			var link = Foxtrick.filter(function(link) {
				return new RegExp(playerId).test(link.href);
			}, playerLinks)[0];
			if (link)
				func(link.parentNode.parentNode);
		};

		var addClassToPlayer = function(playerId, className) {
			affectPlayer(playerId, function(node) {
				Foxtrick.addClass(node, className);
			});
		};

		if (players.length === 1) {
			var playerId = Number(Foxtrick.getParameterFromUrl(players[0].href, 'playerid'));
			addClassToPlayer(playerId, 'ft-highlight-playerDiv');
		}
		else if (players.length === 2) {
			if (isSub) {
				var playerIn = Number(Foxtrick.getParameterFromUrl(players[0].href, 'playerid'));
				var playerOut = Number(Foxtrick.getParameterFromUrl(players[1].href, 'playerid'));
				addClassToPlayer(playerIn, 'ft-highlight-playerDiv');
				addClassToPlayer(playerOut, 'ft-highlight-playerDiv-other');
			}
		}
	},

	change: function(doc) {
		if (!Foxtrick.Pages.Match.hasNewRatings(doc))
			return;

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'DisplayTeamNameOnField'))
			this.runTeamnNames(doc);

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'ShowSpecialties'))
			this.runSpecialties(doc);

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'StarCounter'))
			this.runStars(doc);

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'StaminaCounter'))
			this.runStamina(doc);

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'ShowFaces') &&
			Foxtrick.util.layout.isSupporter(doc))
			this.runFaces(doc);

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'HighlighEventPlayers'))
			this.runEventPlayers(doc);
	}
};
