'use strict';
/**
 * match-lineup-tweaks.js
 * Tweaks for the new style match lineup
 * @author CatzHoek, LA-MJ
 */

Foxtrick.modules['MatchLineupTweaks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	OPTIONS: [
		'DisplayTeamNameOnField', 'ShowSpecialties', 'ConvertStars', 'ShowFaces', 'StarCounter',
		'StaminaCounter', 'HighlighEventPlayers', 'AddSubstiutionInfo', 'HighlightMissing'
	],
	OPTIONS_CSS: [
		null, null, Foxtrick.InternalPath + 'resources/css/match-lineup-convert-stars.css'
	],
	CSS: Foxtrick.InternalPath + 'resources/css/match-lineup-tweaks.css',
	run: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc)
			|| Foxtrick.Pages.Match.inProgress(doc))
			return;
		if (!Foxtrick.Pages.Match.hasNewRatings(doc))
			return;

	},
	// add substition icon for players on the field
	// that are involved in substitutions
	// with alt/title text for minute data
	addSubInfo: function(doc) {

		var subCells = doc.getElementsByClassName('highlightMovements');
		if (!subCells.length)
			return;

		if (doc.getElementsByClassName('ft-subDiv').length)
			return;

		var playerLinks = doc.querySelectorAll('.playersField > div.playerBoxHome > div > a, ' +
										   '#playersBench > div#playersBenchHome' +
										   ' > div.playerBoxHome > div > a,' +
										   '.playersField > div.playerBoxAway > div > a, ' +
										   '#playersBench > div#playersBenchAway' +
										   ' > div.playerBoxAway > div > a');

		var affectPlayer = function(playerId, func) {
			var link = Foxtrick.filter(function(link) {
				return new RegExp(playerId).test(link.href);
			}, playerLinks)[0];
			if (link)
				func(link.parentNode.parentNode);
		};

		// will be used to regex on image.src
		var SUBSTITUTION_TYPES = {
			SUB: 'substitution',
			FORMATION: 'formation', // formation change: might be sub or behavior
			BEHAVIOR: 'behavior',
			SWAP: 'swap'
		};
		var SUB_IMAGES = {};
		SUB_IMAGES[SUBSTITUTION_TYPES.SUB] = 'images/substitution.png';
		SUB_IMAGES[SUBSTITUTION_TYPES.BEHAVIOR] = Foxtrick.InternalPath +
			'resources/img/matches/behavior.png'
		SUB_IMAGES[SUBSTITUTION_TYPES.SWAP] = Foxtrick.InternalPath +
			'resources/img/matches/swap.png';

		var SUB_TEXTS = {};
		SUB_TEXTS[SUBSTITUTION_TYPES.SUB] = [];
		SUB_TEXTS[SUBSTITUTION_TYPES.SUB][0] = Foxtrickl10n.getString('MatchLineupTweaks.out');
		SUB_TEXTS[SUBSTITUTION_TYPES.SUB][1] = Foxtrickl10n.getString('MatchLineupTweaks.in');
		SUB_TEXTS[SUBSTITUTION_TYPES.BEHAVIOR] = Foxtrickl10n.getString('MatchLineupTweaks.behavior');
		SUB_TEXTS[SUBSTITUTION_TYPES.SWAP] = Foxtrickl10n.getString('MatchLineupTweaks.swap');

		var highlightSub = function(otherId, deactivate) {
			affectPlayer(otherId, function(node) {
				// yellow on fielf, red on bench
				var className = node.parentNode.id == 'playersField' ?
					'ft-highlight-playerDiv-field' : 'ft-highlight-playerDiv-bench';
				if (deactivate)
					Foxtrick.removeClass(node, className);
				else
					Foxtrick.addClass(node, className);
			});
		};

		var addSubDiv = function(sub) {
			var type = sub.type;
			if (type == SUBSTITUTION_TYPES.FORMATION) {
				// special case
				type = sub.otherId ? SUBSTITUTION_TYPES.SUB : SUBSTITUTION_TYPES.BEHAVIOR;
			}
			var rawText;
			// different texts for sbjPlayer & objPlayer, i. e. sub
			if (SUB_TEXTS[type] instanceof Array) {
				rawText = SUB_TEXTS[type][!sub.isOut + 0];
			}
			else
				rawText = SUB_TEXTS[type];
			var subText = rawText.replace(/%s/, sub.min);
			var iconSrc = SUB_IMAGES[type];

			affectPlayer(sub.id, function(node) {
				//HTs don't seem to appreciate class names here
				//this is bound to break easily
				//var positionImage = node.querySelector('img[src$="transparent.gif"]');
				//var parent = positionImage.parentNode;
				//var prev = parent.previousSibling;
				//if (prev.getElementsByTagName('img').length != 0) {
					// this should be indicator div (with captain, kicker, card, etc)
					// we need to move it out of the way
					// prev.style.top = '-10px';
					//Foxtrick.addClass(prev, 'ft-adjIndicatorDiv');
				//}
				var subDiv = Foxtrick
					.createFeaturedElement(doc, Foxtrick.modules['MatchLineupTweaks'], 'div');
				Foxtrick.addClass(subDiv, 'ft-subDiv');
				Foxtrick.addImage(doc, subDiv, {
					src: iconSrc,
					alt: subText,
					title: subText,
				});
				if (sub.otherId) {
					// highlight other player on click
					subDiv.setAttribute('ft-activated', '0');
					Foxtrick.onClick(subDiv, function(ev) {
						var div = ev.target;
						var active = Number(div.getAttribute('ft-activated'));
						highlightSub(sub.otherId, active);
						div.setAttribute('ft-activated', '' + Number(!active + 0));
					});
				}
				//node.insertBefore(subDiv, parent);
				var target = node.getElementsByClassName('ft-indicatorDiv')[0];
				target.appendChild(subDiv);
			});
		};

		for (var i = 0; i < subCells.length; i++) {
			var playerCell = subCells[i];
			var row = playerCell.parentNode;
			var typeCell = row.cells[0];
			var timeCell = row.cells[2];

			var time = timeCell.textContent.match(/\d+/)[0];

			var typeImage = typeCell.getElementsByTagName('img')[0];
			var type = '';
			for (var t in SUBSTITUTION_TYPES) {
				if (SUBSTITUTION_TYPES.hasOwnProperty(t)) {
					if (new RegExp(SUBSTITUTION_TYPES[t], 'i').test(typeImage.src)) {
						type = SUBSTITUTION_TYPES[t];
						break;
					}
				}
			}
			if (!type) {
				Foxtrick.log('AddSubInfo: sub type unsupported!');
				continue;
			}
			var subLinks = playerCell.getElementsByTagName('a');
			var pIds = Foxtrick.map(function(link) {
				return Foxtrick.getParameterFromUrl(link, 'playerid');
			}, subLinks);
			var isSubject = true, sbjPid = pIds[0], objPid = pIds[1] || 0;
			addSubDiv({
				id: sbjPid, min: time, type: type, isOut: isSubject, otherId: objPid
			});

			isSubject = false;
			if (objPid) {
				addSubDiv({
					id: objPid, min: time, type: type, isOut: isSubject, otherId: sbjPid
				});
			}
		}

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
			//Foxtrick.stopListenToChange(doc);
			if (node.getElementsByClassName('ft-specialty').length)
				return;
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
			//Foxtrick.startListenToChange(doc);
		};

		var addSpecialtiesByTeamId = function(teamid, players) {
			Foxtrick.Pages.Players.getPlayerList(doc,
			  function(playerInfo) {
				var missing = [];
				Foxtrick.stopListenToChange(doc);
				for (var i = 0; i < players.length; i++) {
					var id = Number(Foxtrick.getParameterFromUrl(players[i].href, 'playerid'));
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerInfo, id);
					var node = players[i].parentNode.parentNode
						.getElementsByClassName('ft-indicatorDiv')[0];
					if (player)
						addSpecialty(node, player);
					else
						missing.push({ id: id, i: i });
				}
				Foxtrick.startListenToChange(doc);
				if (missing.length) {
					for (var j = 0; j < missing.length; ++j) {
						Foxtrick.Pages.Player.getPlayer(doc, missing[j].id,
						  (function(j) {
							return function(p) {
								Foxtrick.stopListenToChange(doc);
								var node = players[missing[j].i].parentNode.parentNode
									.getElementsByClassName('ft-indicatorDiv')[0];
								addSpecialty(node, p ? {
									specialityNumber: p.Specialty
								} : null);
								Foxtrick.startListenToChange(doc);
							}
						})(j));
					}
				}
			}, { teamid: teamid, current_squad: true, includeMatchInfo: true });
		};

		addSpecialtiesByTeamId(homeTeamId, homePlayerLinks);
		addSpecialtiesByTeamId(awayTeamId, awayPlayerLinks);
	},
	runMissing: function(doc) {
		var teams = doc.querySelectorAll('h1 > a, h1 > span > a');

		if (!teams.length)
			return; // we're not ready yet

		if (doc.getElementsByClassName('ft-playerMissing').length)
			return;

		var homeTeamId = Foxtrick.Pages.Match.getHomeTeamId(doc);
		var awayTeamId = Foxtrick.Pages.Match.getAwayTeamId(doc);

		//get player list sucks for nt matches
		var isNT = Foxtrick.Pages.Match.isNT(doc);
		var NT = isNT ? { action: 'view', all: 'false' } : null;

		var homePlayerLinks =
			doc.querySelectorAll('.playersField > div.playerBoxHome > div > a, ' +
			                     '#playersBench > div#playersBenchHome > div.playerBoxHome > div > a');
		var awayPlayerLinks =
			doc.querySelectorAll('.playersField > div.playerBoxAway > div > a, #playersBench > ' +
			                     'div#playersBenchAway > div.playerBoxAway > div > a');

		var alt = Foxtrickl10n.getString('MatchLineupTweaks.missing');

		var addMissingByTeamId = function(teamid, players) {
			Foxtrick.Pages.Players.getPlayerList(doc,
			  function(playerInfo) {
				Foxtrick.stopListenToChange(doc);
				var missing = [];
				for (var i = 0; i < players.length; i++) {
					var id = Number(Foxtrick.getParameterFromUrl(players[i].href, 'playerid'));
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerInfo, id);
					if (!player)
						missing.push(i);
				}
				if (missing.length) {
					for (var j = 0; j < missing.length; ++j) {
						var playerDiv = players[missing[j]].parentNode.parentNode;
						var ftDiv = playerDiv.getElementsByClassName('ft-indicatorDiv')[0];
						var missingDiv = doc.createElement('div');
						Foxtrick.addClass(missingDiv, 'ft-playerMissing');
						Foxtrick.addImage(doc, missingDiv, {
							alt: alt,
							title: alt,
							src: Foxtrick.InternalPath + 'resources/img/matches/missing.png',
						});
						ftDiv.appendChild(missingDiv);
					}
				}
				Foxtrick.startListenToChange(doc);
			}, { teamid: teamid, current_squad: true, includeMatchInfo: true, NT: NT});
		};

		addMissingByTeamId(homeTeamId, homePlayerLinks);
		addMissingByTeamId(awayTeamId, awayPlayerLinks);
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
			//Foxtrick.stopListenToChange(doc);
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
					//backgrounds: [0, 0],// don't show
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
			//Foxtrick.startListenToChange(doc);
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
					Foxtrick.stopListenToChange(doc);
					for (var i = 0; i < players.length; i++) {
						var id = Number(Foxtrick.getParameterFromUrl(players[i].href, 'playerid'));
						addFace(players[i].parentNode.parentNode, id, xml);
					}
					Foxtrick.startListenToChange(doc);
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
		var ratingTemplate = doc.getElementsByClassName('playerRating')[0];
		if (!ratingTemplate)
			return; // we're not ready yet
		if (doc.getElementsByClassName('ft-match-lineup-tweaks-star-counter').length)
			return;

		var starsHome = countStars(doc, 'Home');
		var starsAway = countStars(doc, 'Away');

		// adding image dimensions to prevent flicker...
		//ratingTemplate.getElementsByTagName('img')[0].height = 22;
		//ratingTemplate.getElementsByTagName('img')[0].weight = 13;

		var displayHome = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(displayHome, 'ft-match-lineup-tweaks-star-counter');
		displayHome.appendChild(doc.createElement('span'));
		//var img = ratingTemplate.getElementsByTagName('img')[0].cloneNode(true);
		//img.height = 22;
		//img.width = 13;
		//displayHome.appendChild(img);
		//Foxtrick.addImage(doc, displayHome, {
		//	src: Foxtrick.InternalPath + 'resources/img/matches/star-10.png',
		//	class: 'playerStar',
		//	width: 10,
		//	height: 10
		//});
		var displayAway = displayHome.cloneNode(true);
		var displayDiff = displayHome.cloneNode(true);

		//U+2211 is sum symbol, U+0394 is mathematical delta, U+2605 is star
		displayHome.getElementsByTagName('span')[0].textContent = '\u2211 ' + starsHome + '\u2605';
		displayAway.getElementsByTagName('span')[0].textContent = '\u2211 ' + starsAway + '\u2605';
		displayDiff.getElementsByTagName('span')[0].textContent = '\u0394 ' +
			Math.abs(starsHome - starsAway) + '\u2605';

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

		var displayHome = Foxtrick.createFeaturedElement(doc, this, 'div');
		displayHome.appendChild(doc.createElement('span'));
		Foxtrick.addClass(displayHome, 'ft-match-lineup-tweaks-stamina-counter');

		var displayAway = displayHome.cloneNode(true);
		var displayDiff = displayHome.cloneNode(true);

		//U+2211 is sum symbol, U+0394 is mathematical delta
		displayHome.getElementsByTagName('span')[0].textContent = '\u00D8 ' + staminaHome + ' %';
		displayAway.getElementsByTagName('span')[0].textContent = '\u00D8 ' + staminaAway + ' %';
		displayDiff.getElementsByTagName('span')[0].textContent = '\u0394 ' +
			parseInt(Math.abs(staminaHome - staminaAway)) + ' %';

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
		if (!info)
			return;
		var players = info.getElementsByTagName('a');
		if (!players.length)
			return;

		var eventIcon = timelineEventDetails.getElementsByClassName('timelineEventDetailsIcon')[0]
			.getElementsByTagName('img')[0];

		var isHome = Foxtrick.hasClass(info, 'highlightHome');

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

		var highlightPlayer = function(playerId) {
			affectPlayer(playerId, function(node) {
				if (node.parentNode.id == 'playersField')
					Foxtrick.addClass(node, 'ft-highlight-playerDiv-field');
				else
					Foxtrick.addClass(node, 'ft-highlight-playerDiv-bench');
			});
		};

		for (var i = 0; i < players.length; i++) {
			var player = Number(Foxtrick.getParameterFromUrl(players[i].href, 'playerid'));
			highlightPlayer(player);
		}

	},
	// change the number-star display into real stars
	convertStars: function(doc) {
		var ratings = doc.querySelectorAll('div.playerRating > span');
		for (var i = 0; i < ratings.length; i++) {
			var count = Number(ratings[i].textContent);
			var newDiv = ratings[i].parentNode.cloneNode(false);
			Foxtrick.makeFeaturedElement(newDiv, this);
			// weirdest bug ever: title too short
			newDiv.title = count + '\u2605    ';
			//var starDiv = doc.createElement('div');
			//Foxtrick.addClass(starDiv, 'ft-starDiv');
			// this one will allow centering
			var smallDiv = doc.createElement('div');
			Foxtrick.addClass(smallDiv, 'ft-4starDiv');
			// this one will fit small stars
			var stars5 = Math.floor(count / 5);
			count = count % 5;
			var stars2 = Math.floor(count / 2);
			count = count % 2;
			for (var j = 0; j < stars5; j++) {
				var star5container = doc.createElement('div');
				// this one's for async image purposes
				Foxtrick.addImage(doc, star5container, {
					src: Foxtrick.InternalPath + 'resources/img/matches/5stars.png'
				});
				newDiv.appendChild(star5container);
			}
			for (var j = 0; j < stars2; j++) {
				Foxtrick.addImage(doc, smallDiv, {
					src: Foxtrick.InternalPath + 'resources/img/matches/2stars_h.png'
				});
			}
			newDiv.appendChild(smallDiv);
			if (count) {
				// 4.5 star is a pain in the ass
				var target;
				if (count == 0.5 && smallDiv.childNodes.length == 2) {
					target = newDiv;
				}
				else
					target = smallDiv;
				Foxtrick.addImage(doc, target, {
					src: Foxtrick.InternalPath + 'resources/img/matches/' + count + 'stars_h.png'
				});
			}

			//starDiv.appendChild(smallDiv);
			ratings[i].parentNode.parentNode.replaceChild(newDiv, ratings[i].parentNode);
		}
	},

	change: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc)
			|| Foxtrick.Pages.Match.inProgress(doc))
			return;
		if (!Foxtrick.Pages.Match.hasNewRatings(doc))
			return;

		Foxtrick.stopListenToChange(doc);

		var hId = doc.location.search.match(/HighlightPlayerID=(\d+)/i);
		if (hId) {
			var playerLinks = doc.querySelectorAll('.playersField > div.playerBoxHome > div > a, ' +
											   '#playersBench > div#playersBenchHome' +
											   ' > div.playerBoxHome > div > a,' +
											   '.playersField > div.playerBoxAway > div > a, ' +
											   '#playersBench > div#playersBenchAway' +
											   ' > div.playerBoxAway > div > a');
			var highlightPlayer = function(playerId) {
				var link = Foxtrick.filter(function(link) {
					return new RegExp(playerId).test(link.href);
				}, playerLinks)[0];
				if (link)
					Foxtrick.addClass(link.parentNode.parentNode, 'ft-highlight-playerDiv-url');
			};
			highlightPlayer(hId[1]);
		}

		var playerDivs = doc.querySelectorAll('div.playerDiv');
		if (playerDivs.length && playerDivs[0].getElementsByClassName('ft-indicatorDiv').length)
			return;
		for (var i = 0; i < playerDivs.length; i++) {
			var player = playerDivs[i];
			var ftdiv = Foxtrick.createFeaturedElement(doc, this, 'div');
			Foxtrick.addClass(ftdiv, 'ft-indicatorDiv');
			var staminaDiv = player.querySelector('div.sectorShirt + div > div');
			if (staminaDiv) {
				var stamina = staminaDiv.title.match(/\d+/)[0];
				var fatigue = 100 - Number(stamina);
				staminaDiv.firstChild.style.height = fatigue + '%';
				var staminaSpan = doc.createElement('span');
				Foxtrick.addClass(staminaSpan, 'ft-staminaText');
				staminaSpan.style.backgroundColor = staminaDiv.style.backgroundColor;
				// let's 'hide' 100
				staminaSpan.textContent = (stamina != 100) ? stamina : '00';
				if (stamina == 100)
					staminaSpan.style.color = staminaSpan.style.backgroundColor;
				staminaSpan.title = staminaDiv.title;
				ftdiv.appendChild(staminaSpan);
			}
			player.appendChild(ftdiv);
		}

		// add ft-stamina="N" to ratings spans for possible styling
		var ratings = doc.querySelectorAll('div.playerRating > span');
		for (var i = 0; i < ratings.length; i++) {
			var count = Number(ratings[i].textContent);
			ratings[i].setAttribute('ft-stars', count);
		}


		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'DisplayTeamNameOnField'))
			this.runTeamnNames(doc);

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'HighlighEventPlayers'))
			this.runEventPlayers(doc);
		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'AddSubstiutionInfo'))
			this.addSubInfo(doc);

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'StarCounter'))
			this.runStars(doc);
		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'StaminaCounter'))
			this.runStamina(doc);
		// run this after the counters
		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'ConvertStars'))
			this.convertStars(doc);


		Foxtrick.startListenToChange(doc);

		//add async shit last

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'ShowSpecialties'))
			this.runSpecialties(doc);

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'ShowFaces') &&
			Foxtrick.util.layout.isSupporter(doc))
			this.runFaces(doc);

		if (FoxtrickPrefs.isModuleOptionEnabled('MatchLineupTweaks', 'HighlightMissing'))
			this.runMissing(doc);

	}
};
