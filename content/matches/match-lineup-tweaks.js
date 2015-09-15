'use strict';
/**
 * match-lineup-tweaks.js
 * Tweaks for the new style match lineup
 * @author CatzHoek, LA-MJ
 */

Foxtrick.modules['MatchLineupTweaks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match', 'matchesLive'],
	OPTIONS: [
		'DisplayTeamNameOnField', 'ShowSpecialties', 'ShowNumbers',
		'ConvertStars',
		'SplitLineup',
		'ShowFaces', 'StarCounter', 'StaminaCounter', 'HighlighEventPlayers',
		'AddSubstiutionInfo',
		'HighlightMissing',
		'GatherStaminaData',
	],
	OPTIONS_CSS: [
		null, null, Foxtrick.InternalPath + 'resources/css/match-lineup-numbers.css',
		Foxtrick.InternalPath + 'resources/css/match-lineup-convert-stars.css',
		null,
	],
	CSS: Foxtrick.InternalPath + 'resources/css/match-lineup-tweaks.css',
	run: function(doc) {
		// run change now as sometimes we are too slow to init the listener
		// causing display to be broken on first load
		this.registerListener(doc);

		if (!Foxtrick.Pages.Match.hasRatingsTabs(doc))
			return;

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'GatherStaminaData')) {
			this.gatherStaminaData(doc);
		}
	},
	/**
	 * Register a chain of MOs to by-pass the Live timer.
	 * Cannot use subtree: true on the container because
	 * change() would execute every second in FF.
	 * This is because the match timer triggers childList changes in FF.
	 * @param  {HTMLDocument} doc
	 */
	registerListener: function(doc) {
		var module = this;
		// do the actual stuff
		var change = function(doc) {
			module.onChange.bind(module)(doc);
		};
		Foxtrick.Pages.Match.addLiveTabListener(doc, 'playersField', change);
	},
	addSplitLineupToggle: function(doc) {
		var module = this;
		var SPLIT_TOGGLE_ID = 'ft-split-lineup-toggle';
		if (doc.getElementById(SPLIT_TOGGLE_ID))
			// already done
			return;

		var isYouth = Foxtrick.Pages.Match.isYouth(doc);

		var teamId = isYouth ? Foxtrick.util.id.getYouthTeamIdFromUrl(doc.location.href) :
			Foxtrick.util.id.getTeamIdFromUrl(doc.location.href);
		if (teamId) {
			var awayId = Foxtrick.Pages.Match.getAwayTeamId(doc);
			if (awayId == teamId)
				this.showAway = true;
		}

		var toggleDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
		toggleDiv.id = 'ft-split-lineup-toggle-div';
		var toggle = doc.createElement('input');
		toggle.type = 'checkbox';
		toggle.id = SPLIT_TOGGLE_ID;
		toggle.checked =
			Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'SplitLineup');
		Foxtrick.onClick(toggle, function(ev) {
			var doSplit = ev.target.checked;
			Foxtrick.Prefs.setModuleEnableState('MatchLineupTweaks.SplitLineup', doSplit);
			var doc = ev.target.ownerDocument;
			if (doSplit)
				module.splitLineup(doc);
			else
				module.joinLineup(doc);
		});
		toggleDiv.appendChild(toggle);
		var togLabel = doc.createElement('label');
		togLabel.setAttribute('for', 'ft-split-lineup-toggle');
		togLabel.textContent =
			Foxtrick.L10n.getString('module.MatchLineupTweaks.SplitLineup.desc');
		toggleDiv.appendChild(togLabel);
		var entry = doc.querySelector('#divPlayers h4');
		entry.parentNode.replaceChild(toggleDiv, entry);
	},
	// add substition icon for players on the field
	// that are involved in substitutions
	// with alt/title text for minute data
	addSubInfo: function(doc) {
		var module = this;

		var subCells = doc.querySelectorAll('.highlightMovements, .highlightCards');
		if (!subCells.length)
			return;

		if (doc.getElementsByClassName('ft-indicator-sub').length)
			return;

		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var param = (isYouth ? 'youth' : '') + 'playerid';

		var playerQuery =
			'.playersField > div.playerBoxHome > div > a, ' +
			'#playersBench > div#playersBenchHome > div.playerBoxHome > div > a,' +
			'.playersField > div.playerBoxAway > div > a, ' +
			'#playersBench > div#playersBenchAway > div.playerBoxAway > div > a';

		var playerLinks = doc.querySelectorAll(playerQuery);

		// will be used to regex on image.src
		var SUBSTITUTION_TYPES = {
			SUB: 'substitution|red', // treat red card as sub
			FORMATION: 'formation', // formation change: might be sub or behavior
			BEHAVIOR: 'behavior', // might be sub as well
			SWAP: 'swap',
			YELLOW: 'yellow' // skipped
		};
		var SUB_IMAGES = {};
		SUB_IMAGES[SUBSTITUTION_TYPES.SUB] = 'images/substitution.png';
		SUB_IMAGES[SUBSTITUTION_TYPES.BEHAVIOR] = Foxtrick.InternalPath +
			'resources/img/matches/behavior.png';
		SUB_IMAGES[SUBSTITUTION_TYPES.SWAP] = Foxtrick.InternalPath +
			'resources/img/matches/swap.png';

		var SUB_TEXTS = {};
		SUB_TEXTS[SUBSTITUTION_TYPES.SUB] = [
			Foxtrick.L10n.getString('MatchLineupTweaks.out'),
			Foxtrick.L10n.getString('MatchLineupTweaks.in')
		];
		SUB_TEXTS[SUBSTITUTION_TYPES.BEHAVIOR] =
			Foxtrick.L10n.getString('MatchLineupTweaks.behavior');
		SUB_TEXTS[SUBSTITUTION_TYPES.SWAP] =
			Foxtrick.L10n.getString('MatchLineupTweaks.swap');

		var highlightSub = function(otherId) {
			Foxtrick.Pages.Match.modPlayerDiv(otherId, function(node) {
				// yellow on field, red on bench
				var className = node.parentNode.id == 'playersField' ?
					'ft-highlight-playerDiv-field' : 'ft-highlight-playerDiv-bench';
				Foxtrick.toggleClass(node, className);
			}, playerLinks);
		};

		var addSubDiv = function(id, min, type, isOut, otherId) {
			if (type == SUBSTITUTION_TYPES.YELLOW)
				return;
			if (type == SUBSTITUTION_TYPES.BEHAVIOR && otherId)
				// sub with behavior change only
				type = SUBSTITUTION_TYPES.SUB;
			if (type == SUBSTITUTION_TYPES.FORMATION) {
				// special case: formation change
				type = otherId ? SUBSTITUTION_TYPES.SUB : SUBSTITUTION_TYPES.BEHAVIOR;
			}
			var rawText;
			// different texts for sbjPlayer & objPlayer, i. e. sub
			if (SUB_TEXTS[type] instanceof Array) {
				rawText = SUB_TEXTS[type][!isOut + 0];
			}
			else
				rawText = SUB_TEXTS[type];
			var subText = rawText.replace(/%s/, min);
			var iconSrc = SUB_IMAGES[type];

			Foxtrick.Pages.Match.modPlayerDiv(id, function(node) {
				//HTs don't seem to appreciate class names here
				//this is bound to break easily
				var subDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
				Foxtrick.addClass(subDiv, 'ft-indicator ft-indicator-sub');
				Foxtrick.addImage(doc, subDiv, {
					src: iconSrc,
					alt: subText,
					title: subText,
				});
				if (otherId) {
					// highlight other player on click
					Foxtrick.onClick(subDiv, function() {
						highlightSub(otherId);
					});
				}
				var target = node.getElementsByClassName('ft-indicator-wrapper')[0];
				target.appendChild(subDiv);
			}, playerLinks);
		};

		Foxtrick.forEach(function(playerCell) {
			var row = playerCell.parentNode;
			var typeCell = row.cells[0];
			var timeCell = row.cells[2];

			var time = timeCell.textContent.match(/\d+/)[0];

			var typeImage = typeCell.getElementsByTagName('img')[0];
			var type = '', t;
			for (t in SUBSTITUTION_TYPES) {
				if (SUBSTITUTION_TYPES.hasOwnProperty(t)) {
					if (new RegExp(SUBSTITUTION_TYPES[t], 'i').test(typeImage.src)) {
						type = SUBSTITUTION_TYPES[t];
						break;
					}
				}
			}
			if (!type) {
				Foxtrick.log('AddSubInfo: sub type unsupported!', typeImage.src);
				return;
			}
			var subLinks = playerCell.getElementsByTagName('a');
			var pIds = Foxtrick.map(function(link) {
				return Math.abs(Foxtrick.getParameterFromUrl(link, param));
			}, subLinks);

			if (!pIds.length)
				// neighborhood kids
				return;

			var isSubject = true, sbjPid = pIds[0], objPid = pIds[1] || 0;
			addSubDiv(sbjPid, time, type, isSubject, objPid);

			isSubject = false;
			if (objPid) {
				addSubDiv(objPid, time, type, isSubject, sbjPid);
			}
		}, subCells);

	},

	//adds teamsnames to the field for less confusion
	runTeamnNames: function(doc) {
		var homeTeamName = Foxtrick.Pages.Match.getHomeTeamName(doc);
		var awayTeamName = Foxtrick.Pages.Match.getAwayTeamName(doc);

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
	// adds apecialty icons for all players, on field and on bench
	runSpecialties: function(doc) {
		if (!Foxtrick.Pages.Match.getHomeTeam(doc))
			return; // we're not ready yet

		var homeTeamId = Foxtrick.Pages.Match.getHomeTeamId(doc);
		var awayTeamId = Foxtrick.Pages.Match.getAwayTeamId(doc);
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var param = (isYouth ? 'youth' : '') + 'playerid';

		var homeQuery =
			'.playersField > div.playerBoxHome > div > a, ' +
			'#playersBench > div#playersBenchHome > div.playerBoxHome > div > a';
		var homePlayerLinks = doc.querySelectorAll(homeQuery);

		var awayQuery =
			'.playersField > div.playerBoxAway > div > a, #playersBench > ' +
			'div#playersBenchAway > div.playerBoxAway > div > a';
		var awayPlayerLinks = doc.querySelectorAll(awayQuery);

		var addSpecialty = function(node, player) {
			if (node.getElementsByClassName('ft-specialty').length)
				return;
			if (player && player.specialityNumber) {
				var specIdx = player.specialityNumber;
				var title = Foxtrick.L10n.getSpecialityFromNumber(specIdx);
				var specUrl = Foxtrick.getSpecialtyImagePathFromNumber(specIdx);
				Foxtrick.addImage(doc, node, {
					alt: title,
					title: title,
					src: specUrl,
					class: 'ft-specialty ft-match-lineup-tweaks-specialty-icon'
				});
			}
		};

		var addSpecialtiesByTeamId = function(teamId, players) {
			if (teamId === null)
				return;

			Foxtrick.Pages.Players.getPlayerList(doc,
			  function(playerInfo) {
				if (!playerInfo || !playerInfo.length)
					return;

				Foxtrick.stopListenToChange(doc);
				var missing = [];
				for (var i = 0; i < players.length; i++) {
					var id = Math.abs(Foxtrick.getParameterFromUrl(players[i].href, param));
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerInfo, id);
					var node = players[i].parentNode.parentNode.
						getElementsByClassName('ft-indicator-wrapper')[0];
					if (player)
						addSpecialty(node, player);
					else
						missing.push({ id: id, i: i });
				}
				Foxtrick.startListenToChange(doc);
				if (missing.length) {
					var makeCallback = function(j) {
						return function(p) {
							if (!p)
								return;

							Foxtrick.stopListenToChange(doc);
							var node = players[missing[j].i].parentNode.parentNode.
								getElementsByClassName('ft-indicator-wrapper')[0];
							addSpecialty(node, p || null);
							Foxtrick.startListenToChange(doc);
						};
					};

					for (var j = 0; j < missing.length; ++j) {
						Foxtrick.Pages.Player.getPlayer(doc, missing[j].id, makeCallback(j));
					}
				}
			}, { teamId: teamId, currentSquad: true, isYouth: isYouth });
		};

		addSpecialtiesByTeamId(homeTeamId, homePlayerLinks);
		addSpecialtiesByTeamId(awayTeamId, awayPlayerLinks);
	},
	// adds player numbers for all players, on field and on bench
	runNumbers: function(doc) {
		var module = this;
		if (!Foxtrick.Pages.Match.getHomeTeam(doc))
			return; // we're not ready yet

		var homeTeamId = Foxtrick.Pages.Match.getHomeTeamId(doc);
		var awayTeamId = Foxtrick.Pages.Match.getAwayTeamId(doc);
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var param = (isYouth ? 'youth' : '') + 'playerid';

		var homeQuery =
			'.playersField > div.playerBoxHome > div > a, ' +
			'#playersBench > div#playersBenchHome > div.playerBoxHome > div > a';
		var homePlayerLinks = doc.querySelectorAll(homeQuery);

		var awayQuery =
			'.playersField > div.playerBoxAway > div > a, #playersBench > ' +
			'div#playersBenchAway > div.playerBoxAway > div > a';
		var awayPlayerLinks = doc.querySelectorAll(awayQuery);

		var addByTeamId = function(teamId, players) {
			if (teamId === null)
				return;

			Foxtrick.Pages.Players.getPlayerList(doc,
			  function(playerInfo) {
				if (!playerInfo || !playerInfo.length)
					return;

				Foxtrick.stopListenToChange(doc);
				Foxtrick.forEach(function(link) {
					link.title = link.textContent;
					var id = Math.abs(Foxtrick.getParameterFromUrl(link.href, param));
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerInfo, id);
					if (player && player.number) {
						var node = link.parentNode.parentNode;
						var span = Foxtrick.createFeaturedElement(doc, module, 'span');
						Foxtrick.addClass(span, 'ft-mlt-player-nr');
						span.textContent = player.number;
						node.insertBefore(span, node.firstChild);
					}
				}, players);
				Foxtrick.startListenToChange(doc);
			}, { teamId: teamId, currentSquad: true, isYouth: isYouth });
		};

		addByTeamId(homeTeamId, homePlayerLinks);
		addByTeamId(awayTeamId, awayPlayerLinks);
	},
	runMissing: function(doc) {
		if (!Foxtrick.Pages.Match.getHomeTeam(doc))
			return; // we're not ready yet

		if (doc.getElementsByClassName('ft-playerMissing').length)
			return;

		var homeTeamId = Foxtrick.Pages.Match.getHomeTeamId(doc);
		var awayTeamId = Foxtrick.Pages.Match.getAwayTeamId(doc);

		//get player list sucks for nt matches
		var isNT = Foxtrick.Pages.Match.isNT(doc);
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var param = (isYouth ? 'youth' : '') + 'playerid';

		var homeQuery =
			'.playersField > div.playerBoxHome > div > a, ' +
			'#playersBench > div#playersBenchHome > div.playerBoxHome > div > a';
		var homePlayerLinks = doc.querySelectorAll(homeQuery);

		var awayQuery =
			'.playersField > div.playerBoxAway > div > a, #playersBench > ' +
			'div#playersBenchAway > div.playerBoxAway > div > a';
		var awayPlayerLinks = doc.querySelectorAll(awayQuery);

		var alt = Foxtrick.L10n.getString('MatchLineupTweaks.missing');

		var addMissingByTeamId = function(teamId, players) {
			if (teamId === null)
				return;

			Foxtrick.Pages.Players.getPlayerList(doc,
			  function(playerInfo) {
				if (!playerInfo || !playerInfo.length)
					return;

				Foxtrick.stopListenToChange(doc);
				var missing = [];
				for (var i = 0; i < players.length; i++) {
					var id = Math.abs(Foxtrick.getParameterFromUrl(players[i].href, param));
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerInfo, id);
					if (!player)
						missing.push(i);
				}
				if (missing.length) {
					for (var j = 0; j < missing.length; ++j) {
						var playerDiv = players[missing[j]].parentNode.parentNode;
						var ftDiv = playerDiv.getElementsByClassName('ft-indicator-wrapper')[0];
						var missingDiv = doc.createElement('div');
						Foxtrick.addClass(missingDiv, 'ft-playerMissing ft-indicator');
						Foxtrick.addImage(doc, missingDiv, {
							alt: alt,
							title: alt,
							src: Foxtrick.InternalPath + 'resources/img/matches/missing.png',
						});
						ftDiv.appendChild(missingDiv);
					}
				}
				Foxtrick.startListenToChange(doc);
			}, { teamId: teamId, currentSquad: true, isNT: isNT, isYouth: isYouth });
		};

		addMissingByTeamId(homeTeamId, homePlayerLinks);
		addMissingByTeamId(awayTeamId, awayPlayerLinks);
	},
	runFaces: function(doc) {
		if (!Foxtrick.Pages.Match.getHomeTeam(doc))
			return; // we're not ready yet

		var homeTeamId = Foxtrick.Pages.Match.getHomeTeamId(doc);
		var awayTeamId = Foxtrick.Pages.Match.getAwayTeamId(doc);
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var param = (isYouth ? 'youth' : '') + 'playerid';

		var ownTeamId = isYouth ? Foxtrick.util.id.getOwnYouthTeamId() :
			Foxtrick.util.id.getOwnTeamId();

		var homeQuery =
			'.playersField > div.playerBoxHome > div > a, ' +
			'#playersBench > div#playersBenchHome > div.playerBoxHome > div > a';
		var homePlayerLinks = doc.querySelectorAll(homeQuery);

		var awayQuery =
			'.playersField > div.playerBoxAway > div > a, #playersBench > ' +
			'div#playersBenchAway > div.playerBoxAway > div > a';
		var awayPlayerLinks = doc.querySelectorAll(awayQuery);

		var addFace = function(fieldplayer, id, avatarsXml) {
			if (avatarsXml) {
				if (!id)
					return;
				var elName = (isYouth ? 'Youth' : '') + 'Player';
				var players = avatarsXml.getElementsByTagName(elName);
				for (var i = 0; i < players.length; ++i) {
					if (id === avatarsXml.num(elName + 'ID', players[i]))
						break;
				}
				if (i == players.length)
					return; // id not found

				Foxtrick.addClass(fieldplayer, 'smallFaceCardBox');

				var shirt = fieldplayer.getElementsByClassName('sectorShirt')[0];
				if (Foxtrick.hasClass(shirt, 'ft-smallFaceCard'))
					return;

				Foxtrick.addClass(shirt, 'ft-smallFaceCard');
				var scale = 3;
				Foxtrick.Pages.Match.makeAvatar(shirt, players[i], scale);
			}
		};

		var addFacesByTeamId = function(teamId, players) {
			if (teamId === null)
				return;

			var avartarArgs = [
				['file', (isYouth ? 'youth' : '') + 'avatars'],
				['version', '1.1'],
				[(isYouth ? 'youthT' : 't') + 'eamId', teamId],
			];
			// youthavatars only works for own team
			if (isYouth && teamId != ownTeamId)
				return;
			Foxtrick.util.api.retrieve(doc, avartarArgs, { cache_lifetime: 'session' },
			  function(xml, errorText) {
				if (!xml || errorText) {
					Foxtrick.log(errorText);
					return;
				}
				Foxtrick.stopListenToChange(doc);
				for (var i = 0; i < players.length; i++) {
					var id = Math.abs(Foxtrick.getParameterFromUrl(players[i].href, param));
					addFace(players[i].parentNode.parentNode, id, xml);
				}
				Foxtrick.startListenToChange(doc);
			});
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
			var ratingQuery = '.playersField > .playerBox' + where + ' > .playerRating';
			var ratings = doc.querySelectorAll(ratingQuery);
			for (var i = 0; i < ratings.length; i++) {
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

		var displayHome = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(displayHome, 'ft-match-lineup-tweaks-star-counter');
		displayHome.appendChild(doc.createElement('span'));

		var displayAway = displayHome.cloneNode(true);
		var displayDiff = displayHome.cloneNode(true);

		//U+2211 is sum symbol, U+0394 is mathematical delta, U+2605 is star
		displayHome.getElementsByTagName('span')[0].textContent =
			'\u2211 ' + starsHome + '\u2605';
		displayAway.getElementsByTagName('span')[0].textContent =
			'\u2211 ' + starsAway + '\u2605';
		displayDiff.getElementsByTagName('span')[0].textContent =
			'\u0394 ' + Math.abs(starsHome - starsAway) + '\u2605';

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

			var getStaminaFromNode = function(node) {
				var parent = node.getElementsByClassName('sectorShirt')[0].nextSibling;
				var child = parent.firstChild;
				if (!child) {
					// probably old match like 177995984#
					return 0;
				}

				var staminaTitle = child.title;
				var stamina = staminaTitle.match(/\d+/);
				return parseInt(stamina, 10);
			};

			var items = doc.querySelectorAll('.playersField > .playerBox' + where);
			fieldPlayerCount = items.length; //needed for determining the average later on

			for (var i = 0; i < items.length; i++) {
				stamina += getStaminaFromNode(items[i]);
			}
			return parseInt(stamina / fieldPlayerCount, 10);
		};

		if (!doc.querySelectorAll('.playersField > .playerBoxHome').length)
			return; // we're not ready yet

		var staminaHome = getStaminaAverage(doc, 'Home');
		var staminaAway = getStaminaAverage(doc, 'Away');

		var displayHome = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(displayHome, 'ft-match-lineup-tweaks-stamina-counter');
		displayHome.appendChild(doc.createElement('span'));

		var displayAway = displayHome.cloneNode(true);
		var displayDiff = displayHome.cloneNode(true);

		//U+2211 is sum symbol, U+0394 is mathematical delta
		displayHome.getElementsByTagName('span')[0].textContent = '\u00D8 ' + staminaHome + ' %';
		displayAway.getElementsByTagName('span')[0].textContent = '\u00D8 ' + staminaAway + ' %';
		displayDiff.getElementsByTagName('span')[0].textContent = '\u0394 ' +
			parseInt(Math.abs(staminaHome - staminaAway), 10) + ' %';

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

		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var param = (isYouth ? 'youth' : '') + 'playerid';

		var isHome = Foxtrick.hasClass(info, 'highlightHome');

		var playerQuery =
			'.playersField > div.playerBox' + (isHome ? 'Home' : 'Away') + ' > div > a, ' +
			'#playersBench' + (isHome ? 'Home' : 'Away') +
			' > div.playerBox' + (isHome ? 'Home' : 'Away') + ' > div > a';

		var playerLinks = doc.querySelectorAll(playerQuery);

		var highlightPlayer = function(playerId) {
			Foxtrick.Pages.Match.modPlayerDiv(playerId, function(node) {
				if (node.parentNode.id == 'playersField')
					Foxtrick.addClass(node, 'ft-highlight-playerDiv-field');
				else
					Foxtrick.addClass(node, 'ft-highlight-playerDiv-bench');
			}, playerLinks);
		};

		for (var i = 0; i < players.length; i++) {
			var player = Math.abs(Foxtrick.getParameterFromUrl(players[i].href, param));
			highlightPlayer(player);
		}

	},
	// change the number-star display into real stars
	convertStars: function(doc) {
		var color = Foxtrick.Pages.Match.isYouth(doc) ? '_blue' : '';
		var ratings = doc.querySelectorAll('div.playerRating > span');
		for (var i = 0; i < ratings.length; i++) {
			var ratingsDiv = ratings[i].parentNode;
			var count = Number(ratings[i].textContent);
			var newDiv = ratingsDiv.cloneNode(false);
			Foxtrick.makeFeaturedElement(newDiv, this);
			// weirdest bug ever: title too short
			newDiv.title = count + '\u2605    ';
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
					src: Foxtrick.InternalPath + 'resources/img/matches/5stars' + color + '.png',
					alt: '5*'
				});
				newDiv.appendChild(star5container);
			}
			for (var k = 0; k < stars2; k++) {
				Foxtrick.addImage(doc, smallDiv, {
					src: Foxtrick.InternalPath + 'resources/img/matches/2stars' + color + '.png',
					alt: '2*'
				});
			}
			newDiv.appendChild(smallDiv);
			if (count) {
				// 4.5 stars is a pain in the ass
				var target;
				if (count == 0.5 && smallDiv.childNodes.length == 2) {
					// 4.5
					target = newDiv;
				}
				else
					target = smallDiv;
				Foxtrick.addImage(doc, target, {
					src: Foxtrick.InternalPath + 'resources/img/matches/' + count + 'stars' +
						color + '.png',
					alt: count + '*'
				});
			}

			ratingsDiv.parentNode.replaceChild(newDiv, ratingsDiv);
		}
	},
	// which team to show in split
	showAway: false,
	// split lineup into two for home/away
	splitLineup: function(doc) {
		if (!Foxtrick.Pages.Match.hasRatingsTabs(doc))
			return;

		this.hideOtherTeam(doc);
		// that one started: stop again
		//Foxtrick.stopListenToChange(doc);
		var awayDivs = doc.querySelectorAll('div.playerBoxAway');
		for (var i = 0; i < awayDivs.length; i++) {
			awayDivs[i].style.top = (Number(awayDivs[i].style.top.match(/-?\d+/)) - 240) + 'px';
		}
		var f = doc.getElementById('playersField');
		var div = doc.createElement('div');
		div.id = 'ft-split-arrow-div';
		var alt = Foxtrick.L10n.getString('MatchLineupTweaks.showOther');
		Foxtrick.addImage(doc, div, {
			src: '/Img/Icons/transparent.gif',
			id: 'ft-split-arrow',
			title: alt,
			alt: alt,
		});
		Foxtrick.onClick(div, (function(module) {
			return function() {
				Foxtrick.stopListenToChange(doc);
				module.showAway = !module.showAway;
				module.hideOtherTeam(doc);
				Foxtrick.startListenToChange(doc);
			};
		})(this));
		f.appendChild(div);
	},
	joinLineup: function(doc) {
		this.hideOtherTeam(doc, true); // undo
		var awayDivs = doc.querySelectorAll('div.playerBoxAway');
		for (var i = 0; i < awayDivs.length; i++) {
			awayDivs[i].style.top = (Number(awayDivs[i].style.top.match(/-?\d+/)) + 240) + 'px';
		}
		var div = doc.getElementById('ft-split-arrow-div');
		div.parentNode.removeChild(div);
	},
	hideOtherTeam: function(doc, undo) {
		var hideDivs = doc.querySelectorAll('div.playerBox' + (this.showAway ? 'Home' : 'Away'));
		for (var i = 0; i < hideDivs.length; i++) {
			if (undo)
				Foxtrick.removeClass(hideDivs[i], 'hidden');
			else
				Foxtrick.addClass(hideDivs[i], 'hidden');
		}
		var showDivs = doc.querySelectorAll('div.playerBox' + (this.showAway ? 'Away' : 'Home'));
		for (var j = 0; j < showDivs.length; j++) {
			Foxtrick.removeClass(showDivs[j], 'hidden');
		}
		var f = doc.getElementById('playersField');
		if (undo)
			Foxtrick.removeClass(f, 'ft-field-split');
		else
			Foxtrick.addClass(f, 'ft-field-split');
		if (this.showAway && !undo)
			Foxtrick.addClass(f, 'ft-field-away');
		else
			Foxtrick.removeClass(f, 'ft-field-away');
	},
	/**
	 * Gather stamina data to be used for match-simulator and player table
	 * @param {document} doc
	 */
	gatherStaminaData: function(doc) {
		if (Foxtrick.Pages.Match.isYouth(doc))
			return;

		if (Foxtrick.Pages.Match.getLiveContainer(doc))
			return;

		var team = 'away';
		var ownId = Foxtrick.util.id.getOwnTeamId();
		// only gather data for own team
		var homeId = Foxtrick.Pages.Match.getHomeTeamId(doc);
		var awayId = Foxtrick.Pages.Match.getAwayTeamId(doc);
		if (homeId == ownId)
			team = 'home';
		else if (awayId != ownId)
			return;

		var data = {}, dataText = Foxtrick.Prefs.getString('StaminaData.' + ownId);
		if (dataText) {
			try {
				data = JSON.parse(dataText);
			}
			catch (e) {
				Foxtrick.log('Error parsing StaminaData, data will be reset', e);
			}
		}

		var matchDate = Foxtrick.Pages.Match.getDate(doc);
		var players = this.getPlayersWithStamina(doc, team);

		Foxtrick.map(function(player) {
			if (player.stamina) {
				if (!data.hasOwnProperty(player.PlayerId))
					data[player.PlayerId] = [];

				if (data[player.PlayerId].length &&
					data[player.PlayerId][0] >= matchDate.valueOf())
					// we have more recent data
					return;

				data[player.PlayerId][0] = matchDate.valueOf();
				data[player.PlayerId][1] = player.stamina;
			}
		}, players);

		Foxtrick.log('StaminaData:', matchDate, players, data);
		Foxtrick.Prefs.setString('StaminaData.' + ownId, JSON.stringify(data));
	},

	getPlayersWithStamina: function(doc, team) {
		var EMPTY = [];
		if (Foxtrick.Pages.Match.isYouth(doc))
			return EMPTY;

		var isHome = team == 'home';

		/* jshint ignore:start */
		var getStamina = function(lastEnergy, checkpoints, isRested) {
			// these formulas are derrived from the formula used in match-simulator
			// currently they seem to have low accuracy :(
			// UNUSED!!!
			var getLowStamina = function(lastEnergy, checkpoints, rest) {
				return (lastEnergy - 1.05 - rest + checkpoints * 0.0634) /
					(0.0292 + checkpoints * 0.0039);
			};
			var getWeirdStamina = function(lastEnergy, checkpoints, rest) {
				return (lastEnergy - 1.05 - rest + checkpoints * 0.0325) / 0.0292;
			};
			var getHighStamina = function(lastEnergy, checkpoints, rest) {
				return (lastEnergy + 0.15 - rest + checkpoints * 0.0325) / 0.1792;
			};
			var rest = isRested ? 0.1875 : 0;
			var stamina = getHighStamina(lastEnergy, checkpoints, rest);
			if (stamina < 8) {
				stamina = getLowStamina(lastEnergy, checkpoints, rest);
				if (stamina >= 7.923)
					stamina = getWeirdStamina(lastEnergy, checkpoints, rest);
			}
			return stamina;
		};
		var hasRest = function(from, to) {
			return from < 45 && to > 45;
		};
		/* jshint ignore:end */

		var getCheckpointCount = function(from, to) {
			var ct = Foxtrick.Math.div(to - 1, 5) - Foxtrick.Math.div(from - 1, 5) +
				(from > 0 ? 0 : 1) - (to > 0 ? 0 : 1);
			return ct;
		};
		var findEvent = function(minute) {
			for (var i = 0, event; i < timeline.length && (event = timeline[i]); ++i) {
				if (event.min == minute)
					return i;
			}
			return null;
		};

		var timeline = Foxtrick.Pages.Match.getTimeline(doc);
		var playerRatings = Foxtrick.Pages.Match.getTeamRatingsByEvent(doc, isHome);

		if (!playerRatings.length) {
			// most likely WO, or match in progress
			// abort
			return EMPTY;
		}
		// info for CHPP
		var SourceSystem = Foxtrick.Pages.Match.getSourceSystem(doc);
		// var matchId = Foxtrick.Pages.Match.getId(doc);
		// add locale as argument to prevent using old cache after
		// language changed
		// var locale = Foxtrick.Prefs.getString('htLanguage');
		// var detailsArgs = [
		// 	['file', 'matchdetails'],
		// 	['matchEvents', 'true'],
		// 	['matchId', matchId],
		// 	['sourceSystem', SourceSystem],
		// 	['version', '2.3'],
		// 	['lang', locale]
		// ];
		if (SourceSystem == 'HTOIntegrated') {
			// need to parse player data and change PlayerIds to HT Ids
			var HTOPlayers = Foxtrick.Pages.Match.parsePlayerData(doc);

			if (!HTOPlayers) {
				Foxtrick.log('gatherStaminaData: failed to parse playerData');
				return EMPTY;
			}
		}

		var table = Foxtrick.Pages.Match.getRatingsTable(doc);
		var teamNr = Number(!isHome);
		var tactics = Foxtrick.Pages.Match.getTacticsByTeam(table).tactics[teamNr];
		// don't parse pressing: affects stamina
		if (tactics == 'pressing')
			return EMPTY;

		var affectedPlayerID = '0';
		var events = doc.getElementsByClassName('matchevent');
		// should not be more than one SE with same type
		Foxtrick.any(function(evt) {
			var evtType = parseInt(evt.dataset.eventtype, 10);
			// powerfull suffers in sun (loses stamina)
			if (evtType == 304) {
				var playerLink = evt.getElementsByTagName('a')[0];
				affectedPlayerID = Foxtrick.getParameterFromUrl(playerLink.href, 'playerId');
				return true;
			}
			return false;
		}, events);

		var players = Foxtrick.filter(function(player, i) {
			// need to parse player data and change PlayerIds to HT Ids
			if (typeof HTOPlayers != 'undefined') {
				Foxtrick.any(function(HTOPlayer) {
					if (HTOPlayer.PlayerId == player.PlayerId) {
						player.PlayerId = HTOPlayer.SourcePlayerId;
						return true;
					}
					return false;
				}, HTOPlayers);
			}

			// disregard extra time data
			if (player.ToMin > 90)
				player.ToMin = 90;

			player.ftIdx = i;
			// skip those who didn't play or had negative powerful SE
			return player.ToMin > 0 && player.PlayerId != affectedPlayerID;
		}, playerRatings[0].players);

		Foxtrick.forEach(function(player) {
			player.checkpoints = getCheckpointCount(player.FromMin, player.ToMin);
			player.lastEvent = findEvent(player.ToMin);
			player.lastEnergy = playerRatings[player.lastEvent].players[player.ftIdx].Stamina;

			//player.isRested = hasRest(player.FromMin, player.ToMin);
			//if (player.checkpoints && player.lastEnergy != 1)
			//	player.staminaSkill = getStamina(player.lastEnergy, player.checkpoints,
			//									 player.isRested);
			//else if (player.checkpoints == 18)
			//	player.staminaSkill = 8.7;

			if (player.checkpoints == 18) {
				if (player.lastEnergy != 1)
					player.stamina = Foxtrick.Predict.stamina(player.lastEnergy).toFixed(2);
				else
					player.stamina = '8.63+';
			}
		}, players);
		return players;
	},

	flipStaminaBar: function(doc, playerDivs) {
		var module = this;
		var homePlayers = module.getPlayersWithStamina(doc, 'home');
		var awayPlayers = module.getPlayersWithStamina(doc, 'away');
		var players = Foxtrick.concat(homePlayers, awayPlayers);
		var playersById = {};
		Foxtrick.forEach(function(p) {
			playersById[p.PlayerId] = p;
		}, players);

		Foxtrick.forEach(function(playerDiv) {
			var ftdiv = Foxtrick.createFeaturedElement(doc, module, 'div');
			Foxtrick.addClass(ftdiv, 'ft-indicator-wrapper');
			var staminaDiv = playerDiv.querySelector('div.sectorShirt + div > div');
			Foxtrick.addClass(staminaDiv, 'ft-staminaDiv');
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

				var staminaText = staminaDiv.title;
				var link = playerDiv.querySelector('#playerLink');
				if (link) {
					var id = Foxtrick.getParameterFromUrl(link.href, 'PlayerId');
					var player = playersById[id];
					if (player && player.stamina)
						staminaText += Foxtrick.format(' ({})', [player.stamina]);
				}
				staminaSpan.title = staminaText;
				ftdiv.appendChild(staminaSpan);
			}
			playerDiv.appendChild(ftdiv);
		}, playerDivs);
	},

	onChange: function(doc) {
		if (!Foxtrick.Pages.Match.hasRatingsTabs(doc))
			return;

		var isYouth = Foxtrick.Pages.Match.isYouth(doc);

		Foxtrick.stopListenToChange(doc);

		this.addSplitLineupToggle(doc);
		var playerDivs = doc.querySelectorAll('div.playerDiv');
		if (playerDivs.length &&
		    playerDivs[0].getElementsByClassName('ft-indicator-wrapper').length)
			// been here before
			return;

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'SplitLineup'))
			this.splitLineup(doc);

		this.flipStaminaBar(doc, playerDivs);

		// add ft-stars="N" to ratings spans for possible styling
		var ratings = doc.querySelectorAll('div.playerRating > span');
		for (var j = 0; j < ratings.length; j++) {
			var count = Number(ratings[j].textContent);
			ratings[j].setAttribute('ft-stars', count);
		}

		var hId = doc.location.search.match(/HighlightPlayerID=(\d+)/i);
		if (hId) {
			var playerQuery =
				'.playersField > div.playerBoxHome > div > a, ' +
				'#playersBench > div#playersBenchHome > div.playerBoxHome > div > a,' +
				'.playersField > div.playerBoxAway > div > a, ' +
				'#playersBench > div#playersBenchAway > div.playerBoxAway > div > a';

			var playerLinks = doc.querySelectorAll(playerQuery);
			var highlightPlayer = function(playerId) {
				var link = Foxtrick.filter(function(link) {
					return new RegExp(playerId).test(link.href);
				}, playerLinks)[0];
				if (link)
					Foxtrick.addClass(link.parentNode.parentNode, 'ft-highlight-playerDiv-url');
			};
			highlightPlayer(hId[1]);
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'DisplayTeamNameOnField'))
			this.runTeamnNames(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'HighlighEventPlayers'))
			this.runEventPlayers(doc);
		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'AddSubstiutionInfo'))
			this.addSubInfo(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'StarCounter'))
			this.runStars(doc);
		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'StaminaCounter') &&
		    !isYouth)
			this.runStamina(doc);
		// run this after the counters
		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'ConvertStars'))
			this.convertStars(doc);


		Foxtrick.startListenToChange(doc);

		//add async shit last
		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'ShowNumbers'))
			this.runNumbers(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'ShowSpecialties'))
			this.runSpecialties(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'ShowFaces'))
			this.runFaces(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'HighlightMissing'))
			this.runMissing(doc);

	}
};
