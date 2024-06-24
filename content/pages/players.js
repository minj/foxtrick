/**
 * players.js
 * Utilities on players page
 * @author convincedd, ryanli, LA-MJ
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	// @ts-ignore
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.Players = {};

/**
 * Test whether this is a player list page.
 * Applies to all possible senior and youth pages.
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isPage = function(doc) {
	return this.isSenior(doc) || this.isYouth(doc);
};

/**
 * Test whether this is regular senior player page.
 * Key feature: last match link.
 * Applies to KeyPlayers as well.
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isRegular = function(doc) {
	return Foxtrick.isPage(doc, 'players');
};

/**
 * Test whether this is own senior player page.
 * Key feature: visible skills.
 * Applies to KeyPlayers and NT coaches as well.
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isOwn = function(doc) {
	return Foxtrick.isPage(doc, 'ownPlayers');
};

/**
 * Test whether this is a senior player list page.
 * Applies to all possible senior pages.
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isSenior = function(doc) {
	return Foxtrick.isPage(doc, 'allPlayers');
};

/**
 * Test whether this is an NT player page
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isNT = function(doc) {
	return Foxtrick.isPage(doc, 'ntPlayers');
};

/**
 * Test whether this is an oldies page
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isOldies = function(doc) {
	return Foxtrick.isPage(doc, 'oldPlayers');
};

/**
 * Test whether this is an old coaches page
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isCoaches = function(doc) {
	return Foxtrick.isPage(doc, 'oldCoaches');
};

/**
 * Test whether this is a youth player page
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isYouth = function(doc) {
	return Foxtrick.isPage(doc, 'youthPlayers');
};

/**
 * Test whether this is youth performance view.
 * Skills are unavailable, but position matrix is.
 *
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isYouthPerfView = function(doc) {
	return !!doc.querySelector('.youthPlayerPerformance');
};

/**
 * Test whether this is own youth player page
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isOwnYouth = function(doc) {
	return Foxtrick.isPage(doc, 'ownYouthPlayers');
};

/**
 * Test whether this is a match order page
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isMatchOrder = function(doc) {
	return Foxtrick.isPage(doc, 'matchOrder') || Foxtrick.isPage(doc, 'matchOrderSimple');
};

/**
 * Test whether this is a youth match order page
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isYouthMatchOrder = function(doc) {
	return this.isMatchOrder(doc) &&
		/isYouth=true|SourceSystem=Youth/i.test(doc.location.href);
};

/**
 * Test whether this is a simple match order page
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Players.isSimpleMatchOrder = function(doc) {
	return Foxtrick.isPage(doc, 'matchOrderSimple');
};

/** @typedef {'face'|'separator'} PlayerNodeIncludes */

/**
 * Get the list of player containers.
 *
 * include may optionally include faces or separators,
 * e.g. {face: true, separator: true}
 *
 * @param  {document}                            doc
 * @param  {Record<PlayerNodeIncludes, boolean>} [include]
 * @return {HTMLElement[]}                       playerNodes
 */
Foxtrick.Pages.Players.getPlayerNodes = function(doc, include) {
	const INFOS = ['playerInfo', 'playerInfoOld', 'playerListDetails'];
	const INFOS_SELECTOR = INFOS.map(cls => `.${cls}`).join(',');
	const FACES = ['faceCard', 'faceCardNoBottomInfo'];
	const FACES_SELECTOR = FACES.map(cls => `.${cls}`).join(',');
	const SEPS = ['borderSeparator', 'separator'];
	const SEPS_SELECTOR = SEPS.map(cls => `.${cls}`).join(',');

	/**
	 * @param  {HTMLElement} el
	 * @return {boolean}
	 */
	let ignorePredicate = (el) => {
		/** @type {Record<PlayerNodeIncludes, boolean>} */
		let is = {
			face: el.matches(FACES_SELECTOR),
			separator: el.matches(SEPS_SELECTOR),
		};

		if (include) {
			let included = Object.entries(include).filter(([_, val]) => !!val);
			let inclKeys = included.map(([key, _]) => key);
			let excluded = Object.entries(is).filter(([key]) => !inclKeys.includes(key));
			return !excluded.some(([_, val]) => val);
		}

		return !Object.values(is).some(Boolean);
	};

	let mainBody = doc.getElementById('mainBody');
	let playerList = doc.querySelector('.playerList');
	let nodeColl = playerList ? playerList.children : mainBody.children;

	let nodes = /** @type {HTMLElement[]} */ ([...nodeColl]);

	let divs =
		nodes.filter(el => el.nodeName == 'DIV' && (el.querySelector(INFOS_SELECTOR) ||
	                       el.matches(`${INFOS_SELECTOR}, ${FACES_SELECTOR}, ${SEPS_SELECTOR}`)));

	let pNodes = divs.filter(ignorePredicate);
	if (include && include.face) {
		let newFaces = pNodes.map(n => n.querySelector('.faceCardNoBottomInfo')).filter(Boolean);
		let els = /** @type {HTMLElement[]} */ (newFaces);
		pNodes.push(...els);
	}

	return pNodes;
};

/* eslint-disable complexity */

/**
 * @typedef PlayerListOptions
 * @prop {string|number} [teamId]
 * @prop {boolean} [isYouth]
 * @prop {boolean} [isNT]
 * @prop {boolean} [includeMatchInfo]
 * @prop {boolean} [currentSquad]
 * @prop {boolean} [refresh]
 */

/**
 * @typedef PlayerAge
 * @prop {number} years
 * @prop {number} days
 */

/**
 * @typedef TrainerData
 * @prop {number} [type]
 * @prop {number} [skill]
 */

/**
 * @template T
 * @typedef SkillMap<T>
 * @prop {T} [defending]
 * @prop {T} [keeper]
 * @prop {T} [passing]
 * @prop {T} [playmaking]
 * @prop {T} [scoring]
 * @prop {T} [setPieces]
 * @prop {T} [winger]
 */

/**
 * @typedef {SkillMap<number>} PlayerSkills
 */

/**
 * @typedef PlayerContributionProps
 * @prop {string} [bestPosition]
 * @prop {string} [bestPositionLong]
 * @prop {number} [bestPositionValue]
 */

/**
 * @typedef StaminaPrediction
 * @prop {number} value
 * @prop {Date} date
 */

/**
 * @typedef PlayerProps
 * @prop {number} id
 * @prop {number} [number]
 * @prop {number} [currentClubId]
 * @prop {number} [currentLeagueId]
 *
 * @prop {HTMLElement} [playerNode]
 * @prop {boolean} [hidden]
 *
 * @prop {number} [tsi]
 * @prop {number} [salary]
 * @prop {number} [salaryBase]
 * @prop {boolean} [transferListed]
 * @prop {boolean} [isAbroad]
 *
 * @prop {PlayerAge} [age]
 * @prop {number} [ageYears]
 * @prop {string} [ageText]
 *
 * @prop {PlayerSkills} [skills]
 *
 * @prop {number} [stamina]
 * @prop {number} [staminaPred]
 * @prop {StaminaPrediction} [staminaPrediction]
 *
 * @prop {number} [form]
 * @prop {number} [experience]
 * @prop {number} [loyalty]
 * @prop {number} [leadership]
 * @prop {HTMLSpanElement} [motherClubBonus]
 *
 * @prop {number} [htmsAbility]
 * @prop {number} [htmsPotential]
 * @prop {number} [psicoTSI]
 * @prop {string} [psicoWage]
 * @prop {string} [psicoTitle]
//  * @prop {PsicoTSIPrediction} [psico]
 *
 * @prop {number} [specialtyNumber]
 * @prop {string} [specialty] README: localized!
 *
 * @prop {number} [redCard]
 * @prop {number} [yellowCard]
 * @prop {boolean} [cards]
 *
 * @prop {boolean} [bruised]
 * @prop {boolean} [injured]
 * @prop {number} [injuredWeeks]
 *
 * @prop {HTMLAnchorElement} [lastMatch]
 * @prop {Date} [lastMatchDate]
 * @prop {number} [lastMatchId]
 * @prop {string} [lastPosition] README: localized!
 * @prop {PositionType} [lastPositionType]
 * @prop {number} [lastRating]
 * @prop {number} [lastRatingEndOfGame]
 * @prop {number} [lastRatingDecline]
 *
 * @prop {U21LastMatchDef} u21
 *
 * @prop {boolean} [currentSquad]
 * @prop {boolean} [active]
 * @prop {boolean} [inXML]
 *
 * @prop {HTMLAnchorElement} [nameLink]
 * @prop {HTMLAnchorElement} [twinLink]
 * @prop {HTMLAnchorElement} [currentClubLink]
 * @prop {HTMLAnchorElement} [hyLink]
 * @prop {HTMLAnchorElement} [performanceHistory]
 * @prop {HTMLAnchorElement} [transferCompare]
 */

