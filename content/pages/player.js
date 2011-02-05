/* player.js
 * Utilities on player page
 * @author ryanli
 */

Foxtrick.Pages.Player = {
	isPlayerPage : function(doc) {
		return this.isSeniorPlayerPage(doc) || this.isYouthPlayerPage(doc);
	},

	isSeniorPlayerPage : function(doc) {
		return Foxtrick.isPage(Foxtrick.ht_pages["playerdetail"], doc);
	},

	isYouthPlayerPage : function(doc) {
		return Foxtrick.isPage(Foxtrick.ht_pages["youthplayerdetail"], doc);
	},

	getAge : function(doc) {
		try {
			// returns age in the following format:
			// age = { years: xx, days: yyy };
			var birthdayRe = /(\d+).*?(\d+).*?\d+.*?\d+.*?\d+.*?/;
			var birthdayCell;
			var allDivs = doc.getElementsByTagName("div");
			for (var i = 0; i < allDivs.length; i++) {
				if (allDivs[i].className == "byline") {
					birthdayCell = allDivs[i];
					break;
				}
			}
			var birthdayMatch = birthdayRe.exec(birthdayCell.textContent);

			var age = {
				years : parseInt(birthdayMatch[1]),
				days : parseInt(birthdayMatch[2])
			};
			return age;
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	getName : function(doc) {
		var mainWrapper = doc.getElementById("mainWrapper");
		var h2 = mainWrapper.getElementsByTagName("h2")[0];
		var links = h2.getElementsByTagName("a");
		for (var i = 0; i < links.length; ++i) {
			if (links[i].href.match(RegExp("PlayerID=\\d+", "i"))) {
				return links[i].textContent;
			}
		}
	},

	getId : function(doc) {
		var url = String(doc.location);
		return url.match(RegExp("PlayerID=(\\d+)", "i"))[1];
	},

	getNationalityId : function(doc) {
		try {
			var flag = doc.getElementsByClassName("flag")[0];
			var link = flag.href;
			var idMatch = link.match(/LeagueID=(\d+)/i);
			return idMatch[1];
		}
		catch (e) {
			return null;
		}
	},

	getNationalityName : function(doc) {
		try {
			var flag = doc.getElementsByClassName("flag")[0];
			var img = flag.getElementsByTagName("img")[0];
			return img.title;
		}
		catch (e) {
			return null;
		}
	},

	getTsi : function(doc) {
		if (!this.isSeniorPlayerPage(doc)) {
			return null;
		}
		try {
			var playerInfo = doc.getElementsByClassName("playerInfo")[0];
			var infoTable = playerInfo.getElementsByTagName("table")[0];
			var tsiString = infoTable.rows[1].cells[1].textContent.replace(/\D/g, "");
			return parseInt(tsiString);
		}
		catch (e) {
			Foxtrick.dumpError(e);
			return null;
		}
	},

	// returns leadership, experience, stamina, form for senior players
	// FIXME - find a better name….
	getBasicSkills : function(doc) {
		if (!this.isSeniorPlayerPage(doc)) {
			return null;
		}
		try {
			var playerInfo = doc.getElementsByClassName("playerInfo")[0];
			var basicSkills = playerInfo.getElementsByClassName("skill");
			var ret = {};
			if (basicSkills[1].href.indexOf("skillshort") !== -1) {
				ret.form = FoxtrickHelper.getSkillLevelFromLink(basicSkills[1]);
				ret.stamina = FoxtrickHelper.getSkillLevelFromLink(basicSkills[0]);
			}
			else {
				ret.form = FoxtrickHelper.getSkillLevelFromLink(basicSkills[0]);
				ret.stamina = FoxtrickHelper.getSkillLevelFromLink(basicSkills[1]);
			}
			if (basicSkills[3].href.indexOf("skillshort") !== -1) {
				ret.leadership = FoxtrickHelper.getSkillLevelFromLink(basicSkills[3]);
				ret.experience = FoxtrickHelper.getSkillLevelFromLink(basicSkills[2]);
			}
			else {
				ret.leadership = FoxtrickHelper.getSkillLevelFromLink(basicSkills[2]);
				ret.experience = FoxtrickHelper.getSkillLevelFromLink(basicSkills[3]);
			}
			return ret;
		}
		catch (e) {
			Foxtrick.dumpError(e);
			return null;
		}
	},

	getBruised : function(doc) {
		var playerInfo = doc.getElementsByClassName("playerInfo")[0];
		var infoTable = playerInfo.getElementsByTagName("table")[0];
		var injuryCell = infoTable.rows[4].cells[1];
		var injuryImages = injuryCell.getElementsByTagName("img");
		if (injuryImages.length > 0) {
			if (injuryImages[0].src.indexOf("bruised.gif") !== -1) {
				return true;
			}
		}
		return false;
	},

	getInjuryWeeks : function(doc) {
		var playerInfo = doc.getElementsByClassName("playerInfo")[0];
		var infoTable = playerInfo.getElementsByTagName("table")[0];
		var injuryCell = infoTable.rows[4].cells[1];
		var injuryImages = injuryCell.getElementsByTagName("img");
		if (injuryImages.length > 0) {
			if (injuryImages[0].src.indexOf("injured.gif") !== -1) {
				return parseInt(injuryImages[0].nextSibling.textContent.match(/\d+/)[0]);
			}
		}
		return 0;
	},

	getOwnerClub : function(doc) {
		try {
			const head = doc.getElementsByClassName("main")[0].getElementsByTagName("h2")[0];
			const links = head.getElementsByTagName("a");
			if (links.length < 2)
				return null; // free agent
			return links[0].textContent;
		}
		catch (e) {
			return null;
		}
	},

	// Returns an object like this:
	/*
	{
		base : 5000,
		bonus : 1000,
		total : 6000
	}
	*/
	getWage : function(doc) {
		if (!this.isSeniorPlayerPage(doc)) {
			return null;
		}
		try {
			var playerInfo = doc.getElementsByClassName("playerInfo")[0];
			var infoTable = playerInfo.getElementsByTagName("table")[0];
			// wage position varies for free agents
			if (this.getOwnerClub(doc))
				var wageText = infoTable.rows[2].cells[1].textContent;
			else
				var wageText = infoTable.rows[1].cells[1].textContent;
			var hasBonus = (wageText.indexOf("%") > -1);
			wageText = wageText.replace(/\s*(\d+)\s+/g, "$1");
			var wage = parseInt(wageText);
			if (hasBonus)
				return { base : wage / 1.2, bonus : wage / 6,  total : wage };
			else
				return { base : wage, bonus : 0, total : wage };
		}
		catch (e) {
			Foxtrick.dumpError(e);
			return null;
		}
	},

	getSkills : function(doc) {
		var skillsWithText = this.getSkillsWithText(doc);
		return (skillsWithText ? skillsWithText.values : null);
	},

	// For youth players, returns an object like this:
	/*
	{
		values : {
			keeper : { current : 4, max : 7, maxed : false },
			defending : { current : 0, max : 5, maxed : false },
			// ...
		},
		texts : {
			keeper : { current : "weak", max : "solid" },
			defending : { current : "unknown", max : "inadequate" },
			// ...
		},
		names : {
			keeper : "Keeper",
			defending : "Defending",
			// ...
		}
	}
	*/
	// For senior players, there is no current, max, maxed;
	// values will contain simple integers while texts contain simple strings
	getSkillsWithText : function(doc) {
		try {
			var skills = {};
			var skillTexts = {};
			var skillNames = {};
			var mainBox = doc.getElementsByClassName("mainBox")[0];
			if (!mainBox) {
				return null;
			}
			var skillTable = mainBox.getElementsByTagName("table")[0];
			if (this.isSeniorPlayerPage(doc)) {
				var hasBars = (skillTable.getElementsByClassName("percentImage").length > 0);
				if (hasBars) {
					var skillOrder = ["keeper", "defending", "playmaking", "winger", "passing", "scoring", "setPieces"];
					var rows = skillTable.getElementsByTagName("tr");
					for (var i = 0; i < skillOrder.length; ++i) {
						var skillLink = rows[i].getElementsByTagName("a")[0];
						var skillValue = parseInt(skillLink.href.match(/ll=(\d+)/)[1]);
						var skillText = Foxtrick.trim(skillLink.textContent);
						var skillName = Foxtrick.trim(rows[i].getElementsByTagName("td")[0].textContent).replace(":", "");
						skills[skillOrder[i]] = skillValue;
						skillTexts[skillOrder[i]] = skillText;
						skillNames[skillOrder[i]] = skillName;
					}
				}
				else {
					var skillOrder = ["stamina", "keeper", "playmaking", "passing", "winger", "defending", "scoring", "setPieces"];
					var cells = skillTable.getElementsByTagName("td");
					for (var i = 0; i < skillOrder.length; ++i) {
						var skillLink = cells[2 * i + 1].getElementsByTagName("a")[0];
						var skillValue = parseInt(skillLink.href.match(/ll=(\d+)/)[1]);
						var skillText = Foxtrick.trim(skillLink.textContent);
						var skillName = Foxtrick.trim(cells[2 * i].textContent).replace(":", "")
						skills[skillOrder[i]] = skillValue;
						skillTexts[skillOrder[i]] = skillText;
						skillNames[skillOrder[i]] = skillName;
					}
				}
			}
			else if (this.isYouthPlayerPage(doc)) {
				var skillOrder = ["keeper", "defending", "playmaking", "winger", "passing", "scoring", "setPieces"];
				var rows = skillTable.getElementsByTagName("tr");
				for (var i = 0; i < skillOrder.length; ++i) {
					skills[skillOrder[i]] = {};
					var skillImgs = rows[i].getElementsByTagName("img");
					if (skillImgs.length > 0) {
						var max = skillImgs[0].getAttribute("title").match(/\d/);
						var current = skillImgs[1].title.match(/-?\d/);
						var unknown = skillImgs[1].title.match(/-1/);
						var maxed = !current;
						skills[skillOrder[i]].maxed = false;
						if (maxed) {
							current = max;
							skills[skillOrder[i]].maxed = true;
						}
						// if current and/or max is unknown, mark it as 0
						skills[skillOrder[i]].current = parseInt(unknown ? 0 : current);
						skills[skillOrder[i]].max = parseInt(max ? max : 0);
					}
					else {
						// no image is present, meaning nothing about
						// that skill has been revealed
						skills[skillOrder[i]] = { current : 0, max : 0, maxed : false };
					}
					var currentText = "";
					var maxText = "";
					var skillCell = rows[i].getElementsByTagName("td")[1];
					if (skillCell.getElementsByClassName("youthSkillBar").length > 0) {
						// bar is present
						// skills could either be a skill or unknown
						var isSkill = function(node) {
							return Foxtrick.hasClass(node, "skill")
								|| Foxtrick.hasClass(node, "shy");
						};
						var textNodes = Foxtrick.filter(skillCell.getElementsByClassName("youthSkillBar")[0].childNodes, isSkill);
						Foxtrick.dump("Length: " + textNodes.length + "\n");
						if (textNodes.length >= 2) {
							[currentText, maxText] = [textNodes[0].textContent, textNodes[1].textContent];
						}
					}
					else {
						// no images, the cell says "unknown"
						currentText = maxText = Foxtrick.trim(skillCell.textContent);
					}
					skillTexts[skillOrder[i]] = { current : currentText, max : maxText };
					skillNames[skillOrder[i]] = Foxtrick.trim(rows[i].getElementsByTagName("td")[0].textContent).replace(":", "");
				}
			}
			return { values : skills, texts : skillTexts, names : skillNames };
		}
		catch (e) {
			Foxtrick.dumpError(e);
			return null;
		}
	},

	getTransferDeadline : function(doc) {
		try {
			var bidDiv = doc.getElementById("ctl00_ctl00_CPContent_CPMain_updBid");
			if (bidDiv) {
				var bidPara = bidDiv.getElementsByTagName("p")[0];
				return Foxtrick.util.time.getDateFromText(bidPara.textContent);
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
		return null;
	}
};
