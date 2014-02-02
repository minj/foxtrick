'use strict';
/* player.js
 * Utilities on player page
 * @author ryanli
 */
if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.Player = {
	isPlayerPage: function(doc) {
		return this.isSeniorPlayerPage(doc) || this.isYouthPlayerPage(doc);
	},

	isSeniorPlayerPage: function(doc) {
		return Foxtrick.isPage(doc, 'playerDetails');
	},

	isYouthPlayerPage: function(doc) {
		return Foxtrick.isPage(doc, 'youthPlayerDetails');
	},

	getAge: function(doc) {
		try {
			// returns age in the following format:
			// age = { years: xx, days: yyy };
			var birthdayRe = /(\d+).*?(\d+).*?\d+.*?\d+.*?\d+.*?/;
			var birthdayCell;
			var allDivs = doc.getElementsByTagName('div');
			for (var i = 0; i < allDivs.length; i++) {
				if (allDivs[i].className == 'byline') {
					birthdayCell = allDivs[i];
					break;
				}
			}
			var birthdayMatch = birthdayRe.exec(birthdayCell.textContent);

			var age = {
				years: parseInt(birthdayMatch[1], 10),
				days: parseInt(birthdayMatch[2], 10)
			};
			return age;
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	getName: function(doc) {
		var mainWrapper = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var h2 = mainWrapper.getElementsByTagName('h2')[0];
		var links = h2.getElementsByTagName('a');
		for (var i = 0; i < links.length; ++i) {
			if (links[i].href.match(RegExp('PlayerID=\\d+', 'i'))) {
				return links[i].textContent;
			}
		}
	},

	getId: function(doc) {
		var url = String(doc.location);
		return url.match(RegExp('PlayerID=(\\d+)', 'i'))[1];
	},

	getNationalityId: function(doc) {
		try {
			var flag = doc.getElementsByClassName('flag')[0];
			var link = flag.href;
			var idMatch = link.match(/LeagueID=(\d+)/i);
			return idMatch[1];
		}
		catch (e) {
			return null;
		}
	},

	getNationalityName: function(doc) {
		try {
			var flag = doc.getElementsByClassName('flag')[0];
			var img = flag.getElementsByTagName('img')[0];
			return img.title;
		}
		catch (e) {
			return null;
		}
	},

	getTsi: function(doc) {
		if (!this.isSeniorPlayerPage(doc)) {
			return null;
		}
		try {
			var playerInfo = doc.getElementsByClassName('playerInfo')[0];
			var infoTable = playerInfo.getElementsByTagName('table')[0];
			var tsiString = infoTable.rows[1].cells[1].textContent.replace(/\D/g, '');
			return parseInt(tsiString, 10);
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	// returns leadership, experience, stamina, form for senior players
	// FIXME - find a better name….
	getBasicSkills: function(doc) {
		if (!this.isSeniorPlayerPage(doc)) {
			return null;
		}
		try {
			var playerInfo = doc.getElementsByClassName('playerInfo')[0];
			var basicSkills = playerInfo.getElementsByClassName('skill');
			var ret = {};
			if (basicSkills[1].href.search(/skillshort/i) !== -1) {
				ret.form = Foxtrick.util.id.getSkillLevelFromLink(basicSkills[1]);
				ret.stamina = Foxtrick.util.id.getSkillLevelFromLink(basicSkills[0]);
			}
			else {
				ret.form = Foxtrick.util.id.getSkillLevelFromLink(basicSkills[0]);
				ret.stamina = Foxtrick.util.id.getSkillLevelFromLink(basicSkills[1]);
			}
			if (basicSkills[3].href.search(/skillshort/i) !== -1) {
				ret.leadership = Foxtrick.util.id.getSkillLevelFromLink(basicSkills[3]);
				ret.experience = Foxtrick.util.id.getSkillLevelFromLink(basicSkills[2]);
			}
			else {
				ret.leadership = Foxtrick.util.id.getSkillLevelFromLink(basicSkills[2]);
				ret.experience = Foxtrick.util.id.getSkillLevelFromLink(basicSkills[3]);
			}
			return ret;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	getBruised: function(doc) {
		var playerInfo = doc.getElementsByClassName('playerInfo')[0];
		var infoTable = playerInfo.getElementsByTagName('table')[0];
		var injuryCell = infoTable.rows[4].cells[1];
		var injuryImages = injuryCell.getElementsByTagName('img');
		if (injuryImages.length > 0) {
			if (injuryImages[0].src.search(/bruised.gif/i) !== -1) {
				return true;
			}
		}
		return false;
	},

	getInjuryWeeks: function(doc) {
		var playerInfo = doc.getElementsByClassName('playerInfo')[0];
		var infoTable = playerInfo.getElementsByTagName('table')[0];
		var injuryCell = infoTable.rows[4].cells[1];
		var injuryImages = injuryCell.getElementsByTagName('img');
		if (injuryImages.length > 0) {
			if (injuryImages[0].src.search(/injured.gif/i) !== -1) {
				return parseInt(injuryImages[0].nextSibling.textContent.match(/\d+/)[0], 10);
			}
		}
		return 0;
	},

	getOwnerClub: function(doc) {
		try {
			var head = doc.getElementById('ctl00_ctl00_CPContent_divStartMain').getElementsByTagName('h2')[0];
			var links = head.getElementsByTagName('a');
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
		base: 5000,
		bonus: 1000,
		total: 6000
	}
	*/
	getWage: function(doc) {
		if (!this.isSeniorPlayerPage(doc)) {
			return null;
		}
		try {
			var playerInfo = doc.getElementsByClassName('playerInfo')[0];
			var infoTable = playerInfo.getElementsByTagName('table')[0];
			// wage position varies for free agents
			if (this.getOwnerClub(doc))
				var wageText = infoTable.rows[2].cells[1].textContent;
			else
				var wageText = infoTable.rows[1].cells[1].textContent;
			var hasBonus = (wageText.indexOf('%') > -1);
			wageText = wageText.replace(/\s*(\d+)\s+/g, '$1');
			var wage = parseInt(wageText, 10);
			if (hasBonus)
				return { base: wage / 1.2, bonus: wage / 6, total: wage };
			else
				return { base: wage, bonus: 0, total: wage };
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	getSkills: function(doc) {
		var skillsWithText = this.getSkillsWithText(doc);
		return (skillsWithText ? skillsWithText.values : null);
	},

	// For youth players, returns an object like this:
	/*
	{
		values: {
			keeper: { current: 4, max: 7, maxed: false },
			defending: { current: 0, max: 5, maxed: false },
			// ...
		},
		texts: {
			keeper: { current: 'weak', max: 'solid' },
			defending: { current: 'unknown', max: 'inadequate' },
			// ...
		},
		names: {
			keeper: 'Keeper',
			defending: 'Defending',
			// ...
		}
	}
	*/
	// For senior players, there is no current, max, maxed;
	// values will contain simple integers while texts contain simple strings
	getSkillsWithText: function(doc) {
		try {
			var skills = {};
			var skillTexts = {};
			var skillNames = {};
			var mainBox = doc.getElementsByClassName('mainBox')[0];
			if (!mainBox) {
				return null;
			}
			var skillTable = mainBox.getElementsByTagName('table')[0];
			if (skillTable) {
				if (this.isSeniorPlayerPage(doc)) {
					var hasBars = (skillTable.getElementsByClassName('percentImage').length > 0) ||
						 (skillTable.getElementsByClassName('ft-percentImage').length > 0);
					if (hasBars) {
						var skillOrder = ['keeper', 'defending', 'playmaking', 'winger', 'passing',
							'scoring', 'setPieces'];
						var rows = skillTable.getElementsByTagName('tr');
						for (var i = 0; i < skillOrder.length; ++i) {
							var skillLink = rows[i].getElementsByTagName('a')[0];
							if (skillLink.href.match(/ll=(\d+)/) === null) {
								break; //skills are not visible
							}
							var skillValue = parseInt(skillLink.href.match(/ll=(\d+)/)[1], 10);
							var skillText = Foxtrick.trim(skillLink.textContent);
							var skillName = Foxtrick.trim(rows[i].getElementsByTagName('td')[0]
							                              .textContent).replace(':', '');
							skills[skillOrder[i]] = skillValue;
							skillTexts[skillOrder[i]] = skillText;
							skillNames[skillOrder[i]] = skillName;
						}
					}
					else {
						var skillOrder = ['stamina', 'keeper', 'playmaking', 'passing', 'winger',
							'defending', 'scoring', 'setPieces'];
						var cells = skillTable.getElementsByTagName('td');
						for (var i = 0; i < skillOrder.length; ++i) {
							var cell = cells[2 * i + 1];
							if (!cell)
								break; //skills are not visible
							var skillLink = cell.getElementsByTagName('a')[0];
							if (skillLink.href.match(/ll=(\d+)/) === null) {
								break; //skills are not visible
							}
							var skillValue = parseInt(skillLink.href.match(/ll=(\d+)/)[1], 10);
							var skillText = Foxtrick.trim(skillLink.textContent);
							var skillName = Foxtrick.trim(cells[2 * i].textContent).replace(':', '');
							skills[skillOrder[i]] = skillValue;
							skillTexts[skillOrder[i]] = skillText;
							skillNames[skillOrder[i]] = skillName;
						}
					}
				}
				else if (this.isYouthPlayerPage(doc)) {
					var skillOrder = ['keeper', 'defending', 'playmaking', 'winger', 'passing',
						'scoring', 'setPieces'];
					var rows = skillTable.getElementsByTagName('tr');
					for (var i = 0; i < skillOrder.length; ++i) {
						skills[skillOrder[i]] = {};
						var skillImgs = rows[i].getElementsByTagName('img');
						if (skillImgs.length > 0) {
							var max = skillImgs[0].getAttribute('title').match(/\d/);
							var current = skillImgs[1].title.match(/-?\d/);
							var unknown = skillImgs[1].title.match(/-1/);
							var maxed = !current;
							skills[skillOrder[i]].maxed = false;
							if (maxed) {
								current = max;
								skills[skillOrder[i]].maxed = true;
							}
							// if current and/or max is unknown, mark it as 0
							skills[skillOrder[i]].current = parseInt(unknown ? 0 : current, 10);
							skills[skillOrder[i]].max = parseInt(max ? max : 0, 10);
						}
						else {
							// no image is present, meaning nothing about
							// that skill has been revealed
							skills[skillOrder[i]] = { current: 0, max: 0, maxed: false };
						}
						var currentText = '';
						var maxText = '';
						var skillCell = rows[i].getElementsByTagName('td')[1];
						if (skillCell.getElementsByClassName('youthSkillBar').length > 0) {
							// bar is present
							// skills could either be a skill or unknown
							var isSkill = function(node) {
								return Foxtrick.hasClass(node, 'skill')
									|| Foxtrick.hasClass(node, 'shy');
							};
							var textNodes =
								Foxtrick.filter(isSkill, skillCell
								                .getElementsByClassName('youthSkillBar')[0]
								                .childNodes);
							if (textNodes.length >= 2) {
								currentText = textNodes[0].textContent,
								maxText = textNodes[1].textContent;
							}
						}
						else {
							// no images, the cell says 'unknown'
							currentText = maxText = Foxtrick.trim(skillCell.textContent);
						}
						skillTexts[skillOrder[i]] = { current: currentText, max: maxText };
						skillNames[skillOrder[i]] =
							Foxtrick.trim(rows[i].getElementsByTagName('td')[0].textContent)
								.replace(':', '');
					}
				}
			}
			return { values: skills, texts: skillTexts, names: skillNames };
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	getTransferDeadline: function(doc) {
		try {
			var bidDiv = doc.getElementById('ctl00_ctl00_CPContent_CPMain_updBid');
			if (bidDiv) {
				var bidPara = bidDiv.getElementsByTagName('p')[0];
				return Foxtrick.util.time.getDateFromText(bidPara.textContent);
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return null;
	},

	getPlayer: function(doc, playerid, callback) {
		var args = [];
		args.push(['file', 'playerdetails']);
		args.push(['playerID', playerid]);
		args.push(['version', '2.1']);
		Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'session'},
		  function(xml, errorText) {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				callback(null);
				return;
			}

			var player = {};
			player.PlayerID = Number(xml.getElementsByTagName('PlayerID')[0].textContent);
			player.LastName = xml.getElementsByTagName('LastName')[0].textContent;
			player.FirstName = xml.getElementsByTagName('FirstName')[0].textContent;
			player.NickName = xml.getElementsByTagName('NickName')[0].textContent;
			if (xml.getElementsByTagName('PlayerNumber')[0])
				player.PlayerNumber = Number(xml.getElementsByTagName('PlayerNumber')[0]
				                             .textContent);
			player.Age = Number(xml.getElementsByTagName('Age')[0].textContent);
			player.AgeDays = Number(xml.getElementsByTagName('AgeDays')[0].textContent);
			player.NextBirthDay = xml.getElementsByTagName('NextBirthDay')[0].textContent;
			player.PlayerForm = Number(xml.getElementsByTagName('PlayerForm')[0].textContent);
			player.Cards = Number(xml.getElementsByTagName('Cards')[0].textContent);
			player.InjuryLevel = Number(xml.getElementsByTagName('InjuryLevel')[0].textContent);
			if (xml.getElementsByTagName('Statement')[0])
				player.Statement = xml.getElementsByTagName('Statement')[0].textContent;
			if (xml.getElementsByTagName('PlayerLanguage')[0])
				player.PlayerLanguage = xml.getElementsByTagName('PlayerLanguage')[0].textContent;
			if (xml.getElementsByTagName('PlayerLanguageID')[0])
				player.PlayerLanguageID =
					Number(xml.getElementsByTagName('PlayerLanguageID')[0].textContent);
/*
	  <TrainerData />
	  <OwningTeam>
	  <TeamID>522356</TeamID>
	  <TeamName>FC Karbrüggen</TeamName>
	  <LeagueID>3</LeagueID>
	</OwningTeam>*/
			player.Salary = Number(xml.getElementsByTagName('Salary')[0].textContent);
			player.IsAbroad = xml.getElementsByTagName('IsAbroad')[0].textContent;
			player.Agreeability = Number(xml.getElementsByTagName('Agreeability')[0].textContent);
			player.Aggressiveness = Number(xml.getElementsByTagName('Aggressiveness')[0]
			                               .textContent);
			player.Honesty = Number(xml.getElementsByTagName('Honesty')[0].textContent);
			player.Experience = Number(xml.getElementsByTagName('Experience')[0].textContent);
			player.Loyalty = Number(xml.getElementsByTagName('Loyalty')[0].textContent);
			player.MotherClubBonus = xml.getElementsByTagName('MotherClubBonus')[0].textContent;
			player.Leadership = Number(xml.getElementsByTagName('Leadership')[0].textContent);
			player.Specialty = Number(xml.getElementsByTagName('Specialty')[0].textContent);
			player.NativeCountryID = Number(xml.getElementsByTagName('NativeCountryID')[0]
			                                .textContent);
			player.NativeLeagueID = Number(xml.getElementsByTagName('NativeLeagueID')[0]
			                               .textContent);
			player.NativeLeagueName = xml.getElementsByTagName('NativeLeagueName')[0].textContent;
			player.TSI = Number(xml.getElementsByTagName('TSI')[0].textContent);
//  <PlayerSkills>
			player.StaminaSkill = Number(xml.getElementsByTagName('StaminaSkill')[0].textContent);
			player.Caps = Number(xml.getElementsByTagName('Caps')[0].textContent);
			player.CapsU20 = Number(xml.getElementsByTagName('CapsU20')[0].textContent);
			player.CareerGoals = Number(xml.getElementsByTagName('CareerGoals')[0].textContent);
			player.CareerHattricks = Number(xml.getElementsByTagName('CareerHattricks')[0]
			                                .textContent);
			player.LeagueGoals = Number(xml.getElementsByTagName('LeagueGoals')[0].textContent);
			player.LeagueGoals = Number(xml.getElementsByTagName('LeagueGoals')[0].textContent);
			player.TransferListed = xml.getElementsByTagName('TransferListed')[0].textContent;
// LastMatch
			callback(player);
		});
	}
};