/**
 * @typedef U21LastMatchDef
 * @prop {string} title
 * @prop {string} text
 * @prop {number} value
 */

/**
 * @typedef PlayerXMLProps
 * @prop {number} [category]
 * @prop {number} [countryId]
 *
 * @prop {number} [agreeability]
 * @prop {number} [aggressiveness]
 * @prop {number} [honesty]
 *
 * @prop {number} [careerGoals]
 * @prop {number} [careerHattricks]
 * @prop {number} [cupGoals]
 * @prop {number} [friendliesGoals]
 * @prop {number} [leagueGoals]
 * @prop {number} [goalsCurrentTeam]
 * @prop {number} [matchesCurrentTeam]
 *
 * @prop {number} [caps]
 * @prop {number} [capsU20] NOTE: remains != U21
 * @prop {number} [nationalTeamId]
 * @prop {number} [matchCount] README: NT supp stats
 *
 * @prop {string} [ownerNotes]
 * @prop {string} [statement]
 *
 * @prop {Date} [nextBirthDay]
 * @prop {Date} [joinedSince]
 * @prop {number} [canBePromotedIn]
 *
 * @prop {TrainerData} [trainerData]
 *
 * @prop {number} [lastPlayedMinutes]
 * @prop {string} [lastMatchText]
 */

/**
 * @typedef PlayerTLProps
 * @prop {HTMLElement} [deadline]
 * @prop {number} [currentBid]
 * @prop {HTMLAnchorElement} [bookmarkLink]
 * @prop {HTMLAnchorElement} [hotlistLink]
 * @prop {HTMLAnchorElement} [currentBidderLink]
 * @prop {HTMLAnchorElement} [currentBidderLinkShort]
 */

/** @typedef {keyof Player} PlayerKey */

/**
 * @typedef PlayerMercattrickProps
 * @prop {number} [mtFilters]
 * @prop {number} [mtBookmarks]
 */

/* eslint-disable max-len */
/**
 * @typedef {PlayerSkills & PlayerProps & PlayerXMLProps & PlayerTLProps & PlayerContributionProps & Contributions & PlayerMercattrickProps} Player & ContributionFactors
 */
/* eslint-enable max-len */

/**
 * Get player list.
 *
 * CHPP needs a callback and options.
 * If callback is not provided, only HTML is parsed.
 *
 * Options is {teamId, isYouth, isNT, includeMatchInfo, currentSquad, refresh}
 *
 * First 3 are detected automatically from URL if possible.
 * includeMatchInfo adds last match data.
 * currentSquad is needed to fetch current player list (possibly from non-players page).
 * HTML parsing and oldies page detection are bypassed in this case.
 * It also limits NT player list for supporters.
 *
 * Refresh invalidates cache before fetching.
 *
 * @param  {document}               doc
 * @param  {function(Player[]):any} [callback]
 * @param  {PlayerListOptions}      [options]
 * @return {Player[]}
 */
