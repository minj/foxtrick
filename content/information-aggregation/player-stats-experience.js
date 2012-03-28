"use strict";
/**
 * player-stats-experience.js
 * show how much experience a player gained in invidual matches and shows current subskill
 * @author CatzHoek
 */

Foxtrick.modules["PlayerStatsExperience"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ['playerStats'],

	run : function(doc) {
		
		var xp = {};
		xp.matchLeague = 1.0; 
		xp.matchFriendly = 0.2;
		xp.matchCup = 2.0;
		xp.matchQualification = 2.0;
		xp.matchNtFriendly = 2.0;
		xp.matchNtLeague = 10.0;
		xp.matchMasters = 5.0;

		var xp_column = 6;

		// National friendly match	0.1
		// International friendly match	0.2
		// League match	1
		// Cup match	2
		// U20/NT friendly match	2
		// Qualifying match	2
		// Hattrick Masters match	5
		// U20/NT official match	10
		// U20/NT World Cup (semi)final	20

		//both tables you can alter between atm
		var stats = doc.getElementById("stats");
		var matches = doc.getElementById("matches");

		//headers
		var stats_head = stats.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0];
		//var matches_head = matches.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0];

		var ts_xp = doc.createElement("th");
		Foxtrick.addClass(ts_xp,"stats");
		Foxtrick.addClass(ts_xp,"ft-dummy");
		ts_xp.textContent = "XP Pts."
		stats_head.appendChild(ts_xp);

		//and their entries
		var stats_entries = stats.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
		//var matches_entries = matches.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

		var intRE = RegExp("\\d+", "g");

		var lastGameXP = null;
		var xp_sub_min = 0.0;
		var xp_sub_max = 0.0;
		var friendly_count_since_skillup = 0;
		var firstEntry = true;
		var hadXpSkillUp = false;

		Foxtrick.map( function( entry ){
			var gametypeParent = entry.getElementsByClassName("keyColumn")[0];
			var gameTypeImage = gametypeParent.getElementsByClassName("iconMatchtype")[0].getElementsByTagName("img")[0];
			var gameType = gameTypeImage.className;
			var playtime = entry.getElementsByClassName("endColumn1")[0];
			
			var	xp_entry = parseInt(entry.getElementsByTagName("td")[6].textContent);
			
			
			if(lastGameXP === null){
				lastGameXP = xp_entry;
				firstEntry = false;
			}			
			var playMinutes = playtime.textContent.match(intRE);
			var minutes = 0;
			if(playMinutes != null)
				for (var i = 0; i < playMinutes.length; i++)
					if (!isNaN(playMinutes[i]))
						minutes += parseInt(playMinutes[i]);

			var minutes = Math.min(90, minutes);	
			var ts_xp = doc.createElement("td");

			var isNTmatch = gameTypeImage.parentNode.getAttribute("style") != null;
			var bonus = xp[gameType];
			if(isNTmatch){
				if(gameType == "matchFriendly")
					bonus = xp.matchNtFriendly;
				else if(gameType == "matchLeague")
					bonus = xp.matchNtLeague;
			}	
			var xp_gain = (bonus/90)*minutes;
			
			if(xp_entry == lastGameXP){
				xp_sub_max += xp_gain;
				xp_sub_min += xp_gain;
				if(!isNTmatch && gameType == "matchFriendly")
					xp_sub_min -= 0.1;
			} else {
				hadXpSkillUp = true;
			}
			ts_xp.textContent = xp_gain.toFixed(2);
			entry.appendChild(ts_xp);

		}, stats_entries);


		var div = doc.createElement("div");
		var textNode = doc.createTextNode("Experience Sub is between " + (xp_sub_min/28.0).toFixed(2) + " and " + (xp_sub_max/28.0).toFixed(2));
		
		if(!hadXpSkillUp)
			textNode.textContent = textNode.textContent + ". Info sucks because the player is to fresh or you didn't expand to all matches (Work in progress)";

		div.appendChild(textNode);
		var navigation = doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlMatchHistorySlideToggle");
		navigation.parentNode.insertBefore(div, navigation);
	}
};