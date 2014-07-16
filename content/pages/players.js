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

Foxtrick.Pages.Players.isPlayersPage = function(doc) {
	return this.isSeniorPlayersPage(doc) || this.isYouthPlayersPage(doc);
};
Foxtrick.Pages.Players.isSeniorPlayersPage = function(doc) {
	return Foxtrick.isPage(doc, 'players');
};
Foxtrick.Pages.Players.isYouthPlayersPage = function(doc) {
	return Foxtrick.isPage(doc, 'youthPlayers');
};
Foxtrick.Pages.Players.isMatchOrderPage = function(doc) {
	return Foxtrick.isPage(doc, 'matchOrder') || Foxtrick.isPage(doc, 'matchOrderSimple');
};
Foxtrick.Pages.Players.isYouthMatchOrderPage = function(doc) {
	return this.isMatchOrderPage(doc) &&
		/isYouth=true|SourceSystem=Youth/i.test(doc.location.href);
};
Foxtrick.Pages.Players.isSimpleMatchOrderPage = function(doc) {
	return Foxtrick.isPage(doc, 'matchOrderSimple');
};
Foxtrick.Pages.Players.isOwnPlayersPage = function(doc) {
	var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
	var teamId = Foxtrick.Pages.All.getTeamId(doc);
	return (ownTeamId === teamId && ownTeamId !== null);
};
Foxtrick.Pages.Players.isNtPlayersPage = function(doc) {
	return /NTPlayers/i.test(doc.location.href);
};
Foxtrick.Pages.Players.isOldiesPage = function(doc) {
	return /Oldies\.aspx/i.test(doc.location.href);
};
Foxtrick.Pages.Players.isCoachesPage = function(doc) {
	return /Coaches\.aspx/i.test(doc.location.href);
};

