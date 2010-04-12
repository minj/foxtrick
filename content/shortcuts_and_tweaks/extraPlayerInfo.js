/* extraPlayerInfo.js
 * Add extra information for players in players page
 * @author convincedd, ryanli
 */

FoxtrickExtraPlayerInfo = {
	MODULE_NAME : "ExtraPlayerInfo",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["players"],
	DEFAULT_ENABLED : true,
	OPTIONS : ["CoachInfo", "LeadershipAndExperience", "Flag"],
	NEW_AFTER_VERSION : "0.5.1.3",
	LATEST_CHANGE : "Splitted extra player information from TeamStats as a module.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

	// used for coloring NT players when AddFlags is enabled
	NT_COLOR : "#FFCC00",

	init : function() {
	},

	run : function(page, doc) {
		try {
			var playerList = Foxtrick.Pages.Players.getPlayerList(doc);
			var lang = FoxtrickPrefs.getString("htLanguage");
			var allPlayers = doc.getElementsByClassName("playerInfo");
			for (var i = 0; i < allPlayers.length; ++i) {
				var id = Foxtrick.Pages.Players.getPlayerId(allPlayers[i]);
				var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);

				var basics = allPlayers[i].getElementsByTagName("p")[0];

				if (Foxtrick.isModuleFeatureEnabled(this, "CoachInfo")
					&& player.trainerData !== undefined) {
					var path = "hattricklanguages/language[@name='" + lang + "']/levels/level[@value='" + player.trainerData.skill + "']";
					var trainerSkillStr = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml, path, "text");
					var trainerTypeStr = "";
					if (player.trainerData.type == 0) {
						trainerTypeStr = Foxtrickl10n.getString('foxtrick.defensiveTrainer');
					}
					else if (player.trainerData.type == 1) {
						trainerTypeStr = Foxtrickl10n.getString('foxtrick.offensiveTrainer');
					}
					else {
						trainerTypeStr = Foxtrickl10n.getString('foxtrick.balancedTrainer');
					}
					var trainerSkillLink = '<a href="/Help/Rules/AppDenominations.aspx?lt=skill&ll='+player.trainerData.skill+'#skill">'+trainerSkillStr+'</a>';
					var title = allPlayers[i].getElementsByTagName("b")[0];
					var trainerStr = trainerTypeStr.replace("%s", trainerSkillLink);
					title.innerHTML += "<br/>" + trainerStr;
				}
				if (Foxtrick.isModuleFeatureEnabled(this, "LeadershipAndExperience")
					&& player.leadership !== undefined && player.experience !== undefined
					&& !Foxtrick.Pages.Players.isNtPlayersPage(doc)
					&& !Foxtrick.Pages.Players.isOldiesPage(doc)
					&& !Foxtrick.Pages.Players.isCoachesPage(doc)) {
					// These three kinds of players pages have experience and
					// leadership shown by default, hence no need to process
					// for them
					var path = "hattricklanguages/language[@name='" + lang + "']/levels/level[@value='" + player.leadership + "']";
					var leadershipString = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml, path, "text");
					var path = "hattricklanguages/language[@name='" + lang + "']/levels/level[@value='" + player.experience + "']";
					var experienceString = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml, path, "text");
					var leadershipLink = '<a class="skill" href="/Help/Rules/AppDenominations.aspx?lt=skillshort&ll='+player.leadership+'#skillshort">'+leadershipString+'</a>';
					var experienceLink = '<a class="skill" href="/Help/Rules/AppDenominations.aspx?lt=skill&ll='+player.experience+'#skill">'+experienceString+'</a>';
					var pos = basics.innerHTML.search(/\[/);
					if (pos == -1) {
						pos = basics.innerHTML.length; // no speciality. show after
					}
					else {
						pos -= 2; // has speciality. show before
					}
					var baseStr = Foxtrickl10n.getString("foxtrick.experience_and_leadership");
					basics.innerHTML = basics.innerHTML.substr(0, pos+1)
					+ "<br />" + baseStr.replace("%1", leadershipLink).replace("%2", experienceLink)
					+ " " + basics.innerHTML.substr(pos+1);
				}
				if (Foxtrick.isModuleFeatureEnabled(this, "Flag")
					&& player.countryId !== undefined) {
					var links = allPlayers[i].getElementsByTagName("a");
					var isNtPlayer = (links[0].href.search(/NationalTeam/i) != -1);
					var nameLink = isNtPlayer ? links[1] : links[0];
					if (!isNtPlayer) {
						// NT players have flags by default, so only need
						// to add flags for non-NT players
						var a = doc.createElement("a");
						var leagueName = "New Moon";
						var leagueId = Foxtrick.XMLData.getLeagueIdByCountryId(player.countryId);
						if (leagueId) {
							leagueName = FoxtrickHelper.getLeagueDataFromId(leagueId).LeagueName;
						}
						a.href = "/World/Leagues/League.aspx?LeagueID=" + leagueId;
						a.title = leagueName;
						a.className = "flag inner";
						var img = doc.createElement("img");
						var style = "vertical-align: top; margin-top: 1px; background: transparent url(/Img/Flags/flags.gif) no-repeat scroll "+ (-20)*leagueId + "px 0pt; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial;";
						img.setAttribute("style", style);
						img.src = "/Img/Icons/transparent.gif";
						a.appendChild(img);
						nameLink.parentNode.insertBefore(a, nameLink.parentNode.firstChild);
					}
					else {
						var style = "background-color: " + this.NT_COLOR + ";";
						nameLink.setAttribute("style", style);
					}
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	change : function(page, doc) {
	}
};
