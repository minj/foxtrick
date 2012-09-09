"use strict";
/**
 * match-lineup-teaks.js
 * Tweaks for the new style match lineup
 * @author CatzHoek
 */

Foxtrick.modules["MatchLineupTweaks"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ["match"],
	OPTIONS : ["DisplayTeamNameOnField"],
	CSS : Foxtrick.InternalPath +"resources/css/match-lineup-teaks.css",
	run : function(doc) {
		if(!Foxtrick.Pages.Match.hasNewRatings(doc))
			return;

		if(FoxtrickPrefs.isModuleOptionEnabled("MatchLineupTweaks", "DisplayTeamNameOnField"))
			this.runTeamnNames(doc);
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

	change : function(doc){
		this.run(doc);
	}
};
