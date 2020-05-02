/**
 * players.js
 * Utilities on players page
 * @author convincedd, ryanli, LA-MJ
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.Players = {};

/**
 * Test whether this is a player list page.
 * Applies to all possible senior and youth pages.
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isPage = function(doc) {
	return this.isSenior(doc) || this.isYouth(doc);
};

/**
 * Test whether this is regular senior player page.
 * Key feature: last match link.
 * Applies to KeyPlayers as well.
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isRegular = function(doc) {
	return Foxtrick.isPage(doc, 'players');
};

/**
 * Test whether this is own senior player page.
 * Key feature: visible skills.
 * Applies to KeyPlayers and NT coaches as well.
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isOwn = function(doc) {
	return Foxtrick.isPage(doc, 'ownPlayers');
};

/**
 * Test whether this is a senior player list page.
 * Applies to all possible senior pages.
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isSenior = function(doc) {
	return Foxtrick.isPage(doc, 'allPlayers');
};

/**
 * Test whether this is an NT player page
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isNT = function(doc) {
	return Foxtrick.isPage(doc, 'ntPlayers');
};

/**
 * Test whether this is an oldies page
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isOldies = function(doc) {
	return Foxtrick.isPage(doc, 'oldPlayers');
};

/**
 * Test whether this is an old coaches page
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isCoaches = function(doc) {
	return Foxtrick.isPage(doc, 'oldCoaches');
};

/**
 * Test whether this is a youth player page
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isYouth = function(doc) {
	return Foxtrick.isPage(doc, 'youthPlayers');
};

/**
 * Test whether this is youth performance view.
 * Skills are unavailable, but position matrix is.
 *
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isYouthPerfView = function(doc) {
	return !!doc.querySelector('.youthPlayerPerformance');
};

/**
 * Test whether this is own youth player page
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isOwnYouth = function(doc) {
	return Foxtrick.isPage(doc, 'ownYouthPlayers');
};

/**
 * Test whether this is a match order page
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isMatchOrder = function(doc) {
	return Foxtrick.isPage(doc, 'matchOrder') || Foxtrick.isPage(doc, 'matchOrderSimple');
};

/**
 * Test whether this is a youth match order page
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isYouthMatchOrder = function(doc) {
	return this.isMatchOrder(doc) &&
		/isYouth=true|SourceSystem=Youth/i.test(doc.location.href);
};

/**
 * Test whether this is a simple match order page
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isSimpleMatchOrder = function(doc) {
	return Foxtrick.isPage(doc, 'matchOrderSimple');
};

/**
 * Get the list of player containers.
 *
 * include may optionally include faces or separators,
 * e.g. {face: true, separator: true}
 *
 * @param  {document}       doc
 * @param  {object}         include
 * @return {Array<Element>}         playerNodes
 */
Foxtrick.Pages.Players.getPlayerNodes = function(doc, include) {
	const INFOS = ['playerInfo', 'playerInfoOld', 'playerListDetails'];
	const INFOS_SELECTOR = INFOS.map(cls => `.${cls}`).join(',');
	const FACES = ['faceCard', 'faceCardNoBottomInfo'];
	const FACES_SELECTOR = FACES.map(cls => `.${cls}`).join(',');
	const SEPS = ['borderSeparator', 'separator'];
	const SEPS_SELECTOR = SEPS.map(cls => `.${cls}`).join(',');

	let pred = (el) => {
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

		return !Object.values(is).some(val => val);
	};

	let mainBody = doc.getElementById('mainBody');
	let playerList = doc.querySelector('.playerList');
	let nodeColl = playerList ? playerList.children : mainBody.children;
	let nodes = [...nodeColl];

	let divs = nodes.filter(el => el.nodeName == 'DIV' && (el.querySelector(INFOS_SELECTOR) ||
	                        el.matches(`${INFOS_SELECTOR}, ${FACES_SELECTOR}, ${SEPS_SELECTOR}`)));

	let pNodes = divs.filter(el => pred(el));
	if (include && include.face) {
		let newFaces = pNodes.map(n => n.querySelector('.faceCardNoBottomInfo')).filter(x => x);
		pNodes.push(...newFaces);
	}

	return pNodes;
};

/* eslint-disable complexity */

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
 * @param  {document}      doc
 * @param  {Function}      callback function(Array<Player>)
 * @param  {object}        options  {teamId, isYouth, isNT, includeMatchInfo, currentSquad, refresh}
 * @return {Array<object>}          Array<Player>
 */
