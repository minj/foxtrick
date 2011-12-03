"use strict";
/* players.js
 * Utilities on players page
 * @author convincedd, ryanli
 */

Foxtrick.Pages.Players = {
	isPlayersPage : function(doc) {
		return this.isPlayersPage(doc) || this.isYouthPlayersPage(doc);
	},
	isSeniorPlayersPage : function(doc) {
		return Foxtrick.isPage("players", doc);
	},
	isYouthPlayersPage : function(doc) {
		return Foxtrick.isPage("YouthPlayers", doc);
	},
	isOwnPlayersPage : function(doc) {
		var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		return (ownTeamId === teamId && ownTeamId !== null);
	},
	isNtPlayersPage : function(doc) {
		return (doc.location.href.indexOf("NTPlayers") != -1);
	},
	isOldiesPage : function(doc) {
		return (doc.location.href.indexOf("Oldies\.aspx") != -1);
	},
	isCoachesPage : function(doc) {
		return (doc.location.href.indexOf("Coaches\.aspx") != -1);
	},

	getPlayerList : function(doc, callback, options) { 
		var playerList = [];

		var getXml = function(doc, callback) {
			/*if (!Foxtrick.Pages.Players.isSeniorPlayersPage(doc) && !(options && options.current_squad)) {
				// not the page we are looking for
				Foxtrick.log('players: wrong page');
				callback(null);
				return;
			}*/
			var args = [];
			if (options && options.teamid)
				args.push(["teamId", options.teamid]);
			else if (doc.location.href.match(/teamid=(\d)/i)) {
				if (!(Foxtrick.Pages.Players.isYouthPlayersPage(doc)))
					args.push(["teamId", doc.location.href.match(/teamid=(\d+)/i)[1]]);
				else 
					args.push(["youthTeamID", doc.location.href.match(/teamid=(\d+)/i)[1]]);
			}	
			if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
				args.push(["file", "youthplayerlist"]);
				args.push(["actionType", "details"]);
				//args.push(["showLastMatch", "showLastMatch"]);
			}
			else if (Foxtrick.Pages.Players.isNtPlayersPage(doc)) {
				args.push(["file", "nationalplayers"]);
				args.push(["ShowAll", "true"]);
				args.push(["actionType", "supporterstats"]);
			}
			else {
				args.push(["file", "players"]);
				args.push(["version", "2.1"]);

				if (!options || !options.current_squad) {
					if (Foxtrick.Pages.Players.isOldiesPage(doc))
						args.push(["actionType", "viewOldies"]);
					else if (Foxtrick.Pages.Players.isCoachesPage(doc))
						args.push(["actionType", "viewOldCoaches"]);
				}
			}
			if (options && options.includeMatchInfo==true)
				args.push(["includeMatchInfo","true"]);
			 
			Foxtrick.util.api.retrieve(doc, args,{ cache_lifetime:'session'}, callback);
		};

		var parseXml = function(xml) { 
		try { 
			if (!xml)
				return;
			if (!(Foxtrick.Pages.Players.isYouthPlayersPage(doc)))
				var playerNodes = xml.getElementsByTagName("Player");
			else
				var playerNodes = xml.getElementsByTagName("YouthPlayer");
			for (var i = 0; i < playerNodes.length; ++i) {
				var playerNode = playerNodes[i]; 
			
				if (!(Foxtrick.Pages.Players.isYouthPlayersPage(doc)))
					var id = Number(playerNode.getElementsByTagName("PlayerID")[0].textContent);
				else
					var id = Number(playerNode.getElementsByTagName("YouthPlayerID")[0].textContent);
				// find player with the same ID from playerList (parsed from
				// HTML)
				var player = null, j;
				for (j = 0; j < playerList.length; ++j)
					if (playerList[j].id == id)
						{ player = playerList[j];break;}
				if (!player) {
					if (!options || !options.current_squad) continue; // not present in HTML. skip if not retrieving squad from other page anyways
					else { 
						playerList.push({id : id});
						player = playerList[playerList.length - 1];
						
						player.nameLink = doc.createElement('a');
						player.nameLink.href = '/Club/Players/Player.aspx?PlayerID='+id;
						if (playerNode.getElementsByTagName("PlayerName")[0])
							player.nameLink.textContent = playerNode.getElementsByTagName("PlayerName")[0].textContent;
						else {
							player.nameLink.textContent = playerNode.getElementsByTagName("FirstName")[0].textContent+' '
														+ playerNode.getElementsByTagName("LastName")[0].textContent;
						}
						player.yellowCard = Number(playerNode.getElementsByTagName("Cards")[0].textContent);
						if (player.yellowCard==3) {
							player.yellowCard=0;
							player.redCard=1;
						}
						else player.redCard=0;

						player.injuredWeeks = Number(playerNode.getElementsByTagName("InjuryLevel")[0].textContent);
						if (player.injuredWeeks==0) player.bruised=1;
						else player.bruised = 0;
						if (player.injuredWeeks==-1) player.injuredWeeks=0;

						if (player.yellowCard + player.redCard != 0) 
							player.cards = true;
						else 
							player.cards = false;
						if (player.bruised || player.injuredWeeks != 0) 
							player.injured = true;
						else
							player.injured = false;

						player.transferListed = Number(playerNode.getElementsByTagName("TransferListed")[0].textContent);
						player.form = Number(playerNode.getElementsByTagName("PlayerForm")[0].textContent);
						player.stamina = Number(playerNode.getElementsByTagName("StaminaSkill")[0].textContent);

						var specs={0:'' ,1:'Technical',2:'Quick',3:'Powerful',4:'Unpredictable',5:'Head',6:'Regainer'};
						player.specialityNumber = Number(playerNode.getElementsByTagName("Specialty")[0].textContent);
						var spec = specs[player.specialityNumber];
						player.speciality = (spec=='')?'':Foxtrickl10n.getShortSpecialityFromEnglish(spec);
						player.currentSquad = true;
						player.active = true;

						var LastMatch = playerNode.getElementsByTagName("LastMatch")[0];
						if ( LastMatch && LastMatch.getElementsByTagName("Date")[0] ) {
							player.lastRatingEndOfGame = Number(LastMatch.getElementsByTagName("RatingEndOfGame")[0].textContent);
							player.lastRating = Number(LastMatch.getElementsByTagName("Rating")[0].textContent);
							player.lastRatingDecline = player.lastRating - player.lastRatingEndOfGame;
							player.lastMatchId = Number(LastMatch.getElementsByTagName("MatchId")[0].textContent);
							player.lastMatchDate = LastMatch.getElementsByTagName("Date")[0].textContent;
						}
						if (playerNode.getElementsByTagName("Loyalty").length) 
							player.loyality = Number(playerNode.getElementsByTagName("Loyalty")[0].textContent);
						if (playerNode.getElementsByTagName("MotherClubBonus").length) 
							player.motherClubBonus  = (playerNode.getElementsByTagName("MotherClubBonus")[0].textContent=='True') ? 1 : 0;
						}
				}

				// we found this player in the XML file,
				// go on the retrieve information
				if (playerNode.getElementsByTagName("NrOfMatches").length) {
					player.matchCount = Number(playerNode.getElementsByTagName("NrOfMatches")[0].textContent);
				}
				if (playerNode.getElementsByTagName("PlayerCategoryId").length) {
					var category = Number(playerNode.getElementsByTagName("PlayerCategoryId")[0].textContent);
					if (category > 0) {
						player.category = category;
					}
				}
				if (playerNode.getElementsByTagName("Agreeability").length) {
					player.agreeability = Number(playerNode.getElementsByTagName("Agreeability")[0].textContent);
				}
				if (playerNode.getElementsByTagName("Aggressiveness").length) {
					player.aggressiveness = Number(playerNode.getElementsByTagName("Aggressiveness")[0].textContent);
				}
				if (playerNode.getElementsByTagName("Honesty").length) {
					player.honesty = Number(playerNode.getElementsByTagName("Honesty")[0].textContent);
				}
				if (playerNode.getElementsByTagName("LeagueGoals").length) {
					var leagueGoals = Number(playerNode.getElementsByTagName("LeagueGoals")[0].textContent);
					if (leagueGoals >= 0) {
						player.leagueGoals = leagueGoals;
					}
				}
				if (playerNode.getElementsByTagName("CupGoals").length) {
					var cupGoals = Number(playerNode.getElementsByTagName("CupGoals")[0].textContent);
					if (cupGoals >= 0) {
						player.cupGoals = cupGoals;
					}
				}
				if (playerNode.getElementsByTagName("FriendliesGoals").length) {
					var friendliesGoals = Number(playerNode.getElementsByTagName("FriendliesGoals")[0].textContent);
					if (friendliesGoals >= 0) {
						player.friendliesGoals = friendliesGoals;
					}
				}
				if (playerNode.getElementsByTagName("CareerGoals").length) {
					var careerGoals = Number(playerNode.getElementsByTagName("CareerGoals")[0].textContent);
					if (careerGoals >= 0) {
						player.careerGoals = careerGoals;
					}
				}
				if (playerNode.getElementsByTagName("CareerHattricks").length) {
					var hattricks = Number(playerNode.getElementsByTagName("CareerHattricks")[0].textContent);
					if (hattricks >= 0) {
						player.hattricks = hattricks;
					}
				}
				if (playerNode.getElementsByTagName("NationalTeamID").length) {
					// NationalTeamID of the player if he is a NT player, otherwise 0
					player.nationalTeamId = Number(playerNode.getElementsByTagName("NationalTeamID")[0].textContent);
				}
				if (playerNode.getElementsByTagName("Salary").length) {
					var currencyRate = Foxtrick.util.currency.getRate();
					// from krone to € to user-defined
					player.salary = Math.floor(Number(playerNode.getElementsByTagName("Salary")[0].textContent) / (10 * currencyRate));
				}
				if (playerNode.getElementsByTagName("TSI").length) {
					player.tsi = Number(playerNode.getElementsByTagName("TSI")[0].textContent);
				}
				if (playerNode.getElementsByTagName("Age").length
					&& playerNode.getElementsByTagName("AgeDays").length) {
					var age = {};
					age.years = Number(playerNode.getElementsByTagName("Age")[0].textContent);
					age.days = Number(playerNode.getElementsByTagName("AgeDays")[0].textContent);
					player.age = age;
				}
				if (playerNode.getElementsByTagName("Leadership").length) {
					player.leadership = Number(playerNode.getElementsByTagName("Leadership")[0].textContent);
				}
				if (playerNode.getElementsByTagName("Experience").length) {
					player.experience = Number(playerNode.getElementsByTagName("Experience")[0].textContent);
				}
				if (playerNode.getElementsByTagName("CountryID").length) {
					player.countryId = Number(playerNode.getElementsByTagName("CountryID")[0].textContent);
				}
				if (playerNode.getElementsByTagName("TrainerData").length) {
					var trainerData = playerNode.getElementsByTagName("TrainerData")[0];
					player.trainerData = {};
					if (trainerData.getElementsByTagName("TrainerType").length) {
						player.trainerData.type = Number(trainerData.getElementsByTagName("TrainerType")[0].textContent);
					}
					if (trainerData.getElementsByTagName("TrainerSkill").length) {
						player.trainerData.skill = Number(trainerData.getElementsByTagName("TrainerSkill")[0].textContent);
					}
				}
				if (playerNode.getElementsByTagName("PlayerNumber").length) {
					// number = 100 means this player hasn't been assigned one
					var number = Number(playerNode.getElementsByTagName("PlayerNumber")[0].textContent);
					if (number >= 1 && number < 100) {
						player.number = number;
					}
				}
				var LastMatch = playerNode.getElementsByTagName("LastMatch")[0];
				if ( LastMatch && LastMatch.getElementsByTagName("Date")[0] ) {
					var MatchRoleIDToPosition = {
						"100":"Keeper",
						"101":"Wing back",
						"102":"Central defender",
						"103":"Central defender",
						"104":"Central defender",
						"105":"Wing back",
						"106":"Winger",
						"107":"Inner midfielder",
						"108":"Inner midfielder",
						"109":"Inner midfielder",
						"110":"Winger",
						"111":"Forward",
						"112":"Forward",
						"113":"Forward",
						"114":"Substitution (Keeper)",
						"115":"Substitution (Defender)",
						"116":"Inner midfielder",
						"117":"Substitution (Winger)",
						"118":"Substitution (Forward)",
						"17":"Set pieces",
						"18":"Captain",
						"19":"Replaced Player #1",
						"20":"Replaced Player #2",
						"21":"Replaced Player #3",
					};
					player.lastPlayedMinutes = Number(LastMatch.getElementsByTagName("PlayedMinutes")[0].textContent);
					player.lastPositionCode = Number(LastMatch.getElementsByTagName("PositionCode")[0].textContent);
					var position = Foxtrickl10n.getPositionByType(MatchRoleIDToPosition[player.lastPositionCode]);
					player.lastMatchText = Foxtrickl10n.getString('Last_match_played_as').replace('%1',player.lastPlayedMinutes).replace('%2', position);
				}
				
				if (playerNode.getElementsByTagName("CanBePromotedIn").length) {
					player.canBePromotedIn = playerNode.getElementsByTagName("CanBePromotedIn")[0].textContent;
				}
				if (playerNode.getElementsByTagName("ArrivalDate").length) {
					player.joinedSince = playerNode.getElementsByTagName("ArrivalDate")[0].textContent;
				}
				if (playerNode.getElementsByTagName("OwnerNotes").length) {
					player.ownerNotes = playerNode.getElementsByTagName("OwnerNotes")[0].textContent;
				}
				if (playerNode.getElementsByTagName("Statement").length) {
					player.statement = playerNode.getElementsByTagName("Statement")[0].textContent;
				}
			}
		} catch(e) {Foxtrick.log(e);}
		};

		var parseHtml = function() {
			// preparation steps
			var isOwn = Foxtrick.Pages.Players.isOwnPlayersPage(doc);

			var playerNodes = doc.getElementsByClassName("playerInfo");
			for (var i = 0; i < playerNodes.length; ++i) {
				var playerNode = playerNodes[i];
				var id = Foxtrick.Pages.Players.getPlayerId(playerNode);
				// see if player is already in playerList, add if not
				var player = Foxtrick.filter(function(n) { return n.id == id; }, playerList)[0];
				if (!player) {
					playerList.push({id : id});
					player = playerList[playerList.length - 1];
				}

				var nameLink = Foxtrick.filter(function(n) { return !Foxtrick.hasClass(n, "flag.+"); },
					playerNode.getElementsByTagName("a"))[0];
				player.nameLink = nameLink.cloneNode(true);

				if ( Foxtrick.hasClass(playerNode,'hidden') )
					player.hidden = true;
				
				var paragraphs = playerNode.getElementsByTagName("p");
				var imgs = playerNode.getElementsByTagName("img");
				var as = playerNode.getElementsByTagName("a");

				var basicInformation = paragraphs[0];
				var basicHtml = basicInformation.innerHTML.replace(RegExp("&nbsp;", "g"), "");

				var ageText = basicHtml;
				// First we dump TSI out of the string, and then
				// the first match is years and the second is days
				var tsiMatch = ageText.match(RegExp("\\w+\\s*(=|:)\\s*[\\d\\s]*"));
				if (tsiMatch) {
					ageText = ageText.replace(tsiMatch[0], "");
				}
				var ageRe = new RegExp("\\d+\\D+\\d+\\s\\S+");
				var ageReRussian = new RegExp("\\D+\\d+\\D+\\d+");
				if (ageText.match(ageRe) !== null) {
					ageText = ageText.match(ageRe)[0].replace(",", "");
				}
				else if (ageText.match(ageReRussian) !== null) {
					// Russian have some problems using that RegExp
					// try this instead:
					ageText = ageText.match(ageReRussian)[0].replace(",", "");
				}
				player.ageText = ageText;

				if (!player.age) {
					var ageMatch = ageText.match(/(\d+)/g);
					player.age = { years: Number(ageMatch[0]), days: Number(ageMatch[1]) };
				}

				if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc)
					&& !player.tsi) {
					// youth players don't have TSI, and we can fetch directly
					// from XML if it's there
					var tsiMatch = basicHtml.replace(/\s+/g,'').match(RegExp("[=:](\\d+)"));
					var tsi;
					if (tsiMatch) { 
						tsi = tsiMatch[1];
						tsi = parseInt(tsi);
						player.tsi = tsi;
					}
				}

				var specMatch = basicInformation.textContent.match(/\[(\D+)\]/);
				player.speciality = specMatch ? specMatch[1] : "";

				// this could include form, stamina, leadership and experience
				// if its length ≥ 2, then it includes form and stamina
				// if its length ≥ 4, then it includes leadership and experience
				var basicSkillLinks = basicInformation.getElementsByClassName("skill");

				if (player.form === undefined || player.stamina === undefined
					|| player.leadership === undefined || player.experience === undefined
					|| player.loyality === undefined) {
					var links = {};
					if (basicSkillLinks.length >= 2) {
						if (basicSkillLinks[1].href.search("skillshort") !== -1) {
							links.form = basicSkillLinks[1];
							links.stamina = basicSkillLinks[0];
						}
						else {
							links.form = basicSkillLinks[0];
							links.stamina = basicSkillLinks[1];
						}
					}
					if (basicSkillLinks.length >= 4) {
						if (basicSkillLinks[3].href.search("skillshort") !== -1) {
							links.leadership = basicSkillLinks[3];
							links.experience = basicSkillLinks[2];
						}
						else {
							links.leadership = basicSkillLinks[2];
							links.experience = basicSkillLinks[3];
						}
					}
					if (basicSkillLinks.length >= 5) {
						links.loyality = basicSkillLinks[4]; 
					}
					var basicSkillNames = ["form", "stamina", "leadership", "experience", "loyality"];
					for (var j in basicSkillNames) {
						if (player[basicSkillNames[j]] === undefined
							&& links[basicSkillNames[j]] !== undefined) {
							player[basicSkillNames[j]] = parseInt(links[basicSkillNames[j]].href.match(/ll=(\d+)/)[1]);
						}
					}
				}

				if (isOwn
					&& !Foxtrick.Pages.Players.isOldiesPage(doc)
					&& !Foxtrick.Pages.Players.isCoachesPage(doc)) {
					var skillTable = playerNode.getElementsByTagName("table")[0];
					if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc)) {
						var hasSkillBars = true;
						var rowCount = skillTable.getElementsByTagName("tr").length;
						if (rowCount == 4) {
							hasSkillBars = false;
						}
						if (skillTable) {
							if (hasSkillBars) {
								var skillOrder = ["keeper", "defending", "playmaking", "winger", "passing", "scoring", "setPieces"];
								var rows = skillTable.getElementsByTagName("tr");
								for (var j = 0; j < skillOrder.length; ++j) {
									var skillCell = rows[j].getElementsByTagName("td")[1];
									var skillImg = skillCell.getElementsByTagName("img")[0];
									var skillLevel = skillImg.title.match(/-?\d+/);
									player[skillOrder[j]] = parseInt(skillLevel);
								}
							}
							else {
								var skillOrder = ["keeper", "playmaking", "passing", "winger", "defending", "scoring", "setPieces"];
								var cells = skillTable.getElementsByTagName("td");
								for (var j = 0; j < skillOrder.length; ++j) {
									var level = cells[2 * j + 3].getElementsByTagName("a")[0].href.match(/ll=(\d+)/)[1];
									player[skillOrder[j]] = parseInt(level);
								}
							}
						}
					}
					else if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
						// will return like this: player.keeper = { current: 5, max: 7, maxed: false }
						var skillOrder = ["keeper", "defending", "playmaking", "winger", "passing", "scoring", "setPieces"];
						var rows = skillTable.getElementsByTagName("tr");
						for (var j = 0; j < skillOrder.length; ++j) {
							player[skillOrder[j]] = {};
							var skillCell = rows[j].getElementsByTagName("td")[1];
							var skillImgs = skillCell.getElementsByTagName("img");
							if (skillImgs.length > 0) {
								var max = skillImgs[0].getAttribute("title").match(/\d/);
								var current = skillImgs[1].title.match(/-?\d/);
								var unknown = skillImgs[1].title.match(/-1/);
								var maxed = !current;
								player[skillOrder[j]].maxed = false;
								if (maxed) {
									current = max;
									player[skillOrder[j]].maxed = true;
								}
								// if current and/or max is unknown, mark it as 0
								player[skillOrder[j]].current = parseInt(unknown ? 0 : current);
								player[skillOrder[j]].max = parseInt(max ? max : 0);
							}
							else {
								// no image is present, meaning nothing about
								// that skill has been revealed
								player[skillOrder[j]] = { current : 0, max : 0, maxed : false };
							}
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
					if (imgs[j].className == "motherclubBonus") {
						player.motherClubBonus = true
					}
					if (imgs[j].className == "cardsOne") {
						if (imgs[j].src.indexOf("red_card", 0) != -1) {
							player.redCard = 1;
						}
						else {
							player.yellowCard = 1;
						}
					}
					else if (imgs[j].className == "cardsTwo") {
						player.yellowCard = 2;
					}
					else if (imgs[j].className == "injuryBruised") {
						player.bruised = true;
					}
					else if (imgs[j].className == "injuryInjured") {
						player.injuredWeeks = Number(imgs[j].nextSibling.textContent);
					}
					else if (imgs[j].className == "transferListed") {
						player.transferListed = true;
					}
				}
				if (player.yellowCard + player.redCard != 0) player.cards = true;
				if (player.bruised || player.injuredWeeks != 0) player.injured = true;
				
				// HTMS points
				var htmsPoints = playerNode.getElementsByClassName("ft-htms-points").item(0);
				if (htmsPoints) {
					var points = htmsPoints.getElementsByTagName("span")[0].textContent;
					var matched = points.match(/([\-0-9]+).+?([\-0-9]+)/);
					if (matched) {
						player.htmsAbility = Number(matched[1]);
						player.htmsPotential = Number(matched[2]);
					}
				}

				// last match
				var matchLink = null;
				for (var j = 0; j < as.length; ++j) {
					if (as[j].href.search(/matchid/i) != -1) {
						matchLink = as[j];
					}
				}
				if (matchLink) {
					player.lastMatch = matchLink.cloneNode(true);
				}

				// last rating
				if (matchLink) {
					var container = matchLink.parentNode.parentNode;
					var rating = 0;
					rating += container.getElementsByClassName("starBig").length * 5;
					rating += container.getElementsByClassName("starWhole").length * 1;
					rating += container.getElementsByClassName("starHalf").length * 0.5;
					player.lastRating = rating;
					
					var ratingYellow = 0;
					ratingYellow += (container.innerHTML.split(/star_big_yellow.png/g).length-1)*5; 
					ratingYellow += (container.innerHTML.split(/star_yellow.png/g).length-1)*1; 
					ratingYellow += (container.innerHTML.split(/star_half_yellow.png/g).length-1)*0.5; 
					ratingYellow += (container.innerHTML.split(/star_yellow_to_brown.png/g).length-1)*0.5; 
					player.lastRatingEndOfGame = ratingYellow;

					player.lastRatingDecline = rating - ratingYellow;
				}

				if (matchLink) {
					var position = matchLink.parentNode.nextSibling.nextSibling.innerHTML.match(/\((.+)\)/)[1];
					player.lastPosition = position;
				}

				if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc) && ! Foxtrick.Pages.Players.isOldiesPage(doc)) {
					player.transferCompare = doc.createElement('a');
					player.transferCompare.textContent = Foxtrickl10n.getString('TransferCompare.abbr');
					player.transferCompare.title = Foxtrickl10n.getString('TransferCompare');
					player.transferCompare.href = player.nameLink.href.replace("/Club/Players/Player.aspx" ,"/Club/Transfers/TransferCompare.aspx");
				}

				if (Foxtrick.Pages.Players.isOldiesPage(doc)
					|| Foxtrick.Pages.Players.isCoachesPage(doc)
					|| Foxtrick.Pages.Players.isNtPlayersPage(doc)) {
					var currentPara = null;
					var currentClubLink = null, currentClubId = null;
					for (var j = 0; j < paragraphs.length; ++j) {
						var links = paragraphs[j].getElementsByTagName("a");
						for (var k = 0; k < links.length; ++k) {
							if (links[k].href && links[k].href.search(/TeamID=/i) !== -1) {
								currentClubLink = links[k];
								currentClubId = Foxtrick.util.id.getTeamIdFromUrl(links[k].href);
								break;
							}
						}
						if (currentClubLink !== null) {
							currentPara = paragraphs[j];
							break;
						}
					}
					if (currentClubLink !== null) {
						player.currentClubLink = currentClubLink.cloneNode(true);
						player.currentClubId = currentClubId;

						if (!Foxtrick.Pages.Players.isNtPlayersPage(doc)) { // not applicable for NT players
							// we concatenate the text nodes from the containing
							// <p> to a string, and search for league names there.
							var leagueText = "";
							for (var j = 0; j < currentPara.childNodes.length; ++j) {
								if (currentPara.childNodes[j].nodeName === "#text") {
									// the text is in a child text node of currentPara,
									// so we remove all tags
									leagueText += currentPara.childNodes[j].textContent;
								}
							}
							for (var j in Foxtrick.XMLData.League) {
								if (leagueText.indexOf(Foxtrick.XMLData.League[j].LeagueName) !== -1) {
									player.currentLeagueId = j;
									break;
								}
							}
						}
					}
				}
				var psicoLink = null;
				if (doc.getElementById("psicotsi_show_div_"+i)!==null) 	 // ff
					psicoLink = doc.getElementById("psicotsi_show_div_"+i).getElementsByTagName("a")[0];
				else if (doc.getElementById("psico_show_div_"+i)!==null) 	 // chrome
					psicoLink = doc.getElementById("psico_show_div_"+i).getElementsByTagName("a")[0];
				if (psicoLink) {
					player.psicoTSI = psicoLink.textContent.match(/\d+\.\d+/)[0];
					player.psicoTitle = psicoLink.textContent.match(/(.+)\s\[/)[1];
				}
				
			}
		};
		// if callback is provided, we get list with XML
		// otherwise, we get list synchronously and return it
		if (callback) {
			getXml(doc, function(xml) {
				try {
					// parse HTML first because players present in XML may
					// not present in XML (NT players)
					if (!options || !options.current_squad) parseHtml();
					if (xml) parseXml(xml); 
					callback(playerList);
				}
				catch (e) {
					Foxtrick.log(e);
					callback(null);
				}
			});
		}
		else {
			try {
				parseHtml();
				return playerList;
			}
			catch (e) {
				Foxtrick.log(e);
				return null;
			}
		}
	},

	getPlayerFromListById : function(list, id) {
		for (var i = 0; i < list.length; ++i) {
			if (list[i].id === id) {
				return list[i];
			}
		}
		return null;
	},

	getPlayerId : function(playerInfo) {
		var nameLink = Foxtrick.filter(function(n) { return !Foxtrick.hasClass(n, "flag.+"); },
			playerInfo.getElementsByTagName("a"))[0];
		var id = Number(nameLink.href.match(/playerID=(\d+)/i)[1]);
		return id;
	},

	isPropertyInList : function(playerList, property) {
		for (var i in playerList) {
			if (playerList[i][property] !== undefined) {
				return true;
			}
		}
		return false;
	},
	
	// returns last and second last match dates from a list
	// @param players: array which contains matchdates somewhere in
	// @param getLastMatchDates: function which extract the matchdate from an array element
	// @param mincount: integer determining the minimum count for a date to be taken into account, defaults to 1
	getLastMatchDates : function(players, getLastMatchDates, mincount) {
			var mincount = mincount || 1;
			var matchdays = [], matchdays_count = {}, lastMatch = 0, secondLastMatch = 0;
			for (var i=0; i<players.length; ++i) {
				var thisMatchday = getLastMatchDates(players[i]);
				matchdays.push ( thisMatchday );
				if (!matchdays_count[thisMatchday]) 
					matchdays_count[thisMatchday] = 1;
				else
					++matchdays_count[thisMatchday];
			}
			matchdays.sort();
			lastMatch = matchdays[matchdays.length-1];

			matchdays =  Foxtrick.filter(function(n){
				// delete all older than a week and all with too few players (might be transfers)
				// the '6' is arbitrary
				return (n > lastMatch-7*24*60*60*1000 && matchdays_count[n] >= mincount);
			}, matchdays);
			lastMatch = matchdays[matchdays.length-1];
			secondLastMatch =  matchdays[matchdays.length-1 - matchdays_count[lastMatch] ];
			
			return {lastMatchDate:lastMatch, secondLastMatchDate:secondLastMatch}
	}
};
