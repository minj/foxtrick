/* extraPlayerInfo.js
 * Add extra information for players in players page
 * @author convincedd, ryanli
 */

FoxtrickExtraPlayerInfo = {
	MODULE_NAME : "ExtraPlayerInfo",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["players"],
	OPTIONS : ["CoachInfo", "Flag"],

	// used for coloring NT players when AddFlags is enabled
	NT_COLOR : "#FFCC00",

	run : function(page, doc) {
		var playerList = Foxtrick.Pages.Players.getPlayerList(doc);
		var lang = FoxtrickPrefs.getString("htLanguage");
		var allPlayers = doc.getElementsByClassName("playerInfo");
		for (var i = 0; i < allPlayers.length; ++i) {
			var id = Foxtrick.Pages.Players.getPlayerId(allPlayers[i]);
			var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);

			var basics = allPlayers[i].getElementsByTagName("p")[0];

			if (Foxtrick.isModuleFeatureEnabled(this, "CoachInfo")
				&& player.trainerData !== undefined) {
				var trainerSkillStr = Foxtrickl10n.getLevelByTypeAndValue("levels", player.trainerData.skill);
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
				var trainerSkillLink = '<a class="skill" href="/Help/Rules/AppDenominations.aspx?lt=skill&ll='+player.trainerData.skill+'#skill">'+trainerSkillStr+'</a>';
				var trainerStr = "<br>" + trainerTypeStr.replace("%s", trainerSkillLink);
				// insert after the second break
				basics.innerHTML += trainerStr;
			}
			if (Foxtrick.isModuleFeatureEnabled(this, "Flag")
				&& player.countryId !== undefined) {
				var links = allPlayers[i].getElementsByTagName("a");
				var isNtPlayer = (links[0].href.search(/NationalTeam/i) != -1);
				var nameLink = isNtPlayer ? links[1] : links[0];
				if (!isNtPlayer) {
					// NT players have flags by default, so only need
					// to add flags for non-NT players
					var flag = FoxtrickHelper.createFlagFromCountryId(doc, player.countryId);
					if (flag) {
						nameLink.parentNode.insertBefore(flag, nameLink.parentNode.firstChild);
					}
				}
				else {
					var style = "background-color: " + this.NT_COLOR + ";";
					nameLink.setAttribute("style", style);
				}
			}
		}
	}
};