Foxtrick.Pages.Players.getPlayerList = function(doc, callback, options) {
	var playerList = [];
	var args = [];

	var findById = function(id) {
		return function(p) {
			return p.id == id;
		};
	};

	var getXml = function(doc, callback) {

		var teamId = Foxtrick.util.id.getOwnTeamId();
		if (options && options.teamid)
			teamId = options.teamid;
		else if (/teamid=(\d)/i.test(doc.location.href))
			teamId = Foxtrick.util.id.getTeamIdFromUrl(doc.location.href);

		var isYouth = (options && options.isYouth) ||
			Foxtrick.Pages.Players.isYouthPlayersPage(doc) ||
			Foxtrick.Pages.Players.isYouthMatchOrderPage(doc);

		if (isYouth) {
			args.push(['file', 'youthplayerlist']);
			args.push(['youthTeamId', teamId]);
			args.push(['actionType', 'details']);
		}
		else if (Foxtrick.Pages.Players.isNtPlayersPage(doc) || (options && options.NT)) {
			var action = 'supporterstats', all = 'true';
			if (options && options.NT && typeof(options.NT.action) != 'undefined')
				action = options.NT.action;
			if (options && options.NT && typeof(options.NT.all) != 'undefined')
				all = options.NT.all;
			args.push(['file', 'nationalplayers']);
			args.push(['teamId', teamId]);
			args.push(['actionType', action]);
			args.push(['showAll', all]);
		}
		else {
			args.push(['file', 'players']);
			args.push(['version', '2.2']);
			args.push(['teamId', teamId]);

			if (!options || !options.current_squad) {
				if (Foxtrick.Pages.Players.isOldiesPage(doc))
					args.push(['actionType', 'viewOldies']);
				else if (Foxtrick.Pages.Players.isCoachesPage(doc))
					args.push(['actionType', 'viewOldCoaches']);
			}
		}
		if (options && options.includeMatchInfo) {
			args.push(['includeMatchInfo', 'true']); // senior
			args.push(['showLastMatch', 'true']); // youth
		}
		Foxtrick.util.currency.establish(doc, function() {
			Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'session' }, callback);
		});
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
						newName.replace(/Skill$/, '');
						nodeName = name;
					}
					if (node(nodeName))
						player[newName] = fn(nodeName);
				};
			};

			var playerNode;
			var num = function(nodeName) {
				return xml.num(nodeName, playerNode);
			};
			var money = function(nodeName) {
				return xml.money(nodeName, playerNode);
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
				Foxtrick.Pages.Players.isYouthPlayersPage(doc) ||
				Foxtrick.Pages.Players.isYouthMatchOrderPage(doc);
			var fetchedDate = xml.date('FetchedDate');
			var now = Foxtrick.util.time.getHtDate(doc);

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
					if (!options || !options.current_squad)
						continue;
						// skip if not retrieving squad from other page
					else {
						player = { id: id };
						playerList.push(player);

						player.currentSquad = true;
						player.active = true;

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
						for (var skill in player.skills) {
							player[skill] = player.skills[skill];
						}

						var nums = [
							'StaminaSkill',
							['form', 'PlayerForm'],
							'Loyalty',
							'TransferListed',
						];
						Foxtrick.forEach(addProperty(player, num), nums);

						if (node('PlayerNumber')) {
							// only add if not present in HTML since HTML always has current data
							// number = 100 means this player hasn't been assigned one
							var number = num('PlayerNumber');
							if (number >= 1 && number < 100) {
								player.number = number;
							}
						}
						if (node('Specialty')) {
							var specNum = num('Specialty') || 0;
							var spec = Foxtrick.L10n.getSpecialityFromNumber(specNum);
							player.specialityNumber = specNum;
							player.speciality = spec;
						}

						if (node('MotherClubBonus')) {
							if (bool('MotherClubBonus')) {
								player.motherClubBonus = doc.createElement('span');
								player.motherClubBonus.textContent = '✔';
								player.motherClubBonus.title =
									Foxtrick.L10n.getString('skilltable.youthplayer');
							}
						}

						if (node('Cards')) {
							player.yellowCard = num('Cards');
							if (player.yellowCard == 3) {
								player.yellowCard = 0;
								player.redCard = 1;
							}
							else
								player.redCard = 0;

							player.cards = player.yellowCard + player.redCard !== 0;
						}

						if (node('InjuryLevel')) {
							player.injuredWeeks = num('InjuryLevel');
							player.bruised = player.injuredWeeks ? 0 : 1;
							if (player.injuredWeeks == -1)
								player.injuredWeeks = 0;

							player.injured = (player.bruised || player.injuredWeeks !== 0);
						}
					}
				}

				// we found this player in the XML file,
				player.inXML = true;
				// go on the retrieve information
				player.nameLink = doc.createElement('a');
				player.nameLink.href = '/Club/Players/' + (isYouth ? 'Youth' : '') +
					'Player.aspx?' + (isYouth ? 'Youth' : '') + 'PlayerID=' + id;
				if (node('PlayerName'))
					player.nameLink.textContent = text('PlayerName');
				else {
					player.nameLink.textContent = text('FirstName').
						replace(/(-[^\(])([^-\s]+)/g, '$1.'). // replaces first name
						replace(/(\s[^\(])([^-\s]+)/g, '$1.'). // replace further first names
						replace(/(\(.)([^-\)]+)/g, '$1.'). // non-latin in brackets
						replace(/(^[^\(])([^-\s]+)/g, '$1.') + // replace names connected with '-'
						' ' + text('LastName');

					// keep full name in title
					player.nameLink.title = text('FirstName') + ' ' + text('LastName');
				}

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
					['tsi', 'TSI'],
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
					player.joinedSince = xml.time('ArrivalDate');
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
				if (node('Age') && node('AgeDays')) {
					var age = {};
					age.years = num('Age');
					age.days = num('AgeDays');
					player.age = age;
					player.ageYears = age.years;
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
						link.textContent = Foxtrick.util.time.buildDate(matchDate);
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

					var dateText = Foxtrick.util.time.buildDate(player.lastMatchDate);
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
				return !p.inXML;
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
		var isOwn = Foxtrick.Pages.Players.isOwnPlayersPage(doc);

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
				var cat = name_b.textContent.match(/\((.+)\)/);
				if (cat) {
					// stored as catergoy id
					player.category = Foxtrick.L10n.getCategoryId(cat[1]);
				}
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

			if ((Foxtrick.Pages.Players.isSeniorPlayersPage(doc) ||
				 Foxtrick.Pages.Players.isNtPlayersPage(doc)) && !player.tsi) {
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

			if (isOwn && !Foxtrick.Pages.Players.isOldiesPage(doc) &&
			    !Foxtrick.Pages.Players.isCoachesPage(doc)) {
				var skillTable = playerNode.getElementsByTagName('table')[0];
				var skillInfo;
				if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc)) {
					skillInfo = Foxtrick.Pages.Player.parseSeniorSkills(skillTable);
				}
				else if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
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
			if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc)) {
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

			if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc) &&
				!Foxtrick.Pages.Players.isOldiesPage(doc)) {
				var tc = doc.createElement('a');
				tc.textContent = Foxtrick.L10n.getString('TransferCompare.abbr');
				tc.title = Foxtrick.L10n.getString('TransferCompare');
				var tcUrl = player.nameLink.href;
				tcUrl = tcUrl.replace('/Club/Players/Player.aspx',
				                      '/Club/Transfers/TransferCompare.aspx');
				tc.href = tcUrl;
				player.transferCompare = tc;
			}

			if (Foxtrick.Pages.Players.isOldiesPage(doc) ||
			    Foxtrick.Pages.Players.isCoachesPage(doc) ||
			    Foxtrick.Pages.Players.isNtPlayersPage(doc)) {
				var currentClubLink = null, currentClubId = null;
				Foxtrick.nth(function(currentPara) {
					var plinks = currentPara.getElementsByTagName('a');
					currentClubLink = Foxtrick.nth(function(link) {
						return /TeamID=/i.test(link.href);
					}, plinks);
					if (currentClubLink) {
						currentClubId = Foxtrick.util.id.getTeamIdFromUrl(currentClubLink.href);
						player.currentClubLink = currentClubLink.cloneNode(true);
						player.currentClubId = currentClubId;

						if (!Foxtrick.Pages.Players.isNtPlayersPage(doc)) {
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
								var re = new RegExp(Foxtrick.XMLData.League[j].LeagueName);
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
		if (!Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
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
				var spec = Foxtrick.L10n.getEnglishSpeciality(player.speciality);
				var contributions = Foxtrick.Pages.Player.getContributions(skills, spec);
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
		// only for own seniors
		if (Foxtrick.Pages.Players.isYouthPlayersPage(doc) ||
		    !Foxtrick.Pages.Players.isOwnPlayersPage(doc))
		    return;

		var ownId = Foxtrick.util.id.getOwnTeamId();
		var data, dataText = Foxtrick.Prefs.getString('StaminaData.' + ownId);
		try {
			data = JSON.parse(dataText);
		}
		catch (e) {
			Foxtrick.log(e);
		}
		if (typeof data === 'object') {
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
					if (!options || !options.current_squad)
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

Foxtrick.Pages.Players.getPlayerFromListById = function(list, id) {
	return Foxtrick.nth(function(p) {
		return p.id === id;
	}, list);
};

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

Foxtrick.Pages.Players.isPropertyInList = function(playerList, property) {
	return Foxtrick.any(function(player) {
		return typeof player[property] !== 'undefined';
	}, playerList);
};

// returns last and second last match dates from a list
// @param players: array which contains matchdates somewhere in
// @param getLastMatchDates: function which extract the matchdate from an array element
// @param mincount: integer determining the minimum count for a date to be taken into account,
// 							defaults to 1
Foxtrick.Pages.Players.getLastMatchDates = function(players, getLastMatchDates, mincount) {
	mincount = mincount || 1;
	var matchdays = [], matchdays_count = {}, lastMatch = 0, secondLastMatch = 0;
	for (var i = 0; i < players.length; ++i) {
		var thisMatchday = getLastMatchDates(players[i]);
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
		return n > lastMatch - 7 * 24 * 60 * 60 * 1000 && matchdays_count[n] >= mincount;
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

	return { lastMatchDate: lastMatch, secondLastMatchDate: secondLastMatch };
};
