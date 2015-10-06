'use strict';
/* players.js
 * Utilities on players page
 * @author convincedd, ryanli, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {};
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
 * Get player list.
 * CHPP needs a callback and options.
 * If callback is not provided, only HTML is parsed.
 * Options is {teamId, isYouth, isNT, includeMatchInfo, currentSquad, refresh}
 * First 3 are detected automatically from URL if possible.
 * includeMatchInfo adds last match data.
 * currentSquad is needed to fetch current player list (possibly from non-players page).
 * HTML parsing and oldies page detection are bypassed in this case.
 * It also limits NT player list for supporters.
 * Refresh invalidates cache before fetching.
 * @param  {document} doc
 * @param  {Function} callback function(Array.<object>)
 * @param  {object}   options  {teamId, isYouth, isNT, includeMatchInfo, currentSquad, refresh}
 * @return {array}             Array.<object>
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

		var isYouth = (options && options.isYouth) ||
			Foxtrick.Pages.Players.isYouth(doc) ||
			Foxtrick.Pages.Players.isYouthMatchOrder(doc);

		if (options && typeof options.isNT !== 'undefined')
			isNT = options.isNT;
		else if (teamId > 3000 && teamId < 4000 || Foxtrick.Pages.Players.isNT(doc))
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
			args.push(['version', '2.2']);
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
			var now = Foxtrick.util.time.getHtTimeStamp(doc);
			Foxtrick.util.api.setCacheLifetime(JSON.stringify(args), now);
		}
		Foxtrick.util.currency.establish(doc, function() {
			Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'session' }, callback);
		});
	};

	var addPerfHistLink = function(doc, player) {
		var ps = doc.createElement('a');
		ps.textContent = Foxtrick.L10n.getString('PerformanceHistory.abbr');
		ps.title = Foxtrick.L10n.getString('PerformanceHistory');
		var psUrl = player.nameLink.href;
		psUrl = psUrl.replace('/Club/Players/Player.aspx',
		                      '/Club/Players/PlayerStats.aspx') + '&ShowAll=true';
		ps.href = psUrl;
		ps.target = '_blank';
		player.performanceHistory = ps;
	};
	var addHYLink = function(doc, player) {
		var hyUrl = 'http://www.hattrick-youthclub.org/redirect/type/player_details/ht_id/' +
			player.id;

		var hyLink = doc.createElement('a');
		hyLink.textContent = Foxtrick.L10n.getString('HyLink.abbr');
		hyLink.title = Foxtrick.L10n.getString('HyLink');
		hyLink.href = hyUrl;
		hyLink.target = '_blank';
		player.hyLink = hyLink;
	};

	var parseXml = function(xml) {
		try {
			if (!xml)
				return;

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

			var playerNode;
			var num = function(nodeName) {
				return xml.num(nodeName, playerNode);
			};
			var money = function(nodeName) {
				return xml.money(nodeName, currencyRate, playerNode);
			};
			var node = function(nodeName) {
				return xml.node(nodeName, playerNode);
			};
			var text = function(nodeName) {
				return xml.text(nodeName, playerNode);
			};
			var bool = function(nodeName) {
				return xml.bool(nodeName, playerNode);
			};
			var ifPositive = function(nodeName) {
				var value = num(nodeName);
				if (value > 0)
					return value;
				return undefined;
			};

			var currencyRate = Foxtrick.util.currency.getRate();
			var isYouth = (options && options.isYouth) ||
				Foxtrick.Pages.Players.isYouth(doc) ||
				Foxtrick.Pages.Players.isYouthMatchOrder(doc);
			var fetchedDate = xml.date('FetchedDate');
			var now = Foxtrick.util.time.getHtDate(doc);

			var currentClubId = xml.num(isYouth ? 'YouthTeamID' : 'TeamID');
			var currentClubUrl = isYouth ? '/Club/Youth/?YouthTeamID=' + currentClubId :
				'/Club/?TeamID=' + currentClubId;
			var currentClubLink = doc.createElement('a');
			currentClubLink.textContent = xml.text(isYouth ? 'YouthTeamName' : 'TeamName');
			currentClubLink.href = currentClubUrl;
			currentClubLink.target = '_blank';

			var nodeName = !isYouth ? 'Player' : 'YouthPlayer';
			var playerNodes = xml.getElementsByTagName(nodeName);
			nodeName = !isYouth ? 'PlayerID' : 'YouthPlayerID';
			for (var i = 0; i < playerNodes.length; ++i) {
				playerNode = playerNodes[i];
				var id = num(nodeName);
				// find player with the same ID from playerList
				// (parsed from HTML)
				var player = Foxtrick.nth(findById(id), playerList);
				if (!player) {
					// player not present in HTML!
					if (!options || !options.currentSquad)
						continue;
						// skip if not retrieving squad from other page
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

				if (typeof player.speciality === 'undefined' && node('Specialty')) {
					var specNum = num('Specialty') || 0;
					var spec = Foxtrick.L10n.getSpecialityFromNumber(specNum);
					player.specialityNumber = specNum;
					player.speciality = spec;
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
					else
						player.redCard = 0;

					player.cards = player.yellowCard + player.redCard !== 0;
				}

				if (typeof player.injured === 'undefined' && node('InjuryLevel')) {
					player.injuredWeeks = num('InjuryLevel');
					player.bruised = player.injuredWeeks ? 0 : 1;
					if (player.injuredWeeks == -1)
						player.injuredWeeks = 0;

					player.injured = (player.bruised || player.injuredWeeks !== 0);
				}

				// first name stripping
				player.nameLink = doc.createElement('a');
				player.nameLink.href = '/Club/Players/' + (isYouth ? 'Youth' : '') +
					'Player.aspx?' + (isYouth ? 'Youth' : '') + 'PlayerID=' + id;
				player.nameLink.target = '_blank';
				if (node('PlayerName'))
					player.nameLink.textContent = text('PlayerName');
				else {
					player.nameLink.textContent = text('FirstName').
						replace(/(-[^\(])([^-\s]+)/g, '$1.'). // replaces first name
						replace(/(\s[^\(])([^-\s]+)/g, '$1.'). // replace further first names
						replace(/(\(.)([^-\)]+)/g, '$1.'). // non-latin in brackets
						replace(/(^[^\(])([^-\s]+)/g, '$1.') + // replace names with '-'
						' ' + text('LastName');

					// keep full name in title
					player.nameLink.title = text('FirstName') + ' ' + text('LastName');
				}

				if (!isYouth) {
					if (typeof player.performanceHistory === 'undefined')
						addPerfHistLink(doc, player);
				}
				else {
					if (typeof player.hyLink === 'undefined')
						addHYLink(doc, player);
				}

				if ((Foxtrick.Pages.Players.isOldies(doc) ||
				    Foxtrick.Pages.Players.isCoaches(doc) ||
				    Foxtrick.Pages.Players.isNT(doc)) &&
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
					'Honesty',
					'IsAbroad',
					'Leadership',
					'LeagueGoals',
					['matchCount', 'NrOfMatches'], // NT supp stats
					['nationalTeamId', 'NationalTeamID'],
				];
				Foxtrick.forEach(addProperty(player, num), xmlNums);

				var texts = [
					'OwnerNotes', // README: youth only for some reason
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
				if (node('ArrivalDate')) {
					player.joinedSince = xml.time('ArrivalDate', playerNode);
					// README: youth only for some reason
				}
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

						var matchDate = xml.date('Date', LastMatch);
						player.lastMatchDate = matchDate;

						var link = doc.createElement('a');
						link.href =
							'/Club/Matches/Match.aspx?matchID=' + player.lastMatchId +
							'&SourceSystem=' + (isYouth ? 'Youth' : 'Hattrick') +
							'&teamId=' + Foxtrick.Pages.All.getTeamId(doc) +
							(isYouth ? '&youthTeamId=' +
							 Foxtrick.Pages.All.getTeamIdFromBC(doc) : '') +
							'&HighlightPlayerID=' + player.id + '#tab2';
						link.textContent =
							Foxtrick.util.time.buildDate(matchDate, { showTime: false });
						link.target = '_blank';
						player.lastMatch = link;

						var lastPositionCode = num('PositionCode', LastMatch);
						var pos = Foxtrick.L10n.getPositionTypeById(lastPositionCode);
						if (pos) {
							player.lastPositionType = pos;
							var position = Foxtrick.L10n.getPositionByType(pos);
							player.lastPosition = position;
						}

					}

					player.lastPlayedMinutes = num('PlayedMinutes', LastMatch);

					var dateText =
						Foxtrick.util.time.buildDate(player.lastMatchDate, { showTime: false });
					var str = Foxtrick.L10n.getString('Last_match_played_as_at',
					                                  player.lastPlayedMinutes);
					player.lastMatchText = str.replace('%1', player.lastPlayedMinutes).
						replace('%2', player.lastPosition).replace('%3', dateText);
				}
				if (!player.lastMatchText)
					player.lastMatchText =
						Foxtrick.L10n.getString('Last_match_didnot_play');
			}

			var missingXML = Foxtrick.filter(function(p) {
				return !p.inXML && !isNT;
				// NT players often are not available in XML
			}, playerList);
			if (missingXML.length) {
				Foxtrick.log('WARNING: New players in HTML', missingXML, 'resetting cache');
				var htTime = Foxtrick.util.time.getHtTimeStamp(doc);
				Foxtrick.util.api.setCacheLifetime(JSON.stringify(args), htTime);
			}
		}
		catch (e) { Foxtrick.log(e); }
	};

	var parseHtml = function() {
		// preparation steps
		var isOwn = Foxtrick.Pages.Players.isOwn(doc);
		var isOwnYouth = Foxtrick.Pages.Players.isOwnYouth(doc);

		var playerNodes = doc.getElementsByClassName('playerInfo');
		Foxtrick.forEach(function(playerNode, i) {
			var paragraphs = playerNode.getElementsByTagName('p');
			var imgs = playerNode.getElementsByTagName('img');
			var as = playerNode.getElementsByTagName('a');
			var bs = playerNode.getElementsByTagName('b');

			var id = Foxtrick.Pages.Players.getPlayerId(playerNode);
			// see if player is already in playerList, add if not
			var player = Foxtrick.nth(findById(id), playerList);
			if (!player) {
				player = { id: id };
				playerList.push(player);
			}

			player.playerNode = playerNode;

			var nameLink = Foxtrick.nth(function(n) {
				return !Foxtrick.hasClass(n, 'flag');
			}, playerNode.getElementsByTagName('a'));
			player.nameLink = nameLink.cloneNode(true);

			if (bs[0]) {
				var name_b = bs[0];
				var num = name_b.textContent.match(/(\d+)\./);
				if (num)
					player.number = parseInt(num[1], 10);
				// README: category detection in HTML needs info in htlang.json
				// thus disabled for now
				// var cat = name_b.textContent.match(/\((.+)\)/);
				// if (cat) {
				// 	// stored as catergoy id
				// 	player.category = Foxtrick.L10n.getCategoryId(cat[1]);
				// }
			}

			if (Foxtrick.hasClass(playerNode, 'hidden'))
				player.hidden = true;

			var info = paragraphs[0];

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

			var ageText = basicHtml.trim().replace(/\s\s+/g, ' ');
			// First we dump TSI out of the string, and then
			// the first match is years and the second is days
			var tsiMatch = ageText.match(/\w+(\s*[=:–])?\s*[\d\s]*,/);
			if (tsiMatch) {
				ageText = ageText.replace(tsiMatch[0], '');
			}

			var ageRe = /\d+\D+\d+\s\S+/;
			if (ageText.match(ageRe) !== null) {
				ageText = ageText.match(ageRe)[0].replace(',', '');
			}
			player.ageText = ageText;

			if (!player.age) {
				var ageMatch = ageText.match(/(\d+)/g);
				player.age = {
					years: parseInt(ageMatch[0], 10),
					days: parseInt(ageMatch[1], 10)
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
				player.speciality = specMatch[1];
				player.specialityNumber = Foxtrick.L10n.getNumberFromSpeciality(specMatch[1]);
			}

			// this could include form, stamina, leadership and experience
			// if its length ≥ 2, then it includes form and stamina
			// if its length ≥ 4, then it includes leadership and experience
			// loyalty is 5th
			var attributeLinks = info.getElementsByClassName('skill');

			var attributes = ['form', 'stamina', 'leadership', 'experience', 'loyalty'];
			var missingAttributes = Foxtrick.filter(function(attr) {
				return typeof player[attr] === 'undefined';
			}, attributes);
			if (missingAttributes.length) {
				var links = {};
				if (attributeLinks.length >= 2) {
					if (/skillshort/i.test(attributeLinks[1].href)) {
						links.form = attributeLinks[1];
						links.stamina = attributeLinks[0];
					}
					else {
						links.form = attributeLinks[0];
						links.stamina = attributeLinks[1];
					}
				}
				if (attributeLinks.length >= 4) {
					if (/skillshort/i.test(attributeLinks[3].href)) {
						links.leadership = attributeLinks[3];
						links.experience = attributeLinks[2];
					}
					else {
						links.leadership = attributeLinks[2];
						links.experience = attributeLinks[3];
					}
				}
				if (attributeLinks.length >= 5) {
					links.loyalty = attributeLinks[4];
				}
				Foxtrick.forEach(function(attr) {
					if (typeof links[attr] !== 'undefined') {
						player[attr] = Foxtrick.util.id.getSkillLevelFromLink(links[attr]);
					}
				}, missingAttributes);
			}

			if (isOwn || isOwnYouth) {
				var skillTable = playerNode.getElementsByTagName('table')[0];
				var skillInfo;
				if (Foxtrick.Pages.Players.isSenior(doc)) {
					skillInfo = Foxtrick.Pages.Player.parseSeniorSkills(skillTable);
				}
				else if (Foxtrick.Pages.Players.isYouth(doc)) {
					skillInfo = Foxtrick.Pages.Player.parseYouthSkills(skillTable);
				}
				if (skillInfo) {
					var skills = skillInfo.values;
					player.skills = skills;
					for (var skill in skills) {
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

			for (var j = 0; j < imgs.length; ++j) {
				if (Foxtrick.hasClass(imgs[j], 'motherclubBonus')) {
					player.motherClubBonus = doc.createElement('span');
					player.motherClubBonus.textContent = '✔';
					player.motherClubBonus.title =
						Foxtrick.L10n.getString('skilltable.youthplayer');
				}
				if (Foxtrick.hasClass(imgs[j], 'cardsOne')) {
					if (/red_card/i.test(imgs[j].src)) {
						player.redCard = 1;
					}
					else {
						player.yellowCard = 1;
					}
				}
				else if (Foxtrick.hasClass(imgs[j], 'cardsTwo')) {
					player.yellowCard = 2;
				}
				else if (Foxtrick.hasClass(imgs[j], 'injuryBruised')) {
					player.bruised = true;
				}
				else if (Foxtrick.hasClass(imgs[j], 'injuryInjured')) {
					player.injuredWeeks = parseInt(imgs[j].nextSibling.textContent, 10);
				}
				else if (Foxtrick.hasClass(imgs[j], 'transferListed')) {
					player.transferListed = true;
				}
			}
			player.cards = player.yellowCard + player.redCard !== 0;
			player.injured = player.bruised || player.injuredWeeks !== 0;

			// HTMS points
			var htms = playerNode.querySelector('.ft-htms-points');
			if (htms) {
				player.htmsAbility = parseInt(htms.getAttribute('data-htms-ability'), 10);
				player.htmsPotential = parseInt(htms.getAttribute('data-htms-potential'), 10);
			}

			// last match
			var matchLink = Foxtrick.nth(function(a) {
				return /matchId/i.test(a.href);
			}, as);
			if (matchLink) {
				var matchDateCell = matchLink.parentNode;
				var matchRatingCell = matchDateCell.nextElementSibling;

				player.lastMatch = matchLink.cloneNode(true);
				player.lastMatch.target = '_blank';
				player.lastMatchDate = Foxtrick.util.time.getDateFromText(matchLink.textContent);

				var matchId = Foxtrick.getParameterFromUrl(matchLink.href, 'matchId');
				var youthMatchId = Foxtrick.getParameterFromUrl(matchLink.href, 'youthMatchId');
				player.lastMatchId = parseInt(youthMatchId || matchId, 10);

				var positionSpan = matchRatingCell.querySelector('.shy');
				var position = positionSpan.textContent.match(/\((.+)\)/)[1];
				player.lastPosition = position;
				player.lastPositionType = Foxtrick.L10n.getPositionType(position);

				var rating = 0;
				var ratingYellow = 0;
				var stars = matchRatingCell.getElementsByTagName('img');
				for (var j = 0; j < stars.length; ++j) {
					if (Foxtrick.hasClass(stars[j], 'starBig'))
						rating += 5;
					if (Foxtrick.hasClass(stars[j], 'starWhole'))
						rating += 1;
					if (Foxtrick.hasClass(stars[j], 'starHalf'))
						rating += 0.5;

					if (/star_big_yellow.png$/i.test(stars[j]))
						ratingYellow += 5;
					if (/star_yellow.png$/i.test(stars[j]))
						ratingYellow += 1;
					if (/star_half_yellow.png$/i.test(stars[j]))
						ratingYellow += 0.5;
					if (/star_yellow_to_brown.png$/i.test(stars[j]))
						ratingYellow += 0.5;
				}
				player.lastRating = rating;
				player.lastRatingEndOfGame = ratingYellow;
				player.lastRatingDecline = rating - ratingYellow;
			}

			if (Foxtrick.Pages.Players.isOwn(doc) &&
			    !Foxtrick.Pages.Players.isNT(doc)) {
				var tc = doc.createElement('a');
				tc.textContent = Foxtrick.L10n.getString('TransferCompare.abbr');
				tc.title = Foxtrick.L10n.getString('TransferCompare');
				var tcUrl = player.nameLink.href;
				tcUrl = tcUrl.replace('/Club/Players/Player.aspx',
				                      '/Club/Transfers/TransferCompare.aspx');
				tc.href = tcUrl;
				tc.target = '_blank';
				player.transferCompare = tc;
			}

			// playerstats
			if (!Foxtrick.Pages.Players.isYouth(doc)) {
				addPerfHistLink(doc, player);
			}
			else {
				addHYLink(doc, player);
			}

			if (Foxtrick.Pages.Players.isOldies(doc) ||
			    Foxtrick.Pages.Players.isCoaches(doc) ||
			    Foxtrick.Pages.Players.isNT(doc)) {
				var currentClubLink = null, currentClubId = null;
				Foxtrick.nth(function(currentPara) {
					var plinks = currentPara.getElementsByTagName('a');
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
							var leagueText = '';
							Foxtrick.forEach(function(node) {
								if (node.nodeName === '#text') {
									// the text is in a child text node of currentPara,
									// so we remove all tags
									leagueText += node.textContent;
								}
							}, currentPara.childNodes);
							for (var j in Foxtrick.XMLData.League) {
								// README: this will break with localized country names
								var re = new RegExp(Foxtrick.XMLData.getNTNameByLeagueId(j));
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
			var psicoLink = null;
			var showDiv = doc.getElementById('psicotsi_show_div_' + i) ||
				doc.getElementById('psico_show_div_' + i) ||
				doc.getElementById('ft_psico_show_div_' + i);
			if (showDiv) {
				psicoLink = showDiv.getElementsByTagName('a')[0];
				player.psicoTSI = psicoLink.textContent.match(/\d+\.\d+/)[0];
				player.psicoTitle = psicoLink.textContent.match(/(.+)\s\[/)[1];
			}

		}, playerNodes);
	};

	var addContributionsInfo = function(playerList) {
		if (Foxtrick.Pages.Players.isOwn(doc)) {
			for (var i = 0; i < playerList.length; ++i) {
				var player = playerList[i];
				var skills = {
					keeper: player.keeper,
					playmaking: player.playmaking,
					passing: player.passing,
					winger: player.winger,
					defending: player.defending,
					scoring: player.scoring,
				};

				var contributions = Foxtrick.Pages.Player.getContributions(skills, player);
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
				else
					player.bestPosition = player.bestPositionLong = 'X';

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
		if (data && typeof data === 'object') {
			Foxtrick.map(function(player) {
				if (data[player.id]) {
					player.staminaPrediction = {
						value: data[player.id][1], date: data[player.id][0]
					};
				}
				else
					player.staminaPrediction = null;
			}, playerList);
		}
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
					addContributionsInfo(playerList);
					addStamindaData(doc, playerList);
				}
				catch (e) {
					Foxtrick.log(e);
					playerList = null;
				}
				try {
					callback(playerList);
				}
				catch (e) {
					Foxtrick.log('Error in callback for getPlayerList', e);
				}
			});
		}, 0);
		return null;
	}
	else {
		try {
			parseHtml();
			addContributionsInfo(playerList);
			addStamindaData(doc, playerList);
			return playerList;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	}
};

/**
 * Get player object from player list
 * @param  {array}  list Array.<object>
 * @param  {number} id
 * @return {object}
 */
