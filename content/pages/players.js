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
	getPlayerList : function(doc) {
		try {
			// preparation steps
			var isOwn = this.isOwnPlayersPage(doc);

			var allPlayers = doc.getElementsByClassName("playerInfo");
			var playerList = [];

			// XML data including extra information provided by Hattrick
			var playersXML = this.getXML(doc);

			var player;
			for (var i = 0; i < allPlayers.length; ++i) {
				player = {};
				var hasFlag = (allPlayers[i].getElementsByTagName("a")[0].innerHTML.search(/flags.gif/i)!=-1);
				var offset = hasFlag ? 1 : 0;
				player.id = allPlayers[i].getElementsByTagName("a")[offset].href.replace(/.+playerID=/i, "").match(/^\d+/)[0];

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
								// category === 0 means the player is not categorized
								player.category = parseInt(currentXMLPlayer.getElementsByTagName("PlayerCategoryId")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("Agreeability").length) {
								player.agreeability = parseInt(currentXMLPlayer.getElementsByTagName("Agreeability")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("Aggressiveness").length) {
								player.agreeability = parseInt(currentXMLPlayer.getElementsByTagName("Aggressiveness")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("Honesty").length) {
								player.agreeability = parseInt(currentXMLPlayer.getElementsByTagName("Honesty")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("LeagueGoals").length) {
								var leagueGoals = currentXMLPlayer.getElementsByTagName("LeagueGoals")[0].textContent;
								if (leagueGoals == "Not available") {
									// if it's not available, use -1 to mark it
									player.leagueGoals = -1;
								}
								else {
									player.leagueGoals = parseInt(leagueGoals);
								}
							}
							if (currentXMLPlayer.getElementsByTagName("CareerGoals").length) {
								var careerGoals = currentXMLPlayer.getElementsByTagName("CareerGoals")[0].textContent;
								if (careerGoals == "Not available") {
									// if it's not available, use -1 to mark it
									player.careerGoals = -1;
								}
								else {
									player.careerGoals = parseInt(careerGoals);
								}
							}
							if (currentXMLPlayer.getElementsByTagName("TransferListed").length) {
								var transferListed = currentXMLPlayer.getElementsByTagName("TransferListed")[0].textContent;
								// this would be a Boolean
								player.transferListed = !(transferListed === "0");
							}
							if (currentXMLPlayer.getElementsByTagName("NationalTeamID").length) {
								// NationalTeamID of the player if he is a NT player, otherwise 0
								player.nationalTeamId = parseInt(currentXMLPlayer.getElementsByTagName("NationalTeamID")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("Salary").length) {
								var currencyRate = FoxtrickPrefs.getString("currencyRate");
								// from krone to € to user-defined
								player.salary = parseInt(currentXMLPlayer.getElementsByTagName("Salary")[0].textContent) / (10 * currencyRate);
							}
							if (currentXMLPlayer.getElementsByTagName("TSI").length) {
								player.tsi = parseInt(currentXMLPlayer.getElementsByTagName("TSI")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("Age").length) {
								player.years = parseInt(currentXMLPlayer.getElementsByTagName("Age")[0].textContent);
							}
							if (currentXMLPlayer.getElementsByTagName("Age").length) {
								player.days = parseInt(currentXMLPlayer.getElementsByTagName("AgeDays")[0].textContent);
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
								player.trainerData = currentXMLPlayer.getElementsByTagName("TrainerData")[0];
							}
							if (currentXMLPlayer.getElementsByTagName("PlayerNumber").length) {
								// number = 100 means this player hasn't been assigned one
								var number = parseInt(currentXMLPlayer.getElementsByTagName("PlayerNumber")[0].textContent);
								player.number = number;
							}
							break;
						}
					}
				}

				player.nameLink = allPlayers[i].getElementsByTagName("a")[offset].cloneNode(true);

				var basicInformation = allPlayers[i].getElementsByTagName("p")[0];
				if (!player.years || !player.days) {
					var age = basicInformation.innerHTML.match(/(\d+)/g);
					player.years = age[0];
					player.days = age[1];
				}

				if (!player.tsi) {
					var tsitot_in = basicInformation.innerHTML.substr(0, basicInformation.innerHTML.indexOf("<br>"));
					if (tsitot_in.search(/^\s*TSI/) != -1) {
						// In the language Vlaams, TSI and age are switched. This is a fix for that
						tsitot_in = tsitot_in.replace(/,.+/,"");
					}
					var lastindex = tsitot_in.lastIndexOf(" ");
					if (tsitot_in.lastIndexOf("=") > lastindex) {
						lastindex = tsitot_in.lastIndexOf("=");
					}
					tsitot_in = tsitot_in.substr(lastindex+1).replace("&nbsp;","");
					player.tsi = parseInt(tsitot_in);
				}

				specMatch = basicInformation.textContent.match(/\[(\D+)\]/);
				player.speciality = specMatch ? specMatch[1] : "";

				// NT players don't have leadership and experience in XML
				// but instead in HTML
				if (this.isNtPlayersPage(doc)) {
					player.leadership = parseInt(allPlayers[i].getElementsByTagName("a")[4 + offset].href.match(/ll=(\d+)/)[1]);
					player.experience = parseInt(allPlayers[i].getElementsByTagName("a")[3 + offset].href.match(/ll=(\d+)/)[1]);
				}

				player.form = parseInt(allPlayers[i].getElementsByTagName("a")[1 + offset].href.match(/ll=(\d+)/)[1]);
				player.stamina = parseInt(allPlayers[i].getElementsByTagName("a")[2 + offset].href.match(/ll=(\d+)/)[1]);

				if (isOwn && !this.isOldiesPage(doc) && !this.isCoachesPage(doc)) {			
					var skillTable = allPlayers[i].getElementsByTagName("table")[0];
					var hasSkillBars = true;
					var rowCount = skillTable.getElementsByTagName("tr").length;
					if (rowCount == 4) {
						hasSkillBars = false;
					}
					if (skillTable) {
						if (hasSkillBars) {
							var skillOrder = ["keeper", "defending", "playmaking", "winger", "passing", "scoring", "setPieces"];
							var rows = skillTable.getElementsByTagName("tr");
							for (var j = 0; j < 7; ++j) {
								var cells = rows[j].getElementsByTagName("td");
								var imgs = cells[1].getElementsByTagName("img");
								var level = imgs[0].title.match(/-?\d+/);
								player[skillOrder[j]] = parseInt(level);
							}
						}
						else {
							var skillOrder = ["keeper", "playmaking", "passing", "winger", "defending", "scoring", "setPieces"];
							var cells = skillTable.getElementsByTagName("td");
							for (var j = 0; j < 7; ++j) {
								var level = cells[2 * j + 3].getElementsByTagName("a")[0].href.match(/ll=(\d+)/)[1];
								player[skillOrder[j]] = parseInt(level);
							}
						}
					}
				}

				// red/yellow cards and injuries, these are shown as images
				player.redCard = 0;
				player.yellowCard = 0;
				player.bruised = false;
				player.injured = 0;
				var imgs = allPlayers[i].getElementsByTagName("img");
				for (var j = 0; j < imgs.length; ++j) {
					if (imgs[j].className == "cardsOne") {
						if (imgs[j].src.indexOf("red_card", 0) != -1) {
							player.redCard = 1;
						}
						else {
							player.yellowCard = 1;
						}
					}
					if (imgs[j].className == "cardsTwo") {
						player.yellowCard = 2;
					}
					if (imgs[j].className == "injuryBruised") {
						player.bruised = true;
					}
					if (imgs[j].className == "injuryInjured") {
						player.injured = parseInt(imgs[j].nextSibling.innerHTML);
					}
				}

				// last match
				var as = allPlayers[i].getElementsByTagName("a");
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

				playerList.push(player);
			}
			return playerList;
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	getXML : function(doc) {
		if (!this.isSeniorPlayersPage(doc)) {
			// not the page we are looking for
			return null;
		}
		if (FoxtrickPrefs.getBool("ExtraPlayerslistInfo")) {
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
