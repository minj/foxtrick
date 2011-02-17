/* players.js
 * Utilities on players page
 * @author convincedd, ryanli
 */

Foxtrick.Pages.Players = {
	isPlayersPage : function(doc) {
		return this.isPlayersPage(doc) || this.isYouthPlayersPage(doc);
	},
	isSeniorPlayersPage : function(doc) {
		return Foxtrick.isPage(Foxtrick.ht_pages["players"], doc);
	},
	isYouthPlayersPage : function(doc) {
		return Foxtrick.isPage(Foxtrick.ht_pages["YouthPlayers"], doc);
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

	getPlayerList : function(doc, callback) {
		var playerList = [];

		var getXml = function(doc, callback) {
			if (!Foxtrick.Pages.Players.isSeniorPlayersPage(doc)) {
				// not the page we are looking for
				callback(null);
				return;
			}
			var args = [];
			if (Foxtrick.Pages.Players.isNtPlayersPage(doc)) {
				args.push(["file", "nationalplayers"]);
				args.push(["ShowAll", "true"]);
				args.push(["actionType", "supporterstats"]);
			}
			else {
				args.push(["file", "players"]);
				if (doc.location.href.match(/teamid=(\d)/i))
					args.push("teamId", doc.location.href.match(/teamid=(\d+)/i)[1]);
				if (Foxtrick.Pages.Players.isOldiesPage(doc))
					args.push("actionType", "viewOldies");
				else if (Foxtrick.Pages.Players.isCoachesPage(doc))
					args.push("actionType", "viewOldCoaches");
			}
			Foxtrick.ApiProxy.retrieve(doc, args, callback);
		};

		var parseXml = function(xml) {
			if (!xml)
				return;
			var playerNodes = xml.getElementsByTagName("Player");
			for (var i = 0; i < playerNodes.length; ++i) {
				var playerNode = playerNodes[i];
				var player = {};
				player.id = Number(playerNode.getElementsByTagName("PlayerID")[0].textContent);
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
					trainerData = playerNode.getElementsByTagName("TrainerData")[0];
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
				playerList.push(player);
			}
		};

		var parseHtml = function() {
			// preparation steps
			var isOwn = Foxtrick.Pages.Players.isOwnPlayersPage(doc);
			var isYouth = Foxtrick.Pages.Players.isYouthPlayersPage(doc);

			var playerNodes = doc.getElementsByClassName("playerInfo");
			for (var i = 0; i < playerNodes.length; ++i) {
				var playerNode = playerNodes[i];
				if (playerNode.style.display == "none")
					continue;
				var nameLink = Foxtrick.filter(playerNode.getElementsByTagName("a"),
					function(n) { return n.getElementsByClassName("flag").length == 0; })[0];
				var id = Foxtrick.Pages.Players.getPlayerId(playerNode);
				// see if player is already in playerList, add if not
				var player = Foxtrick.filter(playerList, function(n) { return n.id == id; })[0];
				if (!player) {
					playerList.push({id : id});
					player = playerList[playerList.length - 1];
				}
				player.nameLink = nameLink.cloneNode(true);

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
					var tsiMatch = basicHtml.match(RegExp("\\w+\\s*(=|:)\\s*([\\d\\s]*)"));
					var tsi;
					if (tsiMatch) {
						tsi = tsiMatch[2];
						tsi = tsi.replace(RegExp("\\s", "g"), "");
						tsi = parseInt(tsi);
						player.tsi = tsi;
					}
				}

				specMatch = basicInformation.textContent.match(/\[(\D+)\]/);
				player.speciality = specMatch ? specMatch[1] : "";

				// this could include form, stamina, leadership and experience
				// if its length ≥ 2, then it includes form and stamina
				// if its length ≥ 4, then it includes leadership and experience
				var basicSkillLinks = basicInformation.getElementsByClassName("skill");

				if (player.form === undefined || player.stamina === undefined
					|| player.leadership === undefined || player.experience === undefined) {
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
					var basicSkillNames = ["form", "stamina", "leadership", "experience"];
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
				player.redCard = 0;
				player.yellowCard = 0;
				player.bruised = false;
				player.injured = 0;
				// only senior players can be transfer-listed
				if (Foxtrick.Pages.Players.isSeniorPlayersPage(doc)) {
					player.transferListed = false;
				}

				for (var j = 0; j < imgs.length; ++j) {
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
						player.injured = Number(imgs[j].nextSibling.textContent);
					}
					else if (imgs[j].className == "transferListed") {
						player.transferListed = true;
					}
				}

				// HTMS points
				var htmsPoints = playerNode.getElementsByClassName("ft-htms-points").item(0);
				if (htmsPoints) {
					var points = htmsPoints.getElementsByTagName("span")[0].textContent;
					const matched = points.match(/([\-0-9]+).+?([\-0-9]+)/);
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
				}

				if (matchLink) {
					var position = matchLink.parentNode.nextSibling.nextSibling.innerHTML.match(/\((.+)\)/)[1];
					player.lastPosition = position;
				}

				if (Foxtrick.Pages.Players.isOldiesPage(doc)
					|| Foxtrick.Pages.Players.isCoachesPage(doc)
					|| Foxtrick.Pages.Players.isNtPlayersPage(doc)) {
					var currentPara = null;
					var currentClubLink = null;
					for (var j = 0; j < paragraphs.length; ++j) {
						var links = paragraphs[j].getElementsByTagName("a");
						for (var k = 0; k < links.length; ++k) {
							if (links[k].href && links[k].href.search(/TeamID=/i) !== -1) {
								currentClubLink = links[k];
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
			}
		};
		// if callback is provided, we get list with XML
		// otherwise, we get list synchronously and return it
		if (callback) {
			getXml(doc, function(xml) {
				try {
					parseXml(xml);
					parseHtml();
					callback(playerList);
				}
				catch (e) {
					Foxtrick.dumpError(e);
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
				Foxtrick.dumpError(e);
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
		var nameLink = Foxtrick.filter(playerInfo.getElementsByTagName("a"),
			function(n) { return !Foxtrick.hasClass(n, "flag"); })[0];
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
	}
};
