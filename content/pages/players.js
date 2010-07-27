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
	
	getPlayerList : function(doc, disableXML) {
		try {
			// preparation steps
			var isOwn = this.isOwnPlayersPage(doc);
			var isYouth = this.isYouthPlayersPage(doc);

			var allPlayers = doc.getElementsByClassName("playerInfo");
			var playerList = [];

			// XML data including extra information provided by Hattrick
			var playersXML = disableXML ? null : this.getXML(doc);

			var player;
			for (var i = 0; i < allPlayers.length; ++i) {
				if (allPlayers[i].style.display === "none") {
					continue;
				}

				player = {};
				var hasFlag = (allPlayers[i].getElementsByClassName("flag").length > 0);
				var nameLink = hasFlag ? allPlayers[i].getElementsByTagName("a")[1] : allPlayers[i].getElementsByTagName("a")[0];
				player.id = nameLink.href.replace(/.+playerID=/i, "").match(/^\d+/)[0];
				player.nameLink = nameLink.cloneNode(true);

				if (playersXML !== null) {
					var allXMLPlayers = playersXML.getElementsByTagName("Player");
					for (var j = 0; j < allXMLPlayers.length; ++j) {
						var currentXMLPlayer = allXMLPlayers[j];
						var currentXMLPlayerId = currentXMLPlayer.getElementsByTagName("PlayerID")[0].textContent;
						if (player.id === currentXMLPlayerId) {
							// we found this player in the XML file,
							// go on the retrieve information
							if (currentXMLPlayer.getElementsByTagName("NrOfMatches").length) {
								player.matchCount = parseInt(currentXMLPlayer.getElementsByTagName("NrOfMatches")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("PlayerCategoryId").length) {
								var category = currentXMLPlayer.getElementsByTagName("PlayerCategoryId")[0].textContent;
								if (parseInt(category) > 0) {
									player.category = parseInt(category);
								}
							}
							if (currentXMLPlayer.getElementsByTagName("Agreeability").length) {
								player.agreeability = parseInt(currentXMLPlayer.getElementsByTagName("Agreeability")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("Aggressiveness").length) {
								player.aggressiveness = parseInt(currentXMLPlayer.getElementsByTagName("Aggressiveness")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("Honesty").length) {
								player.honesty = parseInt(currentXMLPlayer.getElementsByTagName("Honesty")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("LeagueGoals").length) {
								var leagueGoals = currentXMLPlayer.getElementsByTagName("LeagueGoals")[0].textContent;
								if (parseInt(leagueGoals) >= 0) {
									player.leagueGoals = parseInt(leagueGoals);
								}
							}
							if (currentXMLPlayer.getElementsByTagName("CupGoals").length) {
								var cupGoals = currentXMLPlayer.getElementsByTagName("CupGoals")[0].textContent;
								if (parseInt(cupGoals) >= 0) {
									player.cupGoals = parseInt(cupGoals);
								}
							}
							if (currentXMLPlayer.getElementsByTagName("FriendliesGoals").length) {
								var friendliesGoals = currentXMLPlayer.getElementsByTagName("FriendliesGoals")[0].textContent;
								if (parseInt(friendliesGoals) >= 0) {
									player.friendliesGoals = parseInt(friendliesGoals);
								}
							}
							if (currentXMLPlayer.getElementsByTagName("CareerGoals").length) {
								var careerGoals = currentXMLPlayer.getElementsByTagName("CareerGoals")[0].textContent;
								if (parseInt(careerGoals) >= 0) {
									player.careerGoals = parseInt(careerGoals);
								}
							}
							if (currentXMLPlayer.getElementsByTagName("CareerHattricks").length) {
								var hattricks = currentXMLPlayer.getElementsByTagName("CareerHattricks")[0].textContent;
								if (parseInt(hattricks) >= 0) {
									player.hattricks = parseInt(hattricks);
								}
							}
							if (currentXMLPlayer.getElementsByTagName("NationalTeamID").length) {
								// NationalTeamID of the player if he is a NT player, otherwise 0
								player.nationalTeamId = parseInt(currentXMLPlayer.getElementsByTagName("NationalTeamID")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("Salary").length) {
								var currencyRate = FoxtrickPrefs.getString("currencyRate");
								// from krone to € to user-defined
								player.salary = Math.floor(parseInt(currentXMLPlayer.getElementsByTagName("Salary")[0].textContent) / (10 * currencyRate));
							}
							if (currentXMLPlayer.getElementsByTagName("TSI").length) {
								player.tsi = parseInt(currentXMLPlayer.getElementsByTagName("TSI")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("Age").length
								&& currentXMLPlayer.getElementsByTagName("AgeDays").length) {
								var age = {};
								age.years = parseInt(currentXMLPlayer.getElementsByTagName("Age")[0].textContent);
								age.days = parseInt(currentXMLPlayer.getElementsByTagName("AgeDays")[0].textContent);
								player.age = age;
							}
							if (currentXMLPlayer.getElementsByTagName("Leadership").length) {
								player.leadership = parseInt(currentXMLPlayer.getElementsByTagName("Leadership")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("Experience").length) {
								player.experience = parseInt(currentXMLPlayer.getElementsByTagName("Experience")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("CountryID").length) {
								player.countryId = parseInt(currentXMLPlayer.getElementsByTagName("CountryID")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("TrainerData").length) {
								trainerData = currentXMLPlayer.getElementsByTagName("TrainerData")[0];
								player.trainerData = {};
								if (trainerData.getElementsByTagName("TrainerType").length) {
									player.trainerData.type = parseInt(trainerData.getElementsByTagName("TrainerType")[0].textContent);
								}
								if (trainerData.getElementsByTagName("TrainerSkill").length) {
									player.trainerData.skill = parseInt(trainerData.getElementsByTagName("TrainerSkill")[0].textContent);
								}
							}
							if (currentXMLPlayer.getElementsByTagName("PlayerNumber").length) {
								// number = 100 means this player hasn't been assigned one
								var number = parseInt(currentXMLPlayer.getElementsByTagName("PlayerNumber")[0].textContent);
								if (number >= 1 && number < 100) {
									player.number = number;
								}
							}
							break;
						}
					}
				}

				var paragraphs = allPlayers[i].getElementsByTagName("p");
				var imgs = allPlayers[i].getElementsByTagName("img");
				var as = allPlayers[i].getElementsByTagName("a");

				var basicInformation;
				if (isYouth) {
					basicInformation = paragraphs[0];
				}
				else {
					for (var j = 0; j < paragraphs.length; ++j) {
						if (paragraphs[j].textContent.search("(=|:)") !== -1) {
							basicInformation = paragraphs[j];
							break;
						}
					}
				}

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
					player.age = { years: parseInt(ageMatch[0]), days: parseInt(ageMatch[1]) };
				}

				if (this.isSeniorPlayersPage(doc) && !player.tsi) {
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

				if (isOwn && !this.isOldiesPage(doc) && !this.isCoachesPage(doc)) {
					var skillTable = allPlayers[i].getElementsByTagName("table")[0];
					if (this.isSeniorPlayersPage(doc)) {
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
					else if (this.isYouthPlayersPage(doc)) {
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
				if (this.isSeniorPlayersPage(doc)) {
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
						player.injured = parseInt(imgs[j].nextSibling.textContent);
					}
					else if (imgs[j].className == "transferListed") {
						player.transferListed = true;
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

				if (this.isOldiesPage(doc) || this.isCoachesPage(doc)) {
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

				playerList.push(player);
			}
			return playerList;
		}
		catch (e) {
			Foxtrick.dumpError(e);
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
		var hasFlag = (playerInfo.getElementsByTagName("a")[0].innerHTML.search(/flags.gif/i)!=-1);
		var offset = hasFlag ? 1 : 0;
		var id = playerInfo.getElementsByTagName("a")[offset].href.replace(/.+playerID=/i, "").match(/^\d+/)[0];
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

	getXML : function(doc) {
		const USER_DATA_KEY = "players-xml";
		if (!this.isSeniorPlayersPage(doc)) {
			// not the page we are looking for
			return null;
		}
		if (doc.getUserData !== undefined && doc.getUserData(USER_DATA_KEY) !== null) {
			Foxtrick.dump(USER_DATA_KEY+" data already saved as user data, returning user data now.\n");
			return doc.getUserData(USER_DATA_KEY);
		}
		// we load the XML only if the ExtraPlayerInfo module is enabled
		if (Foxtrick.isModuleEnabled(FoxtrickExtraPlayerInfo)) {
			var file = "file=players"; // default normal team
			var team = ""; // default own team
			var selection = ""; // default current players

			// determine xml file
			var teamid = doc.location.href.match(/teamid=(\d+)/i)[1];
			var Oldies = this.isOldiesPage(doc);
			var Coaches = this.isCoachesPage(doc);
			var NTplayers = this.isNtPlayersPage(doc);
			if (teamid) team = "&teamId="+teamid;
			if (Oldies) selection = "&actionType=viewOldies";
			if (Coaches) selection = "&actionType=viewOldCoaches";
			if (NTplayers) file = "file=nationalplayers&ShowAll=true&actiontype=supporterstats";

			var location = "http://" + doc.location.hostname + "/Community/CHPP/Players/chppxml.axd?" + file + team + selection;

			Foxtrick.dump("Foxtrick.Pages.Players getting: " + location + "\n");
			// get players.xml
			try {
				var startTime = (new Date()).getTime();
				var req = new XMLHttpRequest();
				req.open("GET", location, false);
				req.send(null);
				if (req.status == 200) {
					var endTime = (new Date()).getTime();
					Foxtrick.dump("Time used: " + (endTime - startTime) + "ms. "
						+ "(This estimation is inaccurate, please use Tamper Data or other tools for better estimation)\n");

					var error = req.responseXML.getElementsByTagName("Error");
					if (error.length == 0) {
						Foxtrick.dump("FileName: " + req.responseXML.getElementsByTagName("FileName")[0].textContent + "\n");
						Foxtrick.dump("Version: " + req.responseXML.getElementsByTagName("Version")[0].textContent + "\n");
						Foxtrick.dump("UserID: " + req.responseXML.getElementsByTagName("UserID")[0].textContent + "\n");
						Foxtrick.dump("ActionType: " + req.responseXML.getElementsByTagName("ActionType")[0].textContent + "\n");
						if (doc.setUserData !== undefined) {
							Foxtrick.dump("\nSaving response XML as user data.\n");
							doc.setUserData(USER_DATA_KEY, req.responseXML, null);
						}
						return req.responseXML;
					}
					else {
						Foxtrick.dump("Error: " + error[0].textContent+"\n");
						Foxtrick.dump("Server: " + req.responseXML.getElementsByTagName("Server")[0].textContent + "\n");
					}
				}
				else {
					Foxtrick.dump("Failure getting " + location + ", request status: " + req.status + ".\n");
				}
			}
			catch (e) {
				Foxtrick.dump("Failure getting " + location + ": " + e + "\n");
			}
		}
		// In case of errors or ExtraPlayerslistInfo disabled, return null
		return null;
	}
};
