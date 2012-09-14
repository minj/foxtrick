"use strict";
/**
 * match-lineup-teaks.js
 * Tweaks for the new style match lineup
 * @author CatzHoek
 */

Foxtrick.modules["MatchLineupTweaks"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ["match"],
	OPTIONS : ["DisplayTeamNameOnField", "ShowSpecialties"],
	CSS : Foxtrick.InternalPath +"resources/css/match-lineup-teaks.css",
	run : function(doc) {
		if(!Foxtrick.Pages.Match.hasNewRatings(doc))
			return;

		if(FoxtrickPrefs.isModuleOptionEnabled("MatchLineupTweaks", "DisplayTeamNameOnField"))
			this.runTeamnNames(doc);

		if(FoxtrickPrefs.isModuleOptionEnabled("MatchLineupTweaks", "ShowSpecialties"))
			this.runSpecialties(doc);
	},

	//adds teamsnames to the field for less confusion
	runTeamnNames : function(doc){
		var teams = doc.querySelectorAll("h1 > a, h1 > span > a");
		var homeTeamName = teams[0].getAttribute("title");
		var awayTeamName = teams[1].getAttribute("title");

		var homeSpan = doc.createElement("span");
		var awaySpan = doc.createElement("span");

		homeSpan.textContent = homeTeamName;
		awaySpan.textContent = awayTeamName;

		Foxtrick.addClass(homeSpan, "ft-match-lineup-tweaks-teamname");
		Foxtrick.addClass(awaySpan, "ft-match-lineup-tweaks-teamname");

		Foxtrick.addClass(homeSpan, "ft-match-lineup-tweaks-teamname-home");
		Foxtrick.addClass(awaySpan, "ft-match-lineup-tweaks-teamname-away");

		doc.getElementById("playersField").appendChild(homeSpan);
		doc.getElementById("playersField").appendChild(awaySpan);

	},
	//adds apecialty icons for all players, on field and on bench
	runSpecialties : function(doc){
		var teams = doc.querySelectorAll("h1 > a, h1 > span > a");
		var homeTeamId = Foxtrick.util.id.getTeamIdFromUrl(teams[0].href);
		var awayTeamId = Foxtrick.util.id.getTeamIdFromUrl(teams[1].href);

		var homePlayerLinks = doc.querySelectorAll(".playersField > div.playerBoxHome > div > a, #playersBench > div#playersBenchHome > div.playerBoxHome > div > a");
		var awayPlayerLinks = doc.querySelectorAll(".playersField > div.playerBoxAway > div > a, #playersBench > div#playersBenchAway > div.playerBoxAway > div > a");

		var addSpecialty = function(node, player){
			Foxtrick.stopListenToChange(doc); 
			if (player && player.specialityNumber != 0) {
				var title = Foxtrickl10n.getSpecialityFromNumber(player.specialityNumber);
				var alt = Foxtrickl10n.getShortSpeciality(title);
				var icon_suffix = "";
				if (FoxtrickPrefs.getBool("anstoss2icons")) 
					icon_suffix = "_alt";
				Foxtrick.addImage(doc, node, { 
					alt: alt, 
					title: title, 
					src: Foxtrick.InternalPath + 'resources/img/matches/spec'+player.specialityNumber+icon_suffix+'.png',
					class: 'ft-specialty ft-match-lineup-tweaks-specialty-icon'
				});
			}
			Foxtrick.startListenToChange(doc);		
		}

		var addSpecialtiesByTeamId = function(teamid, players){
			Foxtrick.Pages.Players.getPlayerList(doc, function(playerInfo) {
				for(var i = 0; i < homePlayerLinks.length; i++){
					var id = Number(Foxtrick.getParameterFromUrl(players[i].href, "playerid"));
					var player = Foxtrick.Pages.Players.getPlayerFromListById(playerInfo, id);
					addSpecialty(players[i].parentNode.parentNode, player);
				}
			}, {teamid:teamid, current_squad:true, includeMatchInfo:true} );
		}

		addSpecialtiesByTeamId(homeTeamId, homePlayerLinks);
		addSpecialtiesByTeamId(awayTeamId, awayPlayerLinks);
	},

	change : function(doc){
		this.run(doc);
	}
};