Foxtrick.Pages.Players.getPlayerList = function(doc, callback, options) {
	var playerList = [];
	var args = [];
	var isNT = false;

	var findById = function(id) {
		return function(p) {
			return p.id == id;
		};
	};

	var getXml = function(doc, callback) {

		var teamId = Foxtrick.util.id.getOwnTeamId();
		if (options && options.teamId)
			teamId = options.teamId;
		else if (/teamid=(\d)/i.test(doc.location.href))
			teamId = Foxtrick.util.id.getTeamIdFromUrl(doc.location.href);
		teamId = parseInt(teamId, 10);

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
			var action = 'supporterstats', all = true;
			if (options && options.currentSquad || !Foxtrick.util.layout.isSupporter(doc)) {
				action = 'view';
				all = false;
			}
			args.push(['file', 'nationalplayers']);
			args.push(['teamId', teamId]);
			args.push(['actionType', action]);
			args.push(['showAll', all]);
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
			var now = Foxtrick.util.time.getHTTimeStamp(doc);
			Foxtrick.util.api.setCacheLifetime(JSON.stringify(args), now);
		}
		Foxtrick.util.currency.detect(doc).then(function() {
			Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'session' }, callback);
		}).catch(function(reason) {
			Foxtrick.log('WARNING: currency.detect aborted:', reason);
		});
	};

	var addPerfHistLink = function(doc, player) {
		var ps = doc.createElement('a');
		ps.title = Foxtrick.L10n.getString('PerformanceHistory');
		var psUrl = player.nameLink.href;
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
	var addHYLink = function(doc, player) {
		var hyUrl = 'https://www.hattrick-youthclub.org/redirect/type/player_details/ht_id/' +
			player.id;

		var hyLink = doc.createElement('a');
		hyLink.title = Foxtrick.L10n.getString('HyLink');
		hyLink.href = hyUrl;
		hyLink.target = '_blank';
		player.hyLink = hyLink;
		Foxtrick.addImage(doc, hyLink, {
			src: Foxtrick.InternalPath + 'resources/img/staff/hyouthclub.png',
			alt: Foxtrick.L10n.getString('HyLink.abbr'),
			'aria-label': hyLink.title,
		});
	};
	var parseXml = function(xml) {
		try {
			if (!xml)
				return;

			var currencyRate = Foxtrick.util.currency.getRate();

			var playerNode;
			var num = function(nodeName, parent) {
				var value = xml.num(nodeName, parent || playerNode);

				// deal with goals being undefined during matches
				if (isNaN(value))
					return void 0;

				return value;
			};
			var money = function(nodeName, parent) {
				return xml.money(nodeName, currencyRate, parent || playerNode);
			};
			var node = function(nodeName, parent) {
				return xml.node(nodeName, parent || playerNode);
			};
			var text = function(nodeName, parent) {
				return xml.text(nodeName, parent || playerNode);
			};
			var bool = function(nodeName, parent) {
				return xml.bool(nodeName, parent || playerNode);
			};
			var ifPositive = function(nodeName, parent) {
				var value = num(nodeName, parent);
				if (value > 0)
					return value;

				return void 0;
			};
			var addProperty = function(player, fn) {
				return function(name) {
					var newName, nodeName;
					if (Array.isArray(name)) {
						newName = name[0];
						nodeName = name[1];
					}
					else {
						newName = name.replace(/^./, function(m) {
							return m.toLowerCase();
						});
						newName = newName.replace(/Skill$/, '');
						nodeName = name;
					}
					if (typeof player[newName] === 'undefined' && node(nodeName))
						player[newName] = fn(nodeName);
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
			var currentClubUrl = isYouth ?
				'/Club/Youth/?YouthTeamID=' + currentClubId :
				'/Club/?TeamID=' + currentClubId;

			var currentClubLink;
			let tNameNode = xml.node(isYouth ? 'YouthTeamName' : 'TeamName');
			if (tNameNode) {
				currentClubLink = doc.createElement('a');
				currentClubLink.textContent = tNameNode.textContent;
				currentClubLink.href = currentClubUrl;
				currentClubLink.target = '_blank';
			}

			var nodeName = isYouth ? 'YouthPlayer' : 'Player';
			var playerNodes = xml.getElementsByTagName(nodeName);
			nodeName = isYouth ? 'YouthPlayerID' : 'PlayerID';
			for (var i = 0; i < playerNodes.length; ++i) {
				playerNode = playerNodes[i];
				var id = num(nodeName);

				// find player with the same ID from playerList
				// (parsed from HTML)
				var player = Foxtrick.nth(findById(id), playerList);
				if (!player) {
					// player not present in HTML!
					if (!options || !options.currentSquad) {
						// skip if not retrieving squad from other page
						continue;
					}
					else {
						player = { id: id };
						playerList.push(player);

						player.currentSquad = true;
						player.active = true;

						if (node('PlayerNumber')) {
							// only add if not present in HTML since HTML always has current data
							// number = 100 means this player hasn't been assigned one
							var number = num('PlayerNumber');
							if (number >= 1 && number < 100) {
								player.number = number;
							}
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
					var age = {};
					age.years = num('Age');
					age.days = num('AgeDays');
					player.age = age;
					player.ageYears = age.years;
				}

				var nums = [
					'StaminaSkill',
					['form', 'PlayerForm'],
					'Loyalty',
					'TransferListed',
					['tsi', 'TSI'],
				];
				Foxtrick.forEach(addProperty(player, num), nums);

				if (!player.skills)
					player.skills = {};

				var skills = [
					['defending', 'DefenderSkill'],
					'KeeperSkill',
					'PassingSkill',
					['playmaking', 'PlaymakerSkill'],
					['scoring', 'ScorerSkill'],
					'SetPiecesSkill',
					'WingerSkill',
				];
				Foxtrick.forEach(addProperty(player.skills, num), skills);

				var newSkillInfo = false;
				for (var skill in player.skills) {
					if (typeof player[skill] === 'undefined') {
						player[skill] = player.skills[skill];

						// skill info was missing
						newSkillInfo = true;
					}
				}

				if (newSkillInfo && !isYouth) {
					var htmsInput = {
						years: player.age.years,
						days: player.age.days,
					};
					Foxtrick.mergeAll(htmsInput, player.skills);
					var htmsResult = Foxtrick.modules['HTMSPoints'].calc(htmsInput);
					player.htmsAbility = htmsResult[0];
					player.htmsPotential = htmsResult[1];

					var psico = Foxtrick.modules['PsicoTSI'].getPrediction(player);
					player.psicoTSI = psico.formAvg;
				}

				if (typeof player.specialty === 'undefined' && node('Specialty')) {
					var specNum = num('Specialty') || 0;
					var spec = Foxtrick.L10n.getSpecialtyFromNumber(specNum);
					player.specialtyNumber = specNum;
					player.specialty = spec;
				}

				if (typeof player.motherClubBonus === 'undefined' && node('MotherClubBonus')) {
					if (bool('MotherClubBonus')) {
						player.motherClubBonus = doc.createElement('span');
						player.motherClubBonus.textContent = '✔';
						player.motherClubBonus.title =
							Foxtrick.L10n.getString('skilltable.youthplayer');
					}
				}

				if (typeof player.cards === 'undefined' && node('Cards')) {
					player.yellowCard = num('Cards');
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
					player.bruised = player.injuredWeeks ? 0 : 1;
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
					var first = text('FirstName');
					var last = text('LastName');
					var nick = text('NickName');

					var fullName = first + ' ' + last;
					nameLink.textContent = fullName;
					nameLink.dataset.fullName = fullName;

					nameLink.title = first + (nick ? ' \'' + nick + '\'' : '') + ' ' + last;
					nameLink.dataset.fullNameAndNick = nameLink.title;
					nameLink.dataset.nickName = nick;

					// first name stripping
					var shortName =
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
					player.currentClubLink = currentClubLink.cloneNode(true);
					player.currentClubId = currentClubId;
				}

				// README: XML exclusive info starts here

				var xmlNums = [
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
					'IsAbroad',
					'Leadership',
					'LeagueGoals',
					['matchCount', 'NrOfMatches'], // NT supp stats
					'MatchesCurrentTeam',
					['nationalTeamId', 'NationalTeamID'],
				];
				Foxtrick.forEach(addProperty(player, num), xmlNums);

				var texts = [
					'OwnerNotes',
					'Statement',
				];
				Foxtrick.forEach(addProperty(player, text), texts);

				// only include these if meaningful data available
				var optionalNums = [
					'Caps',
					'CapsU20',
					['category', 'PlayerCategoryId'],
				];
				Foxtrick.forEach(addProperty(player, ifPositive), optionalNums);

				// custom fields
				if (node('ArrivalDate'))
					player.joinedSince = xml.time('ArrivalDate', playerNode);

				if (node('CanBePromotedIn')) {
					// adjust for cached time
					var cachedPromo = new Date(fetchedDate);
					var diffDays = -1;
					while (cachedPromo <= now) {
						cachedPromo = Foxtrick.util.time.addDaysToDate(cachedPromo, 1);
						++diffDays;
					}
					player.canBePromotedIn = num('CanBePromotedIn') - diffDays;
				}
				if (node('Salary')) {
					player.salary = money('Salary');
				}
				var trainerData = node('TrainerData');
				if (trainerData) {
					player.trainerData = {};
					if (node('TrainerType', trainerData)) {
						player.trainerData.type = num('TrainerType', trainerData);
					}
					if (node('TrainerSkill', trainerData)) {
						player.trainerData.skill = num('TrainerSkill', trainerData);
					}
				}
				var LastMatch = node('LastMatch');
				if (LastMatch && node('Date', LastMatch)) {
					let lastMatchUrlTemplate = '/Club/Matches/Match.aspx?matchID={matchId}' +
						'&SourceSystem={sourceSystem}&teamId={teamId}{youthId}' +
						'&HighlightPlayerID={id}#tab2';

					if (!player.lastMatch) {
						// sometimes last match is missing from HTML even if player is available

						if (xml.node('Rating', LastMatch)) {
							player.lastRating = parseFloat(xml.text('Rating', LastMatch));
							if (xml.node('RatingEndOfGame', LastMatch)) {
								player.lastRatingEndOfGame =
									parseFloat(xml.text('RatingEndOfGame', LastMatch));
								player.lastRatingDecline = player.lastRating -
									player.lastRatingEndOfGame;
							}
						}
						if (xml.node('MatchId', LastMatch))
							player.lastMatchId = xml.num('MatchId', LastMatch);
						else if (xml.node('YouthMatchID', LastMatch))
							player.lastMatchId = xml.num('YouthMatchID', LastMatch);

						let matchDate = xml.date('Date', LastMatch);
						matchDate = Foxtrick.util.time.toUser(doc, matchDate);
						player.lastMatchDate = matchDate;

						let link = doc.createElement('a');

						link.href = Foxtrick.format(lastMatchUrlTemplate, {
							matchId: player.lastMatchId,
							teamId,
							sourceSystem,
							youthParam,
						});

						let dateStr = Foxtrick.util.time.buildDate(matchDate, { showTime: false });
						link.textContent = dateStr;
						link.target = '_blank';
						player.lastMatch = link;

						let lastPositionCode = num('PositionCode', LastMatch);
						let pos = Foxtrick.L10n.getPositionTypeById(lastPositionCode);
						if (pos) {
							player.lastPositionType = pos;
							let position = Foxtrick.L10n.getPositionByType(pos);
							player.lastPosition = position;
						}

					}

					let mins = player.lastPlayedMinutes = num('PlayedMinutes', LastMatch);
					if (mins) {
						let dateText =
							Foxtrick.util.time.buildDate(player.lastMatchDate, { showTime: false });

						let str = Foxtrick.L10n.getString('Last_match_played_as_at', mins);
						player.lastMatchText =
							str.replace('%1', player.lastPlayedMinutes)
							   .replace('%2', player.lastPosition)
							   .replace('%3', dateText);
					}
					else {
						player.lastMatchText = Foxtrick.L10n.getString('Last_match_didnot_play');
					}
				}
			}

			var missingXML = Foxtrick.filter(function(p) {
				// NT players often are not available in XML
				return !p.inXML && !isNT;
			}, playerList);
			if (missingXML.length) {
				Foxtrick.log('WARNING: New players in HTML', missingXML, 'resetting cache');
				var htTime = Foxtrick.util.time.getHTTimeStamp(doc);
				Foxtrick.util.api.setCacheLifetime(JSON.stringify(args), htTime);
			}
		}
		catch (e) { Foxtrick.log(e); }
	};

	var parseHtml = function() {
		var addLastMatchInfo = (player, matchLink, isNewDesign) => {
			player.lastMatch = matchLink.cloneNode(true);
			player.lastMatch.target = '_blank';

			// README: using user date since no time is available
			player.lastMatchDate = Foxtrick.util.time.getDateFromText(matchLink.textContent);

			var matchId = Foxtrick.getUrlParam(matchLink.href, 'matchId');
			var youthMatchId = Foxtrick.getUrlParam(matchLink.href, 'youthMatchId');
			player.lastMatchId = parseInt(youthMatchId || matchId, 10);

			if (isNewDesign) {
				let parent = matchLink.parentNode;
				let positionNode = parent.querySelector('.last_match_position') ||
					matchLink.nextSibling;
				let positionMatch = positionNode.textContent.match(/\((.+)\)/) ||
					positionNode.nextElementSibling.textContent.match(/\((.+)\)/);

				let [_, position] = positionMatch; // lgtm[js/unused-local-variable]
				player.lastPosition = position;
				player.lastPositionType = Foxtrick.L10n.getPositionType(position);

				let ratingCircle = matchLink.previousElementSibling;
				let fullStars = ratingCircle.querySelector('.stars-full, .stars-full-twodigits');
				let full = fullStars && parseInt(fullStars.textContent, 10) || 0;
				let halfStars = ratingCircle.querySelector('.stars-half, .stars-half-twodigits');
				let half = halfStars && parseFloat(halfStars.textContent) || 0;
				let rating = full + half;

				let stamCircle = ratingCircle.querySelector('circle[transform][stroke-dasharray]');
				if (stamCircle) {
					let bgCircle = ratingCircle.querySelector('circle.background');
					let totalStamina = parseFloat(stamCircle.getAttribute('stroke-dasharray'));
					let staminaVal = parseFloat(stamCircle.getAttribute('stroke-dashoffset'));
					let bgVal = parseFloat(bgCircle.getAttribute('stroke-dashoffset'));
					let staminaLoss = staminaVal - bgVal;
					let lossPctg = staminaLoss / totalStamina;
					let finalPctg = 1 - lossPctg;

					player.lastRating = rating; // =average
					player.lastRatingEndOfGame = finalPctg * rating;
					player.lastRatingDecline = lossPctg * rating;
					return;
				}
			}

			let positionText;
			let parent = matchLink.parentNode;
			let positionSpan;
			if ((positionSpan = parent.querySelector('.last_match_position'))) {
				positionText = positionSpan.textContent;
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
				if (Foxtrick.hasClass(star, 'starBig'))
					rating += 5;
				if (Foxtrick.hasClass(star, 'starWhole'))
					rating += 1;
				if (Foxtrick.hasClass(star, 'starHalf'))
					rating += 0.5;

				if (/star_big_yellow.png$/i.test(star))
					ratingYellow += 5;
				if (/star_yellow.png$/i.test(star))
					ratingYellow += 1;
				if (/star_half_yellow.png$/i.test(star))
					ratingYellow += 0.5;
				if (/star_yellow_to_brown.png$/i.test(star))
					ratingYellow += 0.5;
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
			var icons = Foxtrick.toArray(playerNode.querySelectorAll('img, i, object'));

			var isNewDesign = !Foxtrick.hasClass(playerNode, 'playerInfo') &&
				!Foxtrick.hasClass(playerNode, 'playerInfoOld');

			var id = Foxtrick.Pages.Players.getPlayerId(playerNode);

			// see if player is already in playerList, add if not
			var player = Foxtrick.nth(findById(id), playerList);
			if (!player) {
				player = { id };
				playerList.push(player);
			}

			player.playerNode = playerNode;

			var nameLink = playerNode.querySelector('a[href]:not(.flag)');
			player.nameLink = nameLink.cloneNode(true);

			if (Foxtrick.hasClass(playerNode, 'hidden'))
				player.hidden = true;

			var info = paragraphs[0];
			var attributes = ['leadership', 'experience', 'loyalty'];

			if (isNewDesign) {
				let numberNode, number;
				if ((numberNode = nameLink.previousSibling) &&
				    (number = numberNode.textContent.trim())) {
					player.number = parseInt(number, 10);
				}

				let playerInfo = playerNode.querySelector('.transferPlayerInformation table');
				if (Foxtrick.Pages.Players.isYouth(doc)) {
					playerInfo = playerNode.querySelector('.playerInfo table');
				}

				{
					let anonRows = ['owner', 'age', 'tsi', 'salary'],
						anonCells = {}, anonTexts = {};

					if (Foxtrick.Pages.Players.isYouth(doc)) {
						let ageText = info.textContent;
						if (ageText.match(AGE_RE) !== null) {
							ageText = ageText.match(AGE_RE)[0].replace(',', '');
						}
						player.ageText = ageText;
					}
					else {
						if (Foxtrick.Pages.Players.isRegular(doc))
							anonRows.shift(); // no owner
						else if (Foxtrick.Pages.Players.isNT(doc))
							anonRows.pop(); // no salary

						for (let [idx, rowType] of anonRows.entries()) {
							let row = playerInfo.rows[idx];
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
							player.currentClubLink = link.cloneNode(true);
							player.currentClubLink.target = '_blank';
							player.currentClubId = currentClubId;
						}
						if (!player.tsi && anonTexts.tsi) {
							let tsi = anonTexts.tsi.replace(/\D/g, '');
							player.tsi = parseInt(tsi, 10);
						}
						if (!player.salary && anonCells.salary) {
							let { total } = Foxtrick.Pages.Player.getWage(doc, anonCells.salary);
							player.salary = total;
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
					var tsiElement = br.nextSibling;
					if (tsiElement)
						basicHtml += ' ' + tsiElement.textContent;
				}

				let ageText = basicHtml.trim().replace(/\s\s+/g, ' ');

				// First we dump TSI out of the string, and then
				// the first match is years and the second is days
				var tsiMatch = ageText.match(/\w+(\s*[=:–])?\s*[\d\s]*,/);
				if (tsiMatch) {
					ageText = ageText.replace(tsiMatch[0], '');
				}

				if (ageText.match(AGE_RE) !== null) {
					ageText = ageText.match(AGE_RE)[0].replace(',', '');
				}
				player.ageText = ageText;

				if (!player.age) {
					var ageMatch = ageText.match(/(\d+)/g);
					player.age = {
						years: parseInt(ageMatch[0], 10),
						days: parseInt(ageMatch[1], 10),
					};
					player.ageYears = player.age.years;
				}

				if (Foxtrick.Pages.Players.isSenior(doc) && !player.tsi) {
					// youth players don't have TSI, and we can fetch directly
					// from XML if it's there
					var basicNumbers = basicHtml.replace(/\s+/g, '').match(/\d+/g);
					if (basicNumbers) {
						var tsi = basicNumbers[2];
						player.tsi = parseInt(tsi, 10);
					}
				}

				var specMatch = info.textContent.match(/\[(\D+)\]/);
				if (specMatch) {
					var spec = specMatch[1].trim();
					player.specialty = spec;
					player.specialtyNumber = Foxtrick.L10n.getNumberFromSpecialty(spec);
				}
			}

			// this could include form, stamina, leadership and experience, and loyaltz
			// if its length ≥ 2, then it includes form and stamina
			// if its length ≥ 4, then it includes leadership and experience
			// loyalty is 5th
			var attributeLinks = Foxtrick.toArray(info.getElementsByClassName('skill'));

			var missingAttributes = Foxtrick.filter(function(attr) {
				return typeof player[attr] === 'undefined';
			}, attributes);
			if (missingAttributes.length) {
				var links = {};
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
				if (attributeLinks.length >= 1) {
					links.loyalty = attributeLinks.shift();
				}

				Foxtrick.forEach(function(attr) {
					if (typeof links[attr] !== 'undefined') {
						player[attr] = Foxtrick.util.id.getSkillLevelFromLink(links[attr]);
					}
				}, missingAttributes);
			}

			if (isOwn || isOwnYouth) {
				let skillTable = playerNode.querySelector('table');
				if (Foxtrick.hasClass(skillTable.parentNode, 'transferPlayerInformation'))
					skillTable = playerNode.querySelector('.transferPlayerSkills');

				let skillInfo;
				if (Foxtrick.Pages.Players.isSenior(doc)) {
					skillInfo = Foxtrick.Pages.Player.parseSeniorSkills(skillTable);
				}
				else if (Foxtrick.Pages.Players.isYouth(doc)) {
					skillInfo = Foxtrick.Pages.Player.parseYouthSkills(skillTable);

					var twinsInfo = playerNode.querySelector('.ft-youth-twins-container');
					if (twinsInfo && Number(twinsInfo.dataset.possible)) {
						var marked = Number(twinsInfo.dataset.marked);
						var undecided = Number(twinsInfo.dataset.undecided);

						var twinLink = doc.createElement('a');
						twinLink.href = twinsInfo.dataset.url;
						twinLink.target = '_blank';
						twinLink.title = twinsInfo.title;
						twinLink.textContent = marked || '';

						if (undecided) {
							var newTwins = doc.createElement('strong');
							newTwins.textContent = '+' + undecided;
							twinLink.appendChild(newTwins);
						}

						player.twinLink = twinLink;
					}
				}


				if (skillInfo) {
					let skills = skillInfo.values;
					player.skills = skills;
					for (let skill in skills) {
						player[skill] = skills[skill];
					}
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
			if (Foxtrick.Pages.Players.isSenior(doc)) {
				player.transferListed = false;
			}

			for (let icon of icons) {
				if (Foxtrick.hasClass(icon, 'motherclubBonus') ||
				    Foxtrick.hasClass(icon, 'icon-mother-club')) {
					player.motherClubBonus = doc.createElement('span');
					player.motherClubBonus.textContent = '✔';
					player.motherClubBonus.title =
						Foxtrick.L10n.getString('skilltable.youthplayer');
				}
				if (Foxtrick.hasClass(icon, 'cardsOne')) {
					if (/red_card/i.test(icon.src)) {
						player.redCard = 1;
					}
					else {
						player.yellowCard = 1;
					}
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
					player.injuredWeeks = parseInt(length, 10) || length;
				}
				else if (Foxtrick.hasClass(icon, 'transferListed') ||
				         Foxtrick.hasClass(icon, 'icon-transferlisted')) {
					player.transferListed = true;
				}
			}

			player.cards = player.yellowCard + player.redCard !== 0;
			player.injured = player.bruised || player.injuredWeeks !== 0;

			// HTMS points
			let htms = playerNode.querySelector('.ft-htms-points');
			if (htms) {
				player.htmsAbility = parseInt(htms.getAttribute('data-htms-ability'), 10);
				player.htmsPotential = parseInt(htms.getAttribute('data-htms-potential'), 10);
			}

			// last match
			let matchLink;
			if (isYouthPerfView) {
				let links = [...playerNode.querySelectorAll('a[href*="Matches/Match"]')];
				let nonPerfLinks = links.filter(l => !l.closest('.youthPlayerPerformance'));
				matchLink = nonPerfLinks.shift();
			}
			else {
				matchLink = playerNode.querySelector('a[href*="Matches/Match"]');
			}
			if (matchLink) {
				addLastMatchInfo(player, matchLink, isNewDesign);
			}

			if (Foxtrick.Pages.Players.isOwn(doc) &&
			    !Foxtrick.Pages.Players.isNT(doc)) {
				var tc = doc.createElement('a');
				tc.title = Foxtrick.L10n.getString('TransferCompare');
				var tcUrl = player.nameLink.href;
				tcUrl = tcUrl.replace('/Club/Players/Player.aspx',
				                      '/Club/Transfers/TransferCompare.aspx');
				tc.href = tcUrl;
				tc.target = '_blank';
				player.transferCompare = tc;

				var tcImg = doc.createElement('img');
				tcImg.height = 16;
				tcImg.src = '/App_Themes/Standard/images/ActionIcons/sell.png';
				tcImg.alt = Foxtrick.L10n.getString('TransferCompare.abbr');
				tcImg.setAttribute('aria-label', tc.title);
				tc.appendChild(tcImg);
			}

			// playerstats
			if (Foxtrick.Pages.Players.isYouth(doc)) {
				addHYLink(doc, player);
			}
			else {
				addPerfHistLink(doc, player);
			}

			if (!player.currentClubLink &&
			   (Foxtrick.Pages.Players.isOldies(doc) ||
			    Foxtrick.Pages.Players.isCoaches(doc) ||
			    Foxtrick.Pages.Players.isNT(doc))) {
				let currentClubLink = null, currentClubId = null;
				Foxtrick.nth(function(currentPara) {
					let plinks = currentPara.getElementsByTagName('a');
					currentClubLink = Foxtrick.nth(function(link) {
						return /TeamID=/i.test(link.href);
					}, plinks);
					if (currentClubLink) {
						currentClubId = Foxtrick.util.id.getTeamIdFromUrl(currentClubLink.href);
						player.currentClubLink = currentClubLink.cloneNode(true);
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
								let league = Foxtrick.L10n.getCountryNameNative(j);
								let re = new RegExp(Foxtrick.strToRe(league));
								if (re.test(leagueText)) {
									player.currentLeagueId = j;
									break;
								}
							}
						}

						return true;
					}
					return false;
				}, paragraphs);
			}

			let psicoDiv = playerNode.querySelector('.ft-psico');
			if (psicoDiv) {
				player.psicoTSI = psicoDiv.dataset.psicoAvg;
				player.psicoTitle = psicoDiv.dataset.psicoSkill;
			}
			else {
				let psicoLink = null;
				let showDiv = doc.getElementById('psicotsi_show_div_' + i) ||
					doc.getElementById('psico_show_div_' + i);
				if (showDiv) {
					psicoLink = showDiv.getElementsByTagName('a')[0];
					player.psicoTSI = psicoLink.textContent.match(/\d+\.\d+/)[0];
					player.psicoTitle = psicoLink.textContent.match(/(.+)\s\[/)[1];
				}
			}

		}, pNodes);
	};

	var addContributionsInfo = function(playerList) {
		if (Foxtrick.Pages.Players.isOwn(doc)) {
			for (var i = 0; i < playerList.length; ++i) {
				var player = playerList[i];

				var contributions = Foxtrick.Pages.Player.getContributions(player.skills, player);
				for (var name in contributions)
					player[name] = contributions[name];

				var bestPosition = Foxtrick.Pages.Player.getBestPosition(contributions);

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
		}
	};
	var addStamindaData = function(doc, playerList) {
		// only for own regular seniors
		if (!Foxtrick.Pages.Players.isRegular(doc) || !Foxtrick.Pages.All.isOwn(doc))
		    return;

		var ownId = Foxtrick.util.id.getOwnTeamId();
		var data = null, dataText = Foxtrick.Prefs.getString('StaminaData.' + ownId);
		try {
			data = JSON.parse(dataText);
		}
		catch (e) {
			Foxtrick.log(e);
		}

		if (!data || typeof data !== 'object')
			return;

		var newData = {}; // update player list
		Foxtrick.forEach(function(player) {
			if (!(player.id in data)) {
				player.staminaPrediction = null;
				return;
			}

			newData[player.id] = data[player.id]; // only copy existing players

			player.staminaPrediction = {
				value: data[player.id][1],
				date: data[player.id][0],
			};
			player.staminaPred = parseFloat(data[player.id][1]);

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
					playerList = null;
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
 * @param  {Array}  list Array<Player>
 * @param  {number} id
 * @return {object}      Player
 */
Foxtrick.Pages.Players.getPlayerFromListById = function(list, id) {
	return Foxtrick.nth(function(p) {
		return p.id === id;
	}, list);
};

/**
 * Get player ID from player container
 * @param  {Element} playerInfo .playerInfo container
 * @return {number}
 */
Foxtrick.Pages.Players.getPlayerId = function(playerInfo) {
	var id = null;
	try {
		var links = playerInfo.getElementsByTagName('a');
		var nameLink = Foxtrick.nth(function(n) {
			return !Foxtrick.hasClass(n, 'flag');
		}, links);
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
 * @param  {Array}   playerList Array<Player>
 * @param  {string}  property
 * @return {boolean}
 */
Foxtrick.Pages.Players.isPropertyInList = function(playerList, property) {
	return Foxtrick.any(function(player) {
		let val = player[property];
		switch (typeof val) {
			case 'undefined': return false;
			case 'string': return !!val.trim().length;
			case 'number': return !Number.isNaN(val) && val != 0;
			default: return true;
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
 * @param  {Array}    players      Array<object>
 * @param  {Function} getMatchDate function(object): number
 * @param  {number}   playerLimit
 * @return {object}                {last:number, second:number}
 */
Foxtrick.Pages.Players.getLastMatchDates = function(players, getMatchDate, playerLimit) {
	var limit = playerLimit || 1;
	var matchdays = [], matchdaysCount = {}, lastMatch = 0, secondLastMatch = 0;

	for (var i = 0; i < players.length; ++i) {
		var thisMatchday = getMatchDate(players[i]);
		matchdays.push(thisMatchday);

		if (matchdaysCount[thisMatchday])
			++matchdaysCount[thisMatchday];
		else
			matchdaysCount[thisMatchday] = 1;
	}

	matchdays.sort();
	lastMatch = matchdays[matchdays.length - 1];

	matchdays = Foxtrick.filter(function(n) {
		// delete all older than a week and all with too few players (might be transfers)
		var MSECS_IN_WEEK = Foxtrick.util.time.DAYS_IN_WEEK * Foxtrick.util.time.MSECS_IN_DAY;
		var lastWeek = lastMatch - MSECS_IN_WEEK;
		return n > lastWeek && matchdaysCount[n] >= limit;
	}, matchdays);

	if (matchdays.length)
		lastMatch = matchdays[matchdays.length - 1];
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