Foxtrick.Pages.Players.getPlayerFromListById = function(list, id) {
	return Foxtrick.nth(function(p) {
		return p.id === id;
	}, list);
};

/**
 * Get player ID from player container
 * @param  {element} playerInfo .playerInfo container
 * @return {number}
 */
Foxtrick.Pages.Players.getPlayerId = function(playerInfo) {
	var id = null;
	try {
		var links = playerInfo.getElementsByTagName('a');
		var nameLink = Foxtrick.nth(function(n) {
			return !Foxtrick.hasClass(n, 'flag');
		}, links);
		var pId = Foxtrick.getParameterFromUrl(nameLink.href, 'playerId');
		var yPId = Foxtrick.getParameterFromUrl(nameLink.href, 'youthPlayerId');
		id = parseInt(pId || yPId, 10);
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return id;
};

/**
 * Test whether any players in the player list have a certain property
 * @param  {array}   playerList Array.<object>
 * @param  {string}  property
 * @return {Boolean}
 */
Foxtrick.Pages.Players.isPropertyInList = function(playerList, property) {
	return Foxtrick.any(function(player) {
		return typeof player[property] !== 'undefined';
	}, playerList);
};

/**
 * Get the timestamps of 2 last matches played by players: {last, second}.
 * players is an array of arbitrary objects.
 * getMatchDate extracts matchDate as a timestamp from a player object.
 * playerLimit is minimal player count for a match to be eligible.
 * @param  {array}    players      Array.<T>
 * @param  {Function} getMatchDate function(T): number
 * @param  {number}   playerLimit
 * @return {object}                {last:number, second:number}
 */
Foxtrick.Pages.Players.getLastMatchDates = function(players, getMatchDate, playerLimit) {
	playerLimit = playerLimit || 1;
	var matchdays = [], matchdays_count = {}, lastMatch = 0, secondLastMatch = 0;
	for (var i = 0; i < players.length; ++i) {
		var thisMatchday = getMatchDate(players[i]);
		matchdays.push(thisMatchday);
		if (!matchdays_count[thisMatchday])
			matchdays_count[thisMatchday] = 1;
		else
			++matchdays_count[thisMatchday];
	}
	matchdays.sort();
	lastMatch = matchdays[matchdays.length - 1];

	matchdays = Foxtrick.filter(function(n) {
		// delete all older than a week and all with too few players (might be transfers)
		return n > lastMatch - 7 * 24 * 60 * 60 * 1000 && matchdays_count[n] >= playerLimit;
	}, matchdays);

	if (matchdays.length)
		lastMatch = matchdays[matchdays.length - 1];
	else
		lastMatch = 0;

	if (matchdays.length - matchdays_count[lastMatch] > 1) {
		// more than one match found
		secondLastMatch = matchdays[matchdays.length - matchdays_count[lastMatch] - 1];
	}
	else
		secondLastMatch = 0;

	return { last: lastMatch, second: secondLastMatch };
};
