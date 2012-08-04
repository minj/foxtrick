"use strict";
/*
 * live-alert.js
 * Alerting HT Live goals
 * @author ryanli
 */

Foxtrick.modules["LiveAlert"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : [ "matchesLive" ],
	OPTIONS : ["Sound", "home", "away", "own"],
	OPTION_EDITS : true,
	OPTION_EDITS_DISABLED_LIST : [true, false, false, false],
	OPTION_EDITS_DATAURL_LOAD_BUTTONS : [false, true, true, true],
	OPTION_EDITS_DATAURL_IS_SOUND : [false, true, true, true],

	store : {},

	run : function(doc) {
		this.alert(doc);
	},

	change : function(doc) {
		this.alert(doc);
	},

	getScoreFromTab : function(tab) {
		try {
			var doc = tab.ownerDocument;
			if (tab.getElementsByClassName("liveTabScore").length > 0) {
				var score = tab.getElementsByClassName("liveTabScore")[0].textContent;
				if (score == "")
					return;
				var scoreRe = new RegExp("(\\d+)\\s*-\\s*(\\d+)");
				var scoreMatch = score.match(scoreRe);
				if (!Foxtrick.util.layout.isRtl(doc))
					return [parseInt(scoreMatch[1]), parseInt(scoreMatch[2])];
				else
					return [parseInt(scoreMatch[2]), parseInt(scoreMatch[1])];
			}
			return null;
		}
		catch (e) {
			Foxtrick.log("Cannot parse score \"", score, "\"");
			return null;
		}
	},

	getTeamsFromTab : function(tab) {
		var links = tab.getElementsByTagName("a");
		if (links.length == 2) {
			// expanded tab with team names as links
			return [links[0].title, links[1].title];
		}
		else {
			var teams = tab.childNodes[tab.childNodes.length - 1].textContent;
			if (tab.childNodes[tab.childNodes.length - 1].title)
				teams = tab.childNodes[tab.childNodes.length - 1].title;
			teams = Foxtrick.trim(teams);
			return teams.split(" - ");
		}
	},

	alert : function(doc) {
		var tabs = doc.getElementsByClassName("liveTabText");
		for (var i = 0; i < tabs.length; ++i) {
			var tab = tabs[i];
			var score = this.getScoreFromTab(tab);
			if (score !== null) {
				var teams = this.getTeamsFromTab(tab);
				var teamsText = teams[0] + "-" + teams[1]; // used as index
				if (this.store[teamsText] === undefined) {
					this.store[teamsText] = score;
				}
				else {
					var homeScored = this.store[teamsText][0] < score[0];
					var awayScored = this.store[teamsText][1] < score[1];
					if (homeScored || awayScored) {
						// score has changed, alert						
						var own = Foxtrick.modules["Core"].getSelfTeamInfo().shortTeamName;
						var ownScored = own && (
							own == teams[0] && homeScored	||	own == teams[1] && awayScored 
						);
						
						this.store[teamsText] = score;
						// show notification
						Foxtrick.util.notify.create(
							"%h %H - %A %a".replace(/%h/, teams[0])
								.replace(/%H/, score[0])
								.replace(/%A/, score[1])
								.replace(/%a/, teams[1]),
							doc.location
						);
						// play sound if enabled
						if (FoxtrickPrefs.isModuleOptionEnabled("LiveAlert", "Sound")) {
							var sound = null;
							
							if (ownScored && FoxtrickPrefs.isModuleOptionEnabled("LiveAlert", "own"))
								sound = FoxtrickPrefs.getString("module.LiveAlert.own_text");
							else if(homeScored && FoxtrickPrefs.isModuleOptionEnabled("LiveAlert", "home"))
								sound = FoxtrickPrefs.getString("module.LiveAlert.home_text");
							else if(awayScored && FoxtrickPrefs.isModuleOptionEnabled("LiveAlert", "away"))
								sound = FoxtrickPrefs.getString("module.LiveAlert.away_text");
							
							if (sound)
								Foxtrick.playSound(sound, doc);
						}
					}
				}
			}
		}
	}
};
