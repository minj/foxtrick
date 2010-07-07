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

	getSkills : function(doc) {
		return this.getSkillsWithText(doc).values;
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
					var skillOrder = ["keeper", "playmaking", "passing", "winger", "defending", "scoring", "setPieces"];
					var cells = skillTable.getElementsByTagName("td");
					for (var i = 0; i < skillOrder.length; ++i) {
						var skillLink = cells[2 * i + 3].getElementsByTagName("a")[0];
						var skillValue = parseInt(skillLink.href.match(/ll=(\d+)/)[1]);
						var skillText = Foxtrick.trim(skillLink.textContent);
						var skillName = Foxtrick.trim(cells[2 * i + 2].textContent).replace(":", "")
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
					if (rows[i].getElementsByTagName("td").length > 2) {
						// images are present, the third cell contains text
						var skillTextCell = rows[i].getElementsByTagName("td")[2];
						for (var j = 0; j < skillTextCell.childNodes.length; ++j) {
							// could either be a skill or unknown
							if (Foxtrick.hasClass(skillTextCell.childNodes[j], "skill")
								|| Foxtrick.hasClass(skillTextCell.childNodes[j], "shy")) {
								if (currentText === "") {
									currentText = Foxtrick.trim(skillTextCell.childNodes[j].textContent);
								}
								else {
									maxText = Foxtrick.trim(skillTextCell.childNodes[j].textContent);
									break;
								}
							}
						}
					}
					else {
						// no images, the second cell says "unknown"
						var skillTextCell = rows[i].getElementsByTagName("td")[1];
						currentText = maxText = Foxtrick.trim(skillTextCell.textContent);
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
	}
};
