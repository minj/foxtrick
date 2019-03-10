/**
 * match-lineup-tweaks.js
 * Tweaks for the new style match lineup
 * @author CatzHoek, LA-MJ
 */

'use strict';

Foxtrick.modules['MatchLineupTweaks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match', 'matchesLive'],
	OPTIONS: [
		'DisplayTeamNameOnField', 'ShowSpecialties',
		'ConvertStars',
		['SplitLineup', 'InvertSplit'],
		'ShowFaces', 'StarCounter', 'StaminaCounter', 'HighlighEventPlayers',
		'AddSubstiutionInfo',
		'HighlightMissing',
		'GatherStaminaData',
	],
	OPTIONS_CSS: [
		null, null,
		Foxtrick.InternalPath + 'resources/css/match-lineup-convert-stars.css',
		null,
	],
	CSS: Foxtrick.InternalPath + 'resources/css/match-lineup-tweaks.css',
	run: function(doc) {
		this.showAway = false; // FIXME: remove when FF back-end is changed

		// run change now as sometimes we are too slow to init the listener
		// causing display to be broken on first load
		this.registerListener(doc);

		if (!Foxtrick.Pages.Match.hasRatingsTabs(doc))
			return;

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'GatherStaminaData'))
			this.gatherStaminaData(doc);
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

		var change = function(doc) {
			// do the actual stuff
			module.onChange(doc);
		};
		Foxtrick.Pages.Match.addLiveTabListener(doc, 'playersField', change);
	},

	/**
	 * @param {document} doc
	 */
	addSplitLineupToggle: function(doc) {
		const module = this;
		const SPLIT_OPT = 'SplitLineup';
		const SPLIT_OPT_FULL = `${module.MODULE_NAME}.${SPLIT_OPT}`;
		const SPLIT_TOGGLE_ID = 'ft-split-lineup-toggle';
		if (doc.getElementById(SPLIT_TOGGLE_ID)) {
			// already done
			return;
		}

		const isYouth = Foxtrick.Pages.Match.isYouth(doc);

		const teamId = isYouth
			? Foxtrick.util.id.getYouthTeamIdFromUrl(doc.location.href)
			: Foxtrick.util.id.getTeamIdFromUrl(doc.location.href);

		if (teamId) {
			let awayId = Foxtrick.Pages.Match.getAwayTeamId(doc);
			if (awayId == teamId)
				module.showAway = true;
		}

		var toggleDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
		toggleDiv.id = 'ft-split-lineup-toggle-div';

		let toggle = doc.createElement('input');
		toggle.type = 'checkbox';
		toggle.id = SPLIT_TOGGLE_ID;
		toggle.checked = Foxtrick.Prefs.isModuleOptionEnabled(module, SPLIT_OPT);
		toggleDiv.appendChild(toggle);

		Foxtrick.onClick(toggle, function() {
			// eslint-disable-next-line no-invalid-this
			let doSplit = this.checked;

			Foxtrick.Prefs.setModuleEnableState(SPLIT_OPT_FULL, doSplit);

			// eslint-disable-next-line no-invalid-this
			let doc = this.ownerDocument;
			if (doSplit)
				module.splitLineup(doc);
			else
				module.joinLineup(doc);
		});

		let togLabel = doc.createElement('label');
		togLabel.setAttribute('for', 'ft-split-lineup-toggle');
		togLabel.textContent = Foxtrick.L10n.getString(`module.${SPLIT_OPT_FULL}.desc`);
		toggleDiv.appendChild(togLabel);

		let entry = doc.querySelector('#divPlayers h4');
		entry.parentNode.replaceChild(toggleDiv, entry);
	},

	/**
	 * add substition icon for players on the field
	 * that are involved in substitutions
	 * with alt/title text for minute data
	 *
	 * @param {document} doc
	 */
	addSubInfo: function(doc) {
		const module = this;

		/** @type {NodeListOf<HTMLTableCellElement>} */
		const subCells = doc.querySelectorAll('.highlightMovements, .highlightCards');
		if (!subCells.length)
			return;

		if (doc.getElementsByClassName('ft-indicator-sub').length)
			return;

		const isYouth = Foxtrick.Pages.Match.isYouth(doc);
		const idParam = (isYouth ? 'youth' : '') + 'playerid';

		const playerQuery =
			'.playersField > div.playerBoxHome > div > a, ' +
			'#playersBench > div#playersBenchHome > div.playerBoxHome > div > a,' +
			'.playersField > div.playerBoxAway > div > a, ' +
			'#playersBench > div#playersBenchAway > div.playerBoxAway > div > a';

		const playerLinks = doc.querySelectorAll(playerQuery);

		// will be used to regex on image.src
		const SUBSTITUTION_TYPES = {
			SUB: 'substitution|red', // treat red card as sub
			FORMATION: 'formation', // formation change: might be sub or behavior
			BEHAVIOR: 'behavior', // might be sub as well
			SWAP: 'swap',
			YELLOW: 'yellow', // skipped
		};
		const SUB_IMAGES = {
			[SUBSTITUTION_TYPES.SUB]: 'images/substitution.png',
			[SUBSTITUTION_TYPES.BEHAVIOR]:
				Foxtrick.InternalPath + 'resources/img/matches/behavior.png',
			[SUBSTITUTION_TYPES.SWAP]:
				Foxtrick.InternalPath + 'resources/img/matches/swap.png',
		};

		const SUB_TEXTS = {
			[SUBSTITUTION_TYPES.SUB]: [
				Foxtrick.L10n.getString('MatchLineupTweaks.out'),
				Foxtrick.L10n.getString('MatchLineupTweaks.in'),
			],
			[SUBSTITUTION_TYPES.BEHAVIOR]: Foxtrick.L10n.getString('MatchLineupTweaks.behavior'),
			[SUBSTITUTION_TYPES.SWAP]: Foxtrick.L10n.getString('MatchLineupTweaks.swap'),
		};

		var highlightSub = function(otherId) {
			Foxtrick.Pages.Match.modPlayerDiv(otherId, function(node) {
				// yellow on field, red on bench
				const className = node.parentNode.id == 'playersField'
					? 'ft-highlight-playerDiv-field'
					: 'ft-highlight-playerDiv-bench';

				Foxtrick.toggleClass(node, className);
			}, playerLinks);
		};

		var addSubDiv = function(id, min, type, isOut, otherId) {
			var t = type;
			if (t == SUBSTITUTION_TYPES.YELLOW)
				return;

			if (t == SUBSTITUTION_TYPES.BEHAVIOR && otherId) {
				// sub with behavior change only
				t = SUBSTITUTION_TYPES.SUB;
			}
			if (t == SUBSTITUTION_TYPES.FORMATION) {
				// special case: formation change
				t = otherId ? SUBSTITUTION_TYPES.SUB : SUBSTITUTION_TYPES.BEHAVIOR;
			}

			let rawText, subDef = SUB_TEXTS[t];
			if (Array.isArray(subDef)) {
				// different texts for sbjPlayer & objPlayer, i. e. sub
				rawText = subDef[Number(!isOut)];
			}
			else {
				rawText = subDef;
			}

			var subText = rawText.replace(/%s/, min);
			var iconSrc = SUB_IMAGES[t];

			Foxtrick.Pages.Match.modPlayerDiv(id, function(node) {
				// HTs don't seem to appreciate class names here
				// this is bound to break easily
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

				let target = node.getElementsByClassName('ft-indicator-wrapper')[0];
				target.appendChild(subDiv);
			}, playerLinks);
		};

		Foxtrick.forEach(function(playerCell) {
			// eslint-disable-next-line no-extra-parens
			let row = /** @type {HTMLTableRowElement} */ (playerCell.parentNode);
			let typeCell = row.cells[0];
			let timeCell = row.cells[2];

			var [time] = timeCell.textContent.match(/\d+/);
			var type = '';

			let typeImage = typeCell.querySelector('img');
			let typeIcon = typeCell.querySelector('i[class^="icon-"]');
			if (typeImage) {
				for (let t in SUBSTITUTION_TYPES) {
					if (new RegExp(SUBSTITUTION_TYPES[t], 'i').test(typeImage.src)) {
						type = SUBSTITUTION_TYPES[t];
						break;
					}
				}
			}
			else if (typeIcon) {
				let className = typeIcon.className.replace(/^icon-/, '');
				for (let t in SUBSTITUTION_TYPES) {
					if (new RegExp(SUBSTITUTION_TYPES[t], 'i').test(className)) {
						type = SUBSTITUTION_TYPES[t];
						break;
					}
				}
			}

			if (!type) {
				Foxtrick.log('AddSubInfo: sub type unsupported!', typeImage.src);
				return;
			}

			let pLinks = [...playerCell.querySelectorAll('a')];
			let pIds = pLinks.map((l) => {
				let param = Foxtrick.getUrlParam(l.href, idParam);
				return Math.abs(parseInt(param, 10));
			});
			if (!pIds.length) {
				// neighborhood kids
				return;
			}

			let isSubject = true, [sbjPid, objPid] = pIds;
			addSubDiv(sbjPid, time, type, isSubject, objPid || 0);

			isSubject = false;
			if (objPid)
				addSubDiv(objPid, time, type, isSubject, sbjPid);

		}, subCells);

	},

	// adds teamsnames to the field for less confusion
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

	/**
	 * adds apecialty icons for all players, on field and on bench
	 *
	 * @param {document} doc
	 */
	runSpecialties: function(doc) {
		if (!Foxtrick.Pages.Match.getHomeTeam(doc))
			return; // we're not ready yet

		var homeTeamId = Foxtrick.Pages.Match.getHomeTeamId(doc);
		var awayTeamId = Foxtrick.Pages.Match.getAwayTeamId(doc);
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var idParam = (isYouth ? 'youth' : '') + 'playerid';

		var homeQuery =
			'.playersField > div.playerBoxHome > div > a, ' +
			'#playersBench > div#playersBenchHome > div.playerBoxHome > div > a';

		/** @type {NodeListOf<HTMLAnchorElement>} */
		var homePlayerLinks = doc.querySelectorAll(homeQuery);

		var awayQuery =
			'.playersField > div.playerBoxAway > div > a, #playersBench > ' +
			'div#playersBenchAway > div.playerBoxAway > div > a';

		/** @type {NodeListOf<HTMLAnchorElement>} */
		var awayPlayerLinks = doc.querySelectorAll(awayQuery);

		var addSpecialty = function(node, player) {
			if (node.getElementsByClassName('ft-specialty').length)
				return;
			if (player && player.specialtyNumber) {
				var specIdx = player.specialtyNumber;
				var opts = { class: 'ft-specialty ft-match-lineup-tweaks-specialty-icon' };
				Foxtrick.addSpecialty(node, specIdx, opts);
			}
		};

		/**
		 * @param {number} teamId
		 * @param {NodeListOf<HTMLAnchorElement>} pLinks
		 */
		var addSpecialtiesByTeamId = function(teamId, pLinks) {
			if (teamId === null)
				return;

			Foxtrick.Pages.Players.getPlayerList(doc, (pInfo) => {
				if (!pInfo || !pInfo.length)
					return;

				Foxtrick.stopListenToChange(doc);

				var missing = [];
				for (let [i, pL] of [...pLinks].entries()) {
					let param = Foxtrick.getUrlParam(pL.href, idParam);
					let id = Math.abs(parseInt(param, 10));
					let player = Foxtrick.Pages.Players.getPlayerFromListById(pInfo, id);
					let node = pL.parentNode.parentNode.querySelector('.ft-indicator-wrapper');

					if (player)
						addSpecialty(node, player);
					else
						missing.push({ id: id, i: i });
				}

				Foxtrick.startListenToChange(doc);

				if (!missing.length)
					return;

				var makeCallback = m => (player) => {
					if (!player)
						return;

					Foxtrick.stopListenToChange(doc);

					let pL = pLinks[m.i];
					let node = pL.parentNode.parentNode.querySelector('.ft-indicator-wrapper');
					addSpecialty(node, player);

					Foxtrick.startListenToChange(doc);
				};

				for (let m of missing)
					Foxtrick.Pages.Player.getPlayer(doc, m.id, makeCallback(m));

			}, { teamId: teamId, currentSquad: true, isYouth: isYouth });
		};

		addSpecialtiesByTeamId(homeTeamId, homePlayerLinks);
		addSpecialtiesByTeamId(awayTeamId, awayPlayerLinks);
	},
	runMissing: function(doc) {
		if (!Foxtrick.Pages.Match.getHomeTeam(doc))
			return; // we're not ready yet

		if (doc.getElementsByClassName('ft-playerMissing').length)
			return;

		var homeTeamId = Foxtrick.Pages.Match.getHomeTeamId(doc);
		var awayTeamId = Foxtrick.Pages.Match.getAwayTeamId(doc);

		// get player list sucks for nt matches
		var isNT = Foxtrick.Pages.Match.isNT(doc);
		var isYouth = Foxtrick.Pages.Match.isYouth(doc);
		var idParam = (isYouth ? 'youth' : '') + 'playerid';

		var homeQuery =
			'.playersField > div.playerBoxHome > div > a, ' +
			'#playersBench > div#playersBenchHome > div.playerBoxHome > div > a';
		var homePlayerLinks = doc.querySelectorAll(homeQuery);

		var awayQuery =
			'.playersField > div.playerBoxAway > div > a, #playersBench > ' +
			'div#playersBenchAway > div.playerBoxAway > div > a';
		var awayPlayerLinks = doc.querySelectorAll(awayQuery);

		var alt = Foxtrick.L10n.getString('MatchLineupTweaks.missing');

		/**
		 * @param {number} teamId
		 * @param {HTMLAnchorElement[]} pLinks
		 */
		var addMissingByTeamId = function(teamId, pLinks) {
			if (teamId === null)
				return;

			Foxtrick.Pages.Players.getPlayerList(doc, (playerInfo) => {
				if (!playerInfo || !playerInfo.length)
					return;

				Foxtrick.stopListenToChange(doc);
				var missing = [];
				for (let [i, pL] of [...pLinks].entries()) {
					let param = Foxtrick.getUrlParam(pL.href, idParam);
					let id = Math.abs(parseInt(param, 10));
					let player = Foxtrick.Pages.Players.getPlayerFromListById(playerInfo, id);
					if (!player)
						missing.push(i);
				}
				if (missing.length) {
					for (let msIdx of missing) {
						let playerDiv = pLinks[msIdx].parentNode.parentNode;
						let ftDiv = playerDiv.querySelector('.ft-indicator-wrapper');
						let missingDiv = doc.createElement('div');
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
		var idParam = (isYouth ? 'youth' : '') + 'playerid';

		var ownTeamId = isYouth
			? Foxtrick.util.id.getOwnYouthTeamId()
			: Foxtrick.util.id.getOwnTeamId();

		var homeQuery =
			'.playersField > div.playerBoxHome > div > a, ' +
			'#playersBench > div#playersBenchHome > div.playerBoxHome > div > a';
		var homePlayerLinks = doc.querySelectorAll(homeQuery);

		var awayQuery =
			'.playersField > div.playerBoxAway > div > a, #playersBench > ' +
			'div#playersBenchAway > div.playerBoxAway > div > a';
		var awayPlayerLinks = doc.querySelectorAll(awayQuery);

		var addFace = function(fieldPlayer, id, avatarsXml) {
			if (!avatarsXml)
				return;

			if (!id)
				return;

			const SCALE = 3;
			const elName = (isYouth ? 'Youth' : '') + 'Player';
			const xmlPlayers = avatarsXml.getElementsByTagName(elName);

			var player;
			for (let xmlPlayer of xmlPlayers) {
				if (id === avatarsXml.num(`${elName}ID`, xmlPlayer)) {
					player = xmlPlayer;
					break;
				}
			}

			if (!player)
				return; // id not found

			Foxtrick.addClass(fieldPlayer, 'smallFaceCardBox');

			let shirt = fieldPlayer.querySelector('.sectorShirt');
			if (Foxtrick.hasClass(shirt, 'ft-smallFaceCard'))
				return;

			Foxtrick.addClass(shirt, 'ft-smallFaceCard');

			let fragment = doc.createDocumentFragment();
			Foxtrick.Pages.Match.makeAvatar(fragment, player, SCALE);

			let numSpan = shirt.querySelector('.ft-ht-shirt-num');
			if (numSpan)
				shirt.insertBefore(fragment, numSpan);
			else
				shirt.appendChild(fragment);
		};

		/**
		 * @param {number} teamId
		 * @param {HTMLAnchorElement[]} pLinks
		 */
		var addFacesByTeamId = function(teamId, pLinks) {
			if (teamId === null)
				return;

			const OPTS = { cache_lifetime: 'session' };
			const avatarArgs = [
				['file', (isYouth ? 'youth' : '') + 'avatars'],
				['version', '1.1'],
				[(isYouth ? 'youthT' : 't') + 'eamId', teamId],
			];

			// youthavatars only works for own team
			if (isYouth && teamId != ownTeamId)
				return;

			Foxtrick.util.api.retrieve(doc, avatarArgs, OPTS, (xml, errorText) => {
				if (!xml || errorText) {
					Foxtrick.log(errorText);
					return;
				}

				Foxtrick.stopListenToChange(doc);

				for (let pL of pLinks) {
					let param = Foxtrick.getUrlParam(pL.href, idParam);
					let id = Math.abs(parseInt(param, 10));
					addFace(pL.parentNode.parentNode, id, xml);
				}

				Foxtrick.startListenToChange(doc);
			});
		};

		addFacesByTeamId(homeTeamId, homePlayerLinks);
		addFacesByTeamId(awayTeamId, awayPlayerLinks);
	},

	// adds a star summary to the page
	runStars: function(doc) {
		// get the sum of stars from all players on the 'palyersField'
		// @where: 'away' or 'home' ... that's replacing HTs classnames accordingly during lookup
		var countStars = function(doc, where) {
			let stars = 0;
			let ratingQuery = '.playersField > .playerBox' + where + ' > .playerRating';
			let ratings = doc.querySelectorAll(ratingQuery);
			for (let r of ratings)
				stars += Number(r.textContent);

			return stars;
		};

		let ratingTemplate = doc.querySelector('.playerRating');
		if (!ratingTemplate)
			return; // we're not ready yet

		if (doc.querySelector('.ft-match-lineup-tweaks-star-counter'))
			return;

		var starsContainer = doc.createDocumentFragment();

		var displayHome = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(displayHome, 'ft-match-lineup-tweaks-star-counter');
		displayHome.appendChild(doc.createElement('span'));
		starsContainer.appendChild(displayHome);
		/* eslint-disable-next-line no-extra-parens */
		var displayDiff = /** @type {HTMLElement} */ (displayHome.cloneNode(true));
		starsContainer.appendChild(displayDiff);
		/* eslint-disable-next-line no-extra-parens */
		var displayAway = /** @type {HTMLElement} */ (displayHome.cloneNode(true));
		starsContainer.appendChild(displayAway);

		let starsHome = countStars(doc, 'Home');
		let starsAway = countStars(doc, 'Away');

		// U+2211 is sum symbol, U+0394 is mathematical delta, U+2605 is star
		displayHome.querySelector('span').textContent = `\u2211 ${starsHome}\u2605`;
		displayAway.querySelector('span').textContent = `\u2211 ${starsAway}\u2605`;
		displayDiff.querySelector('span').textContent =
			`\u0394 ${Math.abs(starsHome - starsAway)}\u2605`;

		Foxtrick.addClass(displayHome, 'ft-match-lineup-tweaks-stars-counter-sum-home');
		Foxtrick.addClass(displayAway, 'ft-match-lineup-tweaks-stars-counter-sum-away');
		Foxtrick.addClass(displayDiff, 'ft-match-lineup-tweaks-stars-counter-diff');

		doc.getElementById('playersField').appendChild(starsContainer);
	},

	// adds a stamina sumary to the page
	runStamina: function(doc) {
		// @where: 'away' or 'home' ... that's replacing HTs classnames accordingly during lookup
		var getStaminaAverage = function(doc, where) {
			var getStaminaFromNode = function(node) {
				let parent = node.querySelector('.sectorShirt').nextSibling;
				let child = parent.firstChild;
				if (!child) {
					// probably old match like #177995984
					return 0;
				}

				let staminaTitle = child.title;
				let stamina = staminaTitle.match(/\d+/);
				return parseInt(stamina, 10) || 0;
			};

			let items = doc.querySelectorAll('.playersField > .playerBox' + where);
			let stamina = 0.0;
			for (let i of items)
				stamina += getStaminaFromNode(i);

			return Math.floor(stamina / items.length);
		};

		if (!doc.querySelector('.playersField > .playerBoxHome'))
			return; // we're not ready yet

		var staminaContainer = doc.createDocumentFragment();

		var staminaHome = getStaminaAverage(doc, 'Home');
		var staminaAway = getStaminaAverage(doc, 'Away');

		var displayHome = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(displayHome, 'ft-match-lineup-tweaks-stamina-counter');
		displayHome.appendChild(doc.createElement('span'));
		staminaContainer.appendChild(displayHome);

		/* eslint-disable-next-line no-extra-parens */
		var displayDiff = /** @type {HTMLElement} */ (displayHome.cloneNode(true));
		staminaContainer.appendChild(displayDiff);
		/* eslint-disable-next-line no-extra-parens */
		var displayAway = /** @type {HTMLElement} */ (displayHome.cloneNode(true));
		staminaContainer.appendChild(displayAway);

		// U+2211 is sum symbol, U+0394 is mathematical delta
		displayHome.querySelector('span').textContent = `\u00D8 ${staminaHome} %`;
		displayAway.querySelector('span').textContent = `\u00D8 ${staminaAway} %`;
		displayDiff.querySelector('span').textContent =
			`\u0394 ${Math.abs(staminaHome - staminaAway)} %`;

		Foxtrick.addClass(displayHome, 'ft-match-lineup-tweaks-stamina-counter-sum-home');
		Foxtrick.addClass(displayDiff, 'ft-match-lineup-tweaks-stamina-counter-diff');
		Foxtrick.addClass(displayAway, 'ft-match-lineup-tweaks-stamina-counter-sum-away');

		doc.getElementById('playersField').appendChild(staminaContainer);
	},

	/**
	 * @param {document} doc
	 */
	runEventPlayers: function(doc) {
		const timelineEventDetails = doc.getElementById('timelineEventDetails');
		if (!timelineEventDetails || !timelineEventDetails.childNodes.length)
			return;

		const info = timelineEventDetails.querySelector('.timelineEventDetailsInfo');
		if (!info)
			return;

		const eventPLinks = [...info.querySelectorAll('a')];
		if (!eventPLinks.length)
			return;

		const isYouth = Foxtrick.Pages.Match.isYouth(doc);
		const idParam = (isYouth ? 'youth' : '') + 'playerid';

		const isHome = Foxtrick.hasClass(info, 'highlightHome');

		const playerQuery =
			'.playersField > div.playerBox' + (isHome ? 'Home' : 'Away') + ' > div > a, ' +
			'#playersBench' + (isHome ? 'Home' : 'Away') +
			' > div.playerBox' + (isHome ? 'Home' : 'Away') + ' > div > a';

		/** @type {NodeListOf<HTMLAnchorElement>} */
		const allPLinks = doc.querySelectorAll(playerQuery);

		var highlightPlayer = function(playerId) {
			Foxtrick.Pages.Match.modPlayerDiv(playerId, function(node) {
				if (node.parentNode.id == 'playersField')
					Foxtrick.addClass(node, 'ft-highlight-playerDiv-field');
				else
					Foxtrick.addClass(node, 'ft-highlight-playerDiv-bench');
			}, allPLinks);
		};

		for (let pL of eventPLinks) {
			let param = Foxtrick.getUrlParam(pL.href, idParam);
			let id = Math.abs(parseInt(param, 10));
			highlightPlayer(id);
		}

	},

	// change the number-star display into real stars
	convertStars: function(doc) {
		const STARS_STEP = 0.5;
		const STARS_BIG = 5;
		const STARS_SMALL = 2;
		const STARS_SMALL_MAX = STARS_BIG - STARS_STEP;
		const STARS_SMALL_QTY_LIMIT = Math.floor(STARS_SMALL_MAX / STARS_SMALL);
		const STARS_REMAINDER_MAX = STARS_SMALL_MAX - STARS_SMALL_QTY_LIMIT * STARS_SMALL;

		const color = Foxtrick.Pages.Match.isYouth(doc) ? '_blue' : '';

		let ratings = doc.querySelectorAll('div.playerRating > span');
		for (let rating of ratings) {
			var count = Number(rating.textContent);
			var ratingsDiv = rating.parentNode;
			var newDiv = ratingsDiv.cloneNode(false);
			Foxtrick.makeFeaturedElement(newDiv, this);

			// weirdest bug ever: title too short
			newDiv.title = count + '\u2605    ';

			// this one will fit small stars
			var smallDiv = doc.createElement('div');
			Foxtrick.addClass(smallDiv, 'ft-4starDiv');

			let starsBig = Math.floor(count / STARS_BIG);
			count %= STARS_BIG;
			for (let s = 0; s < starsBig; s++) {
				let bigStarCont = doc.createElement('div');

				// this one's for async image purposes
				Foxtrick.addImage(doc, bigStarCont, {
					src: Foxtrick.InternalPath +
						`resources/img/matches/${STARS_BIG}stars${color}.png`,
					alt: `${STARS_BIG}*`,
				});
				newDiv.appendChild(bigStarCont);
			}

			let starsSmall = Math.floor(count / STARS_SMALL);
			count %= STARS_SMALL;
			for (let s = 0; s < starsSmall; s++) {
				Foxtrick.addImage(doc, smallDiv, {
					src: Foxtrick.InternalPath +
						`resources/img/matches/${STARS_SMALL}stars${color}.png`,
					alt: `${STARS_SMALL}*`,
				});
			}

			newDiv.appendChild(smallDiv);
			if (count) {
				// 4.5 stars is a pain in the ass
				let target;
				if (count == STARS_REMAINDER_MAX &&
				    smallDiv.childNodes.length == STARS_SMALL_QTY_LIMIT) {
					// 4.5
					target = newDiv;
				}
				else {
					// 0.5/2.5 1.5/3.5
					target = smallDiv;
				}

				Foxtrick.addImage(doc, target, {
					src: Foxtrick.InternalPath + `resources/img/matches/${count}stars${color}.png`,
					alt: `${count}*`,
				});
			}

			ratingsDiv.parentNode.replaceChild(newDiv, ratingsDiv);
		}
	},

	// which team to show in split
	showAway: false,

	// split lineup into two for home/away
	splitLineup: function(doc) {
		const module = this;
		if (!Foxtrick.Pages.Match.hasRatingsTabs(doc))
			return;

		module.hideOtherTeam(doc);

		// that one started: stop again
		// Foxtrick.stopListenToChange(doc);

		var invert = Foxtrick.Prefs.isModuleOptionEnabled(module, 'InvertSplit');

		let awayDivs = doc.querySelectorAll('#playersField div.playerBoxAway');
		for (let awayDiv of Foxtrick.toArray(awayDivs)) {
			/* eslint-disable no-magic-numbers */
			if (!invert) {
				awayDiv.style.top = (parseInt(awayDiv.style.top, 10) || 0) - 240 + 'px';
				continue;
			}

			awayDiv.style.left = 150 + 356 - parseInt(awayDiv.style.left, 10) + 'px';
			awayDiv.style.top = 268 + 353 - parseInt(awayDiv.style.top, 10) + 'px';
			/* eslint-enable no-magic-numbers */
		}

		var div = doc.createElement('div');
		div.id = 'ft-split-arrow-div';

		let alt = Foxtrick.L10n.getString('MatchLineupTweaks.showOther');
		Foxtrick.addImage(doc, div, {
			src: '/Img/Icons/transparent.gif',
			id: 'ft-split-arrow',
			title: alt,
			alt: alt,
		});

		Foxtrick.onClick(div, () => {
			Foxtrick.stopListenToChange(doc);
			module.showAway = !module.showAway;
			module.hideOtherTeam(doc);
			Foxtrick.startListenToChange(doc);
		});

		let field = doc.getElementById('playersField');
		field.appendChild(div);
	},

	joinLineup: function(doc) {
		const module = this;
		module.hideOtherTeam(doc, true); // undo

		var invert = Foxtrick.Prefs.isModuleOptionEnabled(module, 'InvertSplit');

		let awayDivs = doc.querySelectorAll('#playersField div.playerBoxAway');
		for (let awayDiv of Foxtrick.toArray(awayDivs)) {
			/* eslint-disable no-magic-numbers */
			if (!invert) {
				awayDiv.style.top = parseInt(awayDiv.style.top, 10) + 240 + 'px';
				continue;
			}

			awayDiv.style.left = 150 + 356 - parseInt(awayDiv.style.left, 10) + 'px';
			awayDiv.style.top = 268 + 353 - parseInt(awayDiv.style.top, 10) + 'px';
			/* eslint-enable no-magic-numbers */
		}

		let div = doc.getElementById('ft-split-arrow-div');
		div.parentNode.removeChild(div);
	},

	hideOtherTeam: function(doc, undo) {
		const module = this;
		const showType = module.showAway ? 'Away' : 'Home';
		const hideType = module.showAway ? 'Home' : 'Away';

		let hideDivs = doc.querySelectorAll('#playersField div.playerBox' + hideType +
			', #playersBench' + hideType);
		for (let hideDiv of Foxtrick.toArray(hideDivs)) {
			if (undo)
				Foxtrick.removeClass(hideDiv, 'hidden');
			else
				Foxtrick.addClass(hideDiv, 'hidden');
		}

		let showDivs = doc.querySelectorAll('#playersField div.playerBox' + showType +
			', #playersBench' + showType);
		for (let showDiv of Foxtrick.toArray(showDivs))
			Foxtrick.removeClass(showDiv, 'hidden');

		var invert = Foxtrick.Prefs.isModuleOptionEnabled(module, 'InvertSplit');

		var field = doc.getElementById('playersField');
		if (undo) {
			Foxtrick.removeClass(field, 'ft-field-split');
			Foxtrick.removeClass(field, 'ft-field-split-invert');
		}
		else {
			Foxtrick.addClass(field, invert ? 'ft-field-split-invert' : 'ft-field-split');
		}

		if (module.showAway && !undo) {
			Foxtrick.addClass(field, invert ? 'ft-field-away-invert' : 'ft-field-away');
		}
		else {
			Foxtrick.removeClass(field, 'ft-field-away');
			Foxtrick.removeClass(field, 'ft-field-away-invert');
		}
	},

	/**
	 * Gather stamina data to be used for match-simulator and player table
	 * @param {document} doc
	 */
	gatherStaminaData: function(doc) {
		const module = this;
		if (Foxtrick.Pages.Match.isYouth(doc))
			return;

		const inProgress = Foxtrick.Pages.Match.inProgress(doc);
		const isLive = Foxtrick.isPage(doc, 'matchesLive');
		if (inProgress || isLive)
			return;

		var team = 'away';
		var ownId = Foxtrick.util.id.getOwnTeamId();

		// only gather data for own team
		let homeId = Foxtrick.Pages.Match.getHomeTeamId(doc);
		let awayId = Foxtrick.Pages.Match.getAwayTeamId(doc);
		if (homeId == ownId)
			team = 'home';
		else if (awayId != ownId)
			return;

		var data = {}, dataText = Foxtrick.Prefs.getString('StaminaData.' + ownId);
		if (dataText) {
			try {
				data = JSON.parse(dataText) || {};
			}
			catch (e) {
				Foxtrick.log('Error parsing StaminaData, data will be reset', e);
			}
		}

		var matchDate = Foxtrick.Pages.Match.getDate(doc);
		matchDate = Foxtrick.util.time.toHT(doc, matchDate);

		let players = module.getPlayersWithStamina(doc, team);
		Foxtrick.forEach(function(player) {
			if (!player.stamina)
				return;

			if (!(player.PlayerId in data))
				data[player.PlayerId] = [];

			let pData = data[player.PlayerId], [oldDate, _oldStamina] = pData;

			if (pData.length && oldDate >= matchDate.valueOf()) {
				// we have more recent data
				return;
			}

			pData[0] = matchDate.valueOf();
			pData[1] = player.stamina;

		}, players);

		Foxtrick.log('StaminaData:', matchDate, players, data);
		Foxtrick.Prefs.setString('StaminaData.' + ownId, JSON.stringify(data));
	},

	getPlayersWithStamina: function(doc, team) {
		const EMPTY = [];
		if (Foxtrick.Pages.Match.isYouth(doc))
			return EMPTY;

		const isHome = team == 'home';

		// eslint-disable-next-line no-unused-vars
		var getStamina = (lastEnergy, checkpoints, isRested) => { // lgtm[js/unused-local-variable]
			// these formulas are derrived from the formula used in match-simulator
			// currently they seem to have low accuracy :(

			/* eslint-disable no-magic-numbers */
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
			/* eslint-enable no-magic-numbers */
		};

		// eslint-disable-next-line no-unused-vars
		var hasRest = function(from, to) { // lgtm[js/unused-local-variable]
			const HALF_TIME = 45;
			return from < HALF_TIME && to > HALF_TIME;
		};

		var getCheckpointCount = function(from, to) {
			const MINS_PER_CHECKPOINT = 5;

			let first = Foxtrick.Math.div(from - 1, MINS_PER_CHECKPOINT);
			let last = Foxtrick.Math.div(to - 1, MINS_PER_CHECKPOINT);
			let ct = last - first + (from > 0 ? 0 : 1) - (to > 0 ? 0 : 1);
			return ct;
		};

		var timeline = Foxtrick.Pages.Match.getTimeline(doc);
		var findEvent = function(minute) {
			for (let [i, event] of timeline.entries()) {
				if (event.min < minute)
					continue;

				if (event.min > minute)
					return i - 1; // HT BUG: no event at |minute|

				return i;
			}
			return null;
		};

		var playerRatings = Foxtrick.Pages.Match.getTeamRatingsByEvent(doc, isHome);
		if (!playerRatings.length) {
			// most likely WO, or match in progress
			// abort
			return EMPTY;
		}

		// info for CHPP
		const SOURCE_SYSTEM = Foxtrick.Pages.Match.getSourceSystem(doc);

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

		var HTOPlayers;
		if (SOURCE_SYSTEM == 'HTOIntegrated') {
			// need to parse player data and change PlayerIds to HT Ids
			HTOPlayers = Foxtrick.Pages.Match.parsePlayerData(doc);

			if (!HTOPlayers) {
				Foxtrick.log('gatherStaminaData: failed to parse playerData');
				return EMPTY;
			}
		}

		var table = Foxtrick.Pages.Match.getRatingsTable(doc);
		var teamNr = Number(!isHome);

		// don't parse pressing: affects stamina
		var tactics = Foxtrick.Pages.Match.getTacticsByTeam(table).tactics[teamNr];
		if (tactics == 'pressing')
			return EMPTY;

		var affectedPlayerID = '0';
		var events = doc.getElementsByClassName('matchevent');
		Foxtrick.any(function(evt) {
			// powerfull suffers in sun (loses stamina)
			const POWERFUL_IN_SUN = 304;
			if (parseInt(evt.dataset.eventtype, 10) != POWERFUL_IN_SUN)
				return false;

			let playerLink = evt.querySelector('a');
			if (playerLink) {
				affectedPlayerID = Foxtrick.getUrlParam(playerLink.href, 'playerId');
			}
			else {
				// neighborhood kids
				affectedPlayerID = '0';
			}

			// should not be more than one SE with same type
			return true;
		}, events);

		var players = Foxtrick.filter(function(player, i) {
			if (typeof HTOPlayers != 'undefined') {
				// need to parse player data and change PlayerIds to HT Ids
				Foxtrick.any(function(HTOPlayer) {
					if (HTOPlayer.PlayerId == player.PlayerId) {
						player.PlayerId = HTOPlayer.SourcePlayerId;
						return true;
					}
					return false;
				}, HTOPlayers);
			}

			// disregard extra time data
			const FULL_TIME = 90;
			if (player.ToMin > FULL_TIME)
				player.ToMin = FULL_TIME;

			player.ftIdx = i;

			// skip those who didn't play or had negative powerful SE
			return player.ToMin > 0 && player.PlayerId != affectedPlayerID;
		}, playerRatings[0].players);

		Foxtrick.forEach(function(player) {
			const MAX_CHECKPOINTS = 18;
			player.checkpoints = getCheckpointCount(player.FromMin, player.ToMin);
			player.lastEvent = findEvent(player.ToMin);
			player.lastEnergy = playerRatings[player.lastEvent].players[player.ftIdx].Stamina;

			// player.isRested = hasRest(player.FromMin, player.ToMin);
			// if (player.checkpoints && player.lastEnergy != 1)
			//	player.staminaSkill =
			//		getStamina(player.lastEnergy, player.checkpoints,player.isRested);
			// else if (player.checkpoints == MAX_CHECKPOINTS)
			//	player.staminaSkill = 8.7;

			if (player.checkpoints == MAX_CHECKPOINTS) {
				if (player.lastEnergy == 1)
					player.stamina = '8.63+';
				else
					player.stamina = Foxtrick.Predict.stamina(player.lastEnergy).toFixed(2);
			}
		}, players);
		return players;
	},

	flipStaminaBar: function(doc, playerDivs) {
		var module = this;
		var playersById = {};

		var inProgress = Foxtrick.Pages.Match.inProgress(doc);
		var isLive = Foxtrick.isPage(doc, 'matchesLive');
		if (!isLive && !inProgress) {
			var homePlayers = module.getPlayersWithStamina(doc, 'home');
			var awayPlayers = module.getPlayersWithStamina(doc, 'away');
			var players = Foxtrick.concat(homePlayers, awayPlayers);
			Foxtrick.forEach(function(p) {
				playersById[p.PlayerId] = p;
			}, players);
		}

		Foxtrick.forEach(function(playerDiv) {
			// adjust HT shirt numbers
			var shirt = playerDiv.querySelector('.sectorShirt');
			var numSpan = shirt.firstChild;
			if (numSpan && !isNaN(parseInt(numSpan.textContent, 10)))
				Foxtrick.addClass(numSpan, 'ft-ht-shirt-num');

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
				staminaSpan.textContent = stamina == 100 ? '00' : stamina;
				if (stamina == 100)
					staminaSpan.style.color = staminaSpan.style.backgroundColor;

				var staminaText = staminaDiv.title;
				var link = playerDiv.querySelector('#playerLink');
				if (link) {
					var id = Foxtrick.getUrlParam(link.href, 'PlayerId');
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

	highlightPlayer(doc, playerId) {
		let playerQuery = '.playersField > div.playerBoxHome > div > a, ' +
			'#playersBench > div#playersBenchHome > div.playerBoxHome > div > a,' +
			'.playersField > div.playerBoxAway > div > a, ' +
			'#playersBench > div#playersBenchAway > div.playerBoxAway > div > a';
		let playerLinks = doc.querySelectorAll(playerQuery);

		let link = Foxtrick.nth(l => l.href.indexOf(playerId), playerLinks);
		if (link)
			Foxtrick.addClass(link.parentNode.parentNode, 'ft-highlight-playerDiv-url');
	},

	/* eslint-disable complexity */
	onChange: function(doc) {
		const module = this;
		const isYouth = Foxtrick.Pages.Match.isYouth(doc);

		if (!Foxtrick.Pages.Match.hasRatingsTabs(doc))
			return;

		Foxtrick.stopListenToChange(doc);

		module.addSplitLineupToggle(doc);
		var playerDivs = doc.querySelectorAll('div.playerDiv');
		if (playerDivs.length && playerDivs[0].querySelector('.ft-indicator-wrapper')) {
			// been here before
			return;
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchLineupTweaks', 'SplitLineup'))
			module.splitLineup(doc);

		module.flipStaminaBar(doc, playerDivs);

		// add ft-stars="N" to ratings spans for possible styling
		let ratings = doc.querySelectorAll('div.playerRating > span');
		for (let rating of ratings) {
			let count = Number(rating.textContent);
			rating.setAttribute('ft-stars', count);
		}

		let hId = Foxtrick.getUrlParam(doc.location.href, 'HighlightPlayerID');
		if (hId)
			module.highlightPlayer(doc, hId);

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'DisplayTeamNameOnField'))
			module.runTeamnNames(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'HighlighEventPlayers'))
			module.runEventPlayers(doc);
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'AddSubstiutionInfo'))
			module.addSubInfo(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'StarCounter'))
			module.runStars(doc);
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'StaminaCounter') && !isYouth)
			module.runStamina(doc);

		// run this after the counters
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'ConvertStars'))
			module.convertStars(doc);

		Foxtrick.startListenToChange(doc);

		// add async stuff last
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'ShowSpecialties'))
			module.runSpecialties(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'ShowFaces'))
			module.runFaces(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'HighlightMissing'))
			module.runMissing(doc);

	},

};
