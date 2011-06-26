/* extra-player-info.js
 * Add extra information for players in players page
 * @author convincedd, ryanli
 */

FoxtrickExtraPlayerInfo = {
	MODULE_NAME : "ExtraPlayerInfo",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["players","StatsSquad"],
	OPTIONS : ["CoachInfo", "Flag"],

	// used for coloring NT players when AddFlags is enabled
	NT_COLOR : "#FFCC00",

	run : function(page, doc) {
		if (page==="players") 
			Foxtrick.Pages.Players.getPlayerList(doc, function(playerList) {
				if (!playerList) {
					Foxtrick.log("ExtraPlayerInfo: unable to retrieve player list.");
				}
							
				var lang = FoxtrickPrefs.getString("htLanguage");
				var allPlayers = doc.getElementsByClassName("playerInfo");
				for (var i = 0; i < allPlayers.length; ++i) {
					var id = Foxtrick.Pages.Players.getPlayerId(allPlayers[i]);
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);

					var basics = allPlayers[i].getElementsByTagName("p")[0];

					if (Foxtrick.isModuleFeatureEnabled(FoxtrickExtraPlayerInfo, "CoachInfo")
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
					if (Foxtrick.isModuleFeatureEnabled(FoxtrickExtraPlayerInfo, "Flag")
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
							var style = "background-color: " + FoxtrickExtraPlayerInfo.NT_COLOR + ";";
							nameLink.setAttribute("style", style);
						}
					}
				}
			});
			
		if (page==="StatsSquad") {			
			// get selected teamid
			var teamid=0;
			var options = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ddlTeams').getElementsByTagName('option');
			for (var i=0; i<options.length; ++i) {
				if (options[i].getAttribute('selected')=='selected') { teamid=Number(options[i].value); break; }
			}			
			if (teamid==0) return;
			
			var args = [];
			args.push(["teamId", teamid]);
			args.push(["file", "players"]);
			
			Foxtrick.ApiProxy.retrieve(doc, args, function(xml) {	 
				if (!xml)
					return;
				var playerNodes = xml.getElementsByTagName("Player");

				var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];
				var th = doc.createElement('th');
				th.textContent = Foxtrickl10n.getString('CurrentSquad');
				th.addEventListener("click", FoxtrickTableSort.clickListener, true);
				table.getElementsByTagName('tr')[0].appendChild(th);
			    	
				var as=doc.getElementById('mainBody').getElementsByTagName('a');
				for (var i=0; i<as.length; ++i) {
					if (as[i].href.search(/\/Club\/Players\/Player.aspx\?playerId=\d+/i)!==-1) {
						var id = Number(as[i].href.match(/\/Club\/Players\/Player.aspx\?playerId=(\d+)/i)[1]);
						var inSquad=false;
						for (var j = 0; j < playerNodes.length; ++j) {
							var playerNode = playerNodes[j];
							var pid = Number(playerNode.getElementsByTagName("PlayerID")[0].textContent);
							if (pid === id) {
								inSquad=true;
								break;
							}
						}
						var td = doc.createElement('td');
						td.className='center';
						if (inSquad) td.textContent = 'x';
						as[i].parentNode.parentNode.appendChild(td);								
					}	
				}	
			});	
		}
	}
};