// TODO promisify
Foxtrick.Pages.Players.getPlayerList = function(doc, callback, options) {
	/** @type {Player[]} */
	var playerList = [];

	/** @type {CHPPParams} */
	var args = [];
	var isNT = false;

	/**
	 * @param  {number|void} id
	 * @return {function(Player):boolean}
	 */
	var findById = id => p => p.id == id;

	/**
	 * @param {document} doc
	 * @param {CHPPCallback} callback
	 */
	var getXml = function(doc, callback) {

		var teamId = Foxtrick.util.id.getOwnTeamId();
		if (options && options.teamId)
			teamId = parseInt(String(options.teamId), 10);
		else if (/teamid=(\d)/i.test(doc.location.href))
			teamId = Foxtrick.util.id.getTeamIdFromUrl(doc.location.href);

		if (!teamId) {
			let msg = `Failed to parse teamId: '${teamId}' of ${JSON.stringify(options)}`;
			Foxtrick.log(msg);
			callback(null);
			return;
		}

		var isYouth = options && options.isYouth ||
			Foxtrick.Pages.Players.isYouth(doc) ||
			Foxtrick.Pages.Players.isYouthMatchOrder(doc);

		if (options && typeof options.isNT !== 'undefined')
			isNT = options.isNT;
		else if (Foxtrick.util.id.isNTId(teamId) || Foxtrick.Pages.Players.isNT(doc))
			isNT = true;

		if (isYouth) {
			args.push(['file', 'youthplayerlist']);
			args.push(['youthTeamId', teamId]);
			args.push(['actionType', 'details']);
		}
		else if (isNT) {
			let action = 'supporterstats', all = true;
			if (options && options.currentSquad || !Foxtrick.util.layout.isSupporter(doc)) {
				action = 'view';
				all = false;
			}
			args.push(['file', 'nationalplayers']);
			args.push(['version', '1.5']);
			args.push(['teamId', teamId]);
			args.push(['actionType', action]);
			args.push(['showAll', String(all)]);
		}
		else {
			args.push(['file', 'players']);
			args.push(['version', '2.4']);
			args.push(['teamId', teamId]);

			if (!options || !options.currentSquad) {
				if (Foxtrick.Pages.Players.isOldies(doc))
					args.push(['actionType', 'viewOldies']);
				else if (Foxtrick.Pages.Players.isCoaches(doc))
					args.push(['actionType', 'viewOldCoaches']);
			}
		}
		if (options && options.includeMatchInfo) {
			args.push(['includeMatchInfo', 'true']); // senior
			args.push(['showLastMatch', 'true']); // youth
		}

		if (options && options.refresh) {
			let now = Foxtrick.util.time.getHTTimeStamp(doc) || Date.now();
			Foxtrick.util.api.setCacheLifetime(JSON.stringify(args), now);
		}
		Foxtrick.util.currency.detect(doc).then(function() {
			Foxtrick.util.api.retrieve(doc, args, { cache: 'session' }, callback);
		}).catch(function(reason) {
			Foxtrick.log('WARNING: currency.detect aborted:', reason);
		});
	};

	/**
	 * @param {document} doc
	 * @param {Player}   player
	 */
	var addPerfHistLink = function(doc, player) {
		let ps = doc.createElement('a');
		ps.title = Foxtrick.L10n.getString('PerformanceHistory');
		let psUrl = player.nameLink.href;
		psUrl = psUrl.replace('/Club/Players/Player.aspx',
		                      '/Club/Players/PlayerStats.aspx') + '&ShowAll=true';
		ps.href = psUrl;
		ps.target = '_blank';

		player.performanceHistory = ps;

		Foxtrick.addImage(doc, ps, {
			src: Foxtrick.InternalPath + 'resources/img/shortcuts/stats.png',
			alt: Foxtrick.L10n.getString('PerformanceHistory.abbr'),
			height: 16,
			'aria-label': ps.title,
		});
	};

	/**
	 * @param {document} doc
	 * @param {Player}   player
	 */
	var addHYLink = function(doc, player) {
		const domain = Foxtrick.Prefs.getBool('YouthClub.useStage') ? 'stage' : 'www';
		let hyUrl =
		`https://${domain}.hattrick-youthclub.org/redirect/type/player_details/ht_id/${player.id}`;

		let hyLink = doc.createElement('a');
		hyLink.title = Foxtrick.L10n.getString('HyLink');
		hyLink.href = hyUrl;
		hyLink.target = '_blank';
		hyLink.relList.add('noopener');

		player.hyLink = hyLink;

		Foxtrick.addImage(doc, hyLink, {
			src: Foxtrick.InternalPath + 'resources/img/staff/hyouthclub.png',
			alt: Foxtrick.L10n.getString('HyLink.abbr'),
			'aria-label': hyLink.title,
		});
	};

	/**
	 * @param {CHPPXML} xml
	 */
	var parseXml = function(xml) {
		try {
			if (!xml)
				return;

			var currencyRate = Foxtrick.util.currency.getRate();
			const WAGE_Q = 1.2;

			/** @type {Element} */
			var playerNode;

			/**
			 * @param  {string}  nodeName
			 * @param  {Element} [parent]
			 * @return {number}
			 */
			var num = function(nodeName, parent) {
				var value = xml.num(nodeName, parent || playerNode);

				// deal with goals being undefined during matches
				if (isNaN(value))
					return void 0;

				return value;
			};

			/**
			 * @param  {string}  nodeName
			 * @param  {Element} [parent]
			 * @return {number}
			 */
			var money = function(nodeName, parent) {
				return xml.money(nodeName, currencyRate, parent || playerNode);
			};

			/**
			 * @param  {string}  nodeName
			 * @param  {Element} [parent]
			 * @return {Element}
			 */
			var node = function(nodeName, parent) {
				return xml.node(nodeName, parent || playerNode);
			};

			/**
			 * @param  {string}  nodeName
			 * @param  {Element} [parent]
			 * @return {string}
			 */
			var text = function(nodeName, parent) {
				return xml.text(nodeName, parent || playerNode);
			};

			/**
			 * @param  {string}  nodeName
			 * @param  {Element} [parent]
			 * @return {boolean}
			 */
			var bool = function(nodeName, parent) {
				return xml.bool(nodeName, parent || playerNode);
			};

			/**
			 * @param  {string}  nodeName
			 * @param  {Element} [parent]
			 * @return {number|void}
			 */
			var ifPositive = function(nodeName, parent) {
				var value = num(nodeName, parent);
				if (value > 0)
					return value;

				return void 0;
			};

			/**
			 * if single string is provided, it is camelCased and stripped of 'Skill' suffix
			 *
			 * to rename the node manually, supply [propName, nodeName]
			 * @typedef {[keyof Player, string]|string} PlayerProp
			 */

			/**
			 * @param  {PlayerSkills|PlayerProps|PlayerXMLProps} player
			 * @param  {function(string):any}      fn value getter for provided nodeName
			 * @return {function(PlayerProp):void}
			 */
			var addProperty = function(player, fn) {
				return function(name) {
					var propName, nodeName;
					if (Array.isArray(name)) {
						[propName, nodeName] = name;
					}
					else {
						propName = name.replace(/^./, m => m.toLowerCase());
						propName = propName.replace(/Skill$/, '');
						nodeName = name;
					}
					if (typeof player[propName] === 'undefined' && node(nodeName))
						player[propName] = fn(nodeName);
				};
			};

			var teamId = Foxtrick.Pages.All.getTeamId(doc);
			var isYouth = options && options.isYouth ||
				Foxtrick.Pages.Players.isYouth(doc) ||
				Foxtrick.Pages.Players.isYouthMatchOrder(doc);
			var sourceSystem = isYouth ? 'Youth' : 'Hattrick';
			var youthParam = '';
			if (isYouth)
				youthParam = `&youthTeamId=${Foxtrick.Pages.All.getTeamIdFromBC(doc)}`;

			var fetchedDate = xml.date('FetchedDate');
			var now = Foxtrick.util.time.getHTDate(doc);

			var currentClubId = xml.num(isYouth ? 'YouthTeamID' : 'TeamID');
			var currentClubLink;
			{
				let currentClubUrl = isYouth ?
					'/Club/Youth/?YouthTeamID=' + currentClubId :
					'/Club/?TeamID=' + currentClubId;

				let tNameNode = xml.node(isYouth ? 'YouthTeamName' : 'TeamName');
				if (tNameNode) {
					currentClubLink = doc.createElement('a');
					currentClubLink.textContent = tNameNode.textContent;
					currentClubLink.href = currentClubUrl;
					currentClubLink.target = '_blank';
				}
			}

			let nodeName = isYouth ? 'YouthPlayer' : 'Player';
			for (playerNode of xml.getElementsByTagName(nodeName)) {
				let id = num(`${nodeName}ID`);

				// find player with the same ID from playerList
				// (parsed from HTML)
				let player = Foxtrick.nth(findById(id), playerList);
				if (!player) {
					// player not present in HTML!
					if (!options || !options.currentSquad) {
						// skip if not retrieving squad from other page
						continue;
					}
					else {
						// player = { id };

						/** @type {Partial<Player>} */
						let p = { id: id };
						player = /** @type {Player} */ (p);

						playerList.push(player);

						// TODO why these set here only?
						player.currentSquad = true;
						player.active = true;

						if (node('PlayerNumber')) {
							// only add if not present in HTML since HTML always has current data
							// number = 100 means this player hasn't been assigned one
							let number = num('PlayerNumber');
							if (number >= 1 && number < 100)
								player.number = number;
						}
					}
				}

				// we found this player in the XML file,
				player.inXML = true;

				// go on the retrieve information

				// README: normally this section is already defined in HTML but
				// sometimes part of it is not available
				// we set it here if needed
				if (node('Age') && node('AgeDays')) {
					let age = {
						years: num('Age'),
						days: num('AgeDays'),
					};
					player.age = age;
					player.ageYears = age.years;
				}

				/** @type {PlayerProp[]} */
				let nums = [
					'StaminaSkill',
					['form', 'PlayerForm'],
					'Loyalty',
					'TransferListed',
					['tsi', 'TSI'],
				];
				Foxtrick.forEach(addProperty(player, num), nums);

				if (!player.skills)
					player.skills = {};

				/** @type {PlayerProp[]} */
				let skills = [
					['defending', 'DefenderSkill'],
					'KeeperSkill',
					'PassingSkill',
					['playmaking', 'PlaymakerSkill'],
					['scoring', 'ScorerSkill'],
					'SetPiecesSkill',
					'WingerSkill',
				];
				Foxtrick.forEach(addProperty(player.skills, num), skills);

				let newSkillInfo = false;
				for (let skill in player.skills) {
					if (typeof player[skill] === 'undefined') {
						player[skill] = player.skills[skill];

						// skill info was missing
						newSkillInfo = true;
					}
				}

				if (typeof player.specialty === 'undefined' && node('Specialty')) {
					let specNum = num('Specialty') || 0;
					let spec = Foxtrick.L10n.getSpecialtyFromNumber(specNum);
					player.specialtyNumber = specNum;
					player.specialty = spec;
				}

				if (typeof player.motherClubBonus === 'undefined' && node('MotherClubBonus')) {
					if (bool('MotherClubBonus')) {
						let title = Foxtrick.L10n.getString('skilltable.youthplayer');
						let span = doc.createElement('span');
						span.textContent = '✔';
						span.setAttribute('aria-label', span.title = title);
						player.motherClubBonus = span;
					}
				}

				if (typeof player.cards === 'undefined' && node('Cards')) {
					player.yellowCard = num('Cards');

					// eslint-disable-next-line no-magic-numbers
					if (player.yellowCard == 3) {
						player.yellowCard = 0;
						player.redCard = 1;
					}
					else {
						player.redCard = 0;
					}

					player.cards = player.yellowCard + player.redCard !== 0;
				}

				if (typeof player.injured === 'undefined' && node('InjuryLevel')) {
					player.injuredWeeks = num('InjuryLevel');
					player.bruised = !player.injuredWeeks; // 0 = bruised
					if (player.injuredWeeks == -1)
						player.injuredWeeks = 0;

					player.injured = player.bruised || player.injuredWeeks !== 0;
				}

				var nameLink = doc.createElement('a');
				nameLink.href = '/Club/Players/' + (isYouth ? 'Youth' : '') + 'Player.aspx?' +
					(isYouth ? 'Youth' : '') + 'PlayerID=' + id;
				nameLink.target = '_blank';
				if (node('PlayerName')) {
					// NT
					nameLink.textContent = text('PlayerName');
				}
				else {
					let first = text('FirstName');
					let last = text('LastName');
					let nick = text('NickName');

					let fullName = `${first} ${last}`;
					nameLink.textContent = fullName;
					nameLink.dataset.fullName = fullName;

					nameLink.title = `${first}${nick ? ` '${nick}'` : ''} ${last}`;
					nameLink.dataset.fullNameAndNick = nameLink.title;
					nameLink.dataset.nickName = nick;

					// TODO improve
					// first name stripping
					let shortName =
						first.replace(/(-[^(])([^-\s]+)/g, '$1.') // replaces first
						     .replace(/(\s[^(])([^-\s]+)/g, '$1.') // replace further first names
						     .replace(/(\(.)([^-)]+)/g, '$1.') // non-latin in brackets
						     .replace(/(^[^(])([^-\s]+)/g, '$1.') + // replace names with '-'
						' ' + last;

					nameLink.dataset.shortName = shortName;
				}
				player.nameLink = nameLink;

				if (isYouth) {
					if (typeof player.hyLink === 'undefined')
						addHYLink(doc, player);
				}
				else if (typeof player.performanceHistory === 'undefined') {
					addPerfHistLink(doc, player);
				}

				if ((Foxtrick.Pages.Players.isOldies(doc) ||
				    Foxtrick.Pages.Players.isCoaches(doc) ||
				    Foxtrick.Pages.Players.isNT(doc)) && currentClubLink &&
				    typeof player.currentClubLink === 'undefined') {
					let link = Foxtrick.cloneElement(currentClubLink, true);

					player.currentClubLink = link;
					player.currentClubId = currentClubId;
				}

				// README: XML exclusive info starts here
				/** @type {PlayerXMLProps} */
				let xPlayer = player;

				/** @type {PlayerProp[]} */
				let xmlNums = [
					'Agreeability',
					'Aggressiveness',
					'CareerGoals',
					'CareerHattricks',
					['countryId', 'CountryID'],
					'CupGoals',
					'Experience',
					'FriendliesGoals',
					['friendliesGoals', 'FriendlyGoals'], // youth
					'GoalsCurrentTeam',
					'Honesty',
					'IsAbroad', // no longer exclusive
					'Leadership',
					'LeagueGoals',
					['matchCount', 'NrOfMatches'], // NT supp stats
					'MatchesCurrentTeam',
					['nationalTeamId', 'NationalTeamID'],
				];
				Foxtrick.forEach(addProperty(xPlayer, num), xmlNums);

				/** @type {PlayerProp[]} */
				let texts = [
					'OwnerNotes',
					'Statement',
				];
				Foxtrick.forEach(addProperty(xPlayer, text), texts);

				// only include these if meaningful data available
				/** @type {PlayerProp[]} */
				let optionalNums = [
					'Caps',
					'CapsU20', // NOTE: remains != U21
					['category', 'PlayerCategoryId'],
				];
				Foxtrick.forEach(addProperty(xPlayer, ifPositive), optionalNums);

				// custom fields
				if (newSkillInfo && !isYouth) {
					let { years, days } = player.age;
					let htmsInput = Object.assign({ years, days }, player.skills);

					let [htmsAbility, htmsPotential] = Foxtrick.modules.HTMSPoints.calc(htmsInput);
					let tuple = { htmsAbility, htmsPotential };
					Object.assign(player, tuple);

					// psicoWage requires isAbroad!
					let psico = Foxtrick.modules.PsicoTSI.getPrediction(player, currencyRate);
					player.psicoTSI = psico.formAvg;
					player.psicoWage = psico.wageLow;
				}

				if (node('ArrivalDate'))
					xPlayer.joinedSince = xml.time('ArrivalDate', playerNode);

				if (node('CanBePromotedIn')) {
					// adjust for cached time
					let cachedPromo = new Date(fetchedDate);
					let diffDays = -1;
					while (cachedPromo <= now) {
						cachedPromo = Foxtrick.util.time.addDaysToDate(cachedPromo, 1);
						++diffDays;
					}
					xPlayer.canBePromotedIn = num('CanBePromotedIn') - diffDays;
				}
				if (node('Salary')) {
					player.salary = money('Salary');
					player.salaryBase = player.isAbroad ? player.salary / WAGE_Q : player.salary;
				}
				let trainerData = node('TrainerData');
				if (trainerData) {
					xPlayer.trainerData = {};
					if (node('TrainerType', trainerData))
						xPlayer.trainerData.type = num('TrainerType', trainerData);

					if (node('TrainerSkill', trainerData))
						xPlayer.trainerData.skill = num('TrainerSkill', trainerData);
				}

				let lastMatch = node('LastMatch');
				if (lastMatch && node('Date', lastMatch)) {
					let old = /\.classic\./i.test(doc.URL);
					let lastMatchUrlTemplate =
						`/Club/Matches/Match${old ? '.Classic.' : ''}.aspx?matchID={matchId}` +
						'&SourceSystem={sourceSystem}&teamId={teamId}{youthId}' +
						'&HighlightPlayerID={id}#tab2';

					if (!player.lastMatch) {
						// sometimes last match is missing from HTML even if player is available

						if (xml.node('Rating', lastMatch)) {
							player.lastRating = parseFloat(xml.text('Rating', lastMatch));
							if (xml.node('RatingEndOfGame', lastMatch)) {
								player.lastRatingEndOfGame =
									parseFloat(xml.text('RatingEndOfGame', lastMatch));
								player.lastRatingDecline = player.lastRating -
									player.lastRatingEndOfGame;
							}
						}
						if (xml.node('MatchId', lastMatch))
							player.lastMatchId = xml.num('MatchId', lastMatch);
						else if (xml.node('YouthMatchID', lastMatch))
							player.lastMatchId = xml.num('YouthMatchID', lastMatch);

						let matchDate = xml.date('Date', lastMatch);
						matchDate = Foxtrick.util.time.toUser(doc, matchDate);

						if (matchDate) {
							player.lastMatchDate = matchDate;

							let link = doc.createElement('a');

							link.href = Foxtrick.format(lastMatchUrlTemplate, {
								matchId: player.lastMatchId,
								teamId,
								sourceSystem,
								youthParam,
							});

							let dateStr =
								Foxtrick.util.time.buildDate(matchDate, { showTime: false });
							link.textContent = dateStr;
							link.target = '_blank';
							player.lastMatch = link;
						}

						let lastPositionCode = num('PositionCode', lastMatch);
						let pos = Foxtrick.L10n.getPositionTypeById(lastPositionCode);
						if (pos) {
							player.lastPositionType = pos;
							let position = Foxtrick.L10n.getPositionByType(pos);
							player.lastPosition = position;
						}

					}

					let mins = xPlayer.lastPlayedMinutes = num('PlayedMinutes', lastMatch);
					if (mins) {
						let dateText =
							Foxtrick.util.time.buildDate(player.lastMatchDate, { showTime: false });

						let str = Foxtrick.L10n.getString('Last_match_played_as_at', mins);
						xPlayer.lastMatchText =
							str.replace('%1', String(mins))
							   .replace('%2', player.lastPosition)
							   .replace('%3', dateText);
					}
					else {
						xPlayer.lastMatchText = Foxtrick.L10n.getString('Last_match_didnot_play');
					}
				}
			}

			let missingXML = Foxtrick.filter(function(p) {
				// NT players often are not available in XML
				return !p.inXML && !isNT;
			}, playerList);
			if (missingXML.length) {
				Foxtrick.log('WARNING: New players in HTML', missingXML, 'resetting cache');
				let htTime = Foxtrick.util.time.getHTTimeStamp(doc) || Date.now();
				Foxtrick.util.api.setCacheLifetime(JSON.stringify(args), htTime);
			}
		}
		catch (e) { Foxtrick.log(e); }
	};

	var parseHtml = function() {
		/**
		 * @param {Player} player
		 * @param {HTMLAnchorElement} matchLink
		 * @param {boolean} isNewDesign
		 */
		var addLastMatchInfo = (player, matchLink, isNewDesign) => {
			player.lastMatch = Foxtrick.cloneElement(matchLink, true);
			player.lastMatch.target = '_blank';

			// README: using user date since no time is available
			player.lastMatchDate = Foxtrick.util.time.getDateFromText(matchLink.textContent);

			let matchId = Foxtrick.getUrlParam(matchLink.href, 'matchId');
			let youthMatchId = Foxtrick.getUrlParam(matchLink.href, 'youthMatchId');
			player.lastMatchId = parseInt(youthMatchId || matchId, 10);

			if (isNewDesign) {
				let parent = matchLink.parentNode;
				let positionNode = parent.querySelector('.last_match_position');
				let positionMatch = positionNode.textContent.match(/\((.+)\)/) ||
					positionNode.nextElementSibling.textContent.match(/\((.+)\)/);

				let [_, position] = positionMatch; // lgtm[js/unused-local-variable]
				player.lastPosition = position;
				player.lastPositionType = Foxtrick.L10n.getPositionType(position);

				let ratingCircle = matchLink.previousElementSibling;
				if (ratingCircle) {
					let fullStars = ratingCircle.getAttribute('rating');
					let rating = fullStars && parseFloat(fullStars) || 0;
					let stamina = ratingCircle.getAttribute('stamina');
					let staminaVal = stamina && parseFloat(stamina) || 1;
					let lossPctg = 1-staminaVal;

					player.lastRating = rating; // =average
					player.lastRatingEndOfGame = rating * staminaVal;
					player.lastRatingDecline = lossPctg * rating;
					return;
				}
			}

			let positionText;

			/** @type {Element} */
			let parent = matchLink.parentElement;
			let positionEl;
			if ((positionEl = parent.querySelector('.last_match_position'))) {
				positionText = positionEl.textContent;
			}
			else if (Foxtrick.hasClass(parent, 'playerInfo')) {
				positionText = matchLink.nextSibling.textContent;
			}
			else {
				parent = parent.nextElementSibling;
				let positionSpan = parent.querySelector('.shy');
				positionText = positionSpan.textContent;
			}
			let position = positionText.match(/\((.+)\)/)[1].trim();
			player.lastPosition = position;
			player.lastPositionType = Foxtrick.L10n.getPositionType(position);

			let rating = 0, ratingYellow = 0;
			let stars = parent.querySelectorAll('img');
			for (let star of stars) {
				/* eslint-disable no-magic-numbers */
				if (Foxtrick.hasClass(star, 'starBig'))
					rating += 5;
				if (Foxtrick.hasClass(star, 'starWhole'))
					rating += 1;
				if (Foxtrick.hasClass(star, 'starHalf'))
					rating += 0.5;

				if (/star_big_yellow\.png$/i.test(star.src))
					ratingYellow += 5;
				if (/star_yellow\.png$/i.test(star.src))
					ratingYellow += 1;
				if (/star_half_yellow\.png$/i.test(star.src))
					ratingYellow += 0.5;
				if (/star_yellow_to_brown\.png$/i.test(star.src))
					ratingYellow += 0.5;
				/* eslint-enable no-magic-numbers */
			}
			player.lastRating = rating;
			player.lastRatingEndOfGame = ratingYellow;
			player.lastRatingDecline = rating - ratingYellow;
		};

		// preparation steps
		var isOwn = Foxtrick.Pages.Players.isOwn(doc);
		var isOwnYouth = Foxtrick.Pages.Players.isOwnYouth(doc);
		var isYouthPerfView = Foxtrick.Pages.Players.isYouthPerfView(doc);

		var pNodes = Foxtrick.Pages.Players.getPlayerNodes(doc);
		Foxtrick.forEach(function(playerNode, i) {
			const AGE_RE = /\d+\D+\d+\s\S+/;
			var paragraphs = Foxtrick.toArray(playerNode.getElementsByTagName('p'));

			/** @type {NodeListOf<HTMLElement>} */
			let iconEls = playerNode.querySelectorAll('img, i, object');
			var icons = Foxtrick.toArray(iconEls);

			var isNewDesign = !Foxtrick.hasClass(playerNode, 'playerInfo') &&
				!Foxtrick.hasClass(playerNode, 'playerInfoOld');

			var id = Foxtrick.Pages.Players.getPlayerId(playerNode);

			// see if player is already in playerList, add if not
			var player = Foxtrick.nth(findById(id), playerList);
			if (!player) {
				/** @type {Partial<Player>} */
				let p = { id: id };
				player = /** @type {Player} */ (p);
				playerList.push(player);
			}

			player.playerNode = playerNode;

			/** @type {HTMLAnchorElement} */
			var nameLink = playerNode.querySelector('a[href]:not(.flag)');
			player.nameLink = Foxtrick.cloneElement(nameLink, true);

			if (Foxtrick.hasClass(playerNode, 'hidden'))
				player.hidden = true;

			var [info] = paragraphs;
			var attributes = ['leadership', 'experience', 'loyalty'];

			if (isNewDesign) {
				let numberNode, number;
				if ((numberNode = nameLink.previousSibling) &&
				    (number = numberNode.textContent.trim()))
					player.number = parseInt(number, 10);

				/** @type {HTMLTableElement} */
				let playerInfo = playerNode.querySelector('.transferPlayerInformation table');
				if (Foxtrick.Pages.Players.isYouth(doc))
					playerInfo = playerNode.querySelector('.playerInfo table');

				{
					/** @typedef {'owner'|'age'|'tsi'|'salary'} AnonRowKey */
					/** @type {AnonRowKey[]} */
					let anonRows = ['owner', 'age', 'tsi', 'salary'];

					/** @type {Partial<Record<AnonRowKey, HTMLTableCellElement>>} */
					let anonCells = {};

					/** @type {Partial<Record<AnonRowKey, string>>} */
					let anonTexts = {};

					if (Foxtrick.Pages.Players.isYouth(doc)) {
						let ageText = info.textContent;
						let ageMatch = ageText.match(AGE_RE);
						if (ageMatch !== null)
							ageText = ageMatch[0].replace(',', '');

						player.ageText = ageText;
					}
					else {
						if (Foxtrick.Pages.Players.isRegular(doc))
							anonRows.shift(); // no owner
						else if (Foxtrick.Pages.Players.isNT(doc))
							anonRows.pop(); // no salary

						for (let [idx, rowType] of anonRows.entries()) {
							let row = playerInfo.rows[idx];
							if (!row)
								break;
							let cell = row.cells[1];
							anonCells[rowType] = cell;
							anonTexts[rowType] = cell.textContent.trim();
						}
						player.ageText = anonTexts.age;
					}
					if (!player.age) {
						let [years, days] = player.ageText.match(/(\d+)/g);
						player.age = {
							years: parseInt(years, 10),
							days: parseInt(days, 10),
						};
						player.ageYears = player.age.years;
					}

					if (Foxtrick.Pages.Players.isSenior(doc)) {
						if (!player.currentClubLink && anonCells.owner) {
							let link = anonCells.owner.querySelector('a');
							let currentClubId = Foxtrick.util.id.getTeamIdFromUrl(link.href);
							player.currentClubLink = Foxtrick.cloneElement(link, true);
							player.currentClubLink.target = '_blank';
							player.currentClubId = currentClubId;
						}
						if (!player.tsi && anonTexts.tsi) {
							let tsi = anonTexts.tsi.replace(/\D/g, '');
							player.tsi = parseInt(tsi, 10);
						}
						if (!player.salary && anonCells.salary) {
							let { base, total, bonus } =
								Foxtrick.Pages.Player.getWage(doc, anonCells.salary) || {};

							player.salary = total;
							player.salaryBase = base;
							player.isAbroad = !!bonus;
						}
					}
				}

				{
					const SPEC_PREFIX = 'icon-speciality-'; // HT-TYPO
					let getCellFromNamedRow =
						id => playerInfo.querySelector(`tr[id$="${id}"] td:nth-child(2)`);

					let specIcon, specTd = getCellFromNamedRow('trSpeciality'); // HT-TYPO
					if (specTd && (specIcon = specTd.querySelector(`i[class*="${SPEC_PREFIX}"]`))) {
						let classes = [...specIcon.classList];
						let specClass = classes.filter(c => c.startsWith(SPEC_PREFIX))[0];
						let specNum = parseInt(specClass.match(/\d+/)[0], 10);

						player.specialtyNumber = specNum;
						player.specialty = Foxtrick.L10n.getSpecialtyFromNumber(specNum);
					}

					let namedSkillRows = ['trForm', 'trStamina'];
					for (let rowId of namedSkillRows) {
						let cell = getCellFromNamedRow(rowId);
						if (!cell)
							continue;

						let skill = rowId.slice(2).toLowerCase();
						player[skill] = Foxtrick.Pages.Player.getSkillLevel(cell);
					}
				}
			}
			else {
				attributes.unshift('form', 'stamina');
				let nameB = playerNode.querySelector('b');
				if (nameB) {
					let num = nameB.textContent.match(/(\d+)\./);
					if (num)
						player.number = parseInt(num[1], 10);

					// README: category detection in HTML needs info in htlang.json
					// thus disabled for now
					// var cat = nameB.textContent.match(/\((.+)\)/);
					// if (cat) {
					// 	// stored as catergoy id
					// 	player.category = Foxtrick.L10n.getCategoryId(cat[1]);
					// }
				}

				// The bit of text that contains age, tsi
				var ageElement = info.firstChild;
				var basicHtml = ageElement.textContent;
				var br = info.firstChild.nextSibling;
				if (br) {
					basicHtml += ' ' + br.textContent;
					let tsiElement = br.nextSibling;
					if (tsiElement)
						basicHtml += ' ' + tsiElement.textContent;
				}

				var ageText = basicHtml.trim().replace(/\s\s+/g, ' ');
				{
					// First we dump TSI out of the string, and then
					// the first match is years and the second is days
					let tsiMatch = ageText.match(/\w+(\s*[=:–])?\s*[\d\s]*,/);
					if (tsiMatch)
						ageText = ageText.replace(tsiMatch[0], '');

					let ageMatch = ageText.match(AGE_RE);
					if (ageMatch !== null)
						ageText = ageMatch[0].replace(',', '');

					player.ageText = ageText;
				}

				if (!player.age) {
					let ageMatch = ageText.match(/(\d+)/g);
					player.age = {
						years: parseInt(ageMatch[0], 10),
						days: parseInt(ageMatch[1], 10),
					};
					player.ageYears = player.age.years;
				}

				if (Foxtrick.Pages.Players.isSenior(doc) && !player.tsi) {
					// youth players don't have TSI, and we can fetch directly
					// from XML if it's there
					let basicNumbers = basicHtml.replace(/\s+/g, '').match(/\d+/g);
					if (basicNumbers) {
						let tsi = basicNumbers[2];
						player.tsi = parseInt(tsi, 10);
					}
				}

				let specMatch = info.textContent.match(/\[(\D+)\]/);
				if (specMatch) {
					let spec = specMatch[1].trim();
					player.specialty = spec;
					player.specialtyNumber = Foxtrick.L10n.getNumberFromSpecialty(spec);
				}
			}

			// this could include form, stamina, leadership and experience, and loyalty
			// if its length ≥ 2, then it includes form and stamina
			// if its length ≥ 4, then it includes leadership and experience
			// loyalty is 5th
			/** @type {NodeListOf<HTMLAnchorElement>} */
			let skillLinks = info.querySelectorAll('.skill');
			var attributeLinks = Foxtrick.toArray(skillLinks);

			var missingAttributes = Foxtrick.filter(function(attr) {
				return typeof player[attr] === 'undefined';
			}, attributes);
			if (missingAttributes.length) {
				/** @type {Object.<string, HTMLAnchorElement>} */
				let links = {};
				if (attributeLinks.length >= 2 && attributes.includes('form')) {
					if (/skillshort/i.test(attributeLinks[0].href)) {
						links.form = attributeLinks[0];
						links.stamina = attributeLinks[1];
					}
					else {
						links.stamina = attributeLinks[0];
						links.form = attributeLinks[1];
					}
					attributeLinks = attributeLinks.slice(2);
				}
				if (attributeLinks.length >= 2 && attributes.includes('experience')) {
					if (/skillshort/i.test(attributeLinks[0].href)) {
						links.leadership = attributeLinks[0];
						links.experience = attributeLinks[1];
					}
					else {
						links.experience = attributeLinks[0];
						links.leadership = attributeLinks[1];
					}
					attributeLinks = attributeLinks.slice(2);
				}
				if (attributeLinks.length >= 1)
					links.loyalty = attributeLinks.shift();

				Foxtrick.forEach(function(attr) {
					if (typeof links[attr] !== 'undefined')
						player[attr] = Foxtrick.util.id.getSkillLevelFromLink(links[attr]);

				}, missingAttributes);
			}

			if (isOwn || isOwnYouth) {
				let skillTable = playerNode.querySelector('table');
				let parent = skillTable.parentElement;
				if (Foxtrick.hasClass(parent, 'transferPlayerInformation'))
					skillTable = playerNode.querySelector('.transferPlayerSkills');

				let skillInfo;
				if (Foxtrick.Pages.Players.isSenior(doc)) {
					skillInfo = Foxtrick.Pages.Player.parseSeniorSkills(skillTable);
				}
				else if (Foxtrick.Pages.Players.isYouth(doc)) {
					skillInfo = Foxtrick.Pages.Player.parseYouthSkills(skillTable);

					/** @type {HTMLElement} */
					let twinsInfo = playerNode.querySelector('.ft-youth-twins-container');
					if (twinsInfo && Number(twinsInfo.dataset.possible)) {
						let marked = Number(twinsInfo.dataset.marked);
						let undecided = Number(twinsInfo.dataset.undecided);

						let twinLink = doc.createElement('a');
						twinLink.href = twinsInfo.dataset.url;
						twinLink.target = '_blank';
						twinLink.relList.add('noopener');
						twinLink.setAttribute('aria-label', twinLink.title = twinsInfo.title);
						twinLink.textContent = marked.toString() || '';

						if (undecided) {
							let newTwins = doc.createElement('strong');
							newTwins.textContent = '+' + undecided;
							twinLink.appendChild(newTwins);
						}

						player.twinLink = twinLink;
					}
				}


				if (skillInfo) {
					let skills = skillInfo.values;

					// @ts-ignore
					player.skills = skills; // FIXME youth
					for (let skill in skills)
						player[skill] = skills[skill];
				}
			}

			// red/yellow cards and injuries, these are shown as images
			player.cards = false;
			player.redCard = 0;
			player.yellowCard = 0;
			player.injured = false;
			player.bruised = false;
			player.injuredWeeks = 0;

			// only senior players can be transfer-listed
			if (Foxtrick.Pages.Players.isSenior(doc))
				player.transferListed = false;

			for (let icon of icons) {
				if (Foxtrick.hasClass(icon, 'motherclubBonus') ||
				    Foxtrick.hasClass(icon, 'icon-mother-club')) {
					player.motherClubBonus = doc.createElement('span');
					player.motherClubBonus.textContent = '✔';
					player.motherClubBonus.title =
						Foxtrick.L10n.getString('skilltable.youthplayer');
				}
				if (Foxtrick.hasClass(icon, 'cardsOne')) {
					let img = /** @type {HTMLImageElement} */ (icon);
					if (/red_card/i.test(img.src))
						player.redCard = 1;
					else
						player.yellowCard = 1;
				}
				else if (Foxtrick.hasClass(icon, 'icon-red-card')) {
					player.redCard = 1;
				}
				else if (Foxtrick.hasClass(icon, 'icon-yellow-card')) {
					player.yellowCard = 1;
				}
				else if (Foxtrick.hasClass(icon, 'cardsTwo') ||
				         Foxtrick.hasClass(icon, 'icon-yellow-card-x2')) {
					player.yellowCard = 2;
				}
				else if (Foxtrick.any(cls => Foxtrick.hasClass(icon, cls),
				         ['injuryBruised', 'plaster', 'icon-plaster'])) {

					player.bruised = true;
				}
				else if (Foxtrick.hasClass(icon, 'injuryInjured') ||
				         Foxtrick.hasClass(icon, 'icon-injury')) {

					// README: may contain infinity sign
					let lengthStr = icon.dataset.injuryLength || icon.nextSibling.textContent;
					let length = lengthStr.replace(/\u221e/, 'Infinity');
					player.injuredWeeks = parseFloat(length);
				}
				else if (Foxtrick.hasClass(icon, 'transferListed') ||
				         Foxtrick.hasClass(icon, 'icon-transferlisted')) {
					player.transferListed = true;
				}
			}

			player.cards = player.yellowCard + player.redCard !== 0;
			player.injured = player.bruised || player.injuredWeeks !== 0;

			// HTMS points
			/** @type {HTMLElement} */
			let htms = playerNode.querySelector('.ft-htms-points');
			if (htms) {
				player.htmsAbility = parseInt(htms.dataset.htmsAbility, 10);
				player.htmsPotential = parseInt(htms.dataset.htmsPotential, 10);
			}

			/** @type {HTMLElement} */
			let u21 = playerNode.querySelector('.ft-u21lastmatch');
			if (u21) {
				let title = u21.textContent;
				let text = u21.dataset.valueString;
				let value = parseInt(u21.dataset.value, 10);
				player.u21 = { title, text, value };
			}

			// last match
			/** @type {HTMLAnchorElement} */
			let matchLink;
			if (isYouthPerfView) {
				/** @type {NodeListOf<HTMLAnchorElement>} */
				let coll = playerNode.querySelectorAll('a[href*="Matches/Match"]');
				let links = [...coll];
				let nonPerfLinks = links.filter(l => !l.closest('.youthPlayerPerformance'));
				matchLink = nonPerfLinks.shift();
			}
			else {
				matchLink = playerNode.querySelector('a[href*="Matches/Match"]');
			}

			if (matchLink)
				addLastMatchInfo(player, matchLink, isNewDesign);

			if (Foxtrick.Pages.Players.isOwn(doc) &&
			    !Foxtrick.Pages.Players.isNT(doc)) {
				let tc = doc.createElement('a');
				tc.title = Foxtrick.L10n.getString('TransferCompare');
				let tcUrl = player.nameLink.href;
				tcUrl = tcUrl.replace('/Club/Players/Player.aspx',
				                      '/Club/Transfers/TransferCompare.aspx');
				tc.href = tcUrl;
				tc.target = '_blank';
				player.transferCompare = tc;

				let tcImg = doc.createElement('img');
				tcImg.height = 16;
				tcImg.src = '/App_Themes/Standard/images/ActionIcons/sell.png';
				tcImg.alt = Foxtrick.L10n.getString('TransferCompare.abbr');
				tcImg.setAttribute('aria-label', tc.title);
				tc.appendChild(tcImg);
			}

			// playerstats
			if (Foxtrick.Pages.Players.isYouth(doc))
				addHYLink(doc, player);
			else
				addPerfHistLink(doc, player);

			if (!player.currentClubLink &&
			   (Foxtrick.Pages.Players.isOldies(doc) ||
			    Foxtrick.Pages.Players.isCoaches(doc) ||
			    Foxtrick.Pages.Players.isNT(doc))) {
				let currentClubLink = null, currentClubId = null;
				Foxtrick.any(function(currentPara) {
					let plinks = currentPara.querySelectorAll('a');
					currentClubLink = Foxtrick.nth(function(link) {
						return /TeamID=/i.test(link.href);
					}, plinks);
					if (!currentClubLink)
						return false;

					currentClubId = Foxtrick.util.id.getTeamIdFromUrl(currentClubLink.href);
					let clone = Foxtrick.cloneElement(currentClubLink, true);

					player.currentClubLink = clone;
					player.currentClubLink.target = '_blank';
					player.currentClubId = currentClubId;

					if (!Foxtrick.Pages.Players.isNT(doc)) {
						// not applicable for NT players
						// we concatenate the text nodes from the containing
						// <p> to a string, and search for league names there.
						let leagueText = '';
						Foxtrick.forEach(function(node) {
							if (node.nodeName === '#text') {
								// the text is in a child text node of currentPara,
								// so we remove all tags
								leagueText += node.textContent;
							}
						}, currentPara.childNodes);

						for (let j in Foxtrick.XMLData.League) {
							// README: this will break with localized league names
							let id = parseInt(j, 10);
							let league = Foxtrick.L10n.getCountryNameNative(id);
							if (leagueText.indexOf(league) >= -1) {
								player.currentLeagueId = id;
								break;
							}
						}
					}

					return true;
				}, paragraphs);
			}

			/** @type {HTMLElement} */
			let psicoDiv = playerNode.querySelector('.ft-psico');
			if (psicoDiv) {
				player.psicoTSI = parseFloat(psicoDiv.dataset.psicoAvg);
				player.psicoTitle = psicoDiv.dataset.psicoSkill;
				player.psicoWage = psicoDiv.dataset.psicoWage;
			}
			else {
				let psicoLink = null;
				let showDiv = doc.getElementById('psicotsi_show_div_' + i) ||
					doc.getElementById('psico_show_div_' + i);

				if (showDiv) {
					psicoLink = showDiv.querySelector('a');
					let psico = psicoLink.textContent;
					player.psicoTSI = parseFloat(psico.match(/\d+\.\d+/).toString());
					player.psicoTitle = psico.match(/(.+)\s\[/)[1];
				}
			}

		}, pNodes);
	};

	/**
	 * @param {Player[]} playerList
	 */
	var addContributionsInfo = function(playerList) {
		if (!Foxtrick.Pages.Players.isOwn(doc))
			return;

		for (let player of playerList) {
			let contributions = Foxtrick.Pages.Player.getContributions(player.skills, player);
			if (!contributions)
				continue;

			for (let name in contributions)
				player[name] = contributions[name];

			let bestPosition = Foxtrick.Pages.Player.getBestPosition(contributions);

			// if all skills = 0, then all positions contributions will be 0,
			// so bestPosition = X
			if (bestPosition.position) {
				player.bestPosition =
					Foxtrick.L10n.getString(bestPosition.position + 'Position.abbr');
				player.bestPositionLong =
					Foxtrick.L10n.getString(bestPosition.position + 'Position');
			}
			else {
				player.bestPosition = player.bestPositionLong = 'X';
			}

			player.bestPositionValue = bestPosition.value || 0;
		}
	};

	/**
	 * @param {document} doc
	 * @param {PlayerProps[]} playerList
	 */
	var addStamindaData = function(doc, playerList) {
		// only for own regular seniors
		if (!Foxtrick.Pages.Players.isRegular(doc) || !Foxtrick.Pages.All.isOwn(doc))
		    return;

		var ownId = Foxtrick.util.id.getOwnTeamId();

		/** @type {Record<number, [number, string]>} */
		var data = null, dataText = Foxtrick.Prefs.getString('StaminaData.' + ownId);
		try {
			data = JSON.parse(dataText);
		}
		catch (e) {
			Foxtrick.log(e);
		}

		if (!data || typeof data !== 'object')
			return;

		/** @type {Record<number, [number, string]>} */
		var newData = {}; // update player list
		Foxtrick.forEach(function(player) {
			if (!(player.id in data)) {
				player.staminaPrediction = null;
				return;
			}

			let old = data[player.id];
			newData[player.id] = old; // only copy existing players

			let [tmstmp, val] = old;
			let value = parseFloat(val);
			let date = new Date(tmstmp);

			player.staminaPrediction = { value, date };
			player.staminaPred = tmstmp;

		}, playerList);

		Foxtrick.Prefs.setString('StaminaData.' + ownId, JSON.stringify(newData));
	};

	// if callback is provided, we get list with XML
	// otherwise, we get list synchronously and return it
	if (callback) {
		// always display delayed
		var win = doc.defaultView;
		win.setTimeout(function() {
			getXml(doc, function(xml) {
				try {
					// parse HTML first because players present in HTML may
					// not present in XML (NT players)
					if (!options || !options.currentSquad)
						parseHtml();
					if (xml)
						parseXml(xml);
					addStamindaData(doc, playerList);
					addContributionsInfo(playerList);
				}
				catch (e) {
					Foxtrick.log(e);
					playerList = [];
				}

				try {
					callback(playerList);
					return;
				}
				catch (e) {
					Foxtrick.log('Error in callback for getPlayerList', e);
				}
			});
		}, 0);
		return null;
	}

	// else
	try {
		parseHtml();
		addStamindaData(doc, playerList);
		addContributionsInfo(playerList);
		return playerList;
	}
	catch (e) {
		Foxtrick.log(e);
		return null;
	}
};

/* eslint-enable complexity */

/**
 * Get player object from player list
 * @param  {Player[]} list Array<Player>
 * @param  {number}   id
 * @return {Player}      Player
 */
Foxtrick.Pages.Players.getPlayerFromListById = function(list, id) {
	return Foxtrick.nth(p => p.id === id, list);
};

/**
 * Get player ID from player container
 * @param  {Element} playerInfo .playerInfo container
 * @return {number}
 */
Foxtrick.Pages.Players.getPlayerId = function(playerInfo) {
	var id = null;
	try {
		/** @type {HTMLAnchorElement} */
		var nameLink = playerInfo.querySelector('a:not(.flag)');
		var pId = Foxtrick.getUrlParam(nameLink.href, 'playerId');
		var yPId = Foxtrick.getUrlParam(nameLink.href, 'youthPlayerId');
		id = parseInt(pId || yPId, 10);
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return id;
};

/**
 * Test whether any players in the player list have a certain property
 * @param  {Player[]}  playerList Array<Player>
 * @param  {PlayerKey} property
 * @return {boolean}
 */
Foxtrick.Pages.Players.isPropertyInList = function(playerList, property) {
	return Foxtrick.any((player) => {
		let val = player[property];
		switch (typeof val) {
			case 'undefined': return false;
			case 'string': return !!val.trim().length;
			case 'number': return !Number.isNaN(val) && val != 0;
			default: return val != null;
		}
	}, playerList);
};

/**
 * Get the timestamps of 2 last matches played by players: {last, second}.
 *
 * players is an array of arbitrary objects.
 *
 * getMatchDate extracts matchDate as a timestamp from a player object.
 * playerLimit is minimal player count for a match to be eligible.
 *
 * @template T
 * @param  {ArrayLike<T>}        players
 * @param  {function(T): number} getMatchDate
 * @param  {number}              [playerLimit]
 * @return {{last:number, second:number}}
 */
Foxtrick.Pages.Players.getLastMatchDates = function(players, getMatchDate, playerLimit = 1) {
	/** @type {Set<number>} */
	let mDays = new Set(), matchdaysCount = {}, lastMatch = 0, secondLastMatch = 0;

	for (let player of Foxtrick.toArray(players)) {
		let thisMatchday = getMatchDate(player);
		mDays.add(thisMatchday);

		if (matchdaysCount[thisMatchday])
			++matchdaysCount[thisMatchday];
		else
			matchdaysCount[thisMatchday] = 1;
	}

	let matchdays = [...mDays].sort();
	lastMatch = matchdays.slice().pop();

	const MSECS_IN_WEEK = Foxtrick.util.time.DAYS_IN_WEEK * Foxtrick.util.time.MSECS_IN_DAY;

	matchdays = Foxtrick.filter(function(n) {
		// delete all older than a week and all with too few players (might be transfers)
		const lastWeek = lastMatch - MSECS_IN_WEEK;
		return n > lastWeek && matchdaysCount[n] >= playerLimit;
	}, matchdays);

	if (matchdays.length)
		lastMatch = matchdays.slice().pop();
	else
		lastMatch = 0;

	if (matchdays.length - matchdaysCount[lastMatch] > 1) {
		// more than one match found
		secondLastMatch = matchdays[matchdays.length - matchdaysCount[lastMatch] - 1];
	}
	else {
		secondLastMatch = 0;
	}

	return { last: lastMatch, second: secondLastMatch };
};
