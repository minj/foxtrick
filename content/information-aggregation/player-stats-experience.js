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

		var ts_xp = doc.createElement("th");
		Foxtrick.addClass(ts_xp,"stats");
		Foxtrick.addClass(ts_xp,"ft-dummy");
		ts_xp.textContent = "XP+"
		//stats_head.appendChild(ts_xp);
		stats_head.insertBefore(ts_xp, stats_head.getElementsByTagName("th")[7]);

		//and their entries
		var stats_entries = stats.getElementsByTagName("tbody")[0].getElementsByTagName("tr");		

		var lastGameXP = null;
		var xp_sub_min = 0.0;
		var xp_sub_max = 0.0;
		var friendly_count_since_skillup = 0;
		var hadXpSkillUp = false;
		var xp_sub_min_before = 0.0;

		var matchcounter = {}
		var minutecounter = {}

		Foxtrick.map( function( entry ){
			// var gametypeParent = entry.getElementsByClassName("keyColumn")[0];
			// var gameTypeImage = gametypeParent.getElementsByClassName("iconMatchtype")[0].getElementsByTagName("img")[0];
			// var gameType = gameTypeImage.className;
			// var isNTmatch = gameTypeImage.parentNode.getAttribute("style") != null;
			//var playtimes = entry.getElementsByClassName("endColumn1")[0];
			var	xp_entry = parseInt(entry.getElementsByTagName("td")[xp_column].textContent);
			
			
			if(lastGameXP === null)
				lastGameXP = xp_entry;

			var isNTmatch = function(node){
				var gametypeParent = node.getElementsByClassName("keyColumn")[0];
				var gameTypeImage = gametypeParent.getElementsByClassName("iconMatchtype")[0].getElementsByTagName("img")[0];
				var gameType = gameTypeImage.className;
				return gameTypeImage.parentNode.getAttribute("style") != null;	
			}
			var getPlayedMinutes = function(node){
				var playtimes = entry.getElementsByClassName("endColumn1")[0];
				//sum up the diff positions		
				var intRE = RegExp("\\d+", "g");
				var playMinutes = playtimes.textContent.match(intRE);
				var minutes = 0;
				if(playMinutes != null)
					for (var i = 0; i < playMinutes.length; i++)
						if (!isNaN(playMinutes[i]))
							minutes += parseInt(playMinutes[i]);
				//max 90'
				return Math.min(90, minutes);
			}

			var getGameType = function(node){

				var getBasicGameType = function(node){
					var gametypeParent = node.getElementsByClassName("keyColumn")[0];
					var gameTypeImage = gametypeParent.getElementsByClassName("iconMatchtype")[0].getElementsByTagName("img")[0];
					return gameTypeImage.className;
				}

				var gameType = getBasicGameType(node);
				var isNT = isNTmatch(node);
				if(isNT){
					if(gameType == "matchFriendly")
						return "matchNtFriendly"
					else if(gameType == "matchLeague")
						return  "matchNtLeague"
				} else
					return gameType; 
			}

			var getXpGain = function(minutes, gametype){
				return (xp[gameType]/90)*minutes;	
			}

			var ntMatch = isNTmatch( entry );
			var minutes = getPlayedMinutes( entry );
			var gameType = getGameType(entry);
			var xp_gain = getXpGain(minutes, gameType);

			if(xp_entry == lastGameXP){
				if(!ntMatch){
					 if(gameType == "matchFriendly"){
					 	xp_sub_min += xp_gain/2;
					 	xp_sub_max += xp_gain;	
					 } else {
					 	xp_sub_min += xp_gain;
					 	xp_sub_max += xp_gain;	
					 }
				} else {
					xp_sub_min += xp_gain;
					xp_sub_max += xp_gain;	
				}
			} else {
				hadXpSkillUp = true;
			}

			var ts_xp = doc.createElement("td");
			ts_xp.textContent = xp_gain.toFixed(2);
			entry.insertBefore(ts_xp, entry.getElementsByTagName("td")[xp_column+1]);

		}, stats_entries);


		var div = doc.createElement("div");
		var textNode = doc.createTextNode("Experience Sub is between " + (xp_sub_min/28.0).toFixed(2) + " (" + xp_sub_min.toFixed(2) +")" + " and " + (xp_sub_max/28.0).toFixed(2)  + " (" + xp_sub_max.toFixed(2) +"). ");
		
		if(!hadXpSkillUp)
			textNode.textContent = textNode.textContent + "Info might be incorrect because the player has no recorded experience-skillup or you díd not expand to all matches (Work in progress)";

		div.appendChild(textNode);
		var navigation = doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlMatchHistorySlideToggle");
		navigation.parentNode.insertBefore(div, navigation);
	}
};